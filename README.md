# Add XNO payments to your agent — the 60-second version

Your agent can pay (and get paid) in **Nano (XNO)**: feeless, instant, final. No gas means sub-cent
agent-to-agent payments actually work. This repo is the shortest path for a developer to add it.

## Pick your surface
- **ElizaOS agent** → drop in [`@dhyabi2/plugin-nano`](https://github.com/dhyabi2/elizaos-plugin-nano) (wallet + `PAY_X402_NANO`).
- **OpenAI Agents SDK** → [`openai-agents-nano-x402`](https://github.com/dhyabi2/openai-agents-nano-x402).
- **MCP (any MCP client)** → [`nano-mcp`](https://github.com/dhyabi2/nano-mcp): pay-per-tool-call in XNO.
- **Agent Skill** → [`proof-agent-skill`](https://github.com/dhyabi2/proof-agent-skill).
- **Any HTTP agent** → the x402 flow below.

## The whole thing (x402 settled in XNO)
A live endpoint you can call right now: `https://extract.paypercall.dev/api/v1/extract`
returns a real `402` naming an XNO amount + address. Pay it, retry, get the result. See `example.mjs`.

```
GET  /api/v1/extract                     -> 402 { "message": "Pay 0.0001 XNO to nano_... and retry with X-PAYMENT" }
pay the XNO (one signed block, feeless)
GET  /api/v1/extract   X-PAYMENT: <hash> -> 200 result
```

## Why, in one line
A feeless, sub-second, irreversible rail is the only thing that makes **machine-to-machine micropayments**
economic. See [`POSITIONING.md`](./POSITIONING.md). Add it **beside** USDC, not instead of it
([dual-rail](https://github.com/dhyabi2/dual-rail)); measured settlement properties in
[nano-finality-proof](https://github.com/dhyabi2/nano-finality-proof). Standardization in progress at
[x402#3512](https://github.com/x402-foundation/x402/issues/3512).
