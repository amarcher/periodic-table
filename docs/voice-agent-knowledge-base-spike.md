# Spike: ElevenLabs knowledge base for the voice agent (#41)

**Date:** 2026-09-16. **Corpus:** `docs/superheavy-element-videos.md` (25 elements, 16 KB).
**Method:** two throwaway duplicates of the production agent (production agent untouched), one
per corpus shape, exercised with `rag-query` and with live text-only conversations. Everything
was torn down afterwards. Scripts to reproduce: `scripts/kb-spike/`.

## TL;DR

- **Don't use the default automatic RAG.** Its query rewriter never sees our `[ELEMENT CLICK]`
  contextual updates, so "how did they make *this one*?" retrieves the wrong element. And with
  default limits, every turn pulls in the entire corpus, including for questions that have
  nothing to do with it.
- **Use the `knowledge_base` tool mode** (`rag.knowledge_base_tool_info`) with **one document
  per element**, named `<Z>-<Symbol>` (e.g. `117-Ts`), plus a short prompt rule. The agent
  then reads exactly the right document by name. In testing it picked the correct document 4/4
  times, used the on-screen element for "this one", and didn't search for the off-topic question.
- **Cost of that:** first words arrive no later, but a knowledge-backed answer takes ~6–7.5 s to
  finish instead of ~2–3.5 s (one extra LLM round trip). It also costs ~$0.007 more LLM spend per
  knowledge-backed question.
- **CLI:** the agent's document *references* already live in the agent config and ship with
  `agents push`. Document *contents* need a small sync script, since the CLI has no declarative KB
  push. In-place updates keep document IDs stable, so the script is simple.

## Q1. Does retrieval fire at voice latency?

| Mode | Retrieval step | Median time to first text (n=6) | Time to finished answer |
|---|---|---|---|
| No knowledge base (control) | — | 2.4 s | 1.7–3.7 s |
| Automatic RAG (tuned) | 127–187 ms per turn, every turn | 2.2 s | 2.4–2.9 s typical |
| `knowledge_base` tool + prompt rule | 40–60 ms per call | 2.3 s | 6.4–7.5 s when it reads a doc |

- Automatic RAG's retrieval matches the docs' "~250 ms" figure and isn't noticeable next to the
  ~2 s LLM time to first token.
