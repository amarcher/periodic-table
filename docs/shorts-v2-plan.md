# Shorts v2: narrated, structured, publishable

Status: plan, 2026-10-28. Owner: Andrew. Nothing here is built yet.

## Why

The v1 shorts (`npm run export:social`) are the website's silent 8-second
clips with a hook burned in. They are fine on the site, where the caption is
HTML and the reel is muted by design. On YouTube Shorts, TikTok and Reels they
read as stock loops: no sound, no structure, one static title, no shared grade.
The channel is `@PeriodicTableTech`; what goes on it sets the bar for the brand.

Rule going forward: **the site keeps the silent clips; nothing leaves the site
unless it clears the v2 bar below.**

## The bar (definition of publishable)

A v2 short is publishable when all of these are true:

- 9:16, 1080×1920, 24 fps, 15–22 s, H.264 + AAC, loudness −14 LUFS integrated.
- Structure: hook in the first 1.5 s (headline + brand sting), a setup and a
  payoff in the footage, an end card in the last 2.5 s.
- A narrator says the fact. Captions appear word by word in sync with the voice.
- A sound bed and at least one sound effect on the payoff.
- Footage has no hands, numerals, text or faces, and no visible seam between
  shots.
- One colour grade shared by every clip on the channel.
- The element chip, headline and site mark sit in the top fifth, clear of
  every platform's bottom overlay.
- A human has approved the contact sheet. The pipeline refuses to write post
  copy for an unapproved clip.

## Format spec

| Beat | Time | Picture | Sound |
|---|---|---|---|
| Hook | 0.0–1.5 s | Shot A opens. Headline reveals word by word. Chip + mark fade in. | Sting (0.4 s), bed starts |
| Setup | 1.5–9 s | Shot A continues | Narrator, sentence 1 |
| Payoff | 9–16 s | Shot B (the reaction, reveal or scale cue) | Narrator, sentence 2; SFX on the cut |
| Button | 16–18 s | Last frame holds, headline returns as a one-line takeaway | Narrator's closer (optional) |
| End card | last 2.5 s | Symbol, "periodictable.tech", "all 118 elements" | Bed tails out |

Narration budget: 35–45 words, two sentences plus an optional five-word closer.
Written for a general audience, the same stance as the site. No "kids".

## Pipeline

Seven stages, each a script under `scripts/shorts/`, each idempotent and
keyed by `<Symbol>/<slug>`. Every stage writes into
`output/shorts/<Symbol>/<slug>/` and skips work whose output already exists.

### 1. Brief (`brief.ts`)

Input: a factoid from `scripts/generate-videos/research/<n>-<Sym>.md`
("Kid-Friendly Factoids" and "Alternative Video Concepts Considered").
Output: `brief.json`:

```json
{
  "symbol": "Na", "slug": "soft-then-explosive",
  "headline": "Soft as cheese. Explosive in water.",
  "narration": "Sodium is so soft you can slice it with a butter knife. [[cut]] Drop that slice in water and it bursts into flame, because sodium rips hydrogen straight out of the water molecules.",
  "closer": "That's an alkali metal.",
  "shots": {
    "a": "Vertical. A clamp-held blade slices a silvery block of sodium on a dark bench; the fresh surface gleams, then dulls. No hands.",
    "b": "Vertical. The slice drops into a glass bowl of water and ignites into a tall yellow-orange flame with a burst of sparks. No hands."
  },
  "sfx": "whoosh-ignite",
  "sources": ["research/11-Na.md#factoid-1"]
}
```

The first six briefs are written by hand (they are the launch set and set the
voice). After that, a Claude call drafts the brief from the research file and
a human edits it; the brief is the artefact we review, not the prompt.

### 2. Footage (`footage.ts`)

Gemini Omni 1.1 Flash through the Interactions API, reusing the request code
and the file-id ledger from `scripts/generate-videos/clips.ts`.

- Shot A: text-to-video, 8 s, 9:16. Optionally seeded with a first frame from
  `gpt-image-2.5` when art direction matters (the seed-frame pattern in the
  `ai-video-generation` skill).
- Shot B: image-to-video from **the true last rendered frame of shot A**, not
  the seed, so the cut is continuous. 8 s.
- Resolution: test 720p upscaled by us against Omni's 1080p (which is an
  upscale on their side) on the first clip and pick one. Budget assumes 720p.
- Keep Omni's AAC track this time and audition it as the bed. It is ambient
  noise on the subject and may be better than library music.
- Reject-and-regenerate rule: a shot is rejected if the contact sheet shows
  hands, digits, text, a face, or the payoff missing. Each regeneration is
  logged with its cost.

### 3. Narration (`narrate.ts`)

ElevenLabs `/v1/text-to-speech/{voice}/with-timestamps`, which returns the
audio and character-level timings in one call. Port of `narrate.py` from the
`narrated-presentation` skill. `[[cut]]` in the narration marks where shot B
starts; its timestamp drives the edit, so the picture cut lands on the words.

