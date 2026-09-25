# dsh-voice-mode-adaptation —— 开发者上下文（纯朗读版，重写式维护）

> 用途：给新会话的「此刻心智模型」。状态变了就改对应行，过时内容删除。
> 历史/为什么 → `git log` 与 docs/adr/。用户面向 → README.md。保持本文件 ~60 行以内。

## 是什么

DSH **纯语音朗读**插件（**无语音输入**）：把 AI 回复读出来。
两种触发，一个主动、一个自动：
1. **每条 AI 回复后的朗读键**（`conversation.chat.assistant-actions`）：只朗读被点的那一条（一次性）。
2. **朗读总开关**（`conversation.input.right`，原麦克风按钮位置）：开启后该会话每轮新回复自动朗读；
   **新回合开始时 host 先 `queue.cancel(sessionId)`，客户端按帧里的 `gen` 变化停旧播新（需求 2）**。

TTS 默认 Edge 云端；本地 VITS / Kokoro 可选。语音改编站（公式/表格/代码口播稿）保留。

## 版本与位置

- 分支 `feat/speech-adaptation`；本改造为 0.9.0-tts-only.1（破坏性：移除全部 ASR）。
- 插件目录：`plugin/dsh-voice-mode`；web profile 以 link 方式安装（改源码必须重启 dsh web，前端改完 Ctrl+Shift+R）。

## 运行时架构（host src/index.ts）

```
自动朗读：autoReadSession（全局单活）
  llm/stream tap（仅该会话、无 purpose）
    → 新回合：queue.cancel(sessionId)   // 弃积压 + 中止在途合成 + epoch++
    → SpeechAdapter.feed(text-delta) → 分句 → TtsQueue.enqueue
  → SSE 'audio' 帧（含 gen/sentenceId/chunkId/final）→ client 按句拼帧 → Web Audio 链式播放

手动朗读：POST /speak {sessionId, text}
  → queue.cancel(sessionId) → SpeechAdapter.feed+flush → 同上

HTTP：/read（开关）/speak（单条）/cancel（停）/stream（SSE）/config/preview/voices/
     models(status|download|clean)/rewrite-key/usage
```

## 关键不变量

- **只朗读最终答复**：tap 只取 `text-delta`；reasoning/tool-call 不读；aborted 回合不 flush 尾部半句。
- **模式隔离**：只有 `autoReadSession` 的 llm/stream 被 tap（`purpose` 非空一律放行，避免标题/摘要被读）。
- **新回合打断旧回合**：host `queue.cancel` 提升 **epoch**；epoch 作为帧的 `gen` 下发；client 见 `gen` 变化即 `engine.skip()`（停掉已调度旧音频）+ 清拼帧缓冲。sentenceId 跨 cancel 单调递增，client 拒绝线仍有效。
- **手动朗读也是一次 cancel+新 gen**：点旧消息立即打断当前朗读。
- **只播当前查看会话**：client 的 `currentSessionId` 由组件挂载时登记；切换会话即停播。
- **本地 TTS 模型**：懒下载 + `.part` 断点续传 + SHA256（models.ts）；事件 `model-progress`/`model-error`。
- **屏幕归屏幕**：只改送 TTS 的文本，Markdown 渲染链路一行未动。
- **改编站**：默认关（`rewriteEnabled=false`）；关时完全退化为「原文→清洗→分句」。

## 设置语义（VoiceSettingsValue）

| 键 | 默认 | 语义 |
|---|---|---|
| ttsEngine | edge | edge / vits / kokoro / azure（即时） |
| kokoroModel | int8 | int8（109MB）/ fp32（311MB） |
| voice / rate | 按引擎 / 1.0 | 音色 / 语速（即时） |
| spokenFormat | false | 自动朗读会话注入排版提示词（实时） |
| rewriteEnabled | false | 语音改编站总开关 |
| mathMode / guardMode / rewrite* / pronunciation* / blockPauseMs / wholeSentenceMath | — | 改编站细则 |

> 已移除（v0.9.0-tts-only.1）：interruptLevel / silenceMs / idleTimeoutMinutes / modelHost（用户项）/
> autoSend / autoResume / mode / bargeInMode / echoGateDb / shortcut / senseVoice / wakeWord / toolBeep。

## 关键源文件

src/index.ts（host：路由/tap/队列接线/改编站装配）· src/client.tsx（朗读总开关 + 消息朗读键 + 播放引擎）
· src/tts-queue.ts（逐会话队列/epoch/帧协议）· src/speech-adapter.ts + block-router.ts + math.ts + rewriter.ts（改编站）
· src/segmenter.ts（清洗/分句/多音字）· src/tts-local.ts + tts-vits-worker.ts（本地引擎）· src/azure-ssml.ts
· src/models.ts（下载/校验）· src/settings-form.tsx（设置卡）· src/strings.ts（文案）

## 验证

`npm run typecheck`（host+client）、`npm test`（segmenter/block-router/math/azure-ssml/rewriter/speech-adapter/download/verify-client）、
`npm run verify`（聚合）。当前全绿。设备/真机朗读路径需重启 dsh web 后人工试听。
