"""Upload both corpus variants and attach each to its own throwaway agent.

The production agent is never modified: each variant gets a duplicate of it
with RAG enabled. IDs go to out/state.json; teardown.py removes everything.
"""
import pathlib
import time

from kb import call, load_state, save_state

OUT = pathlib.Path(__file__).resolve().parent / "out"
PROD_AGENT = "agent_3301kkm17wegf6aanhbpardx1893"
MODEL = "e5_mistral_7b_instruct"

state = load_state()


def upload(name: str, path: pathlib.Path) -> dict:
    doc = call("POST", "/v1/convai/knowledge-base/text", {"name": name, "text": path.read_text()})
    call("POST", f"/v1/convai/knowledge-base/{doc['id']}/rag-index", {"model": MODEL})
    return {"id": doc["id"], "name": name, "type": "text", "usage_mode": "auto"}


if "docs" not in state:
    per = [upload(f"[kb-spike] {p.stem}", p) for p in sorted((OUT / "per-element").glob("*.md"))]
    combined = [upload("[kb-spike] superheavy combined", OUT / "combined.md")]
    state["docs"] = {"per-element": per, "combined": combined}
    save_state(state)

pending = [d["id"] for docs in state["docs"].values() for d in docs]
while pending:
    still = []
    for doc_id in pending:
        idx = call("GET", f"/v1/convai/knowledge-base/{doc_id}/rag-index")["indexes"]
        if not any(i["model"] == MODEL and i["status"] == "succeeded" for i in idx):
            still.append(doc_id)
            if any(i["status"] in ("failed", "rag_limit_exceeded", "document_too_small") for i in idx):
                raise SystemExit(f"index failed for {doc_id}: {idx}")
    print(f"indexing: {len(pending) - len(still)}/{len(pending)} ready")
    pending = still
    if pending:
        time.sleep(3)

state.setdefault("agents", {})
for variant, docs in state["docs"].items():
    if variant in state["agents"]:
        continue
    agent_id = call("POST", f"/v1/convai/agents/{PROD_AGENT}/duplicate",
                    {"name": f"[kb-spike] {variant}"})["agent_id"]
    call("PATCH", f"/v1/convai/agents/{agent_id}", {"conversation_config": {"agent": {"prompt": {
        "knowledge_base": docs,
        "rag": {"enabled": True, "embedding_model": MODEL},
    }}}})
    state["agents"][variant] = agent_id
    save_state(state)
    print(f"{variant}: {agent_id}")
