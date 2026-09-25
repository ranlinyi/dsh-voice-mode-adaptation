/**
 * dsh-voice-mode-adaptation host half（纯朗读版 · 无语音输入）。
 *
 * 架构：
 *  - 全局单活指针 autoReadSession：同一时刻至多一个会话处于「自动朗读」；
 *    仅该会话的 llm/stream 被 tap（text-delta -> 分句 -> TTS -> SSE），其余会话直接放行。
 *    每次新回合的 llm/stream 开始前先 cancel 本会话队列：上一回合没读完的部分立即丢弃，
 *    从新回合重新读（需求 2）。
 *  - 手动朗读：/speak 接收任意文本（某条已完成的 AI 回复），走同一适配器 -> TTS -> SSE。
 *  - HTTP 面：/voice-mode-adaptation/read（自动朗读开关）、/speak（单条手动朗读）、
 *    /cancel（停止当前朗读）、/stream（SSE 音频帧 + 状态广播）、/config（client 引导参数）。
 *  - 模型：本地 TTS 模型懒下载 + .part 断点续传至 cacheDir（默认 ~/.cache/dsh-voice-mode-adaptation/models/）。
 */
import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
// Type-only: pulls the webServer Context merge (ctx.webServer) into scope.
import type {} from '@deepseek-ai/dsh-host-webserver'
// Type-only: pulls the settings Context merge (ctx.settings) into scope.
import type { SettingsNamespace } from '@deepseek-ai/dsh-settings'
// Type-only: chunk/options shapes for the llm/stream waterfall tap.
import type { GenerateOptions, StreamChunk } from '@deepseek-ai/dsh-llm'
// Type-only: pulls the 'system-prompt/assemble' waterfall into the Events
// registry (so ctx.on can type-check the assembly callback).
import type { AssembleContext, PromptAssembly } from '@deepseek-ai/dsh-system-prompt'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { rm } from 'node:fs/promises'
import { SpeechAdapter, type SpeechAdapterConfig } from './speech-adapter.ts'
import { SpeechRewriter, parseGuardAllow, rewriteUsage, resetRewriteUsage, type GuardAllowRules, type GuardMode } from './rewriter.ts'
import { DEFAULT_PRONUNCIATION_TABLE, parsePronunciationFixes, type PronunciationFix } from './segmenter.ts'
import { EdgeTtsEngine, AzureTtsEngine, TtsQueue, listEdgeVoices, type TtsEngine } from './tts-queue.ts'
import { parsePhonemeTable } from './azure-ssml.ts'
import { createSherpaVitsEngine, createSherpaKokoroEngine, TTS_MODEL_REPO, kokoroModelDir, type KokoroModel } from './tts-local.ts'
import { HOST_PRIMARY, validateModelHost } from './models.ts'
import { isLoopbackRequest, sameOriginRequest, RateLimiter } from './security.ts'

export const name = 'voice-mode-adaptation'

/**
 * 命名空间品牌常量（与官方 settingsNamespace('voice-mode-adaptation') 等价：其运行时仅做
 * kebab-case 校验（/^[a-z][a-z0-9-]*$/）后原样返回；此处本地断言避免对宿主包运行时 import）。
 */
const NS_VOICE_MODE = 'voice-mode-adaptation' as SettingsNamespace

/**
 * 插件 HTTP 命名空间（固定路径）。client bundle 以静态产物分发，无法感知
 * 宿主侧配置；若 basePath 可配置而客户端硬编码，一旦修改即分叉。故按
 * 客户端契约固定为 /voice-mode-adaptation（不提供覆盖键；custom basePath 无增益）。
 */
const BASE_PATH = '/voice-mode-adaptation'

/**
 * JSON 响应助手：必须用 writeHead 显式写头。
 * 第三方 gzip 包装器（如 @wingsky-1/dsh-gzip）只拦截 writeHead 路径——
 * 「statusCode + setHeader + end」的隐式头路径会产出「content-encoding: gzip
 * 头 + 明文 body」，浏览器报 ERR_CONTENT_DECODING_FAILED，进入语音模式立即退出
 * （2026-08-28 实测根因）。writeHead + end 与无包装器环境同样正确。
 */
const respondJson = (res: ServerResponse, status: number, payload: unknown): void => {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(payload))
}

/**
 * 排版与公式提示词：设置项 spokenFormat 开启后，作为 system prompt 末尾 section 注入
 * （仅活跃语音会话，见 apply 内 'system-prompt/assemble' 瀑布）。
 * 与旧版"口语化、去 Markdown"相反：本提示词要求保持完整 Markdown 与 LaTeX 排版，
 * 屏幕阅读优先，仅额外约束字面美元符号必须转义（避免被渲染成行内公式）。
 */
const VOICE_SPOKEN_PROMPT =
  '【排版与公式】请使用与用户相同的语言、以正常严谨的书面风格作答。屏幕阅读优先：请充分使用 Markdown 结构（标题、列表、表格、引用、行内代码与代码块）与 LaTeX 公式（行内 $...$、展示 $$...$$），不要为了朗读而简化排版。' +
  '字面美元符号必须转义：当 $ 表示货币金额、环境变量、Shell 变量等字面字符时，写成 \\$（反斜杠加美元符号）；同一行内出现两个未转义的 $ 会被渲染成行内公式、导致内容错乱；真正的数学公式仍用 $ 定界，不要转义。' +
  '朗读侧会自行处理排版符号与公式，无需为朗读改变写作方式。'

/** 提示词 section 的稳定名称（注册层按 order 排序；瀑布里 push 即追加到组装结果末尾）。 */
const VOICE_SPOKEN_SECTION = 'voice-mode-adaptation:spoken-format'

/**
 * dsh-agent 的 assembleContextFor 在 assemble 上下文里运行时注入 agent
 * （官方 AssembleContext 类型仅声明 scope/signal，属 merge-extensible 未固定字段；
 * dsh-agent-presets 的 invariant 即同款用法）。此处只声明本插件读取的最小面。
 */
type AgentCarriedContext = AssembleContext & { agent?: { id: string } }

export const inject = ['webServer', 'settings', 'sessions']

/**
 * 模型缓存目录平台默认值：Windows 用 LOCALAPPDATA，类 Unix 用 ~/.cache。
 * 跨平台一致约定（WINDOWS/macOS/Linux 均无需额外配置即可写入）。
 */
