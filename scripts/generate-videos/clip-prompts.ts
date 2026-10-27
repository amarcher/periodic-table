// Veo prompts for fact clips, keyed "<Symbol>/<slug>" to match src/data/clips.ts.
// Each is one continuous action that can loop. CLIP_STYLE_ANCHOR is appended by clips.ts;
// unlike the element STYLE_ANCHOR it does not force a laboratory or a sealed vessel,
// because these shots include oceans, the Sun and a street at dusk.
// No hands, faces, text or numerals: the caption is rendered in HTML on the watch page.
export const CLIP_STYLE_ANCHOR =
  'Photorealistic cinematic video, shallow depth of field, dramatic and vivid, rich volumetric lighting, ' +
  'smooth slow-motion, seamless looping video that returns to its starting state, ' +
  'absolutely no text, no watermarks, no logos, no letters, no numerals, no symbols overlaid on the video, no human faces, no hands.';

export const CLIP_PROMPTS: Record<string, string> = {
  'Au/three-olympic-pools':
    'Slow aerial drift over an Olympic-size swimming pool filled to the brim with solid gleaming gold instead of water, the surface a dense mosaic of stacked gold bars catching hard sunlight, ripples of reflected light shimmering across the metal, the lane ropes and starting blocks visible at the pool edges, the camera slowly orbiting.',
  'Au/soft-enough-to-shape':
    'Extreme close-up of a lustrous gold nugget resting on black velvet as a polished steel rod presses slowly into it, the metal yielding and spreading like warm clay, its surface stretching into a bright flattened sheet without a single crack, soft studio light sliding across the deforming gold.',
  'Au/never-tarnishes':
    'Extreme close-up of a slow trickle of clear water washing dark sediment off an ancient gold ceremonial mask, the gold beneath emerging still brilliant and untouched by time, while beside it a bronze coin crusted in green patina and an iron nail eaten by orange rust crumble under the same water, dramatic museum lighting.',
  'Au/gold-in-the-ocean':
    'Underwater shot in a sunlit tropical ocean, shafts of light piercing clear blue water, and drifting through the water column countless microscopic glittering flecks of gold that catch the light like golden plankton, the camera slowly rising toward the shimmering surface.',
  'H/fuel-of-the-sun':
    'Extreme telephoto view of the surface of the Sun: a roiling ocean of golden-orange plasma granules boiling and churning, an immense arching prominence of glowing hydrogen plasma lifting off the limb and curling back along invisible magnetic field lines, small flares flickering, deep black space beyond.',
  'H/two-thirds-of-water':
    'Macro shot of a single water droplet swelling at the tip of a glass pipette and falling in slow motion into a still dark pool, and inside the droplet a luminous visualization of water molecules: pairs of small glowing white spheres bonded to a larger soft-blue sphere, thousands of them tumbling as the droplet splashes and ripple rings spread outward.',
  'H/lightest-element':
    'Slow motion in a dark laboratory as a cluster of translucent party balloons is released at once: one hydrogen-filled balloon shoots upward far faster than the rest, which drift lazily or sink to the floor, a thin tether trailing beneath the rising balloon as a soft spotlight tracks it.',
  'H/rocket-fuel':
    'Night launch close-up of a rocket engine burning liquid hydrogen: the nozzle erupting with a nearly invisible pale-blue flame rimmed by shimmering heat haze, frost and vapor sheeting off the cryogenic tank walls above, billowing white steam clouds rolling across the launch pad as the rocket begins to rise, camera low and locked off.',
  'Hg/liquid-at-room-temperature':
    'Extreme close-up of a bright bead of liquid mercury rolling across a dark glass surface, splitting into a dozen tiny perfect spheres as it crosses a ridge, then the droplets racing back together and merging into one mirror-smooth bead that reflects the studio lights, slow motion.',
  'Hg/quicksilver':
    'A sheet of black glass tilted into the frame, and a slender stream of quicksilver racing downhill across it in slow motion, impossibly fast and bright, breaking into beads that sprint ahead and rejoin, an overhead spotlight reflecting in every moving droplet, dark background.',
  'Hg/inside-old-thermometers':
    'Extreme close-up of a vintage glass thermometer with a bright silver mercury column, a small candle flame warming the bulb at the bottom while the mercury climbs smoothly up the fine capillary past plain engraved tick marks with no numerals, the glass glinting, dark background.',
  'Hg/water-silver':
    'Slow motion of liquid mercury pouring from a laboratory flask into a white porcelain dish, the stream a solid rope of liquid silver that folds and splashes without wetting the dish, settling into a trembling mirror pool that reflects the overhead lamp, dark background.',
  'Na/table-salt':
    'Extreme close-up time-lapse of sodium chloride crystals growing from a drop of evaporating brine on dark glass: perfect transparent cubes nucleating and expanding edge by edge, stacking into glittering cubic clusters, light refracting through their faces, dark background.',
  'Na/streetlight-glow':
    'A sodium vapor streetlamp warming up at dusk on a foggy empty road: the lamp flickers on with a faint red-pink glow and slowly brightens into the deep amber-orange of sodium light, the fog around it turning gold and wet asphalt reflecting the color, static low-angle camera.',
  'Na/nerve-signals':
    'Microscopic scientific visualization inside a neuron: a long pale axon stretching into darkness, and a bright electric pulse racing along it, sodium ions shown as swarms of tiny glowing golden particles rushing through channels in the membrane as the signal passes, volumetric light, dark background.',
};

