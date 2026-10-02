// Minimal "agent pays an x402 endpoint in XNO" demo. Node 18+ (global fetch).
//   npm i nanocurrency && NANO_SEED=<64hex> NANO_RPC_URL=https://rpc.nano.to node example.mjs
// Uses the same local-signing path as @dhyabi2/plugin-nano. Needs a funded account + an RPC with work_generate.
import { deriveSecretKey, derivePublicKey, deriveAddress, createBlock, checkAddress } from "nanocurrency";

const RPC = process.env.NANO_RPC_URL || "https://rpc.nano.to";
const SEED = process.env.NANO_SEED;
const ENDPOINT = process.env.X402_URL || "https://extract.paypercall.dev/api/v1/extract";
const RAW = 10n ** 30n;
const toRaw = (x) => { const [w, f = ""] = String(x).split("."); return (BigInt(w||"0")*RAW + BigInt((f+"0".repeat(30)).slice(0,30)||"0")).toString(); };
const rpc = (b) => fetch(RPC, { method:"POST", headers:{ "Content-Type":"application/json","User-Agent":"xno-quickstart" }, body:JSON.stringify(b) }).then(r=>r.json());

async function send(to, amountXno) {
  if (!checkAddress(to)) throw new Error("bad destination: " + to);
  const secret = deriveSecretKey(SEED, 0);
  const address = deriveAddress(derivePublicKey(secret), { useNanoPrefix:true });
  const info = await rpc({ action:"account_info", account:address, representative:true });
  if (info.error) throw new Error("account unopened / unfunded");
  const { block, hash } = createBlock(secret, {
    balance:(BigInt(info.balance)-BigInt(toRaw(amountXno))).toString(),
    representative:info.representative, previous:info.frontier, link:to, work:undefined,
  });
  const r = await rpc({ action:"process", json_block:"true", subtype:"send", block });
  return r.hash || hash;
}

let res = await fetch(ENDPOINT, { headers:{ "User-Agent":"xno-quickstart" } });
if (res.status !== 402) { console.log("no payment required:", res.status, (await res.text()).slice(0,200)); process.exit(0); }
const quote = await res.json();
const to = JSON.stringify(quote).match(/(nano|xrb)_[13][0-9a-z]{59}/)?.[0];
const amount = (quote.message || quote.amount || "").match(/\d+(\.\d+)?/)?.[0];
console.log(`402: pay ${amount} XNO to ${to}`);
if (!SEED) { console.log("set NANO_SEED (a funded account) to actually pay."); process.exit(0); }
const hash = await send(to, amount);
res = await fetch(ENDPOINT, { headers:{ "User-Agent":"xno-quickstart", "X-PAYMENT":hash } });
console.log(`paid (block ${hash}); retry -> HTTP ${res.status}`);
console.log((await res.text()).slice(0, 400));
