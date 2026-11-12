import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Snap } from '../types'

const PANE = 'cost-meter'
const snap = atom({ plugin: 'cost-meter', key: 'snap' } as const, null as Snap | null, {
  shape: 'snap-2',
})

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'cost-meter', description: 'Show measured cost, context and limits' })
    return next(e)
  })

  on('command.run', { command: 'cost-meter' }, async $ => {
    await $.ui.open({ id: PANE, title: 'Cost meter' })
    return { text: 'Cost meter opened.' }
  })

  on('session.measure', async ($, e, next) => {
    let cw: { w?: number; src?: string; at?: number } = {}
    try {
      const u = await $.session.usage({ breakdown: 'summary' })
      const b = u.context.breakdown
      if (b) cw = { w: b.rawMaxTokens, src: b.autocompactSource, at: b.isAutoCompactEnabled ? b.autoCompactThreshold : undefined }
    } catch {}
    await update($, snap, () => ({
      compactWindow: cw.w,
      compactSource: cw.src,
      compactAt: cw.at,
      usd: e.cost?.usd,
      tokens: e.context.tokens,
      window: e.context.window,
      percent: e.context.percent,
      limits: e.rateLimits.map(r => ({ kind: r.kind, percentUsed: r.percentUsed, resetsAt: r.resetsAt })),
    }))
    if (e.cost) {
      $.ui.status(`$${e.cost.usd.toFixed(2)}${e.context.percent !== undefined ? ` · ctx ${e.context.percent}%` : ''}`)
    }
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const s = await read($, snap)
    if (!s) return <Text dimColor>No measurement yet.</Text>
    return (
      <Box flexDirection="column">
        <Text>Session cost: {s.usd === undefined ? 'n/a' : `$${s.usd.toFixed(3)}`}</Text>
        <Text>
          Context: {s.tokens ?? '?'} / {s.window} tokens{s.percent !== undefined ? ` (${s.percent}%)` : ''}
        </Text>
        {s.compactWindow !== undefined && (
          <Text>
            Compaction window: {s.compactWindow} tokens
            {s.tokens !== undefined ? ` (${Math.round((s.tokens / s.compactWindow) * 100)}% used)` : ''}
            {s.compactSource ? ` · source: ${s.compactSource}` : ''}
          </Text>
        )}
        {s.compactAt !== undefined && <Text>Auto-compacts at: {s.compactAt} tokens</Text>}
        {s.limits.map(l => (
          <Text>
            {l.kind}: {l.percentUsed}%{l.resetsAt ? ` · resets ${l.resetsAt}` : ''}
          </Text>
        ))}
        <Text dimColor>Figures reported by the engine; nothing estimated.</Text>
      </Box>
    )
  })
}
