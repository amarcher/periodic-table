/**
 * Fusion-sequence prompts for the accelerator-made elements (101–118).
 *
 * These 18 elements are all made the same way — two nuclei are brought together
 * until they stick — so a single shared visual grammar keeps them coherent while
 * the per-element data below keeps them distinct. The grammar follows the real
 * physics: nuclei behave as liquid drops, so fusion is *coalescence* (deform on
 * contact, draw a molten neck, wobble on the brink of tearing apart, boil off
 * neutrons to survive), not a billiard-ball collision.
 *
 * Each element renders as TWO chained 8s clips:
 *   A — inspiral, contact, coalescence, violent wobble, neutron evaporation
 *   B — oscillation damps, the new nucleus settles, then it decays
 *
 * Clip B is seeded from clip A's *rendered* last frame so the join is invisible.
 * Reactions and decay data are the verified ones in docs/superheavy-element-videos.md.
 */

export interface FusionSpec {
  /** Beam ion, as it should read on screen. */
  beam: string;
  /** Beam colour language. */
  beamColor: string;
  /** Target nuclide. */
  target: string;
  /** Target colour language. */
  targetColor: string;
  /** Neutrons evaporated by the compound nucleus (1 = cold fusion, 2–4 = hot). */
  neutrons: number;
  /** Colour of the newly formed element. */
  productColor: string;
  /** How this element ends — its own decay signature or defining trait. */
  ending: string;
}

export const FUSION: Record<number, FusionSpec> = {
  101: { beam: 'helium', beamColor: 'pale green', target: 'einsteinium', targetColor: 'fierce blue-white',
    neutrons: 1, productColor: 'deep violet',
    ending: 'the violet nucleus fades almost as soon as it forms, then another appears beside it, then another — seventeen in all, each winking into existence and out again like fireflies, the first element ever built one single atom at a time' },
  102: { beam: 'neon', beamColor: 'orange-pink', target: 'uranium', targetColor: 'dull green-grey',
    neutrons: 6, productColor: 'warm amber-gold',
    ending: 'the amber nucleus holds steady far longer than it should, calm and unhurried, before finally ejecting an alpha particle and fading' },
  103: { beam: 'boron', beamColor: 'vivid green', target: 'californium', targetColor: 'pale silver-blue',
    neutrons: 5, productColor: 'rose-pink',
    ending: 'the rose-pink nucleus pulses, and its electron cloud reorganises around it — shells visibly rearranging into a new configuration, an element still argued over for where it belongs' },
  104: { beam: 'carbon', beamColor: 'bright blue-white', target: 'californium', targetColor: 'golden',
    neutrons: 4, productColor: 'crimson-red',
    ending: 'two ghostly auras, one crimson and one deep blue, wash over the crimson nucleus in turn, each claiming it, flickering back and forth before one finally holds and the other fades' },
  105: { beam: 'nitrogen', beamColor: 'cool violet', target: 'californium', targetColor: 'golden',
    neutrons: 4, productColor: 'teal-green',
    ending: 'the teal nucleus settles into an unusually patient, steady glow, enduring far beyond its neighbours, before splitting cleanly into two glowing fragments' },
  106: { beam: 'oxygen', beamColor: 'icy white-blue', target: 'californium', targetColor: 'golden',
    neutrons: 4, productColor: 'warm orange-gold',
    ending: 'the orange-gold nucleus burns with a dignified steady light, six faint electron rings tracing around it, before gracefully releasing an alpha particle' },
  107: { beam: 'chromium', beamColor: 'steel blue', target: 'bismuth', targetColor: 'iridescent rose-gold',
    neutrons: 1, productColor: 'luminous blue-white',
    ending: 'the blue-white nucleus is joined by a pair of small red oxygen atoms that bond to it, forming a volatile compound that drifts away as a glowing molecule' },
  108: { beam: 'iron', beamColor: 'amber-orange', target: 'lead', targetColor: 'deep indigo',
    neutrons: 1, productColor: 'blue-silver',
    ending: 'four small red oxygen atoms close in and bond to the blue-silver nucleus, and the resulting molecule lifts and drifts away as a volatile vapour' },
  109: { beam: 'iron', beamColor: 'amber-orange', target: 'bismuth', targetColor: 'iridescent rose-gold',
    neutrons: 1, productColor: 'soft dignified purple',
    ending: 'one single purple nucleus glows alone in enormous darkness, solitary and quiet, holding for a long beat before releasing an alpha particle' },
  110: { beam: 'nickel', beamColor: 'electric green', target: 'lead', targetColor: 'deep indigo',
    neutrons: 1, productColor: 'platinum-white',
    ending: 'the platinum-white nucleus shines like a captured star, impossibly dense, then erupts into a cascade of alpha decays, each daughter flashing briefly before decaying again' },
  111: { beam: 'nickel', beamColor: 'electric green', target: 'bismuth', targetColor: 'iridescent rose-gold',
    neutrons: 1, productColor: 'rich warm gold',
    ending: 'the golden nucleus radiates fine straight rays of light outward in all directions, piercing the darkness like x-rays, before trembling and splitting apart' },
  112: { beam: 'zinc', beamColor: 'blue-white', target: 'lead', targetColor: 'deep indigo',
    neutrons: 1, productColor: 'cool silvery-blue',
    ending: 'the silvery-blue nucleus turns liquid and mirror-bright like mercury, then its surface seals shut and it drifts free, inert and unreactive, refusing to touch anything around it' },
  114: { beam: 'calcium', beamColor: 'brilliant white-blue', target: 'plutonium', targetColor: 'dark red-orange',
    neutrons: 2, productColor: 'liquid silver',
    ending: 'the liquid-silver nucleus shimmers and flows like mercury, and far behind it in the darkness a distant golden-green shore glows faintly — the island of stability, never reached' },
  115: { beam: 'calcium', beamColor: 'brilliant white-blue', target: 'americium', targetColor: 'warm silver-grey',
    neutrons: 3, productColor: 'deep violet-magenta',
    ending: 'the violet-magenta nucleus survives barely an instant before erupting into a rapid chain of alpha decays, each daughter flashing with diminishing light like a string of firecrackers' },
  116: { beam: 'calcium', beamColor: 'brilliant white-blue', target: 'curium', targetColor: 'glowing purple-white',
    neutrons: 3, productColor: 'hot pink-red',
    ending: 'the hot pink-red nucleus flares to searing white and is gone almost immediately, its entire life shorter than a blink, erupting into smaller and smaller fragments' },
  117: { beam: 'calcium', beamColor: 'brilliant white-blue', target: 'berkelium', targetColor: 'rare pale green',
    neutrons: 3, productColor: 'striking teal-cyan',
    ending: 'the teal-cyan nucleus shimmers briefly — the product of the rarest target ever prepared — then tears apart into a scatter of glowing fragments' },
  118: { beam: 'calcium', beamColor: 'brilliant white-blue', target: 'californium', targetColor: 'pale silver-blue',
    neutrons: 3, productColor: 'deep blue-violet',
    ending: 'the blue-violet nucleus is wrapped not in neat orbital rings but in a diffuse shimmering fog of electrons that blurs and ripples, easily disturbed, before the whole thing bursts apart in a cascade of decays' },
};