// Portrait shorts (9:16). Compose for a phone held upright: the subject fills the
// frame top to bottom. Captions come from the research factoids.
Object.assign(CLIP_PROMPTS, {
  'Au/made-of-stardust':
    'Vertical framing. Deep space: two neutron stars spiral into each other at terrifying speed and collide in a blinding kilonova flash, a vast cloud of incandescent debris blooming upward through the frame, and within it countless flecks of newly forged gold cooling from white to warm yellow and drifting toward the camera, stars beyond.',
  'Au/thinner-than-light':
    'Vertical close-up of a sheet of beaten gold leaf, impossibly thin, suspended against a brilliant white light so the light shines through the metal with a soft blue-green glow, the leaf rippling and trembling like silk in a faint breath of air, its edges fluttering, tiny gold flakes drifting, dark background.',
  'Au/egyptian-gold':
    'Vertical shot inside a dark Egyptian tomb as torchlight sweeps slowly across a gold funerary mask, its surface flawless and mirror-bright, warm light sliding over untouched gold while the carved stone walls around it are cracked and dusty, dust motes drifting in the beam.',
  'Au/ocean-of-gold':
    'Vertical underwater shot in a sunlit tropical ocean, shafts of light piercing clear blue water from above, countless microscopic glittering flecks of gold drifting through the water column like golden plankton, the camera slowly rising toward the shimmering surface.',
  'H/fuel-of-the-stars':
    'Vertical extreme telephoto view of the surface of the Sun filling the frame: a roiling ocean of golden-orange plasma granules boiling and churning, an immense prominence of glowing hydrogen plasma towering upward through the frame and curling back along invisible magnetic field lines, deep black space above.',
  'H/water-maker':
    'Vertical close-up of a small pale-blue hydrogen flame burning beneath a cold clear glass dome; as the flame burns, fog forms on the inside of the glass and gathers into clear water droplets that swell, catch the light and run down the glass, the only thing the flame produces being water, dark background.',
  'H/invisible-flame':
    'Vertical shot of an industrial steel hydrogen vent pipe in dim light with no visible flame, only a shimmering column of heat haze rising above it; the head of a straw broom on a long handle extends slowly into that empty-looking air and its bristles burst into bright orange flame, revealing the invisible fire, embers drifting upward.',
  'H/rocket-fuel-short':
    'Vertical night launch close-up of a rocket engine burning liquid hydrogen: the nozzle erupting with a nearly invisible pale-blue flame rimmed by heat haze, frost and vapor sheeting off the cryogenic tank walls above it, billowing white steam clouds rolling across the pad as the rocket begins to rise, camera low, looking up.',
  'Hg/cannonball-floats':
    'Vertical slow motion: a heavy black iron cannonball dropped into a deep pool of liquid mercury, the mirror surface bulging and splashing upward in slow silver waves as the cannonball bobs and settles, floating on top of the liquid metal, reflections rippling across the pool, dark background.',
  'Hg/quicksilver-alive':
    'Vertical shot of a sheet of black glass tilted toward the camera, and beads of quicksilver racing down it in slow motion, impossibly fast and bright, splitting into smaller droplets that sprint ahead and snap back together as if alive, an overhead spotlight reflected in every moving droplet, dark background.',
  'Hg/liquid-metal-mirror':
    'Vertical close-up of liquid mercury pouring from a glass vial held in a laboratory clamp onto a dark slate surface below, flowing like water but mirror-bright, spreading into a trembling silver pool that reflects the overhead light and the vial above it, slow motion, dark background.',
  'Na/soft-then-explosive':
    'Vertical shot: a dull silvery block of sodium metal on a dark bench is sliced by a knife blade lowering into frame, cutting it like cold cheese to reveal a bright silver interior that tarnishes within seconds; the slice drops into a glass bowl of water below and skitters, hisses and erupts into a bright yellow-orange flame with a sharp pop, water splashing, dark background.',
  'Na/ocean-of-salt':
    'Vertical aerial shot rising over an endless white salt flat under a hard blue sky, the crystalline crust cracked into hexagonal plates stretching to the horizon, and in the distance the upper floors of city skyscrapers poking out of the salt as if the whole city were buried in it, heat shimmer, slow upward drift.',
  'Na/streetlight-glow-short':
    'Vertical shot of a tall sodium vapor streetlamp warming up at dusk on a foggy empty road: the lamp flickers on with a faint red-pink glow at the top of the frame and slowly brightens into the deep amber-orange of sodium light, the fog around it turning gold and the wet asphalt below reflecting the color, static low-angle camera.',
});
