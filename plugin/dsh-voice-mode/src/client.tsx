/**
 * dsh-voice-mode-adaptation client half（纯朗读版 · 无语音输入）。
 *
 * 两个入口：
 *  1. 输入框工具排的「朗读总开关」（conversation.input.right，替换原麦克风按钮）：
 *     点击开启自动朗读——AI 每轮新回复自动朗读；新回复开始时 host 会立刻 cancel
 *     上一回合没读完的部分（需求 2）。
 *  2. 每条 AI 回复操作行里的「朗读键」（conversation.chat.assistant-actions）：
 *     只朗读被点的那一条，不改变自动朗读状态。
 *
 * 播放：host SSE 'audio' 帧 -> 按句拼帧 -> Web Audio 链式调度（同原实现）。
 * 只播放「当前查看会话」的音频；切换会话即停播。
 */
import * as React from 'react'
import { useEffect, useState } from 'react'
import { t } from './strings.ts'
import { VoiceSettingsCard } from './settings-form.tsx'

export const inject = ['slots', 'sessions', 'settingsScope']

declare const __BUILD_TAG__: string
const BUILD_TAG = __BUILD_TAG__
console.log('[dsh-voice-mode-adaptation] build=' + BUILD_TAG)

const BASE_PATH = '/voice-mode-adaptation'

/**
 * 每 tab 稳定唯一 ID（sessionStorage 跨刷新保持、关 tab 清除）。
 * host 用它把音频帧只发给「播放所有者」标签页——同一句 TTS 不会被多个标签页叠加播放。
 */
function getTabId(): string {
  try {
    const KEY = 'dshvma-tabId'
    let id = sessionStorage.getItem(KEY)
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2) + Date.now().toString(36)
      sessionStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36)
  }
}
const TAB_ID = getTabId()

/**
 * 已处理帧指纹（模块级，跨 reader 实例共享）。兜底：若同一页面因热重载/重复加载出现
 * 两个 reader，两个播放器会各自收到同一批音频帧——只让第一个出声，第二个丢弃。
 */
const seenAudioFrames = new Map<string, number>()
function audioFrameSeen(key: string): boolean {
  const now = Date.now()
  if (seenAudioFrames.size > 4000) {
    for (const [k, ts] of seenAudioFrames) {
      if (now - ts > 60000) seenAudioFrames.delete(k)
    }
    if (seenAudioFrames.size > 4000) seenAudioFrames.clear()
  }
  if (seenAudioFrames.has(key)) return true
  seenAudioFrames.set(key, now)
  return false
}

interface TtsChunkFrame {
  sessionId: string
  /** 队列世代（cancel 递增）：变化即新回合开始，需停掉旧回合已调度的音频。 */
  gen?: number
  sentenceId: number
  chunkId: number
  final: boolean
  text?: string
  audio: string
  mime?: string
  pauseBeforeMs?: number
}

interface PlayFrame {
  sessionId: string
  seq: number
  text: string
  audio: Uint8Array<ArrayBuffer>
  mime?: string
  pauseBeforeMs?: number
}

interface ReaderState {
  /** host 当前自动朗读会话（SSE 'read' 广播）。 */
  autoRead: string | null
  /** 播放所有者标签页 id：只有等于本 tab 的 TAB_ID 时才播放（多标签页防重）。 */
  ownerTabId: string | null
  playing: boolean
  caption: string | null
  ttsNotice: string | null
  notice: string | null
  /** 当前正在手动朗读的消息 key（messageId 字符串）；用于让对应朗读键保持高亮。 */
  speakingKey: string | null
}

interface Reader {
  readonly state: ReaderState
  subscribe(fn: (s: ReaderState) => void): () => void
  /** 组件挂载时登记当前查看会话：只播放该会话的音频。 */
  setCurrentSession(id: string | null): void
  enter(sessionId: string): Promise<{ ok: boolean; error?: string }>
  exit(sessionId: string): Promise<void>
  speak(sessionId: string, text: string, key?: string): Promise<{ ok: boolean }>
  stop(sessionId: string): void
  /** 关闭 SSE、停止播放并移除监听（重复 apply / 热重载时停掉旧实例，防多重声音）。 */
  dispose(): void
}