Voice: reuse the site's guide voice (`6Ac71viMXq5tLn2bwYdz`, from the
ElevenLabs agent config) so the channel sounds like the site. Confirm it reads
chemistry well; keep a pronunciation map for element names that trip it.

Output: `narration.mp3`, `timings.json` (word start/end), `cues.json`
(`cut`, `closer`).

### 4. Composition (`compose/`)

A renderer, not ImageMagick. Two candidates, decided in milestone 1:

- **HyperFrames** (the `narrated-presentation` skill's choice): HTML + GSAP
  scenes rendered headlessly to MP4, real web fonts (Inter and Space Grotesk,
  the site's fonts), word-by-word captions from `timings.json`.
- **ffmpeg + ASS subtitles**: cheaper, but this machine's ffmpeg has no libass
  or drawtext, so it would need a rebuild and gives less typographic control.

Layers: footage (A then B at the `cut` cue), scrim, chip, animated headline,
karaoke captions in the lower-middle band (never the bottom 20%), site mark,
end card. All positions are the v1 safe-zone numbers.

### 5. Finish (`finish.ts`)

ffmpeg: apply the channel LUT (one `.cube`, chosen in milestone 1 and
committed), mix narration + bed + sfx with ducking, `loudnorm` to −14 LUFS,
encode `-crf 18 -preset slow -movflags +faststart`, write the poster from the
hook frame.

### 6. Review (`review.ts`)

Writes `contact.png` (a frame every second, the waveform underneath, the
caption text overlaid) and `review.md` with the brief, costs and the checklist
from "The bar". Approval is a human writing `approved.json` (who, when, which
checklist items). Stage 7 refuses to run without it.

### 7. Publish (`publish.ts`)

Writes `post.txt` (title, caption with the watch-page link, hashtags, the AI
label reminder) next to the MP4 and updates `output/shorts/manifest.json`.
Uploading stays manual for the first fifty posts; the YouTube Data API is the
first automation candidate after that, Instagram's Graph API second, TikTok's
Content Posting API (needs an app audit) last.

## What stays the same

- The website reel and carousel keep using the silent 8-second clips.
- `clips.ts`, the watch pages, the schema and the sitemap do not change.
- The v1 export stays for posters and for a quick silent cut when needed.

## Costs and timing per clip

| Item | Cost | Time |
|---|---|---|
| Omni, 2 × 8 s at 720p | $1.60 | ~70 s |
| Seed frame (gpt-image-2.5), when used | < $0.05 | ~10 s |
| ElevenLabs, ~300 characters | < $0.05 | ~3 s |
| Render + finish | $0 | ~60–90 s |
| Regenerations (budget one per three clips) | ~$0.55 avg | |
| **Total** | **~$2.20** | **~4 min** |

A short a day is about $65 a month. The launch set of six is about $15.

## Milestones

1. **Spike (one clip, by hand).** Take the existing sodium short, write its
   brief, record the narration, and build the composition for it in both
   candidate renderers. Pick the renderer and the LUT. Deliverable: one
   publishable sodium short and a decision log. This is where the look is
   decided; nothing else starts until it's approved.
2. **Pipeline.** Scripts 1–7 with the ledger, the skip-if-exists rule and the
   approval gate. Deliverable: `npm run shorts -- --element Na` reproduces the
   spike from `brief.json`.
3. **Launch set.** Six briefs: the best factoid each for Na, H, Hg, Au, plus
   two new elements chosen from the research (candidates: K for the purple
   flame and water reaction, Ga for melting in a hand-free warm bath, Bi for
   the rainbow crystals). Review and approve all six.
4. **Channel launch.** Delete the private v1 draft on YouTube, post one a day
   for six days on YouTube and TikTok, with the site link in each description.
   Instagram joins when the account exists.
5. **Cadence.** Claude-drafted briefs, a weekly batch of seven, one review
   sitting. Revisit automation at fifty posts.

## Decisions needed before milestone 1

1. **Voice.** Reuse the site's guide voice, or cast a new narrator for the
   channel? Reusing it ties the channel to the site; a new one can be punchier.
2. **Music.** Bake a licensed bed into the file (consistent everywhere, needs a
   licence and a track choice) or use each platform's library at upload time
   (free, but every post sounds different and the file ships with narration
   only). Omni's own ambient track is the third option, to be auditioned.
3. **Length.** 15–18 s with two shots is the proposal. A single 8–10 s shot
   with narration is cheaper and still clears the bar if the payoff is in it.

## Risks

- Omni ignores "no hands" and "no digits" often enough that one shot in three
  may need regenerating. The budget assumes it; the review stage catches it.
- The A→B seam. Seeding B from A's last frame usually holds; when it doesn't,
  a hard cut on the narration's `[[cut]]` beat hides it.
- Pronunciation. ElevenLabs can stumble on element names; the pronunciation
  map is cheap insurance.
- HyperFrames is new to this repo. If the spike shows it fighting us, the
  fallback is rebuilding ffmpeg with libass and using ASS karaoke, which is
  plainer but reliable.
- Platform policy. Every post carries the AI-generated label; YouTube's is set
  per upload under "Show more". Skipping it risks removal.