- Tool mode's retrieval is faster, but the LLM has to decide to call the tool, wait for the
  result, and then generate. The agent often says a short filler line first ("Let's find out who
  it's named after!"), which in voice covers much of the gap. One run took 9.5 s before any text.
- Two automatic-RAG runs reported ~35–41 s to a finished answer. That was not reproduced in any
  other mode and looks like a harness artifact. Ignore it until it's seen in voice.
- **Not yet measured: real voice sessions.** All numbers are from text-only sessions. Voice adds
  TTS and turn-taking, but the retrieval and LLM steps are the same.

## Q2. One document per element, or one big document?

**One per element, clearly.** Same text, split two ways:

- Per-element: 25 documents, each indexed as **exactly one chunk**, so a hit is one whole
  element and nothing else. (ElevenLabs won't index documents under 500 bytes for RAG and
  silently puts them in the prompt instead. The smallest here is Rutherfordium at 508 bytes.
  Keep an eye on this for short entries.)
- Combined: 1 document split into **7 chunks of ~1.8–2.8 KB, each mixing 2–4 elements**, cut
  without regard to element boundaries.

`rag-query`, 12 questions with a known answer:

| | Top chunk contains the right element | …and nothing else |
|---|---|---|
| Per-element | 10/12 | **10/12** |
| Combined | 8/12 | 0/12 (always 1–3 other elements in the chunk) |

Both variants missed "Why did the berkelium get stuck at customs?" (returns Berkelium; the story
is in Tennessine's entry) and "Where was element 113 discovered?" (returns Flerovium; the
embeddings handle atomic numbers poorly). Tool mode avoids both, because the model picks the
document name itself.

A default-settings trap that applies to either shape: `max_vector_distance` defaults to 0.6, but
every distance observed for this corpus was 0.13–0.22. With 20 chunks allowed, **every query,
including "Why is gold shiny?", retrieved 14–16 KB (essentially the whole corpus)**. Tightening
to 3 chunks and distance ≤ 0.18 cut that to ~2 KB, and off-topic queries retrieved nothing. The
0.18 cutoff is fit to only 14 questions. Relevant hits sat at 0.13–0.16 and off-topic ones at
0.20–0.21, which is not much margin.

## Q3. Can the CLI manage it?

Partly.

- **References: yes.** `knowledge_base: [...]` and `rag: {...}` are already fields in
  `agent_configs/Chemical-Element-Periodic-Table-Guide.json`, so the list of attached documents
  and the RAG settings are version-controlled and ship through `/11labs-push` today.
- **Contents: no.** The installed `@elevenlabs/cli` is 0.4.3. The current 1.3.0 is a rewrite that
  wraps the full API (`agents knowledge-base documents create_from_text | update | ...`), but
  those are one-off commands. There's no `knowledge-base push` that syncs a local folder.
  (`agents push`/`pull` still exist in 1.3.0 but are hidden from `--help`. Whether 1.3.0 still
  reads our 0.4.x `agents.json` wasn't tested.)
- **A sync script is easy** because `PATCH /v1/convai/knowledge-base/{id}` with `{"content": ...}`
  updates a text document **without changing its ID** and re-indexes it automatically (~12 s).
  Agent config references never need to change after the first upload. Suggested shape: generate
  docs from the repo → match remote docs by name → create any missing ones, update changed ones
  → write the name→ID map to a gitignored file, like `agents.json`. Note that the body field is
  `content`: sending `text` returns 200 and changes nothing.

## Q4. Cost

ElevenLabs lists no separate knowledge-base or RAG fee. Storage and indexing are included, and
the knowledge base is available on every plan. **The cost is LLM input tokens**, which are passed
through on top of call minutes. LLM spend for the same two-turn text conversations:

| Mode | LLM $ per conversation |
|---|---|
| No knowledge base | $0.0019–0.0026 |
| Automatic RAG, tuned (3 chunks) | $0.0019–0.0056 |
| Tool mode, when it reads a document | $0.0091–0.0097 |

Tool mode costs more because each tool round re-sends the whole context (~10k input tokens, no
cache hits observed). That's roughly +$0.007 per knowledge-backed question, compared with
$0.08 per call minute. Automatic RAG with **default** limits would add ~4–5k tokens to *every*
turn, which is the configuration to avoid.

Side note from the billing data: conversations were billed as `gemini-3.7-flash`, even though
the config says `gemini-2.5-flash`. ElevenLabs appears to be remapping the model, so check the
LLM setting.

## Q5. Does retrieval respect the current element?

**Automatic RAG: no.** The query rewriter builds the search query from the spoken conversation
only. With a Tennessine click sent first, "How did they make this one?" was rewritten to "What
is this element?", exactly as with no click at all. It retrieved Flerovium, Copernicium, and
Hassium, and the agent answered from memory without the verified story. Setting
`query_rewrite_prompt_override` to tell the rewriter to use `[ELEMENT CLICK]` made it worse: it
**made up clicks** (`[element click: Neon] How was this element made?`), and the off-topic Gold
question started retrieving unrelated superheavy documents. Contextual updates simply aren't in
the rewriter's input.

**Tool mode: yes.** The main LLM *does* see contextual updates, and it writes the query or picks
the document itself: `knowledge_base({"strategy": "cat", "documents": ["117-Ts"]})`. Without a
prompt rule it searched only 1 of 5 times, and the other answers came from memory. One of those
got the customs story wrong ("sorted out the forms just in time"). The prompt rule used:

> The knowledge base has one verified document per element for protactinium (91) and americium
> through oganesson (95-118), named like '117-Ts'. When the child asks how one of those elements
> was discovered, made, or named, or asks for its story, ALWAYS read that element's document with
> the knowledge_base tool before answering, and use its facts instead of your memory. Use the
> element from the most recent [ELEMENT CLICK] when the child says 'this one' or 'it'. Do not
> search for other elements.

With the rule, the agent read the correct document 4/4 times and made no lookup for Gold. The
Tennessine answer then included the 250-day berkelium run, customs rejecting the shipment twice,
the five Atlantic crossings, and six atoms, all from our document.

## Recommendation for the real rollout

1. One text document per element, named `<Z>-<Symbol>`, generated from repo sources.
2. `rag.enabled: true` with `knowledge_base_tool_info.enabled_strategies: ["cat", "semantic"]`
   (`cat` does the real work; `semantic` covers questions not tied to one element, like "which
   element went to Mars?"; tool-mode `semantic` wasn't tested on that question). Keep `max_retrieved_rag_chunks_count` around 3.
3. Add a prompt rule like the one above that lists which elements have documents.
4. Add a `scripts/` sync step (create/update by name) and run it from `/11labs-push` before
   `agents push`.
5. **Rewrite the corpus for the agent before wiring it in.** `superheavy-element-videos.md` is a
   video production spec. Its `Visual:` lines mix instructions for an animator ("a countdown
   clock against a cargo manifest") with real facts (curium on Mars, americium in smoke
   detectors), so the lines can't just be deleted. Stripping them dropped several documents
   under the 500-byte indexing minimum.
6. Before shipping, test on a real phone in voice: time from the question to the first spoken
   word, and whether the filler line sounds natural.

**Alternative worth weighing:** what tool mode ends up doing is "read the document for element
X." A client tool `get_element_story(symbol)` that returns text bundled with the app would do
the same with no sync script and no remote copy to drift. The cost is story text in the JS
bundle and a round trip through the browser. Tool-mode `semantic` search is the part a client
tool couldn't easily replace.

## Reproducing

```bash
cd scripts/kb-spike
python3 split-corpus.py          # out/per-element/*.md + out/combined.md
python3 setup.py                 # upload + index docs, duplicate agent per variant
python3 eval-retrieval.py        # rag-query table
node eval-live.mjs per-element   # live text-only conversations (needs Node 22+)
python3 teardown.py              # delete spike agents + docs
```

`setup.py` creates the agents with default RAG settings. The tuned limits, tool mode, and prompt
rule above were applied by hand between runs.
