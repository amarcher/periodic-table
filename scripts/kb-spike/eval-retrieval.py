"""Run the same questions through rag-query for each variant.

rag-query retrieves with the raw query (no conversation-aware rewrite), so this
measures chunking/ranking only. Element context is tested in eval-live.mjs.
"""
import json
import re
import time
import urllib.parse

from kb import call, load_state

# (question, expected element symbol or None when nothing should match)
QUESTIONS = [
    ("How did they make tennessine?", "Ts"),
    ("Why did the berkelium get stuck at customs?", "Ts"),
    ("Which element is named after a woman scientist?", "Mt"),
    ("What element is inside a smoke detector?", "Am"),
    ("Which element glows purple in the dark?", "Cm"),
    ("Has any element been to Mars?", "Cm"),
    ("What is the fermium gap?", "Fm"),
    ("Which element was found in a hydrogen bomb explosion?", "Es"),
    ("Was an element ever named after someone who was still alive?", "Sg"),
    ("What is the island of stability?", "Fl"),
    ("Where was element 113 discovered?", "Nh"),
    ("How many atoms of oganesson have ever been made?", "Og"),
    ("How did they make this one?", None),  # deictic: no element in the query
    ("Why is gold shiny?", None),           # off-corpus
]

state = load_state()
SYMBOLS = {d["id"]: d["name"].split("-")[-1] for d in state["docs"]["per-element"]}


def elements_in(text: str) -> list[str]:
    return re.findall(r"^#+ \w+ \((\w+)\), element", text, flags=re.M)


report = {}
for variant, agent_id in state["agents"].items():
    rows = []
    for q, expected in QUESTIONS:
        t0 = time.perf_counter()
        r = call("POST", f"/v1/convai/agents/{agent_id}/knowledge-base/rag-query", {"query": q})
        ms = round((time.perf_counter() - t0) * 1000)
        chunks = r["chunks"]
        ranked = []
        for c in chunks:
            ranked += [SYMBOLS[c["document_id"]]] if c["document_id"] in SYMBOLS else elements_in(c["text"])
        top_chunk = ([SYMBOLS[chunks[0]["document_id"]]] if chunks and chunks[0]["document_id"] in SYMBOLS
                     else elements_in(chunks[0]["text"]) if chunks else [])
        rows.append({
            "q": q, "expected": expected, "ms": ms,
            "n_chunks": len(chunks),
            "chars": sum(len(c["text"]) for c in chunks),
            "top_dist": round(chunks[0]["vector_distance"], 3) if chunks else None,
            "top_chunk_elements": top_chunk,
            "hit_top1": expected in top_chunk if expected else None,
            "rank": ranked.index(expected) + 1 if expected in ranked else None,
            "noise_elements_in_top_chunk": len([e for e in top_chunk if e != expected]),
        })
    report[variant] = rows

(__import__("pathlib").Path(__file__).parent / "out" / "retrieval.json").write_text(json.dumps(report, indent=2))
for variant, rows in report.items():
    print(f"\n== {variant}")
    print(f"{'question':58} {'exp':3} {'top1':5} {'rank':4} {'chunks':6} {'chars':6} {'dist':5} {'ms':5}")
    for r in rows:
        print(f"{r['q'][:58]:58} {str(r['expected']):3} {str(r['hit_top1']):5} {str(r['rank']):4} "
              f"{r['n_chunks']:6} {r['chars']:6} {str(r['top_dist']):5} {r['ms']:5}  top={r['top_chunk_elements']}")