/**
 * 播放引擎：句级 decodeAudioData -> AudioBufferSourceNode 链式调度；
 * decode 失败整段降级 <audio> 元素，保顺序播放。无 AEC/录音耦合（纯朗读）。
 */
function createAudioEngine(
  setUi: (patch: Partial<ReaderState>) => void,
  onAllPlayed?: () => void,
): { push(frame: PlayFrame): void; skip(): void; warm(): void; unduck(): void } {
  const pending: PlayFrame[] = []
  const fallbackAudio = new Audio()
  let fallback = false
  let ctx: AudioContext | null = null
  let duckGain: GainNode | null = null
  let nextEndAt = 0
  const activeSrcs = new Set<AudioBufferSourceNode>()
  let decoding = false
  const captionQueue: string[] = []

  const warm = (): void => {
    if (ctx) {
      void ctx.resume?.()
      return
    }
    try {
      const AC: typeof AudioContext =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      ctx = new AC()
      duckGain = ctx.createGain()
      duckGain.gain.value = 1
      duckGain.connect(ctx.destination)
      void ctx.resume?.()
    } catch {
      ctx = null
    }
  }

  const playFallback = (): void => {
    const frame = pending.shift() ?? null
    if (!frame) {
      setUi({ playing: false, caption: null })
      return
    }
    const url = URL.createObjectURL(new Blob([frame.audio], { type: frame.mime === 'audio/wav' ? 'audio/wav' : 'audio/mpeg' }))
    fallbackAudio.src = url
    fallbackAudio.onended = () => {
      URL.revokeObjectURL(url)
      playFallback()
    }
    fallbackAudio.onerror = () => {
      URL.revokeObjectURL(url)
      playFallback()
    }
    setUi({ playing: true, caption: frame.text, ttsNotice: null })
    const gap = Math.max(0, frame.pauseBeforeMs ?? 0)
    const startFallback = (): void => void fallbackAudio.play().catch(() => playFallback())
    if (gap > 0) setTimeout(startFallback, gap)
    else startFallback()
  }

  const drainPending = (): void => {
    if (decoding || !ctx || !duckGain || pending.length === 0) return
    decoding = true
    void (async () => {
      try {
        while (pending.length > 0) {
          const frame = pending[0]
          const buf = await ctx!.decodeAudioData(frame.audio.buffer.slice(0))
          if (pending.length === 0 || pending[0] !== frame) return
          pending.shift()
          const t0 = ctx!.currentTime
          const gapS = Math.max(0, frame.pauseBeforeMs ?? 0) / 1000
          const at = Math.max(t0 + 0.02, nextEndAt + gapS)
          const src = ctx!.createBufferSource()
          src.buffer = buf
          src.connect(duckGain!)
          activeSrcs.add(src)
          src.onended = () => {
            activeSrcs.delete(src)
            captionQueue.shift()
            if (activeSrcs.size === 0 && pending.length === 0) {
              setUi({ playing: false, caption: null })
              onAllPlayed?.()
            } else if (captionQueue.length > 0) {
              setUi({ caption: captionQueue[0] })
            }
          }
          src.start(at)
          nextEndAt = at + buf.duration
          captionQueue.push(frame.text)
          setUi({ playing: true, caption: captionQueue[0], ttsNotice: null })
        }
      } catch {
        for (const src of activeSrcs) {
          try {
            src.stop()
          } catch {
            // ignore
          }
        }
        activeSrcs.clear()
        captionQueue.length = 0
        fallback = true
        playFallback()
      } finally {
        decoding = false
      }
    })()
  }

  return {
    push(frame) {
      if (fallback || !ctx) {
        pending.push(frame)
        if (fallbackAudio.paused) playFallback()
        return
      }
      pending.push(frame)
      drainPending()
    },
    skip() {
      pending.length = 0
      nextEndAt = 0
      fallbackAudio.pause()
      fallbackAudio.onended = null
      fallbackAudio.onerror = null
      for (const src of activeSrcs) {
        try {
          src.stop()
        } catch {
          // ignore
        }
      }
      activeSrcs.clear()
      captionQueue.length = 0
      setUi({ playing: false, caption: null })
    },
    warm,
    unduck() {
      if (!ctx || !duckGain) return
      const now = ctx.currentTime
      duckGain.gain.cancelScheduledValues(now)
      duckGain.gain.setTargetAtTime(1, now, 0.035)
    },
  }
}

