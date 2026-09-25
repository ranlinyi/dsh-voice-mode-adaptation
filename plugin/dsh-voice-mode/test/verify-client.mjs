/**
 * 发布前自检：核对 bundle 清单、exports、files 白名单与 client bundle 形状（纯朗读版）。
 * 无网络、无 dsh 依赖。运行：node test/verify-client.mjs（npm test 串联）。
 */
import assert from 'node:assert/strict'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

let passed = 0
const t = (name, fn) => {
  fn()
  passed++
  console.log('  ok  ' + name)
}

const read = (p) => readFileSync(join(root, p), 'utf8')
const pkg = JSON.parse(read('package.json'))

t('dsh.bundle.patch 指向 cordis.patch.yml 且文件存在', () => {
  assert.equal(pkg.dsh?.bundle?.patch, './cordis.patch.yml')
  assert.ok(existsSync(join(root, 'cordis.patch.yml')))
})
t('dsh.client 声明 platform=web + inject 运行时（含 ui-chat 消息操作行）', () => {
  assert.equal(pkg.dsh?.client?.platform, 'web')
  assert.deepEqual(pkg.dsh?.client?.inject, [
    '@deepseek-ai/dsh-client-connection',
    '@deepseek-ai/dsh-cordis-client-runner',
    '@deepseek-ai/dsh-api-remotes',
    '@deepseek-ai/dsh-client-locale',
    '@deepseek-ai/dsh-client-ui-renderer',
    '@deepseek-ai/dsh-client-ui-conversation',
    '@deepseek-ai/dsh-client-ui-chat',
    '@deepseek-ai/dsh-client-ui-layout',
    '@deepseek-ai/dsh-client-ui-settings',
    '@deepseek-ai/dsh-client-ui-settings-plugins',
  ])
})
t('exports 必须含 ./.client、./cordis.patch.yml、./package.json', () => {
  const e = pkg.exports ?? {}
  for (const k of ['.', './client', './cordis.patch.yml', './package.json']) {
    assert.ok(e[k], 'missing exports[' + k + ']')
  }
  assert.equal(e['./client'], './lib/client.js')
})
t('files 白名单含 cordis.patch.yml 与 lib 产物', () => {
  const files = pkg.files ?? []
  for (const f of ['lib/index.js', 'lib/client.js', 'cordis.patch.yml', 'README.md', 'LICENSE']) {
    assert.ok(files.includes(f), 'files missing ' + f)
  }
})
t('files 不再包含已删除的 ASR worker 产物', () => {
  const files = pkg.files ?? []
  assert.ok(!files.includes('lib/sense-worker.mjs'), 'sense-worker.mjs 应已移除')
})
t('publishConfig.access 为 public', () => {
  assert.equal(pkg.publishConfig?.access, 'public')
})
t('engines.node 如实声明', () => {
  assert.ok(pkg.engines?.node)
})
t('lib/index.js 存在且为 ESM（export 声明）', () => {
  const src = read('lib/index.js')
  assert.ok(/export\s*\{/.test(src), 'host bundle lacks export statement')
  for (const s of ['name', 'apply', 'Config', 'VoiceSettingsSchema']) {
    assert.ok(src.includes(s), 'host bundle missing ' + s)
  }
})
t('host bundle 只有朗读端点（/read、/speak），无 ASR 端点', () => {
  const src = read('lib/index.js')
  for (const s of ['/read', '/speak', '/cancel', '/stream', '/preview']) {
    assert.ok(src.includes(s), 'host bundle missing endpoint ' + s)
  }
  for (const s of ['createAsrRuntime', 'handleAsrRequest', 'zipformer', 'senseVoice', 'bargeInMode', 'keepAsr']) {
    assert.ok(!src.includes(s), 'host bundle still contains removed ASR symbol: ' + s)
  }
})
t('host llm tap 在新回合开始时 cancel 本会话队列（需求 2）', () => {
  const src = read('lib/index.js')
  assert.ok(src.includes('autoReadSession'), 'host bundle missing autoReadSession')
  assert.ok(/cancel\(sessionId\)/.test(src), 'host bundle missing per-turn queue cancel')
  assert.ok(src.includes('/read') && src.includes('/speak'), 'host bundle missing read/speak routes')
})
t('host bundle 含分块帧协议（sentenceId/chunkId/final）', () => {
  const src = read('lib/index.js')
  assert.ok(src.includes('sentenceId'), 'host bundle missing sentenceId')
  assert.ok(src.includes('chunkId'), 'host bundle missing chunkId')
  assert.ok(src.includes('final: false'), 'host bundle missing non-final frame flag')
})
t('lib/client.js 是 __ModuleLoader__ 闭包且注入朗读相关槽位', () => {
  const src = read('lib/client.js')
  assert.ok(src.includes('window.__ModuleLoader__.load'), 'missing loader wrapper')
  for (const s of [
    'conversation.input.right',
    'conversation.input.dock',
    'conversation.chat.assistant-actions',
    'settings.plugin.item',
    'voice-mode-adaptation',
    'read-toggle',
    'read-one',
    '/read',
    '/speak',
  ]) {
    assert.ok(src.includes(s), 'client bundle missing ' + s)
  }
})
t('client bundle 已无 ASR/录音/AEC 代码', () => {
  const src = read('lib/client.js')
  for (const s of ['NlmsAec', 'zipformer', 'createAsrEngine', 'audioWorklet', 'isSpeechTrueCount', 'bargeInMode']) {
    assert.ok(!src.includes(s), 'client bundle still contains removed ASR symbol: ' + s)
  }
})
t('client 按句拼帧完整性校验仍在（curChunkCount）', () => {
  const src = read('lib/client.js')
  assert.ok(src.includes('curChunkCount'), 'client bundle missing chunk-count integrity check')
})
t('build 产物与源码时间戳对齐（lib 不早于 src）', () => {
  const srcFiles = ['src/index.ts', 'src/client.tsx', 'src/tts-queue.ts', 'src/segmenter.ts', 'src/speech-adapter.ts', 'src/strings.ts']
  const newestSrc = Math.max(...srcFiles.map((s) => (existsSync(join(root, s)) ? statSync(join(root, s)).mtimeMs : 0)))
  for (const f of ['lib/index.js', 'lib/client.js']) {
    assert.ok(readFileSync(join(root, f)).length > 10_000, f + ' 疑似未构建')
    assert.ok(statSync(join(root, f)).mtimeMs >= newestSrc - 500, f + ' 早于源码（需 node build.mjs）')
  }
})

console.log('\nverify-client：' + passed + ' 项通过')
