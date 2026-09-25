> [!IMPORTANT]
> **Read-aloud only (v0.9.0-tts-only.1)**: all voice input (ASR, microphone, wake word, barge-in) was removed; this plugin only reads assistant replies aloud.
> Each reply gets a Read button; the button beside the composer is the auto read-aloud master switch. See `CONTEXT.md` for the current design.

# dsh-voice-mode

[![npm version](https://img.shields.io/npm/v/dsh-voice-mode?style=flat-square)](https://www.npmjs.com/package/dsh-voice-mode)
[![License](https://img.shields.io/github/license/qishuilalala/dsh-voice-mode?style=flat-square)](https://github.com/qishuilalala/dsh-voice-mode/blob/main/plugin/dsh-voice-mode/LICENSE)
[![dsh-plugin](https://img.shields.io/badge/dsh--plugin-voice-brightgreen?style=flat-square)](https://github.com/topics/dsh-plugin)

> Read-aloud for DeepSeek Harness (dsh): a Read button after every assistant
> reply, plus an auto read-aloud master switch that reads each new reply and
> interrupts the previous unfinished one. No voice input.
>
> 中文说明见 [README.md](./README.md).

![dsh-voice-mode-adaptation](assets/hero-banner.png)

![UI overview (concept image)](assets/ui-overview.png)

> **Version note (0.9.0-tts-only.1)**: all voice input (ASR / microphone / wake word / barge-in / AEC) and its settings, endpoints and models were removed; only read-aloud remains. Engines: Edge cloud (default) / local VITS / Kokoro (zh+en; `int8` 109 MB / `fp32` 311 MB) / Azure cloud (SSML phonemes). The optional speech adaptation station is off by default and sends nothing.

## Fork enhancements (this repo)

- **Read-aloud shape**: one Read button per assistant reply, plus an auto read-aloud master switch; a new reply interrupts the previous unfinished one;
- **Switchable engines**: Edge cloud (default) / local VITS (Chinese) / local Kokoro (zh+en, 103 voices; `int8` / `fp32`) / Azure cloud (SSML phonemes); engine / voice / rate / model precision apply live;
- **Speech adaptation station (optional)**: formulas / tables / code → spoken scripts; default off, zero egress;
- **Pronunciation list + paragraph pauses**;
- **Hardening**: loopback + Origin guards, per-endpoint rate limits, local model SHA256 pinning, download-host allowlist;
- **Version compatibility**: one codebase for dsh 0.1.1-rc.2 → 0.1.5-rc.2 (`npm run check:anchors`, `npm run verify:dual`).

## Features


- **Auto read-aloud master switch**: the Read button in the composer toolbar (where the mic used to be) toggles continuous reading for the current session; globally single-active
- **Per-reply Read button**: one Read button per assistant message (next to copy/like), reads just that reply; clicking an older one stops the current reading first
- **New-reply interrupt**: when a new reply starts, the host cancels the session's synth queue (drop backlog, abort in-flight, epoch++), and the client sees the frame `gen` change and calls `engine.skip()` to stop the previous turn's already-scheduled audio
- **Output pipeline**: only the final answer's `text-delta` is read (reasoning / tool calls are skipped), streamed sentence-by-sentence with a caption status bar above the composer (with a Stop button)
- **Speech adaptation station (optional)**: formulas / tables / code → spoken scripts; whole-sentence output for inline math; paragraph pauses; pronunciation list
- **Lazy model download with progress**: local engines download models on first use (`.part` resumable + SHA256); live progress in the settings panel; `npm run prefetch` pre-downloads
- **Settings**: Settings → Plugins → voice-mode-adaptation, with engine / voice / rate / model precision / adaptation options; **voices are previewable**
- **Resilience**: TTS unreachable hint, visible model-download failure, SSE auto-reconnect

## Interaction gestures

| Gesture | Behaviour |
| --- | --- |
| Click the mic button / `Ctrl+Shift+V` | Enter / exit voice mode |
| Just speak, pause ~1500 ms (toggle) | Accumulate into draft, auto-send after ~3 s of quiet |
| Hold `Ctrl` (toggle, ≥250 ms speech) | Force-send the current segment immediately |
| **Hold the mic button (hold)** | Hold to talk, release to send; swipe up / `Esc` / blur abandons the segment; <250 ms tap exits the mode |
| Hold `Ctrl` (hold, ≥600 ms) | Keyboard push-to-talk, release to send |
| Speak the wake word first (if configured) | Activate from standby into listening (then recognition and sending begin) |
| Speak while AI is reading | Interrupt playback and cancel the running turn |
| Type in the input box | Auto-exit voice mode (draft is kept) |

## Installation

**Requirements**: dsh web (Node ≥ 18), a modern browser (Chrome / Edge / Firefox, supporting `getUserMedia` and Web Audio).

```sh
# Option 1: from npm (recommended)
dsh plugin --profile web add dsh-voice-mode
# Equivalent via npx if the dsh CLI is not installed locally:
npx -y @deepseek-ai/dsh plugin --profile web add dsh-voice-mode

# Option 2: local tarball
dsh plugin --profile web add ./dsh-voice-mode-0.1.0.tgz

# Option 3: from source
git clone https://github.com/qishuilalala/dsh-voice-mode.git
cd dsh-voice-mode/plugin/dsh-voice-mode && pnpm install && pnpm build
dsh plugin --profile web add .
```

**Bundle plugins require a dsh restart to take effect** (restart methods by platform):

- **Linux (systemd)**: `systemctl restart dsh`
- **Windows / macOS / manual hosting**: restart your dsh process (kill and run `dsh web` again, or restart it in your service manager)

**Optional**: pre-download the ASR model to reduce the download wait on the first voice-mode entry:

```sh
npm run prefetch          # run inside the plugin dir; writes to the platform cache dir
# or specify the cache location: node scripts/prefetch.mjs --cache-dir /where/ever/models
```

## Usage

1. Click the mic button in the input toolbar (or press `Ctrl+Shift+V`) to enter voice mode; a status bar appears above the input box
2. Choose how to speak: just talk and let the ~1500 ms pause split and ~3 s of quiet auto-send (toggle); or hold the mic button and release to send (hold)
3. The AI answer is read sentence-by-sentence with a caption overlay at the bottom-right; click "Skip" or just start speaking to interrupt
4. Click "Exit" in the status bar (or press `Ctrl+Shift+V` again) to leave voice mode

On first entry the recognition model is downloaded; the status bar shows `正在加载模型… <file> <percent>%`.

If a wake word is configured, you land in standby first (the status bar prompts `说『唤醒词』开始`), and recognizing starts after you speak the wake word.

## Settings (Settings → Plugins → Plugins config → 语音模式)

| Key | Default | Description |
| --- | --- | --- |
| `ttsEngine` | `edge` | Read-aloud engine: `edge` Microsoft cloud (default, fast) / `vits` local Chinese / `kokoro` local zh+en; **applies live** |
| `kokoroModel` | `int8` | Kokoro precision: `int8` (default, 109 MB, CPU/low-bandwidth) / `fp32` (311 MB, better quality, GPU/large memory); same 103 voices; **applies live** |
| `voice` | per engine | Voice: 5 VITS speakers; 103 Kokoro voices (◀▶ stepper; 62/68/75/76 favourite males pinned); Edge ShortNames below. The inline "试听" button previews it at the current rate |
| `rate` | `1.0` | Reading speed multiplier (0.5 slow ～ 2.0 fast), **applies live** |
| `interruptLevel` | `0` | Barge-in sensitivity (host-side VAD frame detection + echo gate): 0 high threshold / 1 medium / 2 low |
| `silenceMs` | `1500` | Silence pause in ms that marks the end of a complete sentence |
| `idleTimeoutMinutes` | `10` | Minutes of inactivity before auto-exiting voice mode (reading counts as activity) |
| `modelHost` | default | Model download host (use `https://hf-mirror.com` on mainland networks) |
| `autoSend` | `true` | Auto-send once quiet (consecutive segments join into one message); when off, text only goes to the draft (hold `Ctrl` / release in hold mode still sends) |
| `mode` | `toggle` | Interaction mode: `toggle` continuous listening + 1500 ms silence split; `hold` push-to-talk, release to send (short tap exits) |
| `wakeWord` | empty (off) | Wake word (e.g. `你好小D`): speak it after entering to activate, avoiding accidental triggers; empty = off |

Effect timing: `voice`/`rate`/`ttsEngine`/`kokoroModel`/`spokenFormat` take effect **immediately** (TTS hot-swap); the rest apply on the next voice-mode entry. Defaults come from the plugin config (`base` layer) — they follow the config unless explicitly changed.

### Common voices (full list: `node scripts/list-voices.mjs`)

| ShortName | Description |
| --- | --- |
| `zh-CN-XiaoxiaoNeural` | Xiaoxiao · Female (default) |
| `zh-CN-XiaoyiNeural` | Xiaoyi · Female |
| `zh-CN-YunxiNeural` | Yunxi · Male |
| `zh-CN-YunjianNeural` | Yunjian · Male |
| `zh-CN-YunyangNeural` | Yunyang · Male |
| `zh-CN-YunxiaNeural` | Yunxia · Male |
| `zh-CN-liaoning-XiaobeiNeural` | Xiaobei · Northeastern Mandarin · Female |
| `zh-CN-shaanxi-XiaoniNeural` | Xiaoni · Shaanxi Mandarin · Female |
| `zh-HK-HiuMaanNeural` | HiuMaan · Cantonese · Female |
| `zh-HK-WanLungNeural` | WanLung · Cantonese · Male |
| `zh-TW-HsiaoYuNeural` | HsiaoYu · Taiwanese Mandarin · Female |
| `zh-TW-YunJheNeural` | YunJhe · Taiwanese Mandarin · Male |
| `en-US-AriaNeural` | Aria · English · Female |
| `en-US-GuyNeural` | Guy · English · Male |

## Configuration (bundle patch / settings.yaml)

You can also edit the `voice-mode:` section of `~/.dsh/settings.yaml` directly (the GUI card and RPC write to the same document layer):

```yaml
- id: voice-mode
  name: dsh-voice-mode
  config:
    enabled: true                 # false = disables voice mode entirely (toggle rejects)
    cacheDir: ~/.cache/dsh-voice-mode/models   # overridable; platform default otherwise
    # Defaults seeded for the settings (the settings panel overrides; the panel is authoritative):
    voice: zh-CN-XiaoxiaoNeural
    rate: 1.0
    interruptLevel: 0
    silenceMs: 1500
    idleTimeoutMinutes: 10
    modelHost: https://huggingface.co
```

> Note: the effective values of `voice/rate/interruptLevel/silenceMs/idleTimeoutMinutes/modelHost/autoSend`
> come from the **settings panel**; the bundle config only seeds defaults for those keys
> (`enabled/cacheDir` remain bundle-config-only).
> The plugin HTTP namespace is fixed to `/voice-mode` (matching the client bundle contract; not configurable).

## API

| Route | Description |
| --- | --- |
| `GET /voice-mode/stream` | SSE: `event: audio` (`{sessionId, seq, text, audio(base64 MP3)}`), `event: mode` (global single-active ownership), `event: tool` (beep), `event: asr-progress / asr-ready / asr-error / tts-error` |
| `POST /voice-mode/toggle` | `{sessionId, on}` enter/exit voice mode (globally single-active) |
| `POST /voice-mode/asr` | Raw f32 LE 16k PCM payload → `{text}` (streaming zipformer2); returns `202 {loading}` until the model is ready; `?reset=1` discards the in-flight segment (used on wake-word hit) |
| `POST /voice-mode/cancel` | `{sessionId}` invalidates the TTS queue and drops the in-flight ASR segment |
| `POST /voice-mode/preview` | `{voice, rate?}` one-shot synthesis preview → `audio/mpeg` (400 missing voice / voice too long; 502 synthesis failure, e.g. invalid ShortName; 403 when the plugin's `enabled=false`). Does not require voice mode to be active; uses an isolated synthesis connection and does not affect the reading queue |
| `GET /voice-mode/config` | Client bootstrap parameters (silence threshold / sensitivity / voice and rate, etc.) |
| `GET /voice-mode` | Health check `{ok, name, enabled, active}` |

## Model & cache

- Recognition model: `csukuangfj/sherpa-onnx-streaming-zipformer-zh-int8-2025-06-30` (encoder ≈154 MB / decoder / joiner / tokens, ~160 MB total), running host-side via sherpa-onnx (Node WASM, Apache-2.0, natively cross-platform)
- Cache directory defaults by platform:
  - **Windows**: `%LOCALAPPDATA%\dsh-voice-mode\models`
  - **macOS / Linux**: `~/.cache/dsh-voice-mode/models`
  - both overridable via `cacheDir`
- Downloads use `.part` resume; `huggingface.co` falls back to `hf-mirror.com` on failure (configurable via `modelHost`)

## How it works

![architecture](assets/architecture.png)

```
input:  mic ──RMS VAD (1500 ms silence split)──▶ POST /voice-mode/asr (f32 PCM, 16k, incremental)
                                            │ zipformer2 streaming ASR (host-side WASM)
                                            ▼
        composer draft ──autoSend──▶ model stream ──llm/stream tap (active voice session only)
                                            │ text-delta filter → sentence segmentation
                                            ▼
        browser ◀── SSE /voice-mode/stream ◀── TtsQueue (local VITS / native Kokoro / Edge, sentence-by-sentence)
```

- Speech and reading only happen for the session pointed to by the global single-active pointer `activeVoiceSession`; other sessions pass through `llm/stream` with zero overhead (mode isolation)
- The `llm/stream` tap is lossless: every chunk passes through unchanged; segmentation/synthesis only observe and never block the model stream
- ASR runs host-side (sherpa-onnx WASM, zipformer2 Chinese streaming + SenseVoice finalization which adds punctuation); the browser only captures audio (`getUserMedia` 16k mono) and does endpoint detection
- Local TTS (VITS / native Kokoro) runs in an isolated child process (fork, auto-restart); barge-in kills the in-flight synthesis instantly to free CPU
- The TTS queue is per-session with an epoch version: old frames are all invalidated after a barge-in, so it is truly silent

## Known limitations

- Barge-in relies on browser echo cancellation (`echoCancellation`); loud speaker volume may leak into the mic (no JS-level AEC)
- `Ctrl+Shift+V` overrides the browser's "paste as plain text" shortcut (normal `Ctrl+V` paste still works)
- The recognition model prioritizes Simplified Chinese; recognition quality is affected by ambient noise
- Browser autoplay policy: reading requires prior user interaction on the page (clicking the mic satisfies it); if the browser blocks playback and the status bar shows no hint, make sure the page is foregrounded and not muted
- **The wake word is a lightweight implementation** (text matching on the streaming transcript, not a dedicated KWS engine): it may lag or misfire in noisy environments; the wake word itself never enters the chat (the buffer is dropped on hit)
- In hold mode, switching windows/tabs while holding **abandons the segment** (prevents continuous recording); come back and hold again
- The hero (new-session empty state) has no voice entry: voice mode is a session-level feature; enter a session first and use the mic button in the input toolbar
- The preview request timeout uses `AbortSignal.timeout` (Chrome 103+ / Firefox 100+ / Safari 16+); on older browsers clicking preview immediately shows a failure hint — an expected degradation

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Mic click does nothing, red hint in the status bar | The browser denied mic permission: allow it in the address bar and retry |
| Status bar stuck on `正在加载模型… x%` | Check the network; the model is large (160 MB) — `npm run prefetch` first; on mainland networks set `modelHost` to `https://hf-mirror.com` |
| Status bar shows `语音模型下载失败` | Both mirrors are unreachable: check network/proxy and re-enter voice mode (resumable) |
| Caption appears (overlay) but no sound | Check system volume/output; if autoplay is blocked, click anywhere on the page and retry |
| Status bar shows `朗读连接失败：正在重试…` | Edge TTS unreachable (overseas service), auto-retries; if it persists, check network/proxy |
| Poor recognition | Get closer to the mic, reduce ambient noise; if echo remains, raise the interrupt sensitivity by one step |
| Hold mode has no effect | Make sure hold mode is active and you're in voice mode (button shows `按住说话`); the browser window must be in the foreground |
| Preview button reports synthesis failure | Edge TTS unreachable (overseas) or the ShortName doesn't exist: verify the name (`node scripts/list-voices.mjs` lists all) and retry later |

## Development

### Dependency discipline (important)

Three categories, each with its own home:

- **Third-party runtime deps** (`msedge-tts` / `sherpa-onnx`) and **registry-resolvable framework packages**
  (`@deepseek-ai/schemastery`) → `dependencies`. schemastery is a public npm package and the
  dsh host platform does not shadow it internally, so installing it into a profile causes no
  version conflicts.
- **Host framework packages** (`@deepseek-ai/cordis` / `@deepseek-ai/dsh-web` / `react`) →
  `peerDependencies`. Host packages are provided by the dsh runtime; putting them in
  dependencies makes dshmarket treat it as "shadowing host versions" and blocks marketplace
  upgrades. Peer versions must match the current dsh runtime
  (locally: cordis `^4.0.1`, dsh-web `^0.1.0-rc.6 || ^0.1.1-rc.0`, react `^18.2.0`),
  and be bumped when dsh is upgraded.
- **Type-only references** (`@deepseek-ai/dsh-settings` / `dsh-host-webserver` / `dsh-llm`) →
  no runtime imports between instances (`import type` + esbuild stripping), no declaration needed;
  during development the types link via pnpm `file:` to the local dsh distribution's node_modules
  (the registry's rc.1 type snapshot lags behind the distribution; the distribution types are the
  runtime truth).

`dependencies` must contain only true third-party runtime deps — never host-shared packages; after
changing deps, run `npm pack --dry-run` and `pnpm test` as regression.

### Build & test

```sh
pnpm install && pnpm build    # esbuild: lib/index.js (host) + lib/client.js (browser)
pnpm test                     # segmenter/wakeword unit tests + pre-release self-check (no network)
node test/hold-e2e.js         # hold-mode acceptance (standalone browser, /asr route interception)
systemctl restart dsh         # Linux; restart the dsh process on other platforms
```

> Note: dsh installs the plugin as a pnpm `file:` link (directory copy); after `node build.mjs` you
> must copy `lib/client.js` to `<profile>/node_modules/dsh-voice-mode/lib/` and restart dsh before
> the browser picks up the new bundle.

### Structure

```
src/index.ts      host: single-active pointer, llm/stream tap, SSE, settings registration
src/asr-host.ts   host: zipformer2 streaming ASR + lazy model download (.part resume)
src/tts-queue.ts  host: per-session TTS queue + epoch barge-in
src/segmenter.ts  host: sentence segmentation (markdown stripping + terminating punctuation)
src/client.tsx    client: mic button + status bar + reading overlay + barge-in
src/asr.ts        client: getUserMedia + RMS VAD + partial polling
scripts/prefetch.mjs  model pre-download (cross-platform cache dir + resume)
test/segmenter.test.mjs  sentence segmentation unit tests
test/wakeword.test.mjs    wake-word matching unit tests
test/verify-client.mjs   pre-release self-check (bundle manifest/exports/shape)
test/hold-e2e.js          hold-mode end-to-end acceptance (standalone browser)
scripts/list-voices.mjs   print all Edge TTS voices (source of the voice table)
```

Integration probes (`hold-e2e.js`, `spoken-prompt-rpc.sh`, `spoken-toggle-ui-check.js`) live in the repo root `test/`, outside this npm package.

## License

MIT