function createReader(): Reader {
  const listeners = new Set<(s: ReaderState) => void>()
  const state: ReaderState = { autoRead: null, ownerTabId: null, playing: false, caption: null, ttsNotice: null, notice: null, speakingKey: null }
  let source: EventSource | null = null
  let currentSessionId: string | null = null
  const notify = (): void => {
    for (const fn of listeners) {
      try {
        fn({ ...state })
      } catch {
        // listener errors must not kill the loop
      }
    }
  }
  const setUi = (patch: Partial<ReaderState>): void => {
    Object.assign(state, patch)
    notify()
  }
  /** 整段播完自然收尾：清掉「本条正在朗读」高亮。 */
  const engine = createAudioEngine(setUi, () => setUi({ speakingKey: null }))

  const rejectSeqUpTo = new Map<string, number>()
  const lastFinalSeq = new Map<string, number>()
  let curSentenceId: number | null = null
  let curChunks: Uint8Array[] = []
  let curBytes = 0
  let curChunkCount = 0
  /** 当前播放的队列世代；变化 = 新回合开始。 */
  let curGen: number | null = null

  const doSkipAudio = (sidArg?: string | null): void => {
    const sid = sidArg ?? currentSessionId
    if (sid) rejectSeqUpTo.set(sid, Math.max(lastFinalSeq.get(sid) ?? -1, curSentenceId ?? -1))
    curSentenceId = null
    curChunks = []
    curBytes = 0
    curChunkCount = 0
    engine.skip()
    setUi({ speakingKey: null })
  }

  const connect = (): void => {
    if (source) return
    source = new EventSource(location.origin + BASE_PATH + '/stream?tabId=' + encodeURIComponent(TAB_ID))
    source.addEventListener('open', () => {
      rejectSeqUpTo.clear()
      lastFinalSeq.clear()
    })
    source.addEventListener('read', (e: MessageEvent<string>) => {
      try {
        const data = JSON.parse(e.data) as { active?: string | null; ownerTabId?: string | null }
        state.autoRead = data.active ?? null
        state.ownerTabId = data.ownerTabId ?? null
        notify()
      } catch {
        // ignore malformed frame
      }
    })
    source.addEventListener('audio', (e: MessageEvent<string>) => {
      try {
        const frame = JSON.parse(e.data) as TtsChunkFrame
        frame.sessionId = frame.sessionId ?? ''
        for (const fn of audioListeners) {
          try {
            fn(frame)
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore malformed frame
      }
    })
    source.addEventListener('tts-error', (e: MessageEvent<string>) => {
      try {
        const p = JSON.parse(e.data) as { sessionId?: string }
        if (p.sessionId === currentSessionId) setUi({ ttsNotice: t('ttsNoticeFail') })
      } catch {
        // ignore malformed frame
      }
    })
  }

  const audioListeners = new Set<(f: TtsChunkFrame) => void>()
  audioListeners.add((frame) => {
    if (frame.sessionId !== currentSessionId) return
    // 播放所有者门禁（多标签页防重）：host 广播 ownerTabId，只有所有者出声；
    // ownerTabId 为 null（尚无所有者 / 旧 host）时不拦，保证兼容。
    if (state.ownerTabId !== null && state.ownerTabId !== TAB_ID) return
    const rejectLine = rejectSeqUpTo.get(frame.sessionId)
    if (rejectLine !== undefined && frame.sentenceId <= rejectLine) return
    // 去重兜底：同一 (gen,sentenceId,chunkId,final) 只处理一次（防两个 reader 重复出声）。
    const dedupKey =
      frame.sessionId + '#' + (frame.gen ?? 0) + '#' + frame.sentenceId + '#' + frame.chunkId + '#' + (frame.final ? 1 : 0)
    if (audioFrameSeen(dedupKey)) return
    // 需求 2：世代变化 = AI 开始新一回合 → 立刻停掉上一回合已调度的音频，改读新回合。
    const gen = frame.gen ?? 0
    if (gen !== curGen) {
      curGen = gen
      engine.skip()
      curSentenceId = null
      curChunks = []
      curBytes = 0
      curChunkCount = 0
    }
    if (frame.sentenceId !== curSentenceId) {
      curSentenceId = frame.sentenceId
      curChunks = []
      curBytes = 0
      curChunkCount = 0
    }
    if (frame.final) {
      if (frame.chunkId !== curChunkCount) {
        curSentenceId = null
        curChunks = []
        curBytes = 0
        curChunkCount = 0
        return
      }
      const buf = new Uint8Array(curBytes)
      let off = 0
      for (const c of curChunks) {
        buf.set(c, off)
        off += c.length
      }
      curSentenceId = null
      curChunks = []
      curBytes = 0
      curChunkCount = 0
      if (buf.length === 0) return
      const isMp3 = buf[0] === 0xff
      const isWav = buf.length >= 4 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
      if (!isMp3 && !isWav) return
      engine.push({
        sessionId: frame.sessionId,
        seq: frame.sentenceId,
        text: frame.text ?? '',
        audio: buf,
        mime: frame.mime,
        pauseBeforeMs: frame.pauseBeforeMs,
      })
      lastFinalSeq.set(frame.sessionId, frame.sentenceId)
      return
    }
    const bin = atob(frame.audio)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    curChunks.push(bytes)
    curBytes += bytes.length
    curChunkCount += 1
  })

  connect()

  /**
   * 用户切回/聚焦本标签页时接管播放权：多标签页下「你正在看哪个 tab，就哪个 tab 出声」。
   * 只在自动朗读开启、且当前所有者不是本 tab 时触发，避免无谓请求。
   */
  const reclaimOwner = (): void => {
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
    const sid = state.autoRead
    if (!sid || state.ownerTabId === TAB_ID) return
    setUi({ ownerTabId: TAB_ID })
    void fetch(location.origin + BASE_PATH + '/read', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ sessionId: sid, on: true, tabId: TAB_ID }),
    }).catch(() => undefined)
  }
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', reclaimOwner)
  if (typeof window !== 'undefined') window.addEventListener('focus', reclaimOwner)

  return {
    get state() {
      return state
    },
    subscribe(fn) {
      listeners.add(fn)
      fn({ ...state })
      return () => {
        listeners.delete(fn)
      }
    },
    setCurrentSession(id) {
      if (id === currentSessionId) return
      doSkipAudio(currentSessionId)
      currentSessionId = id
      curGen = null
    },
    async enter(sessionId) {
      doSkipAudio(sessionId)
      // 乐观认领播放权：点击即由本 tab 出声（host 广播最终以 ownerTabId 校正）。
      setUi({ ownerTabId: TAB_ID })
      try {
        const res = await fetch(location.origin + BASE_PATH + '/read', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId, on: true, tabId: TAB_ID }),
        })
        const out = (await res.json()) as { active?: string | null; ownerTabId?: string | null; error?: string }
        if (!res.ok) return { ok: false, error: out.error ?? t('readFail') }
        state.autoRead = out.active ?? null
        state.ownerTabId = out.ownerTabId ?? TAB_ID
        notify()
        return { ok: true }
      } catch {
        return { ok: false, error: t('readFail') }
      }
    },
    async exit(sessionId) {
      doSkipAudio(sessionId)
      try {
        const res = await fetch(location.origin + BASE_PATH + '/read', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId, on: false, tabId: TAB_ID }),
        })
        const out = (await res.json()) as { active?: string | null }
        state.autoRead = out.active ?? null
        state.ownerTabId = null
        notify()
      } catch {
        // SSE 广播最终会纠正
      }
    },
    async speak(sessionId, text, key) {
      doSkipAudio(sessionId)
      // 点击即认领播放权 + 高亮本条（点击反馈）；失败或播完由 setUi/onAllPlayed 清除。
      setUi({ notice: null, speakingKey: key ?? null, ownerTabId: TAB_ID })
      try {
        const res = await fetch(location.origin + BASE_PATH + '/speak', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId, text, tabId: TAB_ID }),
        })
        if (!res.ok) {
          const out = (await res.json().catch(() => ({}))) as { error?: string }
          setUi({ notice: out.error ?? t('readFail'), speakingKey: null })
          return { ok: false }
        }
        return { ok: true }
      } catch {
        setUi({ notice: t('readFail'), speakingKey: null })
        return { ok: false }
      }
    },
    stop(sessionId) {
      doSkipAudio(sessionId)
      void fetch(location.origin + BASE_PATH + '/cancel', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, tabId: TAB_ID }),
      }).catch(() => undefined)
    },
    dispose() {
      try {
        source?.close()
      } catch {
        // ignore
      }
      source = null
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', reclaimOwner)
      if (typeof window !== 'undefined') window.removeEventListener('focus', reclaimOwner)
      doSkipAudio()
      listeners.clear()
    },
  }
}

