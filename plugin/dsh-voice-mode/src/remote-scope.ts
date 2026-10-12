/**
 * 0.2.0 宿主设置数据层适配器。
 *
 * 背景：0.1.x 宿主客户端提供 `settingsScope` 服务，设置卡经它读写命名空间；
 * 0.2.0 起该服务移除，设置栈改为 `ctx.remote.settings` 的 describe/update
 * 分层读写（SettingsNamespaceView.value 即合并后的值：schema 默认 → base → user）。
 * 本适配器用新 API 实现 ScopeController 三方法，VoiceSettingsCard 组件零改动。
 *
 * 快照：{ status, value }。status：loading（初读中）| ready | unavailable（宿主
 * 无此命名空间或远端缺失）| error（请求失败）。写入为单字段合并（update），
 * 带 expectedRevision 防并发覆盖；回包视图立即落快照。
 * 局限：非本卡发起的配置变更不会实时推送，重开设置页时经 subscribe 重读。
 */

/** 0.2.0 客户端远端设置面（仅声明本适配器用到的方法）。 */
interface RemoteSettingsFace {
  describe(): Promise<{
    writable?: boolean
    namespaces?: Array<{ ns: string; value?: unknown; revision?: number }>
  }>
  update(
    ns: string,
    patch: Record<string, unknown>,
    expectedRevision?: number,
  ): Promise<{ value?: unknown; revision?: number } | undefined>
}

/** 与 settings-form.tsx 的 ScopeController 结构一致（避免循环 import）。 */
interface ScopeSnapshot {
  status?: string
  value?: Record<string, unknown>
  [k: string]: unknown
}

export function createRemoteSettingsScope(
  ctx: unknown,
  ns: string,
): {
  getSnapshot(): ScopeSnapshot
  subscribe(fn: () => void): () => void
  set(field: string, value: unknown): Promise<void>
} {
  const remote = (ctx as { remote?: { settings?: RemoteSettingsFace } } | null | undefined)?.remote
  let snap: ScopeSnapshot = { status: 'loading', value: {} }
  let revision: number | undefined
  const listeners = new Set<() => void>()
  const emit = (): void => {
    for (const fn of [...listeners]) {
      try {
        fn()
      } catch {
        // 单个监听器异常不阻断其它监听器
      }
    }
  }
  const applyView = (view: { value?: unknown; revision?: number } | undefined | null): void => {
    if (!view) return
    revision = typeof view.revision === 'number' ? view.revision : revision
    snap = { status: 'ready', value: (view.value ?? {}) as Record<string, unknown>, revision }
    emit()
  }
  const refresh = async (): Promise<void> => {
    if (!remote?.settings) {
      snap = { status: 'unavailable', value: snap.value ?? {} }
      emit()
      return
    }
    try {
      const described = await remote.settings.describe()
      const view = (described?.namespaces ?? []).find((v) => v?.ns === ns)
      if (view) applyView(view)
      else {
        snap = { status: 'unavailable', value: {} }
        emit()
      }
    } catch {
      snap = { status: 'error', value: snap.value ?? {} }
      emit()
    }
  }
  return {
    getSnapshot: (): ScopeSnapshot => snap,
    subscribe: (fn: () => void): (() => void) => {
      listeners.add(fn)
      void refresh()
      return () => {
        listeners.delete(fn)
      }
    },
    set: async (field: string, value: unknown): Promise<void> => {
      if (!remote?.settings) throw new Error('remote.settings unavailable')
      const view = await remote.settings.update(ns, { [field]: value }, revision)
      applyView(view)
    },
  }
}