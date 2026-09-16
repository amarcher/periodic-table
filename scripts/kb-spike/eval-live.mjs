// Live text-only conversations against the spike agents (Node 22+, no deps).
// Measures what rag-query can't: the conversation-aware query rewrite, real
// per-turn RAG latency, and LLM cost, read back from the conversation record.
//
//   node eval-live.mjs <variant> <label>
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const dir = new URL('./out/', import.meta.url);
const state = JSON.parse(readFileSync(new URL('state.json', dir)));
const env = readFileSync(new URL('../../.env', import.meta.url), 'utf8');
const KEY = process.env.ELEVENLABS_API_KEY ?? env.match(/^ELEVENLABS_API_KEY=(.*)$/m)[1].trim();
const [variant = 'per-element', label = variant] = process.argv.slice(2);
const agentId = state.agents[variant];

// First line matches buildElementContext() in src/hooks/useElementConversation.ts.
const click = (name, symbol, z) =>
  `[ELEMENT CLICK] The child just clicked on ${name} (symbol: ${symbol}, atomic number: ${z}).`;

const SCENARIOS = [
  { name: 'deictic + context (Ts)', context: click('Tennessine', 'Ts', 117), say: 'How did they make this one?' },
  { name: 'deictic, no context', context: null, say: 'How did they make this one?' },
  { name: 'deictic + context (Lr)', context: click('Lawrencium', 'Lr', 103), say: 'Why do scientists argue about where this one goes?' },
  { name: 'deictic + context (Sg)', context: click('Seaborgium', 'Sg', 106), say: 'Who is this one named after?' },
  { name: 'named, no context', context: null, say: 'Why did the berkelium for tennessine get stuck at customs?' },
  { name: 'off-corpus', context: click('Gold', 'Au', 79), say: 'Why is this one so shiny?' },
];

const api = async (path) => {
  const r = await fetch(`https://api.elevenlabs.io${path}`, { headers: { 'xi-api-key': KEY } });
  if (!r.ok) throw new Error(`${path} -> ${r.status} ${await r.text()}`);
  return r.json();
};

function run(scenario) {
  return new Promise(async (resolve, reject) => {
    const { signed_url } = await api(`/v1/convai/conversation/get-signed-url?agent_id=${agentId}`);
    const ws = new WebSocket(signed_url);
    let conversationId, sentAt, firstPartMs, phase = 'greeting';
    const timer = setTimeout(() => { ws.close(); reject(new Error('timeout')); }, 45000);
    const send = (m) => ws.send(JSON.stringify(m));
    const ask = () => {
      if (scenario.context) send({ type: 'contextual_update', text: scenario.context });
      setTimeout(() => { sentAt = performance.now(); phase = 'answer'; send({ type: 'user_message', text: scenario.say }); },
        scenario.context ? 500 : 0);
    };
    ws.onopen = () => send({ type: 'conversation_initiation_client_data',
      conversation_config_override: { conversation: { text_only: true } } });
    ws.onmessage = ({ data }) => {
      const m = JSON.parse(data);
      if (m.type === 'ping') return send({ type: 'pong', event_id: m.ping_event.event_id });
      if (m.type === 'conversation_initiation_metadata') conversationId = m.conversation_initiation_metadata_event.conversation_id;
      if (m.type === 'agent_chat_response_part' && phase === 'answer' && firstPartMs == null) firstPartMs = performance.now() - sentAt;
      if (m.type === 'agent_response') {
        if (phase === 'greeting') { phase = 'waiting'; return ask(); }
        if (phase === 'answer') {
          clearTimeout(timer);
          const answer = m.agent_response_event.agent_response;
          ws.close();
          resolve({ conversationId, answer, clientFirstTokenMs: Math.round(firstPartMs ?? performance.now() - sentAt),
            clientFullMs: Math.round(performance.now() - sentAt) });
        }
      }
    };
    ws.onerror = (e) => { clearTimeout(timer); reject(e.error ?? e); };
  });
}

async function details(conversationId) {
  for (let i = 0; i < 20; i++) {
    const c = await api(`/v1/convai/conversations/${conversationId}`);
    if (c.status === 'done' || c.status === 'failed') return c;
    await new Promise((r) => setTimeout(r, 3000));
  }
  return api(`/v1/convai/conversations/${conversationId}`);
}

const names = Object.fromEntries(Object.values(state.docs).flat().map((d) => [d.id, d.name.replace('[kb-spike] ', '')]));
const results = [];
for (const s of SCENARIOS) {
  const live = await run(s);
  const c = await details(live.conversationId);
  const turn = [...c.transcript].reverse().find((t) => t.role === 'agent' && t.message);
  const rag = c.transcript.map((t) => t.rag_retrieval_info).filter(Boolean).at(-1);
  const row = {
    scenario: s.name, say: s.say, ...live,
    retrievalQuery: rag?.retrieval_query ?? null,
    retrieved: rag?.chunks?.map((ch) => `${names[ch.document_id] ?? ch.document_id}@${ch.vector_distance?.toFixed(3)}`) ?? [],
    ragLatencyMs: rag?.rag_latency_secs != null ? Math.round(rag.rag_latency_secs * 1000) : null,
    toolCalls: c.transcript.flatMap((t) => (t.tool_calls ?? []).map((tc) => `${tc.tool_name}(${tc.params_as_json})`)),
    toolLatencyMs: c.transcript.flatMap((t) => (t.tool_results ?? []).map((tr) => Math.round((tr.tool_latency_secs ?? 0) * 1000))),
    turnMetrics: turn?.conversation_turn_metrics?.metrics ?? null,
    charging: c.metadata?.charging ?? null,
  };
  results.push(row);
  console.log(`\n## ${row.scenario}\n  say: ${row.say}\n  rewrite: ${row.retrievalQuery}\n  retrieved: ${row.retrieved.join(', ') || '(none)'}` +
    `\n  tools: ${row.toolCalls.join(' ; ') || '(none)'} ${row.toolLatencyMs.join('/')}ms\n  rag ${row.ragLatencyMs}ms | first token ${row.clientFirstTokenMs}ms | full ${row.clientFullMs}ms\n  answer: ${row.answer}`);
}
writeFileSync(new URL(`live-${label}.json`, dir), JSON.stringify(results, null, 2));