const EMPTY_NODES: unknown[] = []

/** 从运行时注入的标准 useChat 快照里取 legacy 会话节点（稳定引用，无渲染环）。 */
function useAssistantNodes(useChat: unknown): unknown[] {
  const hook = typeof useChat === 'function' ? (useChat as (sel: (s: unknown) => unknown) => unknown) : null
  if (!hook) return EMPTY_NODES
  const nodes = hook((s: unknown) => {
    const conv = s as { legacy?: { nodes?: unknown[] } } | undefined
    return conv?.legacy?.nodes ?? EMPTY_NODES
  })
  return Array.isArray(nodes) ? nodes : EMPTY_NODES
}

/** 取某条 finalized assistant 消息的纯文本（只读 text 块）。 */
function extractAssistantText(nodes: unknown[], messageId: unknown): string {
  const parts: string[] = []
  for (const raw of nodes) {
    const n = raw as { kind?: string; messageId?: unknown; blocks?: Array<{ kind?: string; text?: unknown }> }
    if (!n || n.kind !== 'assistant' || n.messageId !== messageId) continue
    for (const b of n.blocks ?? []) {
      if (b && b.kind === 'text' && typeof b.text === 'string') parts.push(b.text)
    }
  }
  return parts.join('\n').trim()
}

function SpeakerIcon({ active }: { active?: boolean }): React.ReactElement {
  return React.createElement(
    'svg',
    { viewBox: '0 0 24 24', width: 16, height: 16, 'aria-hidden': 'true' },
    React.createElement('path', {
      fill: 'currentColor',
      d: active
        ? 'M4 9v6h4l5 4V5L8 9H4Zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Z'
        : 'M4 9v6h4l5 4V5L8 9H4Zm12 3a4 4 0 0 0-2-3.46v6.92A4 4 0 0 0 16 12Zm-2-7.7v2.06a6 6 0 0 1 0 11.28v2.06a8 8 0 0 0 0-15.4Z',
    }),
  )
}

