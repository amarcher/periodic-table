"""Delete the spike agents and knowledge-base documents recorded in out/state.json."""
from kb import STATE, call, load_state

state = load_state()
for variant, agent_id in state.get("agents", {}).items():
    call("DELETE", f"/v1/convai/agents/{agent_id}")
    print(f"deleted agent {variant} {agent_id}")
for docs in state.get("docs", {}).values():
    for d in docs:
        call("DELETE", f"/v1/convai/knowledge-base/{d['id']}?force=true")
        print(f"deleted doc {d['name']}")
STATE.unlink(missing_ok=True)
