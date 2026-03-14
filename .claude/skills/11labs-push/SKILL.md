---
name: 11labs-push
description: Push this project's ElevenLabs agent and tool configs. Use when the user has edited agent prompts, tool definitions, or wants to sync local config changes to ElevenLabs.
---

# Push ElevenLabs configs for the Periodic Table project

Push the local agent and tool configs to ElevenLabs. This project's voice agent is "Chemical Element Periodic Table Guide".

## Key files

- `agent_configs/Chemical-Element-Periodic-Table-Guide.json` — the main agent config (prompt, first message, voice settings, tool_ids)
- `tool_configs/navigate_to_element.json` — client tool for voice-driven element navigation
- `tool_configs/go_back_to_table.json` — client tool for closing the detail view via voice

## Setup

`agents.json` and `tools.json` are gitignored because they contain the agent ID mapping. On a fresh clone, pull them first:

```bash
export ELEVENLABS_API_KEY=$(grep ELEVENLABS_API_KEY .env | cut -d= -f2)
echo "y" | elevenlabs agents pull --no-ui
echo "y" | elevenlabs tools pull --no-ui
```

## Push steps

1. Read `.env` to get `ELEVENLABS_API_KEY`
2. Ensure `agents.json` and `tools.json` exist (pull if missing)
3. Dry-run:
   ```bash
   ELEVENLABS_API_KEY=$KEY elevenlabs tools push --dry-run
   ELEVENLABS_API_KEY=$KEY elevenlabs agents push --dry-run
   ```
4. Show the user what will change
5. On confirmation, push:
   ```bash
   ELEVENLABS_API_KEY=$KEY elevenlabs tools push
   echo "y" | ELEVENLABS_API_KEY=$KEY elevenlabs agents push
   ```

## Important

- Always dry-run before pushing
- Tools must be pushed before agents if new tools were added (agent references tool IDs)
- The `ELEVENLABS_API_KEY` in `.env` is scoped to ElevenAgents Write permission only