/**
 * 消息操作行用的喇叭图标：默认**空心描边**（与官方 MessageIconActions / 点赞那批细线图标一致），
 * 正在朗读（filled）时才变实心——与点赞「选中后变实心」同一套视觉语言。
 */
function SpeakerGlyph({ filled }: { filled?: boolean }): React.ReactElement {
  const stroke = { stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return React.createElement(
    'svg',
    { viewBox: '0 0 16 16', width: 15, height: 15, fill: 'none', 'aria-hidden': 'true' },
    React.createElement(
      'path',
      filled
        ? { d: 'M8.4 2.4 4.9 5.3H2.3v5.4h2.6l3.5 2.9V2.4Z', fill: 'currentColor' }
        : { d: 'M8.4 2.4 4.9 5.3H2.3v5.4h2.6l3.5 2.9V2.4Z', ...stroke },
    ),
    React.createElement('path', { d: 'M10.7 5.9a3 3 0 0 1 0 4.2', ...stroke }),
    React.createElement('path', { d: 'M12.6 3.9a5.4 5.4 0 0 1 0 8.2', ...stroke }),
  )
}

function iconButtonStyle(on: boolean, disabled: boolean): React.CSSProperties {
  return {
    border: '1px solid ' + (on ? 'rgba(63, 185, 80, 0.45)' : 'rgba(139, 148, 158, 0.35)'),
    background: on ? 'rgba(63, 185, 80, 0.16)' : 'rgba(139, 148, 158, 0.08)',
    cursor: disabled ? 'default' : 'pointer',
    padding: '5px 10px',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontFamily: 'system-ui, sans-serif',
    color: disabled ? '#6e7681' : on ? '#3fb950' : '#8b949e',
    opacity: disabled ? 0.5 : 1,
    transition: 'background 0.15s ease, color 0.2s ease, border-color 0.15s ease',
  }
}

/** 朗读总开关（原麦克风按钮位置）：开启 = 该会话每轮新回复自动朗读。 */
export function ReadToggleButton({ reader, sessionId }: { reader: Reader; sessionId?: string }): React.ReactElement {
  const [s, setS] = useState<ReaderState>(reader.state)
  useEffect(() => reader.subscribe(setS), [reader])
  useEffect(() => reader.setCurrentSession(sessionId ?? null), [reader, sessionId])
  const on = sessionId !== undefined && s.autoRead === sessionId
  return React.createElement(
    'button',
    {
      type: 'button',
      'data-dshvm': 'read-toggle',
      'aria-label': on ? t('readToggleOn') : t('readToggleOff'),
      'aria-pressed': on,
      title: on ? t('readTitleOn') : t('readTitleOff'),
      onClick: () => {
        if (!sessionId) return
        void (on ? reader.exit(sessionId) : reader.enter(sessionId))
      },
      style: iconButtonStyle(on, sessionId === undefined),
    },
    React.createElement(SpeakerIcon, { active: on }),
    s.playing ? t('readPlaying') : t('readToggle'),
  )
}

let buttonCssInjected = false
/**
 * 消息操作行图标的统一样式（与官方 MessageIconActions / MessageFeedbackActions 完全一致：
 * 28px 圆形、透明底无边框、label-tertiary、hover 用 --dsw-alias-interactive-bg-hover），
 * 外加点击反馈：:active 缩放 + 点击脉冲 + 「本条正在朗读」高亮。
 */
function injectButtonCss(): void {
  if (buttonCssInjected || typeof document === 'undefined') return
  buttonCssInjected = true
  const el = document.createElement('style')
  el.setAttribute('data-dshvm', 'css')
  el.textContent = [
    '.dshvma-mbtn{width:calc(28px + var(--dsh-content-font-delta,0px));height:calc(28px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:28px;justify-content:center;align-items:center;padding:6px;display:inline-flex;transition:background .15s ease,color .15s ease,transform .08s ease}',
    '.dshvma-mbtn svg{width:calc(15px + var(--dsh-content-font-delta,0px));height:calc(15px + var(--dsh-content-font-delta,0px))}',
    '.dshvma-mbtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}',
    '.dshvma-mbtn:active{transform:scale(.88)}',
    '.dshvma-mbtn:disabled{cursor:default;opacity:.4}',
    '.dshvma-mbtn:disabled:hover{background:0 0;color:var(--dsw-alias-label-tertiary)}',
    '.dshvma-mbtn[data-active="true"]{color:var(--dsw-alias-brand-primary)}',
    '.dshvma-mbtn[data-pulse="true"]{animation:dshvma-mbtn-pulse .5s ease-out}',
    '@keyframes dshvma-mbtn-pulse{0%{box-shadow:0 0 0 0 rgba(88,166,255,.5)}100%{box-shadow:0 0 0 9px rgba(88,166,255,0)}}',
  ].join('')
  document.head.appendChild(el)
}

/** 每条 AI 回复后的朗读键：只朗读被点的那一条。样式与官方消息操作键一致。 */
export function ReadMessageButton(props: {
  reader: Reader
  messageId?: unknown
  sessionId?: string
  useChat?: unknown
}): React.ReactElement {
  const { reader, messageId, sessionId, useChat } = props
  const [s, setS] = useState<ReaderState>(reader.state)
  const [pulse, setPulse] = useState(false)
  useEffect(() => reader.subscribe(setS), [reader])
  useEffect(() => reader.setCurrentSession(sessionId ?? null), [reader, sessionId])
  const nodes = useAssistantNodes(useChat)
  const text = React.useMemo(() => extractAssistantText(nodes, messageId), [nodes, messageId])
  const disabled = !sessionId || !text
  const key = messageId === undefined ? null : String(messageId)
  const active = key !== null && s.speakingKey === key && s.playing
  return React.createElement(
    'button',
    {
      type: 'button',
      className: 'dshvma-mbtn',
      'data-dshvm': 'read-one',
      'data-active': active ? 'true' : undefined,
      'data-pulse': pulse ? 'true' : undefined,
      'aria-label': t('readOneTitle'),
      'aria-pressed': active,
      title: disabled ? t('readOneEmpty') : t('readOneTitle'),
      disabled,
      onClick: () => {
        if (disabled) return
        setPulse(true)
        setTimeout(() => setPulse(false), 520)
        void reader.speak(sessionId as string, text, key ?? undefined)
      },
    },
    React.createElement(SpeakerGlyph, { filled: active }),
  )
}

/** 输入框上方状态条：仅朗读中/出错时出现，带停止。 */
export function ReadingStatusBar({ reader, sessionId }: { reader: Reader; sessionId?: string }): React.ReactElement {
  const [s, setS] = useState<ReaderState>(reader.state)
  useEffect(() => reader.subscribe(setS), [reader])
  useEffect(() => reader.setCurrentSession(sessionId ?? null), [reader, sessionId])
  if (!s.playing && !s.notice && !s.ttsNotice) return React.createElement(React.Fragment, null)
  const text = s.notice ?? s.ttsNotice ?? s.caption ?? t('readPlaying')
  return React.createElement(
    'div',
    {
      'data-dshvm': 'reading-bar',
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 10,
        fontSize: 12,
        fontFamily: 'system-ui, sans-serif',
        color: s.notice ? '#ffa657' : '#3fb950',
        background: s.notice ? 'rgba(255, 166, 87, 0.08)' : 'rgba(63, 185, 80, 0.08)',
        border: '1px solid ' + (s.notice ? 'rgba(255, 166, 87, 0.3)' : 'rgba(63, 185, 80, 0.25)'),
      },
    },
    React.createElement('span', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 } }, text),
    React.createElement(
      'button',
      {
        type: 'button',
        onClick: () => {
          if (sessionId) reader.stop(sessionId)
        },
        style: {
          font: 'inherit',
          cursor: 'pointer',
          color: 'inherit',
          background: 'transparent',
          border: '1px solid currentColor',
          borderRadius: 8,
          padding: '2px 10px',
          flexShrink: 0,
        },
      },
      t('readStop'),
    ),
  )
}

