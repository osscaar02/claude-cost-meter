export type Snap = {
  usd?: number
  tokens?: number
  window: number
  percent?: number
  compactWindow?: number
  compactSource?: string
  compactAt?: number
  limits: { kind: string; percentUsed: number; resetsAt?: string }[]
}

declare module 'claude-code' {
  interface PluginState {
    'cost-meter': { snap: Shaped<Snap | null> }
  }
}
