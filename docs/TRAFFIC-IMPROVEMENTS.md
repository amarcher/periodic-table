# Search, exploration measurement, and browser resilience

## Search pages

`npm run build` generates the homepage plus 118 element HTML pages. Each page has the existing factual summary, properties, fun facts, links to other elements, its own title/description/canonical, and structured data before JavaScript runs. React replaces the initial content with the interactive explorer. Social sharing retains the original element video and poster where available.

The canonical origin is `https://periodictable.tech`. The sitemap contains only the homepage and proper-case element paths such as `/element/Au`; lowercase aliases retain the proper-case canonical. Vercel `cleanUrls` serves the generated HTML. The previous social-bot-only rewrite and catch-all homepage rewrite were removed. `404.html` is deliberately excluded from indexing. The existing OG API remains available for compatibility.

## Event definitions

Custom events go independently to the existing GA and PostHog destinations. Production events require the apex or www hostname; localhost and preview hosts do not emit these events. No new analytics provider or credential was added. GA's existing automatic page-view collection remains responsible for page views; no second custom page-view implementation was added.

| Event | Meaning and properties |
| --- | --- |
| `element_opened` | One element route entry, including direct landings, reloads, and browser history. `symbol`, `atomic_number`. Repeated React effects for the same route are ignored. |
| `element_engagement` | Incremental focused, visible time in `active_ms`, flushed every 30 seconds, on blur/hide, and on close. |
| `element_closed` | Total focused, visible `duration_ms` for that route visit. Do not add this to `element_engagement` or time will be counted twice. |
| `exploration_progress` | Running `distinct_elements` count within this tab's exploration period. Persists through reloads when session storage is available; resets after 30 minutes without recorded element activity. This is not a GA session identifier. Never sum the running counts. |
| `phase_diagram_used` | First pointer or arrow-key change on a phase diagram, or first slider change, per element visit. No event for unrelated keyboard input. |
| `valence_toggle`, `orbital_filter`, `unfilled_toggle`, `hybridization_toggle` | Existing explicit orbital-control interactions remain available. These indicate exploration, not demonstrated learning. |
| `video_started` | First actual playback per element visit, including autoplay. |
| `video_play_toggle` | Explicit play/pause intent. |
| `video_engagement` | Incremental visible playback in `watched_ms`, flushed every 30 seconds and on lifecycle exits. |
| `video_loop` | Observed near-end to beginning playback wrap, with running `loop_count`. Includes native looping seeks. The player has no seeking UI; a programmatic seek exactly at a loop boundary is indistinguishable from a loop. Never sum the running loop counts. |
| `voice_agent_activated` | Explicit attempt, before microphone permission and connection. |
| `voice_connected` | Successful connection, with `connection_ms` measured from the attempt, including permission time. |
| `voice_connection_failed` | Attempt ended before connection; bounded reason such as microphone denial/timeout/device, connection error, or remote disconnect. |
| `voice_cancelled` | User cancellation or page exit before connecting. |
| `voice_session_ended` | A connected session ended; `duration_ms` and a bounded reason. Ended does not establish a successful educational outcome. |
| `atom_display_changed` | Explicit selection of still view or 3D. |

Diagnostics are capped at five events per name per document lifetime: `application_error`, `video_loaded`, `video_stalled`, `video_error`, `image_error`, `atom_quality_reduced`, `atom_fallback`, and `voice_unavailable`. Caps make them diagnostic samples, not exact population error rates. Diagnostic payloads contain bounded categories, element identifiers, timings, and numeric media error codes; no transcripts or raw exception messages were added.

Focus time is not a measure of comprehension, and an unattended foreground tab can still accrue time. Checkpoints reduce exit losses but cannot guarantee delivery after a browser crash, blocked analytics, or sudden shutdown. Historical open/close/video measurements use different semantics and should not be compared directly across this release without accounting for the change.

## Browser behavior

- The voice SDK is loaded separately from the initial app entry. A load/render failure leaves the element explorer usable.
- 3D starts with reduced detail on devices reporting four or fewer cores or 4 GB or less memory. Sustained low frame rate reduces quality for the rest of the document lifetime. Pixel ratio is capped at 1.5 and reduced to 1 in low quality.
- Hidden or offscreen atom canvases stop their frame loop. Rendering errors or WebGL context loss show a still atom summary. Reduced-motion preference selects that summary by default; visitors can choose 3D explicitly.
- Video autoplay respects reduced-motion and save-data preferences. Playback pauses when hidden/offscreen. Video errors retain the original poster and a readable fallback. Hovering element links no longer preloads video files.
- Wikipedia photos request thumbnails first and cancel stale work when an element closes.
- Voice permission and connection attempts have timeouts, cancellation, and distinct outcome events. A microphone stream granted after the permission timeout is still stopped. Browsing does not require voice.

## Local verification — September 10, 2026

- Production build passes; all 118 generated pages, lowercase aliases, canonical URLs, boot assets, and sitemap entries checked. Representative H/Au/Og and lowercase Au HTML served HTTP 200 from the local preview.
- 37 tests pass across 7 files, covering metadata, route timing, storage failure, analytics destination isolation, video loop/seek semantics, voice outcomes, and late microphone cleanup, alongside the existing tests.
- All changed TypeScript/JavaScript files pass ESLint without warnings. Full-repository lint still has five existing errors, reproduced from the unchanged starting commit: four in `scripts/generate-videos/{api-client,index}.ts` and one material mutation in `src/components/atom/ElectronShell.tsx`.
- Chrome local production preview checked at 1366×768: direct Hydrogen landing, still/3D switching, phase keyboard control, video pause, closing, opening Gold, back/forward, and reload with updated metadata. No browser errors observed; Three.js emits its existing Clock deprecation warning.
- The build still warns about large lazy voice and 3D chunks. No claim of measured Chromebook speedup or hosting capacity is made.

## Deployment follow-up

These are production checks, not results of the local commit:

1. Verify `/`, `/element/H`, `/element/Au`, `/element/Og`, lowercase aliases, and an invalid element URL on the actual Vercel deployment. Confirm element HTML and canonical before JS, a real HTTP 404 for the invalid path, and original social media URLs. Vite preview's SPA fallback is not evidence of Vercel's 404 behavior.
2. Inspect representative URLs and the sitemap in the existing Search Console property. Valid HTML is an indexing prerequisite, not a promise that Google will index or rank every page.
3. Verify one GA page view per route transition and one custom element-open event per route entry. Register useful custom dimensions/metrics for reports as needed; the commit does not change GA administration or connect Search Console to GA.
4. Exercise microphone denied, blocked connection, cancellation, and successful voice on a test device. No paid voice session was started during local verification.
5. Test a real older Chromebook and a constrained school-like network, including repeated element navigation, heavy elements, context loss, and background tabs. Desktop viewport checks do not emulate device memory, GPU, or network constraints.
6. Compare settled acquisition data after processing. Review engagement and voice success by browser/device alongside sampled media/graphics diagnostics before buying more infrastructure or increasing paid voice usage.
