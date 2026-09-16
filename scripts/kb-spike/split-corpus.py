"""Split docs/superheavy-element-videos.md into knowledge-base documents.

Writes two variants built from identical text, so retrieval can be compared:
  out/per-element/<Z>-<Symbol>.md   one document per element (25)
  out/combined.md                   all elements in one document

Text is kept verbatim. The source mixes verified facts with animator direction
("Visual:" lines); several of those lines carry facts (curium on Mars, the
americium smoke detector), so stripping them loses content.
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / "docs/superheavy-element-videos.md"
OUT = pathlib.Path(__file__).resolve().parent / "out"

text = SRC.read_text()
body = text.split("## Per-element specs", 1)[1].split("\n---\n", 1)[0]

ELEMENT = re.compile(r"^\*\*(\d+) · (\w+) \((\w+)\)\*\*(.*)$")


docs = []  # (z, name, symbol, era_title, era_intro, block)
for era in re.split(r"^### ", body, flags=re.M)[1:]:
    era_title, _, rest = era.partition("\n")
    lines = rest.splitlines()
    starts = [i for i, l in enumerate(lines) if ELEMENT.match(l)]
    era_intro = "\n".join(lines[: starts[0]]).strip()
    for n, s in enumerate(starts):
        end = starts[n + 1] if n + 1 < len(starts) else len(lines)
        z, name, sym, _ = ELEMENT.match(lines[s]).groups()
        docs.append((int(z), name, sym, era_title.strip(), era_intro,
                     "\n".join(lines[s:end]).strip()))

(OUT / "per-element").mkdir(parents=True, exist_ok=True)
combined = ["# How the superheavy elements (91, 95–118) were discovered and made\n"]
for z, name, sym, era_title, era_intro, block in docs:
    header = f"# {name} ({sym}), element {z}\n\nDiscovery era: {era_title}\n"
    if era_intro:
        header += f"\n{era_intro}\n"
    (OUT / "per-element" / f"{z:03d}-{sym}.md").write_text(f"{header}\n{block}\n")
    combined.append(f"## {name} ({sym}), element {z}\n\nDiscovery era: {era_title}\n\n{block}\n")
(OUT / "combined.md").write_text("\n".join(combined))

print(f"{len(docs)} elements")
for p in sorted((OUT / "per-element").iterdir()):
    print(f"  {p.name:14} {p.stat().st_size:5} bytes")
print(f"  combined.md    {(OUT / 'combined.md').stat().st_size} bytes")