export function apply(ctx: any): void {
  injectButtonCss()
  // 单实例兜底：client half 若因热重载/重复加载被 apply 两次，旧 reader 的 SSE 与播放引擎
  // 会与新实例并行出声（多重声音）。先彻底停掉旧实例，再建新的。
  const g = globalThis as unknown as { __dshvmaReader__?: Reader }
  try {
    g.__dshvmaReader__?.dispose()
  } catch {
    // ignore
  }
  const reader = createReader()
  g.__dshvmaReader__ = reader

  ctx.slots.inject('conversation.input.right', () =>
    ctx.slots.register(
      {
        name: 'conversation.input.right',
        id: 'voice-mode-adaptation-read',
        order: 80,
        inject: (): { reader: Reader } => ({ reader }),
      },
      ReadToggleButton,
    ),
  )

  ctx.slots.inject('conversation.input.dock', () =>
    ctx.slots.register(
      {
        name: 'conversation.input.dock',
        id: 'voice-mode-adaptation-reading',
        order: 10,
        inject: (): { reader: Reader } => ({ reader }),
      },
      ReadingStatusBar,
    ),
  )

  ctx.slots.inject('conversation.chat.assistant-actions', () =>
    ctx.slots.register(
      {
        name: 'conversation.chat.assistant-actions',
        id: 'voice-mode-adaptation-speak',
        order: 20,
        inject: (): { reader: Reader } => ({ reader }),
      },
      ReadMessageButton,
    ),
  )

  // 设置卡片：Plugins → 插件配置 区。
  if (ctx.settingsScope) {
    ctx.slots.inject('settings.plugin.item', () =>
      ctx.slots.register(
        {
          name: 'settings.plugin.item',
          id: 'voice-mode-adaptation',
          key: 'voice-mode-adaptation',
          order: 100,
          label: t('stateVoiceMode'),
        },
        () => React.createElement(VoiceSettingsCard, { scope: ctx.settingsScope.bind({ namespace: 'voice-mode-adaptation' }) }),
      ),
    )
  }
  // 卸载/热重载：关闭本实例的 SSE 与播放引擎（防旧实例残留继续出声）。
  if (typeof ctx.effect === 'function') {
    ctx.effect(() => () => {
      if (g.__dshvmaReader__ === reader) g.__dshvmaReader__ = undefined
      reader.dispose()
    })
  }
}