/** "a" / "an" for a colour phrase like "icy white-blue" or "amber-orange". */
const a = (phrase: string) => (/^[aeiou]/i.test(phrase) ? 'an' : 'a') + ' ' + phrase;

const DROPLET = (n: number) =>
  n === 1
    ? 'a single tiny white-hot neutron droplet pinches off and flies free, trailing a thin spark'
    : `${n} tiny white-hot neutron droplets pinch off in quick succession and fly free, trailing thin sparks`;

/** Clip A — inspiral, contact, coalescence, wobble, neutron evaporation. */
export function clipAVideo(s: FusionSpec): string {
  return (
    `Extreme close-up against pure black: two glowing molten nuclei — ${a(s.beamColor)} ${s.beam} drop and a larger ${s.targetColor} ${s.target} drop — ` +
    `whirl around each other in a tight binary orbit, already fast and accelerating hard, the orbit tightening turn after turn. ` +
    `They sweep around one another again and again at a dizzying, sickening pace, each revolution faster and closer than the last, ` +
    `smearing into motion-blurred arcs, luminous spiral trails winding inward behind them like an inspiralling binary. ` +
    `The whirl becomes almost too fast to follow — then the two drops slam together and flatten against each other, a searing white seam blazing along the contact face. ` +
    `Surface tension takes over: a thick molten neck draws between them and they flow into one another, their colours bleeding together as the two liquids mix. ` +
    `The merged body stretches into a long peanut shape, pinched hard at the waist, wobbling and shuddering violently on the brink of tearing back into two. ` +
    `At the peak of that wobble ${DROPLET(s.neutrons)} into the darkness. ` +
    `Hold on the violently oscillating molten dumbbell, still straining. ` +
    `Violent accelerating orbital motion, then liquid coalescence with real surface tension and viscous flow, slow-motion droplet physics.`
  );
}

export function clipAStart(s: FusionSpec): string {
  return (
    `Extreme close-up against pure black: two glowing molten nuclei locked in a tight, extremely fast binary orbit around a shared centre — ` +
    `a ${s.beamColor} ${s.beam} drop and a larger ${s.targetColor} ${s.target} drop, already very close together, caught mid-whirl. ` +
    `Both are smeared into motion-blurred crescent arcs by their speed, with long luminous spiral trails winding inward behind them, ` +
    `the whole frame conveying violent rotational velocity. They are circling, not yet touching.`
  );
}

export function clipAEnd(s: FusionSpec): string {
  return (
    `Extreme close-up against pure black: a single merged molten nucleus, violently out of round — an elongated wobbling droplet pinched hard at the waist, ` +
    `glowing ${s.productColor} with the ${s.beamColor} and ${s.targetColor} of its two parents still marbled through it. ` +
    `${s.neutrons === 1 ? 'One tiny white-hot neutron droplet has' : `${s.neutrons} tiny white-hot neutron droplets have`} just pinched free and ` +
    `${s.neutrons === 1 ? 'flies' : 'fly'} away trailing thin sparks. There is only one body now, not two, and it is still straining.`
  );
}

/** Clip B — the wobble damps, the new element settles, then decays. */
export function clipBVideo(s: FusionSpec): string {
  return (
    `Continuous shot, extreme close-up against pure black. A violently wobbling molten nucleus shaped like an elongated peanut, pinched hard at the waist, strains as if about to tear in two. ` +
    `Instead the oscillation damps: the pinched waist thickens and fills in, the lobes draw together, and the body slowly rounds out, ` +
    `surface waves shrinking with each pass as the molten liquid settles under its own surface tension. ` +
    `It becomes a single rounded nucleus glowing steady ${s.productColor}, breathing gently — a newborn atom, finally whole. It holds for a beat, calm. ` +
    `Then ${s.ending}. ` +
    `Liquid surface tension, viscous damping, slow-motion molten physics throughout.`
  );
}

export function clipBEnd(s: FusionSpec): string {
  return (
    `Extreme close-up against pure black: the aftermath of a newly formed ${s.productColor} nucleus as ${s.ending}. ` +
    `Molten liquid surfaces, glowing against deep darkness, caught mid-motion rather than at rest.`
  );
}
