# cost-meter

A Claude Code mod: a pane (`/cost-meter`) and a status-line entry showing what the engine itself reports for your session.

- Session cost in USD
- Context fill (tokens / window)
- Compaction window and the token count at which auto-compaction runs, with where the window comes from (settings, env, model default)
- Rate-limit windows and when they reset

No model calls, no network, no telemetry, no files read or written. The cost, context and rate-limit figures are the engine's own; the compaction lines come from the engine's local context breakdown (`/context`-style estimate).

## Install

```
/plugin install cost-meter --marketplace osscaar02/claude-cost-meter
```

Answer `y` to add the marketplace, then pick a scope. Then run `/cost-meter`.

## License

MIT