const defaultModelCacheDir = (): string =>
  process.platform === 'win32'
    ? join(process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'), 'dsh-voice-mode-adaptation', 'models')
    : join(homedir(), '.cache', 'dsh-voice-mode-adaptation', 'models')

/**
 * Q15 设置命名空间：全部运行时旋钮（音色/语速/打断/静音/超时/镜像/自动发送/模式/口语化提示词）。
 *
 * 官方分层（dsh-settings 契约）：resolve = schema(mergeLayers(base, 用户文档))——
 * schema 默认（平台常量）为最底、组合包 config 经 register 的 `base` 为第二顺位、
 * 设置面板（用户文档）最高。因此：本文件 schema 默认全是平台常量；config 子集在
 * apply 期以 `{ base }` 传入。生效范围：voice/rate 即时（TTS 热切换）；spokenFormat 即时
 * （每次组装提示词时读取，对当前会话的后续回复生效）；其余下次进入生效。
 */
export interface VoiceSettingsValue {
  /** 朗读引擎：edge 微软云端（默认）/ vits 本地中文 / kokoro 本地中英 / azure 付费云端（支持 SSML 音素）；设置面板即时切换。 */
  ttsEngine: 'edge' | 'vits' | 'kokoro' | 'azure'
  /** Kokoro 模型精度（int8 默认 / fp32 音质更好；仅 kokoro 引擎生效，切换即时重建引擎）。 */
  kokoroModel: KokoroModel
  /** Azure 朗读端点：区域名（如 eastasia）或完整链接；仅 azure 引擎使用。 */
  azureEndpoint: string
  /** Azure 密钥的凭据引用（环境变量名；密钥不落配置明文）。 */
  azureKeyRef: string
  /** Azure 多音字拼音表：每行「词 => 拼音」（如 行 => hang2），# 起首为注释；仅 azure 引擎使用。 */
  azurePhonemes: string
  voice: string
  rate: number
  /**
   * 自动朗读会话注入排版与公式提示词（默认关，实时生效）：仅 autoReadSession 的回复被注入，
   * 要求保留完整 Markdown/LaTeX 排版并转义字面美元符号；非朗读会话不受影响。
   */
  spokenFormat: boolean
  /** 语音改编站总开关（默认关）：开启后公式/表格/代码改写成口播稿再朗读，正文不受影响。 */
  rewriteEnabled: boolean
  /** 改写模型 OpenAI 兼容端点（默认智谱 GLM）。 */
  rewriteBaseUrl: string
  /** 改写模型密钥的凭据引用（环境变量名；密钥不落配置明文）。 */
  rewriteApiKeyRef: string
  /** 改写模型名（默认 glm-4.5-air）。 */
  rewriteModel: string
  /** 改写请求超时（毫秒，超时回退确定性读法）。 */
  rewriteTimeoutMs: number
  /** 改写输出 token 上限。 */
  rewriteMaxTokens: number
  /** 改写温度（越低越稳定，默认 0）。 */
  rewriteTemperature: number
  /** 相同片段复用讲稿（默认开）。 */
  rewriteCache: boolean
  /** 关闭改写模型的思考链（默认开）：GLM-4.5 等思考型模型不关思考会只输出推理、正文为空。 */
  rewriteDisableThinking: boolean
  /** 传给改写模型的前文字符**上限**（0 = 不给前文；默认 800）。实际长度按片段动态伸缩。 */
  rewriteContextChars: number
  /**
   * 多音字 / 易读错词的**用户词表**：每行「原词 => 同音替身」，# 起首为注释。
   * 完全可见可改：默认值是插件带的一份「行(háng)」同音词表，可自行增删或清空；
   * 是否生效由 pronunciationEnabled 决定。替身必须与原词**等字数**，
   * 只允许同音替换（历史实现「最速降线 => 最速下降线」增了音节、等于改了术语，已移除）。
   */
  pronunciationFixes: string
  /** 是否启用上面的用户词表（默认开）。关 = 完全不改任何朗读文本。 */
  pronunciationEnabled: boolean
  /** 改写守卫强度：off 全关 / lenient 放宽 / standard 默认 / strict 收紧。 */
  guardMode: GuardMode
  /** 自定义放行规则（每行一条；命中即跳过全部守卫）。 */
  guardAllowRules: string
  /** 段落之间的停顿毫秒（0 = 关；默认 350）；标题之后用 1.6 倍。 */
  blockPauseMs: number
  /**
   * 含行内公式的整句交给模型出稿（默认开）：正文与公式读法一次成型，避免重复朗读。
   * 关掉则退回"公式片段单独改写 + 正文单独念"。
   */
  wholeSentenceMath: boolean
  /** 数学朗读模式：rules 确定性规则（默认）/ model 交给改写模型 / verbatim 原样。 */
  mathMode: 'rules' | 'model' | 'verbatim'
}

/** 平台常量默认（最底层；config base 与用户设置逐层覆盖）。 */
const VOICE_SETTINGS_DEFAULTS: VoiceSettingsValue = {
  ttsEngine: 'edge',
  kokoroModel: 'int8',
  azureEndpoint: '',
  azureKeyRef: '',
  azurePhonemes: '',
  voice: 'zh-CN-XiaoxiaoNeural',
  rate: 1.0,
  spokenFormat: false,
  rewriteEnabled: false,
  rewriteBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  rewriteApiKeyRef: '',
  rewriteModel: 'glm-4.5-air',
  rewriteTimeoutMs: 8000,
  rewriteMaxTokens: 400,
  rewriteTemperature: 0,
  rewriteCache: true,
  rewriteDisableThinking: true,
  rewriteContextChars: 800,
  pronunciationFixes: DEFAULT_PRONUNCIATION_TABLE,
  pronunciationEnabled: true,
  guardMode: 'standard',
  guardAllowRules: '',
  blockPauseMs: 350,
  wholeSentenceMath: true,
  mathMode: 'rules',
}

/** 以平台常量默认构造设置 schema。 */
export function createVoiceSettingsSchema(defs?: Partial<VoiceSettingsValue>): z<VoiceSettingsValue> {
  const d = { ...VOICE_SETTINGS_DEFAULTS, ...defs }
  return z.object({
    ttsEngine: z
      .union([z.const('vits'), z.const('kokoro'), z.const('edge'), z.const('azure')])
      .default(d.ttsEngine)
      .description(
        '朗读引擎：edge 微软云端（默认，快、音质自然，被朗读文本会发送到微软）/ vits 本地中文 / kokoro 本地中英（回复文本不出本机）/ azure 付费云端（需端点+密钥；支持 SSML 音素级多音字）；切换即时生效',
      ),
    kokoroModel: z
      .union([z.const('int8'), z.const('fp32')])
      .default(d.kokoroModel)
      .description(
        'Kokoro 模型精度：int8（默认，体积小/加载快，CPU 友好）/ fp32（音质更好、体积大，GPU 或大内存机器推荐）；两档共用同一套 103 音色，切换即时生效',
      ),
    azureEndpoint: z
      .string()
      .default(d.azureEndpoint)
      .description('Azure 朗读端点：填区域名（如 eastasia）或完整链接（https://<region>.tts.speech.microsoft.com）；仅 azure 引擎使用'),
    azureKeyRef: z
      .string()
      .default(d.azureKeyRef)
      .description('Azure 密钥的凭据引用名（如 AZURE_SPEECH_KEY）；真实密钥写入 DSH 凭据库，不落配置文件明文'),
    azurePhonemes: z
      .string()
      .default(d.azurePhonemes)
      .description('Azure 多音字拼音表：每行「词 => 拼音」（如 行 => hang2、银行 => yin2 hang2），# 起首为注释；经 SSML <phoneme> 精确发音，仅 azure 引擎使用'),
    voice: z
      .string()
      .default(d.voice)
      .description(
        '朗读音色（按 ttsEngine 取值：vits 用说话人名 suyingxue/gunian/fushiyu/bingjiao/bazong；kokoro 用 0-102 编号或中文名 zf_xiaobei/zf_xiaoni/zf_xiaoxiao/zf_xiaoyi；edge 用 Edge ShortName 如 zh-CN-XiaoxiaoNeural 晓晓·女，完整清单见 scripts/list-voices.mjs）',
      ),
    rate: z.number().min(0.5).max(2).default(d.rate).description('朗读语速倍率（0.5 = 慢速，2.0 = 快速，1.0 = 正常）'),
    spokenFormat: z
      .boolean()
      .default(d.spokenFormat)
      .description('语音会话注入排版与公式提示词（保留完整 Markdown 与 LaTeX 排版，并要求字面美元符号转义为 \\$；默认关，改动即时生效）'),
    rewriteEnabled: z
      .boolean()
      .default(d.rewriteEnabled)
      .description('语音改编站总开关（默认关）：开启后公式/表格/代码先改写成口播稿再朗读；正文朗读不受影响，开启前不改动任何现有行为'),
    rewriteBaseUrl: z
      .string()
      .default(d.rewriteBaseUrl)
      .description('改写模型 OpenAI 兼容端点（默认智谱 GLM）；请求从宿主发出，密钥不上浏览器'),
    rewriteApiKeyRef: z
      .string()
      .default(d.rewriteApiKeyRef)
      .description('改写模型密钥的凭据引用（填环境变量名，如 GLM_API_KEY；密钥不写入配置明文）'),
    rewriteModel: z
      .string()
      .default(d.rewriteModel)
      .description('改写模型名（默认 glm-4.5-air）'),
    rewriteTimeoutMs: z
      .number()
      .min(500)
      .max(60000)
      .default(d.rewriteTimeoutMs)
      .description('改写请求超时毫秒（默认 8000；超时自动回退确定性读法）'),
    rewriteMaxTokens: z
      .number()
      .min(64)
      .max(4000)
      .default(d.rewriteMaxTokens)
      .description('改写输出 token 基线（默认 400）：插件会按片段长度自动上调（上限 2048），避免 JSON 被截断'),
    rewriteTemperature: z
      .number()
      .min(0)
      .max(2)
      .default(d.rewriteTemperature)
      .description('改写温度（默认 0，越低越稳定）'),
    rewriteCache: z
      .boolean()
      .default(d.rewriteCache)
      .description('相同片段复用讲稿（默认开，减少重复请求）'),
    rewriteDisableThinking: z
      .boolean()
      .default(d.rewriteDisableThinking)
      .description('关闭改写模型的思考链（默认开）：GLM-4.5 等思考型模型不关思考只会输出推理、正文为空，导致改写回退；仅端点支持 thinking 参数时有效'),
    rewriteContextChars: z
      .number()
      .min(0)
      .max(4000)
      .default(d.rewriteContextChars)
      .description('传给改写模型的前文字符上限（默认 800；实际长度按片段动态伸缩，短片段少给、大代码块/大表格多给；0 = 不给前文，仅保留符号表）'),
    pronunciationEnabled: z
      .boolean()
      .default(d.pronunciationEnabled)
      .description('启用多音字用户词表（默认开）。关 = 完全不改任何朗读文本（屏幕本来就不受影响）'),
    pronunciationFixes: z
      .string()
      .default(d.pronunciationFixes)
      .description('多音字用户词表（可增删/清空）：每行「原词 => 同音替身」，替身必须与原词等字数，只允许同音替换，不允许增删字或改成同义词；原词也可写成正则 /pattern/flags（用于「第 N 行」这类动态上下文，此时跳过等字数校验，替换串支持 $1）。默认值是一份「行(háng)」同音词表，不代表固定内置，随时可改'),
    guardMode: z
      .union([z.const('off'), z.const('lenient'), z.const('standard'), z.const('strict')])
      .default(d.guardMode)
      .description('改写守卫强度：standard 默认 / lenient 放宽（更难触发回退）/ strict 收紧 / off 全关（只保留 JSON 协议解析，风险自负）'),
    guardAllowRules: z
      .string()
      .default(d.guardAllowRules)
      .description('自定义放行规则（每行一条，# 注释）：整行 /正则/flags 命中「改写稿」即放行；seg: 前缀改为命中「原始片段」（该片段跳过全部守卫）；其它按字面文字做子串匹配。用于把守卫误杀的读法放行'),
    blockPauseMs: z
      .number()
      .min(0)
      .max(3000)
      .default(d.blockPauseMs)
      .description('段落之间的停顿毫秒（默认 350；0 = 关）。标题之后用 1.6 倍——解决"换段/标题到正文一口气念完"的不自然'),
    wholeSentenceMath: z
      .boolean()
      .default(d.wholeSentenceMath)
      .description('含行内公式的整句交给模型出稿（默认开）：整句一次成型，正文与公式不会各念一遍。关掉则退回公式片段单独改写，长句容易出现重复朗读。仅 mathMode=model 时生效'),
    mathMode: z
      .union([z.const('rules'), z.const('model'), z.const('verbatim')])
      .default(d.mathMode)
      .description('数学朗读模式：rules 确定性规则（默认，零容错）/ model 交给改写模型 / verbatim 原样念出'),
  })
}

/** 兼容导出：平台常量默认 schema（供外部引用/自检）。 */
export const VoiceSettingsSchema: z<VoiceSettingsValue> = createVoiceSettingsSchema()

/** 插件配置（cordis.patch.yml / 设置面板可覆盖；默认值面向对话场景）。 */
export interface Config {
  /** 总开关；关闭时拒绝进入语音模式（toggle 返回 403）。 */
  enabled: boolean
  /** 模型缓存目录。 */
  cacheDir: string
  /** 模型上游 host；huggingface.co / hf-mirror.com 均可达（§4 已验证）。 */
  modelHost: string
  /** 朗读引擎：edge（微软云端，默认）/ vits（本地中文）/ kokoro（本地中英，回复文本不出本机）/ azure（付费云端，SSML 音素）。 */
  ttsEngine: 'edge' | 'vits' | 'kokoro' | 'azure'
  /** Kokoro 模型精度（int8 默认 / fp32 音质更好）。 */
  kokoroModel: KokoroModel
  /** 允许局域网访问 /voice-mode-adaptation/*（默认仅回环；开启后建议前置认证门）。 */
  allowLan: boolean
  /** 允许白名单之外的模型下载源（默认关；仅 https）。 */
  allowCustomModelHost: boolean
  /** 朗读音色（按 ttsEngine 取值：vits 说话人名 / kokoro sid / edge ShortName）。 */
  voice: string
  /** 朗读语速倍率（Q15 设置可改）。 */
  rate: number
}

export const Config: z<Config> = z.object({
  enabled: z.boolean().default(true),
  cacheDir: z.string().default(defaultModelCacheDir()),
  modelHost: z.string().default('https://huggingface.co'),
  ttsEngine: z.union([z.const('edge'), z.const('vits'), z.const('kokoro'), z.const('azure')]).default('edge'),
  kokoroModel: z.union([z.const('int8'), z.const('fp32')]).default('int8'),
  allowLan: z.boolean().default(false),
  allowCustomModelHost: z.boolean().default(false),
  voice: z.string().default('zh-CN-XiaoxiaoNeural'),
  rate: z.number().default(1.0),
})

export function apply(ctx: Context, config: Config): void {
  // --- 全局单活指针：同一时刻至多一个会话处于「自动朗读」（手动朗读不占此位）。 ---
  let autoReadSession: string | null = null
  /** 播放所有者标签页：音频帧只发给它，避免多标签页叠加播放同一句（多重声音）。 */
  let readerTabId: string | null = null

  // --- 回合世代：同一会话每次新 llm/stream 递增。新回合开始时先 cancel 本会话队列，
  //     上一回合没读完的部分立即丢弃、从新回合重新读（需求 2）。 ---
  const streamGen = new Map<string, number>()

  // --- fork 加固：会话存在性校验（第 0 层）。 ---
  // dsh-web 提供 host sessions 服务（in-memory 会话存储）；toggle 只接受
  // 真实存在的会话，拒绝凭空指定任意 sessionId。
  const sessions = ctx.get('sessions') as { get(id: string): unknown } | undefined

  // --- fork 加固：限流器（第 4 层）。 ---
  const limiter = new RateLimiter()
  // 定期回收空 bucket（防 key 数量长期占满 maxKeys 后拒绝新 key；低频路径即可）。
  const limiterPrune = setInterval(() => limiter.prune(Date.now(), 60000), 60000)
  ctx.effect(() => () => clearInterval(limiterPrune))

  /** 规范化模型源（本地 TTS 模型下载用；非法值回退官方源）。 */
  const normalizedModelHost = (): string =>
    validateModelHost(config.modelHost, config.allowCustomModelHost) ?? HOST_PRIMARY

  // --- fork 加固：回环校验（第 2 层，allowLan=false 默认）与 Origin 校验（第 1 层）。 ---
  const denyNonLoopback = (req: IncomingMessage, res: ServerResponse): boolean => {
    if (!config.allowLan && !isLoopbackRequest(req)) {
      res.statusCode = 403
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ error: 'loopback only (allowLan=false)' }))
      return true
    }
    return false
  }
  const denyCrossOrigin = (req: IncomingMessage, res: ServerResponse): boolean => {
    if (!sameOriginRequest(req)) {
      res.statusCode = 403
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ error: 'cross-origin request denied' }))
      return true
    }
    return false
  }

  // --- SSE 客户端表：audio 帧 + mode 状态广播共用一条下行通道。 ---
  type SseSink = (event: string, payload: unknown) => void
  type SseClient = { tabId: string | null; send: SseSink }
  const sseClients = new Set<SseClient>()
  const broadcast = (event: string, payload: unknown): void => {
    for (const c of sseClients) {
      try {
        c.send(event, payload)
      } catch {
        // dead socket: the close handler removes it
      }
    }
  }
  /**
   * 只发给「播放所有者」标签页。历史问题：audio 帧广播给全部标签页时，
   * 同一句 TTS 会在 N 个 tab 同时播放（多重声音/双重奏）。音频帧统一走本函数。
   */
  const sendToReader = (event: string, payload: unknown): void => {
    if (readerTabId === null) return
    for (const c of sseClients) {
      if (c.tabId !== readerTabId) continue
      try {
        c.send(event, payload)
      } catch {
        // dead socket: the close handler removes it
      }
    }
  }

  // --- 设置命名空间（官方分层：schema 平台常量默认 ⊕ config base ⊕ 用户文档）。 ---
  const settingsScope = ctx.settings.register(
    NS_VOICE_MODE,
    createVoiceSettingsSchema(),
    {
      base: {
        ttsEngine: config.ttsEngine,
        voice: config.voice,
        rate: config.rate,
      },
    },
  )
  let vset: VoiceSettingsValue = settingsScope.get()

  // --- 语音改编站：改写器（密钥按凭据引用逐次解析，明文不落配置）。 ---
  let rewriter: SpeechRewriter | null = null
  let rewriterSig = ''
  /** 放行规则解析结果（解析错误照常回报，便于用户发现写法问题）。 */
  let guardAllow: GuardAllowRules = { speech: [], segment: [], errors: [] }
  let guardAllowRaw: string | null = null
  const syncGuard = (): void => {
    const raw = vset.guardAllowRules ?? ''
    if (raw === guardAllowRaw) return
    guardAllowRaw = raw
    guardAllow = parseGuardAllow(raw)
  }
  syncGuard()
  /** 通用凭据解析：合法引用名走 DSH 凭据库（再退环境变量）；其它形态按字面密钥。 */
  const resolveCredential = async (rawRef: string): Promise<string> => {
    const raw = String(rawRef ?? '').trim()
    if (!raw) return ''
    // 合法凭据引用（环境变量名）：走 DSH 凭据机制，再退环境变量。
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(raw)) {
      const creds = ctx.get('credentials') as
        | { resolve?: (r: string) => Promise<{ value?: string } | undefined> }
        | undefined
      if (creds && typeof creds.resolve === 'function') {
        try {
          const r = await creds.resolve(raw)
          if (r && typeof r.value === 'string' && r.value) return r.value
        } catch {
          // 凭据服务未配置/不可用：回退环境变量
        }
      }
      return process.env[raw] ?? ''
    }
    // 其它形态：按字面密钥使用（GUI 直接粘贴密钥的便捷路径）。
    return raw
  }
  /** 解析改写密钥（明文不落配置）。 */
  const resolveRewriteKey = (): Promise<string> => resolveCredential(vset.rewriteApiKeyRef)
  /** 解析 Azure 订阅密钥（明文不落配置）。 */
  const resolveAzureKey = (): Promise<string> => resolveCredential(vset.azureKeyRef)
  /** 仅在连接配置变化时重建（保留缓存）；开关关闭则置空。 */
  const rebuildRewriter = (): void => {
    const s = vset
    const sig = [
      s.rewriteEnabled, s.rewriteBaseUrl, s.rewriteApiKeyRef, s.rewriteModel,
      s.rewriteTimeoutMs, s.rewriteMaxTokens, s.rewriteTemperature, s.rewriteCache,
      s.rewriteDisableThinking, s.guardMode, guardAllowRaw,
    ].join('|')
    if (sig === rewriterSig) return
    rewriterSig = sig
    rewriter = s.rewriteEnabled
      ? new SpeechRewriter({
          baseUrl: s.rewriteBaseUrl,
          apiKey: resolveRewriteKey,
          model: s.rewriteModel,
          timeoutMs: s.rewriteTimeoutMs,
          maxTokens: s.rewriteMaxTokens,
          temperature: s.rewriteTemperature,
          cache: s.rewriteCache,
          disableThinking: s.rewriteDisableThinking,
          guardMode: s.guardMode,
          guardAllow,
        })
      : null
  }
  rebuildRewriter()

  // --- 语音改编站：多音字替代表（用户维护，默认空 = 不改任何词、也不纠音）。 ---
  // 只强制「等字数」这一条不变量：字数不等的条目被拒绝并记录，绝不静默改名。
  let pronunciation: PronunciationFix[] = []
  let pronunciationRaw: string | null = null
  let pronunciationErrors: string[] = []
  const syncPronunciation = (): void => {
    const raw = vset.pronunciationFixes ?? ''
    if (raw === pronunciationRaw) return
    pronunciationRaw = raw
    const parsed = parsePronunciationFixes(raw)
    pronunciationErrors = parsed.errors
    // 开关关闭时不应用任何替换；但解析错误照常回报，方便用户发现词表写法问题。
    pronunciation = vset.pronunciationEnabled ? parsed.fixes : []
  }
  syncPronunciation()

  const speechConfig = (): SpeechAdapterConfig => ({
    enabled: vset.rewriteEnabled,
    mathMode: vset.mathMode,
    rewriter,
    pronunciation,
    contextChars: vset.rewriteContextChars,
    blockPauseMs: vset.blockPauseMs,
    wholeSentenceMath: vset.wholeSentenceMath,
  })

  // --- TTS 引擎工厂（fork：edge 云端 / vits 本地中文 / kokoro 本地中英；设置面板即时切换）。 ---
  const makeEngine = (kind: 'edge' | 'vits' | 'kokoro' | 'azure'): TtsEngine => {
    if (kind === 'edge') return new EdgeTtsEngine(config.voice, config.rate)
    if (kind === 'azure') {
      return new AzureTtsEngine({
        endpoint: () => vset.azureEndpoint,
        resolveKey: resolveAzureKey,
        phonemes: () => parsePhonemeTable(vset.azurePhonemes).rules,
        voice: vset.voice || config.voice,
        rate: vset.rate,
      })
    }
    if (kind === 'kokoro') {
      return createSherpaKokoroEngine({
        cacheDir: config.cacheDir,
        modelHost: normalizedModelHost,
        allowCustomHost: config.allowCustomModelHost,
        model: vset.kokoroModel,
        broadcast,
      })
    }
    return createSherpaVitsEngine({
      cacheDir: config.cacheDir,
      modelHost: normalizedModelHost,
      allowCustomHost: config.allowCustomModelHost,
      broadcast,
    })
  }
  let engineKind: 'edge' | 'vits' | 'kokoro' | 'azure' = vset.ttsEngine ?? config.ttsEngine
  let activeKokoroModel: KokoroModel = vset.kokoroModel

  // --- TTS 队列（§8.4）：逐句合成后经 SSE 广播；epoch 机制支撑打断。 ---
  const queue = new TtsQueue({
    engine: makeEngine(engineKind),
    onError: (sessionId) => sendToReader('tts-error', { sessionId }),
  })
  // fork 修复：启动时把当前设置的音色/语速应用到引擎——
  // 此前引擎默认硬编码为素映雪，朗读直到"设置变化"才更新（重启后朗读一直女声的根因）。
  queue.updateVoice(vset.voice, vset.rate)
  const unsubscribe = queue.subscribe((frame) => sendToReader('audio', frame))
  ctx.effect(() => unsubscribe)
  // 生命周期收尾：插件卸载/热重载时关闭 TTS WebSocket（否则连接悬挂泄漏）。
  ctx.effect(() => () => void queue.close())
  // 设置变化即时生效（applies 'live'）：音色/语速直接热更换；引擎切换重建引擎并
  // 清空在途队列（fork 新增）；其余在下次进入生效。
  ctx.effect(() =>
    settingsScope.watch((next) => {
      vset = next
      // 放行规则先解析，rebuildRewriter 的签名与构造都要用到它。
      guardAllowRaw = null
      syncGuard()
      rebuildRewriter()
      syncPronunciation()
      if (next.ttsEngine !== engineKind) {
        engineKind = next.ttsEngine
        queue.setEngine(makeEngine(engineKind))
      } else if (engineKind === 'kokoro' && next.kokoroModel !== activeKokoroModel) {
        // Kokoro 精度切换：重建引擎指向另一模型目录（已缓存则即时，否则下次下载）。
        activeKokoroModel = next.kokoroModel
        queue.setEngine(makeEngine('kokoro'))
      }
      queue.updateVoice(next.voice, next.rate)
    }),
  )
  /** 当前生效参数（/config 输出给 client 引导；client 每次进入模式重新拉取）。 */
  const currentVoice = (): string => vset.voice
  const currentRate = (): number => vset.rate
  const currentEngine = (): 'edge' | 'vits' | 'kokoro' | 'azure' => engineKind

  // --- 朗读用提示词：仅自动朗读会话的 system prompt 注入。 ---
  // 设置项 spokenFormat（默认关，实时生效）：开启后仅 autoReadSession 的请求被注入；
  // 关闭后 assemble 直接放行（对当前会话的后续回复立即失效）。不能直接改 llm/stream 的
  // options：agent-loop 的 request 经 deepFreeze（只读），赋值会抛 TypeError。改用 assembly
  // 瀑布：dsh-agent 的 assembleContextFor 在 assemble 上下文里注入 agent（官方
  // AssembleContext 类型未声明，merge-extensible，dsh-agent-presets invariant 同款运行时
  // 用法）；按 agent.id 精确匹配自动朗读会话，其它会话、子代理、后台任务会话均不注入。
  ctx.on('system-prompt/assemble', (assembly: PromptAssembly, context: AgentCarriedContext, next) => {
    if (!config.enabled || !vset.spokenFormat) return next()
    const agentId = context.agent?.id
    if (agentId !== undefined && agentId === autoReadSession) {
      assembly.sections.push({ name: VOICE_SPOKEN_SECTION, text: VOICE_SPOKEN_PROMPT })
    }
    return next()
  })

  // --- llm/stream 无损 tap：仅自动朗读会话被观察，其余直达。 ---
  ctx.on('llm/stream', (options: GenerateOptions, next): AsyncIterable<StreamChunk> => {
    const rawSessionId = options.sessionId
    // 只朗读主对话回合：compaction / session-title 等内部生成流带 purpose，
    // 若被 tap 会把「会话摘要/标题生成」播出来（官方 GenerateOptions.purpose 契约）。
    if (!config.enabled || rawSessionId === undefined || options.purpose !== undefined) return next()
    // dsh 0.1.2：sessionId 为 SessionId 品牌（Agent/Session 共用同一身份轴）。
    const sessionId: string = rawSessionId as string
    if (autoReadSession !== sessionId) return next()
    const gen = (streamGen.get(sessionId) ?? 0) + 1
    streamGen.set(sessionId, gen)
    // 需求 2：AI 开始下一回合回复 → 立刻结束上一回合没读完的部分，从新的一回合重新读。
    // cancel 提升队列 epoch（弃积压 + 中止在途合成），随后本回合句子以新 epoch 入队。
    queue.cancel(sessionId)
    return tapActiveStream(sessionId, next(), queue, speechConfig)
  })

  // --- HTTP 面 ---
  const base = BASE_PATH

  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'prefix',
      path: base,
      handler: (req, res: ServerResponse) => {
        if (denyNonLoopback(req, res)) return
        respondJson(res, 200, {
          ok: true,
          name: 'dsh-voice-mode-adaptation',
          enabled: config.enabled,
          autoRead: autoReadSession,
          // 被拒绝的替代表行 / 放行规则行 / Azure 拼音表行：给用户可见反馈，而不是静默忽略。
          pronunciationErrors,
          guardErrors: guardAllow.errors,
          azurePhonemeErrors: parsePhonemeTable(vset.azurePhonemes).errors,
        })
      },
    }),
  )

  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: `${base}/config`,
      handler: (req, res: ServerResponse) => {
        if (denyNonLoopback(req, res)) return
        respondJson(res, 200, {
            basePath: base,
            rate: currentRate(),
            voice: currentVoice(),
            cacheDir: config.cacheDir,
            ttsEngine: currentEngine(),
            audioMime: queue.mime,
            allowLan: config.allowLan,
            autoRead: autoReadSession,
          })
      },
    }),
  )

  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: `${base}/preview`,
      handler: (req: IncomingMessage, res: ServerResponse) => {
        if (denyNonLoopback(req, res)) return
        if (denyCrossOrigin(req, res)) return
        // fork 加固：试听限流（每来源 IP 20 次/分钟——设置面板对比音色
        // 会连续点击，3 次/分钟误伤正常使用；20 次/分钟仍能防滥用打爆 TTS）。
        if (!limiter.hit(`preview:${req.socket.remoteAddress ?? 'unknown'}`, 20, 60000)) {
          res.statusCode = 429
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify({ error: 'rate limited' }))
          return
        }
        // 总开关一致语义（同 /toggle 403）：关闭时试听也不发起合成调用。
        if (!config.enabled) {
          respondJson(res, 403, { error: 'voice mode disabled' })
          return
        }
        collectBody(req, res, MAX_JSON_BODY, async (body) => {
          let voice = ''
          let rate: number | undefined
          try {
            const parsed = JSON.parse(body || '{}') as { voice?: unknown; rate?: unknown }
            voice = String(parsed.voice ?? '').trim()
            if (typeof parsed.rate === 'number' && Number.isFinite(parsed.rate)) {
              rate = Math.min(2, Math.max(0.5, parsed.rate))
            }
          } catch {
            // malformed body → voice '' → 400 below
          }
          // 音色名上限：拦截畸形长串（MAX_JSON_BODY 内的兜底）；合法 ShortName 均远短于此。
          if (voice.length > 128) {
            respondJson(res, 400, { error: 'voice too long' })
            return
          }
          if (!voice) {
            respondJson(res, 400, { error: 'voice required' })
            return
          }
          // 试听例句：kokoro 中英都能读 → 混例句；VITS 只支持中文 → 中文句；
          // Edge 按音色区域选（英文音色读中文会产出空音频）。
          const sample =
            currentEngine() === 'kokoro'
              ? '你好，欢迎使用语音模式。Hello, welcome to voice mode.'
              : currentEngine() === 'vits' || voice.startsWith('zh-')
                ? '你好，欢迎使用语音模式。'
                : 'Hello, welcome to voice mode.'
          let buf: Buffer
          try {
            buf = await queue.synthesize(sample, { voice, rate })
          } catch (e) {
            console.warn(`[dsh-voice-mode-adaptation] preview synthesis failed: ${String(e)}`)
            respondJson(res, 502, { error: '预览合成失败：请检查网络或音色名（ShortName）是否正确' })
            return
          }
          res.writeHead(200, { 'content-type': queue.mime, 'cache-control': 'no-store' })
          res.end(buf)
        })
      },
    }),
  )

  // --- 改写密钥：GUI 输入 → 宿主写入 DSH 凭据库（settings 只留引用名，明文不落配置）。 ---
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: base + '/rewrite-key',
      handler: (req: IncomingMessage, res: ServerResponse) => {
        if (denyNonLoopback(req, res)) return
        if (denyCrossOrigin(req, res)) return
        if (req.method !== 'POST') {
          respondJson(res, 405, { error: 'POST only' })
          return
        }
        if (!limiter.hit('rewrite-key:' + (req.socket.remoteAddress ?? 'unknown'), 10, 60000)) {
          respondJson(res, 429, { error: 'rate limited' })
          return
        }
        collectBody(req, res, MAX_JSON_BODY, async (body) => {
          let ref = ''
          let value = ''
          try {
            const parsed = JSON.parse(body || '{}') as { ref?: unknown; value?: unknown }
            ref = String(parsed.ref ?? '').trim()
            value = String(parsed.value ?? '')
          } catch {
            // malformed -> 400 below
          }
          if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(ref)) {
            respondJson(res, 400, { error: 'invalid ref (use an env-var name like GLM_API_KEY)' })
            return
          }
          const creds = ctx.get('credentials') as
            | {
                set?: (r: string, v: string) => Promise<void>
                unset?: (r: string) => Promise<void>
              }
            | undefined
          if (!creds || typeof creds.set !== 'function') {
            respondJson(res, 501, { error: 'credentials service unavailable' })
            return
          }
          try {
            if (!value.trim()) {
              if (typeof creds.unset === 'function') await creds.unset(ref)
              respondJson(res, 200, { ok: true, ref, cleared: true })
              return
            }
            await creds.set(ref, value)
            respondJson(res, 200, { ok: true, ref })
          } catch (e) {
            respondJson(res, 500, { error: 'store failed: ' + String((e as Error)?.message ?? e) })
          }
        })
      },
    }),
  )

  // --- 累计 token 消耗：仅设置面板查看（进程内累计，重启清零）。GET 读、POST 清零。 ---
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: base + '/usage',
      handler: (req: IncomingMessage, res: ServerResponse) => {
        if (denyNonLoopback(req, res)) return
        if (denyCrossOrigin(req, res)) return
        if (req.method === 'POST') {
          if (!limiter.hit('usage-reset:' + (req.socket.remoteAddress ?? 'unknown'), 10, 60000)) {
            respondJson(res, 429, { error: 'rate limited' })
            return
          }
          resetRewriteUsage()
          respondJson(res, 200, { ok: true, ...rewriteUsage() })
          return
        }
        respondJson(res, 200, rewriteUsage())
      },
    }),
  )

  // --- 自动朗读总开关（替换原语音输入开关）：on=true 进入自动朗读（该会话新回复自动朗读），
  //     on=false 退出。全局单活：切换会话自动让出旧会话。 ---
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: `${base}/read`,
      handler: (req: IncomingMessage, res: ServerResponse) => {
        if (denyNonLoopback(req, res)) return
        if (denyCrossOrigin(req, res)) return
        collectBody(req, res, MAX_JSON_BODY, (body) => {
          let sessionId: string | undefined
          let on: boolean | undefined
          let tabId: string | undefined
          try {
            const parsed = JSON.parse(body || '{}') as { sessionId?: string; on?: boolean; tabId?: string }
            sessionId = parsed.sessionId
            on = parsed.on
            tabId = typeof parsed.tabId === 'string' && parsed.tabId && parsed.tabId.length <= 64 ? parsed.tabId : undefined
          } catch {
            // ignore malformed body
          }
          if (!sessionId) {
            respondJson(res, 400, { error: 'sessionId required' })
            return
          }
          if (on !== undefined && typeof on !== 'boolean') {
            respondJson(res, 400, { error: 'invalid on' })
            return
          }
          // 每会话 2 次/2 秒（允许「开+关」正常操作对），防状态抖动。
          if (!limiter.hit(`read:${sessionId}`, 2, 2000)) {
            respondJson(res, 429, { error: 'rate limited' })
            return
          }
          if (on === true) {
            if (!config.enabled) {
              respondJson(res, 403, { error: 'read-aloud disabled' })
              return
            }
            // 会话存在性校验：只接受真实存在的会话。
            if (sessions && !sessions.get(sessionId)) {
              respondJson(res, 403, { error: 'unknown session' })
              return
            }
            const previous = autoReadSession
            autoReadSession = sessionId
            // 播放所有者：谁开启自动朗读，音频就只发给谁，其余标签页只同步状态、不出声。
            if (tabId) readerTabId = tabId
            // 进入即清本会话旧 TTS 积压（cancel 保留 seq 递增，客户端拒绝线继续有效）。
            queue.cancel(sessionId)
            if (previous && previous !== sessionId) queue.cancel(previous)
            broadcast('read', { active: autoReadSession, ownerTabId: readerTabId })
          } else if (autoReadSession === sessionId) {
            autoReadSession = null
            readerTabId = null
            queue.cancel(sessionId)
            broadcast('read', { active: null, ownerTabId: null })
          }
          respondJson(res, 200, { active: autoReadSession, ownerTabId: readerTabId })
        })
      },
    }),
  )

  // --- 单条手动朗读：把某条已完成的 AI 回复交给 TTS（与自动朗读无关，一次性）。
  //     先 cancel 本会话在途/积压：点旧消息的朗读键时立即停掉正在读的内容，改读这一条。 ---
  const MAX_SPEAK_BODY = 512 * 1024
  const MAX_SPEAK_CHARS = 200000
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: `${base}/speak`,
      handler: (req: IncomingMessage, res: ServerResponse) => {
        if (denyNonLoopback(req, res)) return
        if (denyCrossOrigin(req, res)) return
        if (!config.enabled) {
          respondJson(res, 403, { error: 'read-aloud disabled' })
          return
        }
        collectBody(req, res, MAX_SPEAK_BODY, (body) => {
          let sessionId: string | undefined
          let text = ''
          let tabId: string | undefined
          try {
            const parsed = JSON.parse(body || '{}') as { sessionId?: string; text?: unknown; tabId?: string }
            sessionId = parsed.sessionId
            text = typeof parsed.text === 'string' ? parsed.text : ''
            tabId = typeof parsed.tabId === 'string' && parsed.tabId && parsed.tabId.length <= 64 ? parsed.tabId : undefined
          } catch {
            // malformed -> 400 below
          }
          if (!sessionId) {
            respondJson(res, 400, { error: 'sessionId required' })
            return
          }
          if (!text.trim()) {
            respondJson(res, 400, { error: 'text required' })
            return
          }
          if (text.length > MAX_SPEAK_CHARS) {
            respondJson(res, 413, { error: 'text too long' })
            return
          }
          if (sessions && !sessions.get(sessionId)) {
            respondJson(res, 403, { error: 'unknown session' })
            return
          }
          if (!limiter.hit(`speak:${sessionId}`, 30, 60000)) {
            respondJson(res, 429, { error: 'rate limited' })
            return
          }
          // 点朗读键的标签页成为播放所有者（其余标签页不出声）。
          if (tabId) readerTabId = tabId
          // 打断当前朗读，改读这一条。
          queue.cancel(sessionId)
          const adapter = new SpeechAdapter({
            config: speechConfig,
            onSentence: (s, pauseBeforeMs) => queue.enqueue(sessionId, s, pauseBeforeMs),
          })
          adapter.feed(text)
          adapter.flush()
          broadcast('read', { active: autoReadSession, ownerTabId: readerTabId })
          respondJson(res, 200, { ok: true, ownerTabId: readerTabId })
        })
      },
    }),
  )

  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: `${base}/models/status`,
      handler: (req, res: ServerResponse) => {
        if (denyNonLoopback(req, res)) return
        // 模型实时状态（设置面板轮询；无需语音模式）。
        respondJson(res, 200, { tts: queue.status() })
      },
    }),
  )

  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: `${base}/models/clean`,
      handler: (req: IncomingMessage, res: ServerResponse) => {
        if (denyNonLoopback(req, res)) return
        if (denyCrossOrigin(req, res)) return
        if (!config.enabled) {
          respondJson(res, 403, { error: 'voice mode disabled' })
          return
        }
        collectBody(req, res, MAX_JSON_BODY, (body) => {
          // 清理本地 TTS 引擎模型缓存（vits/kokoro），下一句合成重新下载。
          let engine: 'vits' | 'kokoro' = 'vits'
          try {
            const p = JSON.parse(body || '{}') as { engine?: unknown }
            if (p.engine === 'kokoro' || p.engine === 'vits') engine = p.engine
            else {
              respondJson(res, 400, { error: 'invalid engine' })
              return
            }
          } catch {
            respondJson(res, 400, { error: 'invalid json' })
            return
          }
          const dir = join(config.cacheDir, engine === 'kokoro' ? kokoroModelDir(vset.kokoroModel) : TTS_MODEL_REPO)
          void rm(dir, { recursive: true, force: true })
            .then(() => {
              // 清理的是当前引擎：重建引擎（下一句合成触发重新下载/init）。
              if (engineKind === engine) {
                queue.setEngine(makeEngine(engine))
                queue.updateVoice(vset.voice, vset.rate)
              }
              respondJson(res, 200, { ok: true, engine })
            })
            .catch((e) => respondJson(res, 500, { error: String(e) }))
        })
      },
    }),
  )

  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: `${base}/models/download`,
      handler: (req: IncomingMessage, res: ServerResponse) => {
        if (denyNonLoopback(req, res)) return
        if (denyCrossOrigin(req, res)) return
        if (!config.enabled) {
          respondJson(res, 403, { error: 'voice mode disabled' })
          return
        }
        collectBody(req, res, MAX_JSON_BODY, (body) => {
          let engine: 'vits' | 'kokoro' = 'vits'
          try {
            const p = JSON.parse(body || '{}') as { engine?: unknown }
            if (p.engine === 'kokoro' || p.engine === 'vits') engine = p.engine
            else {
              respondJson(res, 400, { error: 'invalid engine' })
              return
            }
          } catch {
            respondJson(res, 400, { error: 'invalid json' })
            return
          }
          // 仅当前生效的本地引擎可在此触发下载（设置面板「下载」按钮只在本地引擎下出现）。
          if (engineKind !== engine) {
            respondJson(res, 400, { error: 'engine not active' })
            return
          }
          void queue
            .prepare()
            .then(() => respondJson(res, 200, { ok: true, engine }))
            .catch((e) => {
              console.warn(`[dsh-voice-mode-adaptation] model download failed: ${String(e)}`)
              respondJson(res, 502, { error: '模型下载失败：请检查网络' })
            })
        })
      },
    }),
  )

  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: `${base}/voices`,
      handler: async (req: IncomingMessage, res: ServerResponse) => {
        if (denyNonLoopback(req, res)) return
        if (denyCrossOrigin(req, res)) return
        // Edge 全量音色（设置面板选 Edge 时拉取；网络失败由 client 回退常用清单）。
        try {
          const voices = await listEdgeVoices()
          respondJson(res, 200, { voices })
        } catch (e) {
          respondJson(res, 502, { error: String(e) })
        }
      },
    }),
  )

  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: `${base}/cancel`,
      handler: (req: IncomingMessage, res: ServerResponse) => {
        if (denyNonLoopback(req, res)) return
        if (denyCrossOrigin(req, res)) return
        collectBody(req, res, MAX_JSON_BODY, (body) => {
          let sessionId: string | undefined
          try {
            const parsed = JSON.parse(body || '{}') as { sessionId?: string }
            sessionId = parsed.sessionId
          } catch {
            // ignore malformed body
          }
          if (sessionId && !limiter.hit(`cancel:${sessionId}`, 2, 1000)) {
            respondJson(res, 429, { error: 'rate limited' })
            return
          }
          // 停 TTS（epoch++，积压与在途全弃）。
          if (sessionId) queue.cancel(sessionId)
          respondJson(res, 200, { ok: true })
        })
      },
    }),
  )

  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: `${base}/stream`,
      handler: (req, res: ServerResponse) => {
        if (denyNonLoopback(req, res)) return
        // fork 加固：SSE 连接上限（防连接耗尽）。
        if (sseClients.size >= 4) {
          respondJson(res, 429, { error: 'too many streams' })
          return
        }
        // 从查询串取 tabId：音频只发给播放所有者标签页。
        let tabId: string | null = null
        try {
          const u = new URL(req.url ?? '/', 'http://localhost')
          tabId = u.searchParams.get('tabId')
        } catch {
          // ignore malformed url
        }
        if (tabId !== null && (tabId === '' || tabId.length > 64)) tabId = null
        res.writeHead(200, {
          'content-type': 'text/event-stream; charset=utf-8',
          'cache-control': 'no-cache, no-transform',
          connection: 'keep-alive',
        })
        res.write('retry: 3000\n\n')
        const send: SseSink = (event, payload) => {
          res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`)
        }
        const client: SseClient = { tabId, send }
        sseClients.add(client)
        // 上线即告知当前自动朗读归属与播放所有者（纠正多标签页/多会话漂移）。
        send('read', { active: autoReadSession, ownerTabId: readerTabId })
        const heartbeat = setInterval(() => {
          try {
            res.write(': hb\n')
          } catch {
            // socket 已销毁的边缘窗口：忽略（cleanup 会清定时器）
          }
        }, 25000)
        let cleaned = false
        const cleanup = (): void => {
          if (cleaned) return
          cleaned = true
          clearInterval(heartbeat)
          sseClients.delete(client)
          // 播放所有者标签页断开：把所有权移交给仍在线的一个标签页；没有则清空，
          // 避免「自动朗读显示为开、却没有任何标签页出声」。
          if (tabId !== null && tabId === readerTabId) {
            const next = [...sseClients].find((c) => c.tabId !== null)
            readerTabId = next && next.tabId !== null ? next.tabId : null
            broadcast('read', { active: autoReadSession, ownerTabId: readerTabId })
          }
        }
        req.on('close', cleanup)
        res.on('close', cleanup)
      },
    }),
  )
}

/**
 * 有界 JSON 请求体收集：超过 maxBytes 立即 413（插件 HTTP 面不信任外部载荷体积；
 * /speak 的文本上限在调用处用 MAX_SPEAK_BODY 单独控制）。
 */
const MAX_JSON_BODY = 16 * 1024

function collectBody(
  req: IncomingMessage,
  res: ServerResponse,
  maxBytes: number,
  onBody: (body: string) => void | Promise<void>,
): void {
  const chunks: Buffer[] = []
  let received = 0
  let tooLarge = false
  req.on('data', (c: Buffer) => {
    if (tooLarge) return
    received += c.length
    if (received > maxBytes) {
      tooLarge = true
      respondJson(res, 413, { error: 'request body too large' })
      return
    }
    chunks.push(c)
  })
  req.on('end', () => {
    if (tooLarge) return
    // 按 Buffer 收集后一次性 UTF-8 解码：隐式 `body += c` 会在多字节字符跨 chunk 时损坏中文。
    const body = Buffer.concat(chunks).toString('utf8')
    // onBody 可能是 async（如 /preview）；rejection 不得成为未处理错误（响应已由回调内部处理）。
    try {
      const r = onBody(body)
      if (r && typeof r.then === 'function') r.catch(() => {})
    } catch {
      // 同步抛已由回调自身兜住；此处仅防漏
    }
  })
  req.on('error', () => {
    // 客户端中断：忽略（不重复响应）
  })
}

/**
 * 自动朗读会话的流 tap：无损转发（观察不改流）；text-delta 进句子切分器并入 TTS 队列。
 * 回合被中止（aborted）时不 flush 尾部半句——那正是未完成的内容，不应朗读。
 */
async function* tapActiveStream(
  sessionId: string,
  inner: AsyncIterable<StreamChunk>,
  queue: TtsQueue,
  getSpeechConfig: () => SpeechAdapterConfig,
): AsyncIterable<StreamChunk> {
  let flushed = false
  let finishReason: unknown = null
  const adapter = new SpeechAdapter({
    config: getSpeechConfig,
    onSentence: (s, pauseBeforeMs) => queue.enqueue(sessionId, s, pauseBeforeMs),
  })
  const flushOnce = (): void => {
    if (flushed) return
    flushed = true
    adapter.flush()
  }
  try {
    for await (const chunk of inner) {
      // 只朗读最终答复的 text-delta；reasoning/tool-call 不读。
      if (chunk.type === 'text-delta' && chunk.text) adapter.feed(chunk.text)
      if (chunk.type === 'finish') finishReason = chunk.reason
      yield chunk
    }
  } finally {
    const aborted =
      finishReason !== null &&
      typeof finishReason === 'object' &&
      (finishReason as { kind?: unknown }).kind === 'aborted'
    if (!aborted) flushOnce()
  }
}