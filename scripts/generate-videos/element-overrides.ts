export interface ElementOverride {
  // Full video prompt (if provided, used instead of category template)
  videoPrompt?: string;
  // Set to true if research recommends skipping video for this element
  skipVideo?: boolean;
  // Legacy fields kept for backward compat
  flameColor?: string;
  glowColor?: string;
  propertyAction?: string;
  transitionAction?: string;
  reactionDescription?: string;
  volatilityDescription?: string;
  lanthanideProperty?: string;
  actinideProperty?: string;
}

// Maps atomicNumber → per-element override data for prompt building.
// Research-based prompts from scripts/generate-videos/research/.
// Already-done elements (10, 11, 35, 79, 92) retain their original overrides.
export const elementOverrides: Record<number, ElementOverride> = {
  1: {
    // Hydrogen
    videoPrompt:
      'Extreme close-up slow-motion of a cluster of shimmering soap bubbles floating upward, each filled with hydrogen gas. A small flame touches the first bubble and it erupts into a brilliant expanding fireball, the shockwave popping neighboring bubbles which each ignite in rapid chain-reaction succession. The fireballs bloom outward as perfect orange-white spheres of flame, each ten times the volume of the original bubble, with wisps of steam curling away. The soap film fragments scatter as glowing embers. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  2: {
    // Helium
    videoPrompt:
      'Extreme close-up of a small glass beaker filled with crystal-clear liquid helium cooled below 2 Kelvin. The superfluid begins creeping up the inside walls of the glass as a thin, glistening film, silently climbing over the rim and flowing down the outside of the beaker in defiance of gravity. Droplets form at the bottom of the beaker and drip steadily downward like an impossible inverted fountain. The liquid surface inside is perfectly still — zero viscosity, zero turbulence. Faint condensation fog curls around the ultra-cold glass. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  3: {
    // Lithium
    videoPrompt:
      'Extreme close-up slow-motion of a small silvery chunk of lithium metal being dropped into a glass dish of water. On contact, the metal hisses and fizzes, releasing streams of tiny hydrogen bubbles. The lithium piece dances across the water surface, gradually shrinking as it reacts. The escaping hydrogen ignites with a stunning deep crimson-red flame that flickers and pulses above the water, casting rich red reflections across the rippling surface. Wisps of white vapor rise from the hot reaction zone as the metal slowly dissolves. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  4: { skipVideo: true }, // Beryllium
  5: {
    // Boron
    videoPrompt:
      'Extreme close-up of a small pile of dark amorphous boron powder on a ceramic dish. A flame touches the powder and it ignites, erupting into a spectacular brilliant green fire. The vivid emerald-green flames dance and flicker intensely, casting bright green light across the scene. Sparks of glowing green shoot upward from the burning pile. The flames shift between deep forest green and bright electric green as different portions of the powder combust. Wisps of white smoke curl upward through the green glow. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  6: {
    // Carbon
    videoPrompt:
      'Extreme close-up of a small rough diamond held in metal tongs, glowing bright cherry-red after being heated by a torch. The incandescent diamond is lowered into a glass flask of pure liquid oxygen. On contact, the diamond erupts into a dazzling, blindingly bright white-hot combustion, burning with fierce intensity like a tiny star. The diamond shrinks visibly as pure carbon combines with oxygen, releasing brilliant white sparks and an intense glow that illuminates the entire flask. The liquid oxygen bubbles and churns around the burning gem. The diamond slowly vanishes, consumed entirely by the reaction. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  7: {
    // Nitrogen
    videoPrompt:
      'Extreme close-up of liquid nitrogen being poured from a silvery Dewar flask into a glass bowl of warm water. On contact, the liquid nitrogen flash-boils violently, erupting into a massive roiling cascade of thick white fog that billows upward and spills over the edges of the bowl in dramatic slow-motion. The water churns and bubbles furiously as the ultra-cold liquid dances across its surface on a cushion of vapor. Dense clouds of white condensation fog roll and tumble in turbulent swirls, expanding outward like a miniature thunderstorm. The fog pours over the rim and cascades downward like a frozen waterfall. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  8: {
    // Oxygen
    videoPrompt:
      'Extreme close-up of a stream of pale, translucent blue liquid oxygen being slowly poured from a small Dewar flask between the poles of a large horseshoe magnet. As the liquid passes between the magnet poles, it defies gravity — caught and suspended in mid-air by the magnetic field, forming a shimmering blue bridge of liquid hanging impossibly between the silvery metal poles. The trapped liquid oxygen glows with a delicate sky-blue color, wobbling and rippling slightly. Wisps of cold condensation fog curl around the suspended liquid. More liquid is added and the blue pool grows, held aloft by invisible magnetic force. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  9: {
    // Fluorine
    videoPrompt:
      'Extreme close-up of a tuft of fine steel wool sitting inside a glass reaction vessel. A stream of pale yellow-green fluorine gas flows in from a valve, filling the chamber with a faint sickly yellow haze. The instant the gas contacts the steel wool, it erupts into violent, brilliant white-hot combustion — fierce orange-white sparks and flames explode outward from the iron fibers as they burn furiously in the fluorine atmosphere. Glowing embers of iron fluoride spray in all directions as the steel wool is consumed at terrifying speed. The pale yellow gas continues flowing as the metal disintegrates into a shower of white-hot sparks and ash. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  10: { glowColor: 'red-orange' }, // Neon
  11: { flameColor: 'bright yellow-orange' }, // Sodium
  12: {
    // Magnesium
    videoPrompt:
      'Extreme close-up slow-motion of a strip of silvery magnesium ribbon being ignited from one end. The flame starts as a flickering red-orange, then erupts into an intensely brilliant white-hot blaze that consumes the ribbon, radiating dazzling white light in all directions. Tiny white-hot sparks and glowing fragments of magnesium oxide drift away from the burning tip. The ribbon curls and crumbles into delicate white ash as the blazing white flame creeps steadily along its length, illuminating swirling wisps of white smoke. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  13: {
    // Aluminium
    videoPrompt:
      'Extreme close-up of a red-hot ceramic crucible tilting slowly, pouring a stream of molten aluminum — a shimmering silvery liquid glowing faintly orange from the heat. The molten metal cascades in a smooth, mirror-like stream into a graphite mold below, splashing slightly on impact and sending tiny bright sparks upward. The surface of the liquid metal ripples and reflects light like mercury, with a faint orange-red glow from the 660-degree heat. Wisps of heat shimmer rise from the surface as the metal begins to solidify at the edges, transitioning from glowing liquid to solid silver. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  14: {
    // Silicon
    videoPrompt:
      'Extreme close-up of the Czochralski crystal-growing process: a perfectly cylindrical ingot of pure silicon crystal is being slowly pulled upward from a crucible of molten silicon glowing bright orange-white. The solid crystal emerges with a dark blue-grey metallic luster, mirror-smooth and flawless, rotating slowly as it rises. Below it, the molten silicon surface glows intensely like liquid fire, and at the interface where solid meets liquid, a brilliant ring of light marks the crystallization front. The contrast between the glowing orange melt and the cool dark metallic crystal above is stunning. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  15: {
    // Phosphorus
    videoPrompt:
      'Extreme close-up in a dark room of a small translucent waxy chunk of white phosphorus sitting on a ceramic dish. The phosphorus emits an ethereal, ghostly green-blue glow as it slowly oxidizes in air — faint wisps of white smoke curl upward from its surface. Suddenly the phosphorus self-ignites, erupting into a brilliant intense white-orange flame with dense billowing clouds of white phosphorus pentoxide smoke swirling dramatically upward. The flame is fierce and hungry, consuming the waxy solid rapidly while casting sharp dancing shadows. The white smoke fills the frame like a miniature storm cloud. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  16: {
    // Sulfur
    videoPrompt:
      'Extreme close-up of bright yellow sulfur crystals being heated in a glass flask. The crystals melt into a thin, clear golden-amber liquid that flows like water. As the temperature climbs, the liquid transforms — deepening from golden yellow to rich orange, then to a dramatic dark blood-red as it thickens into a viscous, syrupy mass. Then the sulfur ignites, and a stunning electric blue flame dances across the surface of the dark red liquid, casting an otherworldly blue glow across the glass flask. Wisps of pale smoke curl upward as the vivid blue fire flickers and pulses hypnotically against the deep crimson molten sulfur beneath it. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  17: {
    // Chlorine
    videoPrompt:
      'Extreme close-up of a large round glass flask filled with dense, swirling greenish-yellow chlorine gas — the gas is thick enough to see distinct layers and currents of vivid yellow-green color. A tuft of fine steel wool is lowered slowly into the flask on a wire. The moment it enters the chlorine, the steel wool begins to glow bright orange-red and erupts into a shower of brilliant orange sparks, burning vigorously without any flame. Voluminous clouds of reddish-brown iron chloride smoke billow and swirl inside the flask, mixing dramatically with the yellow-green chlorine gas, creating turbulent swirling patterns of contrasting colors — green-yellow and rusty brown. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  18: {
    // Argon
    videoPrompt:
      'Extreme close-up of a glass discharge tube in a pitch-dark room. Electricity suddenly surges through the argon gas inside, and the tube erupts with a rich, intense blue-purple glow that illuminates the entire frame. The light pulses and flickers with subtle variations in intensity, casting a cool violet-blue wash across the glass surfaces. The glow is deep and saturated — a vivid lavender-blue that is distinctly different from neon\'s red-orange. Tiny bright spots of plasma shimmer and dance inside the tube where the gas ionizes most intensely. The blue-purple light reflects off the glass walls creating ethereal halos and soft glowing edges. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  19: {
    // Potassium
    videoPrompt:
      'Extreme close-up slow-motion of a soft, silvery chunk of potassium metal being dropped into a glass dish of water. The instant it touches the surface, it ignites spontaneously, skittering and spinning wildly across the water with a brilliant lilac-violet flame. Hydrogen gas hisses and bubbles furiously around the metal as it dances, throwing off violet sparks. The water churns and splashes from the violent exothermic reaction. The potassium shrinks rapidly as it\'s consumed, the violet flame reflecting off the turbulent water surface. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  20: {
    // Calcium
    videoPrompt:
      'Extreme close-up of a shiny silvery piece of calcium metal placed into a clear glass beaker of water. Tiny bubbles of hydrogen gas immediately begin forming on the metal\'s surface, growing into a steady stream of rising bubbles. The crystal-clear water gradually turns cloudy and milky white as calcium hydroxide forms, creating swirling white clouds that billow outward from the reacting metal. The bubbling intensifies, with streams of gas percolating upward through the increasingly opaque white liquid. Wisps of white precipitate drift and curl through the water like underwater smoke. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  21: { skipVideo: true }, // Scandium
  22: {
    // Titanium
    videoPrompt:
      'Extreme close-up of a titanium metal rod being pressed against a spinning grinding wheel in a dark workshop. An explosive shower of blindingly brilliant white sparks erupts from the contact point, spraying outward in a wide, dazzling fan. The sparks are intensely white and bright, distinctly different from the orange sparks of steel, bursting and branching as they fly through the air. The grinding wheel spins rapidly, sending continuous streams of white-hot titanium particles cascading through the darkness like a fountain of tiny stars. Sparks bounce and ricochet off surfaces, each one burning with pure white intensity. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  23: {
    // Vanadium
    videoPrompt:
      'Extreme close-up of four glass laboratory flasks arranged in a row, each containing a different brilliantly colored vanadium solution. From left to right: vivid yellow (+5), rich sky blue (+4), deep emerald green (+3), and striking lavender-purple (+2). The camera slowly tracks across them as light passes through each solution, making the colors glow intensely and cast colored light onto the white surface below. The liquids gently swirl and shimmer, their saturated jewel-tone colors gleaming under the light. Each flask radiates its own brilliant hue — a complete rainbow from a single element in different oxidation states. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  24: {
    // Chromium
    videoPrompt:
      'Extreme close-up of a perfectly polished block of pure chromium metal with a flawless mirror finish. The surface reflects everything around it with razor-sharp clarity, acting as a perfect metallic mirror. The camera slowly moves, causing reflections to glide and shift across the chrome surface like liquid silver. Brilliant points of light dance and streak across the mirror-perfect metal. The chromium gleams with a cool, bluish-silver tone, its surface so perfectly reflective it seems almost liquid. Subtle prismatic light refractions catch at the edges where the chrome meets shadow. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  25: {
    // Manganese
    videoPrompt:
      'Extreme close-up of dark purplish-black crystals of potassium permanganate being dropped into a glass beaker of perfectly clear water. The instant the crystals touch the water, intense deep purple-violet tendrils begin streaming downward like ink, swirling and curling in mesmerizing fluid dynamics. The saturated purple color is so vivid it seems to glow. The tendrils spiral and bloom outward, creating fractal-like patterns as they diffuse through the water. More crystals dissolve, intensifying the rich violet color until the entire solution becomes a deep, jewel-like purple. The purple streams catch the light, creating an otherworldly, hypnotic display. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  26: {
    // Iron
    videoPrompt:
      'Extreme close-up of a bundle of fine steel wool suspended in a glass jar filled with pure oxygen. A single spark ignites it and the iron erupts into a dazzling cascade of combustion — brilliant orange and white sparks showering downward like a miniature fireworks display. The steel wool glows intensely, shifting from deep red to blinding orange-white as the iron burns furiously in the oxygen-rich atmosphere. Molten droplets of iron oxide rain down in bright streaks, each one a tiny meteor trailing light. The combustion races through the steel wool, consuming it in a spectacular chain reaction of heat and light, the sparks reflecting off the glass walls. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  27: {
    // Cobalt
    videoPrompt:
      'Extreme close-up of molten cobalt-blue glass on the end of a glassblowing rod, glowing with an intense deep blue color that seems to radiate from within. The molten glass slowly rotates, its surface shimmering with a rich sapphire-blue hue that catches and refracts light. As it turns, the deep blue color shifts between navy and brilliant azure depending on the thickness of the glass. The molten material has a viscous, honey-like quality, stretching and flowing slowly while maintaining its extraordinary blue saturation. Tiny bubbles rise through the blue glass, catching light like miniature sapphire gems. The blue is so deep and vivid it seems almost electric. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  28: {
    // Nickel
    videoPrompt:
      'Extreme close-up of a highly polished nickel metal sphere with a warm silvery-gold luster resting on a dark glass surface. A powerful neodymium magnet slowly approaches from above. Suddenly the nickel sphere snaps upward and locks onto the magnet with a satisfying click, defying gravity. The camera captures the sphere hanging suspended from the magnet, rotating slowly to reveal its beautiful warm-toned metallic surface. More polished nickel spheres are brought near and they leap from the surface one by one, chaining together beneath the magnet in a cascading magnetic attraction. The warm golden-silver sheen of the nickel catches the light as the spheres swing gently. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  29: {
    // Copper
    videoPrompt:
      'Extreme close-up of a coiled copper wire being held in the flame of a Bunsen burner. The copper\'s distinctive warm rose-gold surface begins to glow red, then the flame erupts into a spectacular vivid green-blue color. The brilliant emerald-green flames lick and dance around the copper, producing an intense, saturated green light that illuminates everything nearby. The copper glows orange-red at the point of contact while the surrounding flame blazes bright green, creating a stunning contrast of complementary colors. Green sparks and wisps of emerald-colored fire swirl upward. The copper surface shifts from its natural warm pink-orange to iridescent blue-purple oxidation colors. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  30: {
    // Zinc
    videoPrompt:
      'Extreme close-up of granulated zinc metal pieces being dropped into a glass beaker of hydrochloric acid. The instant the silvery-gray zinc hits the liquid, a violent eruption of tiny hydrogen gas bubbles begins, fizzing and roaring furiously from the metal\'s surface. The bubbling is intense and relentless — a churning mass of bubbles streaming upward through the clear liquid like a miniature underwater volcano. The zinc pieces visibly dissolve and shrink as they react, their surfaces alive with effervescence. Steam and gas rise from the roiling surface. The bubbles catch the light as they rise, creating a shimmering curtain of ascending spheres. The reaction accelerates as heat builds, the solution churning ever more vigorously. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  31: {
    // Gallium
    videoPrompt:
      'Extreme close-up of a shiny, silvery chunk of solid gallium metal resting in the palm of a hand. The warmth of the skin begins to melt the metal — its edges soften and become glossy, liquid metal slowly pooling and spreading like mercury. The solid gradually collapses into a brilliant, mirror-like liquid puddle that reflects everything around it. The transformation from rigid solid to flowing liquid happens in real time, the gallium slumping and liquefying as body heat alone is enough to trigger the phase change. The liquid gallium shimmers with a bright metallic luster, pooling in the creases of the palm. Droplets of liquid metal catch the light like tiny mirrors. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  32: {
    // Germanium
    videoPrompt:
      'Extreme close-up of a large, polished germanium crystal with a stunning dark grayish-silver metallic luster, almost like a dark mirror. The crystal has a diamond-like crystalline structure visible at its faceted edges. The camera slowly rotates around the crystal, catching brilliant reflections that shimmer across its surface — the germanium appears almost black in some angles and brilliantly reflective in others. Light plays across its hard, glass-like surface revealing an otherworldly, semi-metallic beauty. Alongside it, a polished germanium lens sits transparent to infrared light, glowing subtly warm from within when viewed from the right angle. The crystal structure catches geometric patterns of light. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  33: {
    // Arsenic
    videoPrompt:
      'Extreme close-up of crystalline gray metallic arsenic inside a sealed glass tube being gently heated from below. The hard, brittle, silver-gray crystals begin to transform directly into a swirling yellowish vapor without ever becoming liquid — sublimating straight from solid to gas. The pale yellow-white fumes rise and swirl inside the glass tube in ghostly, ethereal tendrils. As the vapor contacts the cooler upper portion of the tube, it re-deposits as a thin film of shiny gray crystalline arsenic on the glass walls, creating a dark metallic mirror coating. The cycle of sublimation and deposition creates a dramatic visual of matter shifting between states inside the sealed vessel. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  34: {
    // Selenium
    videoPrompt:
      'Extreme close-up of a mound of vivid brick-red amorphous selenium powder in a glass dish being slowly heated. The brilliant red powder begins to darken, shifting from bright scarlet-red to deep crimson, then to a rich blood-red as the temperature climbs. As it softens at 50°C, the powder melts into a dark red viscous liquid. With continued heating the liquid darkens further, transforming through deep ruby to black as it reaches 180°C and converts to the gray metallic form. The final gray selenium has a lustrous metallic sheen, completely transformed from the original vivid red powder. The dramatic color journey from bright red through every shade to metallic gray unfolds in a mesmerizing continuous transformation. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  35: {
    // Bromine
    volatilityDescription:
      'A glass vial of deep reddish-brown liquid Bromine (Br) is uncorked and thick, ominous red-brown vapor billows upward aggressively, filling the space with dense swirling toxic-looking clouds that catch the light dramatically',
  },
  36: {
    // Krypton
    videoPrompt:
      'Extreme close-up of a glass discharge tube in a dark room, filled with pure krypton gas. Electricity surges through the tube and it erupts with a haunting, brilliant greenish-white glow. The light is otherworldly — a spectral pale green-white with subtle lavender undertones, distinctly different from neon\'s warm red-orange. The gas inside shimmers and pulses as the electrical discharge ionizes the krypton atoms, producing sharp spectral lines of green and yellow light. The glass tube radiates this eerie, ghostly luminescence, casting pale green-white light across nearby surfaces. The glow is steady and intense, with subtle flickering at the electrodes where the discharge originates. The ethereal light fills the darkness like something from another world. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  37: {
    // Rubidium
    videoPrompt:
      'Extreme close-up slow-motion of a small silvery chunk of Rubidium metal dropping into a glass dish of water. Unlike sodium which floats, the dense rubidium immediately sinks beneath the surface and reacts with terrifying violence — a massive eruption of bubbling hydrogen gas, reddish-purple flames bursting through the water\'s surface, sparks flying outward, water splashing violently in all directions. The reaction is instantaneous and explosive, far more violent than sodium or potassium. Clouds of white vapor billow upward as the metal is consumed in a furious underwater inferno. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  38: {
    // Strontium
    videoPrompt:
      'Extreme close-up of a piece of strontium metal igniting and burning with an intensely brilliant, deep crimson-red flame inside a glass crucible. The flame is a saturated, unmistakable scarlet red — far brighter and more vivid than any ordinary fire. Tiny red sparks and embers scatter outward as the metal is consumed. The crimson light illuminates swirling wisps of white smoke that curl upward. The red glow reflects off the glass walls of the crucible, bathing everything in rich scarlet light. The flame dances and pulses with fierce intensity. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  39: {
    // Yttrium
    videoPrompt:
      'Extreme close-up of fine silvery yttrium metal turnings and shavings piled on a ceramic dish. A spark ignites them and they erupt into a brilliant, blinding white-hot fire — burning with a fierce, almost unbearable intensity. The white flames consume the metal turnings rapidly, glowing like tiny stars. Bright white sparks shoot upward and outward, trailing streaks of light. Wisps of white smoke rise from the pile as the yttrium oxide ash forms. The intense white glow illuminates the entire scene with harsh, pure white light that overwhelms the darkness. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  40: {
    // Zirconium
    videoPrompt:
      'Extreme close-up of zirconium powder being sprinkled into a flame, where each particle ignites instantly and burns with a dazzling, blindingly bright white flash — the hottest metal flame on Earth at 4660 degrees Celsius. Brilliant white sparks cascade downward and outward like a miniature fireworks fountain, each spark burning with an intense, pure white-hot glow. The shower of sparks trails long white streaks through the darkness. More powder feeds the reaction, creating a continuous waterfall of white-hot burning particles, each one a tiny sun. The scene pulses with searing white energy. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  41: {
    // Niobium
    videoPrompt:
      'Extreme close-up of a polished grey niobium metal disc submerged in electrolyte solution. As voltage is applied, the surface begins to transform — sweeping across the metal like a wave, the color shifts from brown to gold, then deep purple, then vivid blue, then bright teal, and finally brilliant green. The color change ripples across the surface in real time, creating a mesmerizing rainbow gradient. Light refracts off the thin oxide film, producing iridescent interference patterns. The metal gleams with saturated, jewel-like hues that seem impossible for a simple grey metal. Tiny bubbles rise from the surface as the electrochemistry works its magic. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  42: {
    // Molybdenum
    videoPrompt:
      'Extreme close-up of a thick molybdenum metal rod being heated in a vacuum chamber. As the temperature climbs, the rod begins to glow — first a deep cherry red, then bright orange, then an intense yellow-white as it approaches its extraordinary melting point of 2623 degrees Celsius. The rod radiates searing light like a miniature sun, heat waves shimmering around it. The surface remains perfectly solid and smooth even at white-hot temperatures where most metals would have long since melted into puddles. The brilliant incandescent glow illuminates the vacuum chamber walls with warm orange light. The rod pulses with barely contained thermal energy. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  43: {
    // Technetium
    videoPrompt:
      'Extreme close-up of a small, sealed glass ampoule containing a thin piece of silvery-metallic technetium with a platinum-like luster. In time-lapse, a dark oxide tarnish slowly creeps across the pristine metallic surface like an encroaching shadow — transforming the brilliant silver into a mottled, darkening grey-black. The tarnish spreads organically in fractal-like patterns across the metal. A faint, eerie Cherenkov-blue shimmer hints at the invisible radioactivity within. The sealed ampoule sits in dramatic isolation, a tiny prison for the lightest radioactive element — every single atom of it unstable and decaying. Wisps of condensation form on the cool glass. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  44: {
    // Ruthenium
    videoPrompt:
      'Extreme close-up of a polished piece of hard, silvery-white ruthenium metal sitting on a ceramic plate inside a small furnace. As the temperature rises past 800 degrees Celsius, the pristine metallic surface begins to darken and transform — a deep black ruthenium dioxide coating creeps across the surface like ink spreading on paper. The once mirror-bright metal gradually turns matte black as oxygen attacks at high temperature. Faint heat distortion shimmers above the surface. The transformation from brilliant silver-white to deep, light-absorbing black is stark and dramatic — the metal consuming its own shine. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  45: {
    // Rhodium
    videoPrompt:
      'Extreme close-up of a tiny crucible of molten rhodium glowing intensely white-hot at over 1960 degrees Celsius. The blindingly bright liquid metal is carefully poured into a small mold, flowing like liquid mirror. As it cools, the surface transitions from a searing white-orange glow to a warm amber, then to a cool silvery-white with an impossibly perfect mirror finish. The solidified rhodium reflects its surroundings with 80 percent reflectivity — sharper and brighter than silver, with no hint of tarnish or dulling. The mirror-like surface catches and bends light, creating brilliant highlights and reflections. The world\'s most expensive precious metal, gleaming with an almost supernatural brightness. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  46: {
    // Palladium
    videoPrompt:
      'Extreme close-up of a thin, polished palladium metal foil inside a sealed glass chamber. As hydrogen gas is introduced, the silvery metal begins to visibly absorb the invisible gas like a metallic sponge — the foil subtly swells, expands, and warps as it soaks up hundreds of times its own volume of hydrogen into its crystal lattice. The surface shimmers and shifts as the internal structure transforms. Then, as the hydrogen is released, the foil slowly contracts back, and wisps of vapor form on its surface as released hydrogen meets oxygen in the air, creating tiny patches of condensation and faint warmth. The metal breathes the gas in and out like a living thing. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  47: {
    // Silver
    videoPrompt:
      'Extreme close-up of a graphite crucible filled with molten silver heated to over 960 degrees Celsius — the liquid metal glows with an intense, warm orange-white radiance. The molten silver is poured in a smooth, heavy stream into a mold, flowing like liquid mercury but glowing with fierce heat. The stream catches the light with impossibly perfect reflections — a river of liquid mirror. As it fills the mold and begins to cool, the surface transitions from glowing orange to warm gold, then to the iconic brilliant white-silver with the highest reflectivity of any element. The cooling surface develops a flawless mirror finish that reflects the world around it with crystal clarity. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  48: {
    // Cadmium
    videoPrompt:
      'Extreme close-up of silvery-white cadmium metal with a distinctive bluish tint sitting in a ceramic crucible. As heat is applied, the soft metal quickly melts into a shimmering liquid pool at just 321 degrees Celsius. The temperature continues to rise, and thick, deep yellow vapor begins to billow upward from the molten surface — cadmium\'s distinctive monatomic vapor, intensely colored like liquid sunshine turned to gas. The heavy yellow clouds swirl and curl ominously in the air above the crucible, dense and vivid against the dark background. The contrast between the bluish-silver liquid and the rich yellow vapor is striking and otherworldly. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  49: {
    // Indium
    videoPrompt:
      'Extreme close-up of a silvery-white bar of indium metal being slowly bent by gloved hands. The incredibly soft metal yields and deforms like metallic putty, bending far more easily than any typical metal. As it bends, the surface crinkles and wrinkles, and you can almost hear the eerie high-pitched crackling "cry" — caused by crystal planes snapping and reorganizing inside the metal. The bar is then pressed against a glass surface, leaving a visible metallic streak like a silver pencil mark. Finally, the indium is placed on a warm hotplate at just 157 degrees Celsius, where it quickly melts into a shimmering pool of liquid metal that clings to and wets the glass surface beneath it. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  50: {
    // Tin
    videoPrompt:
      'Extreme close-up time-lapse of a polished, shiny piece of white tin metal in a freezing cold environment. Small grey spots begin to appear on the pristine silvery surface — the first signs of "tin pest." The grey patches spread outward like a slow-motion infection, each spot catalyzing more spots around it. The smooth, metallic surface progressively crumbles and disintegrates as the crystal structure transforms, expanding by 27 percent and destroying itself from within. The once solid, shiny metal slowly collapses into a pile of dull grey powder — consumed entirely by its own allotropic transformation. The disintegration accelerates as it progresses, the metal seeming to eat itself alive. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  51: {
    // Antimony
    videoPrompt:
      'Extreme close-up of a beautiful chunk of antimony metal with a lustrous, silvery-blue surface and distinctive star-shaped crystalline patterns. A small hammer strikes the metal and it shatters explosively like glass — fragments flying outward, revealing glittering, flaky crystalline layers inside. The shattered pieces scatter across the dark surface, each fragment showing the characteristic layered, plate-like crystal structure that makes antimony more brittle than glass. The broken surfaces catch the light with a silvery-blue metallic sheen. The brittle destruction of what appears to be a solid metal is shocking and counterintuitive — metals are not supposed to shatter like porcelain. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  52: {
    // Tellurium
    videoPrompt:
      'Extreme close-up of a chunk of crystalline tellurium with a striking silvery-white metallic luster, sitting on a ceramic plate. A flame is applied and the brittle metalloid begins to burn with a distinctive, vivid blue-green flame that flickers and dances. White smoke of tellurium dioxide billows upward from the burning surface in thick, swirling plumes. The blue-green fire reflects off the crystalline facets of the remaining tellurium, creating an otherworldly glow. The brittle crystal structure causes small pieces to crack and pop off as the heat penetrates, each fragment igniting with its own tiny blue-green flame. The contrast between the metallic silver crystal and the alien blue-green fire is mesmerizing. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  53: {
    // Iodine
    videoPrompt:
      'Extreme close-up of dark, lustrous, almost black iodine crystals with a faint purple-metallic sheen sitting in a round glass flask. Gentle heat is applied from below and the crystals begin to sublimate — transforming directly from solid to gas without ever becoming liquid. Rich, deep purple-violet vapor rises from the crystals and fills the flask like smoke from a wizard\'s cauldron. The heavy purple gas swirls and billows in thick, luxurious clouds, the vivid violet color intensifying as more vapor accumulates. At the top of the flask, a cold glass surface causes the vapor to re-crystallize into beautiful, glittering purple-black crystals that grow and branch in intricate patterns. The entire flask glows with an ethereal violet light. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  54: {
    // Xenon
    videoPrompt:
      'Extreme close-up of a sealed glass discharge tube filled with invisible xenon gas in a dark room. Electricity is applied and the tube erupts with a brilliant, intense blue-lavender glow — the xenon gas ionizes into a shimmering plasma that fills the entire tube with ethereal light. The blue glow pulses and flickers with electric energy, casting cool blue-violet light across the glass walls. Tiny plasma filaments and arcs dance within the tube, creating mesmerizing patterns of ionized gas. The light is cold and alien, unlike any flame or incandescent glow — pure electron excitation energy converted directly to photons of blue-white light. The discharge tube hums with contained electrical power, the xenon plasma shimmering like captured lightning. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  55: {
    // Caesium
    videoPrompt:
      'Extreme close-up slow-motion of a small golden chunk of Cesium metal sealed in a glass ampoule being cracked open and dropped into a glass dish of water. The instant it touches the surface, a massive violent explosion erupts — brilliant white-hot flashes, shockwaves rippling through the water, steam billowing upward, and fragments of molten metal scattering like tiny fireworks. The water splashes outward in a dramatic crown shape as hydrogen gas ignites with pale pink-white flames. The most reactive metal meeting water in spectacular fashion. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  56: {
    // Barium
    videoPrompt:
      'Extreme close-up of a Bunsen burner flame in a dark laboratory as a wire loop dipped in barium chloride is brought into the flame. The entire flame transforms into a stunning, vivid emerald green — bright and saturated, illuminating the surrounding glassware with an eerie green glow. The green fire dances and flickers, casting dramatic green light across the scene. The flame pulses with intensity as more barium compound is introduced, producing a brilliant green fireball. This is the element that makes green fireworks possible. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  57: {
    // Lanthanum
    videoPrompt:
      'Extreme close-up of fine silvery-white lanthanum metal filings being sprinkled from above into open air in a dark laboratory. The tiny metal particles ignite spontaneously mid-fall, each one bursting into a brilliant white-hot spark, creating a shower of miniature fireworks cascading downward like a metallic waterfall of light. The sparks trail bright white streaks through the darkness as the pyrophoric metal oxidizes instantly on contact with oxygen. A continuous stream of glittering, self-igniting metal rain. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  58: {
    // Cerium
    videoPrompt:
      'Extreme close-up slow-motion of a steel striker scraping along a ferrocerium rod in a dark room. An explosive shower of brilliant white-hot sparks erupts from the contact point, each spark reaching temperatures of 3000 degrees Celsius, trailing bright orange-white streaks through the darkness. The sparks fan outward in a dramatic arc, some bouncing and splitting into smaller fragments on impact. The cerium-rich alloy sheds incandescent particles that glow intensely as they oxidize mid-flight. A cascade of thousands of tiny burning metal fragments lighting up the darkness. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  59: {
    // Praseodymium
    videoPrompt:
      'Time-lapse extreme close-up of a freshly cut, bright silvery praseodymium metal surface exposed to air. Over seconds, a vivid green oxide layer begins creeping across the metallic surface like emerald frost spreading on a window. The green crust grows thicker and more textured, spalling and flaking to reveal fresh metal beneath that immediately begins greening again. The oxide layer has a rich, saturated green-yellow color — nature painting the metal in real time. Tiny flakes of green oxide curl and peel away as new layers form beneath. A metal that rusts green instead of orange. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  60: {
    // Neodymium
    videoPrompt:
      'Extreme close-up slow-motion of two large, shiny silver neodymium magnets being released from opposite sides with a red apple placed between them. The magnets accelerate toward each other with terrifying speed, slamming together with explosive force — the apple is instantly crushed and obliterated, juice and fragments spraying outward in a dramatic starburst pattern. The sheer magnetic force is visible in the violence of the collision. Droplets of apple juice hang suspended in the slow-motion capture as shattered fragments scatter in every direction. The world\'s most powerful permanent magnets demonstrating their incredible attractive force. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  61: {
    // Promethium
    videoPrompt:
      'Extreme close-up of a small sealed glass vial containing promethium salt crystals sitting on a dark surface. The room is pitch black, but the crystals emit an eerie, ghostly pale blue-green glow entirely from their own radioactive decay — no external light source needed. The soft luminescence pulses gently, casting faint blue-green light onto the glass walls of the vial. The glow is ethereal and otherworldly, like a tiny captured piece of radioactive starlight. A self-luminous element that has been glowing since the moment it was created, powered by atomic decay. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  62: { skipVideo: true }, // Samarium
  63: {
    // Europium
    videoPrompt:
      'Extreme close-up of small glass dishes containing europium oxide powder in a dark room. A UV lamp switches on, and the powder instantly erupts with an intense, brilliant red phosphorescence — a deep, saturated crimson glow that illuminates everything nearby. Next to it, a europium-doped strontium aluminate sample blazes with electric blue-green light. The UV lamp switches off, but the europium compounds keep glowing — the red fades slowly while the blue-green persists with an ethereal, ghostly luminescence that refuses to die. The brightest, longest-lasting glow-in-the-dark material known to science. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  64: {
    // Gadolinium
    videoPrompt:
      'Extreme close-up of a small, shiny silver gadolinium metal sample hanging from a powerful permanent magnet in a dark laboratory. The metal clings firmly to the magnet, clearly ferromagnetic. A gentle stream of warm air from a heat gun begins warming the gadolinium. At around 20 degrees Celsius — barely above room temperature — the gadolinium suddenly and dramatically releases from the magnet and falls away, tumbling downward. The invisible magnetic force that held it simply vanishes as thermal energy disrupts the magnetic ordering. The metal is cooled and brought back — it snaps to the magnet again. Heated once more, it drops. A metal that switches its magnetism on and off with just a few degrees of temperature change. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  65: {
    // Terbium
    videoPrompt:
      'Extreme close-up of a glass dish containing terbium-doped material in a dark room. A UV lamp clicks on and the sample instantly erupts with an intense, electric green fluorescence — a vivid, saturated green glow so bright it illuminates the entire surrounding area with an otherworldly emerald light. The green fluorescence is strikingly pure and intense, far brighter than typical glow-in-the-dark materials. A euro banknote is brought under the same UV light, and terbium security features blaze green against the dark purple of the UV. The brilliant green phosphorescence makes terbium the undisputed king of green light among all elements. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  66: { skipVideo: true }, // Dysprosium
  67: { skipVideo: true }, // Holmium
  68: {
    // Erbium
    videoPrompt:
      'Extreme close-up of a collection of erbium-doped glass pieces in a dark room — rods, lenses, and discs all tinted a beautiful, distinctive rose-pink color. A beam of light passes through the erbium glass, emerging tinted with a warm rosy glow. An erbium oxide powder sample nearby displays a vivid pink color. When a green laser beam strikes the erbium-doped glass, the glass erupts with bright pink fluorescence along the beam path, the erbium ions converting green light into their signature pink emission. Glowing pink traces of light streak through the glass like veins of luminous rose quartz. The element that powers the entire internet, revealed in its true color. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  69: { skipVideo: true }, // Thulium
  70: { skipVideo: true }, // Ytterbium
  71: { skipVideo: true }, // Lutetium
  72: {
    // Hafnium
    videoPrompt:
      'Extreme close-up of fine silvery hafnium metal powder being sprinkled from a glass vial onto a ceramic dish in a laboratory. The instant the powder contacts air, it ignites spontaneously in a cascade of brilliant white-hot sparks and intense orange-white flames, each grain becoming a tiny blazing star as it falls. The pyrophoric metal flares with dazzling incandescence, sparks ricocheting off the dish and trailing bright streaks through the air like miniature fireworks. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  73: {
    // Tantalum
    videoPrompt:
      'Extreme close-up of a polished, lustrous blue-gray tantalum metal bar being slowly lowered into a glass beaker of fuming concentrated hydrochloric acid. The acid hisses and fumes around the edges of the beaker, vapors swirling upward, yet the tantalum sits completely untouched — its mirror-like surface perfectly intact, not a single bubble forming on its surface. The camera slowly orbits the beaker, showing the violent fuming acid contrasted against the impossibly serene, gleaming metal sitting calmly within it. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  74: {
    // Tungsten
    videoPrompt:
      'Extreme close-up of a coiled tungsten filament inside a clear glass bulb. Electric current slowly increases — the filament shifts from invisible to deep red, then bright orange, then searing yellow, and finally an almost unbearable brilliant white-hot glow that illuminates everything around it. The thin wire trembles slightly from the heat, radiating intense white light that flares and blooms in the lens. The coils glow so hot they seem to pulse with energy, yet the metal holds perfectly solid, refusing to melt at temperatures that would vaporize nearly any other element. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  75: { skipVideo: true }, // Rhenium
  76: {
    // Osmium
    videoPrompt:
      'Extreme close-up of a small, lustrous blue-gray osmium bead with a distinctive metallic sheen sitting on one side of a precision glass balance scale in a laboratory. On the other side, a steel ball bearing three times its size is placed — and the osmium side stays firmly down. More ball bearings are added one by one, and the scale barely budges. The camera pushes in tight on the tiny osmium bead, its bluish surface catching the light with an almost alien metallic luster, impossibly heavy for its minuscule size. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  77: {
    // Iridium
    videoPrompt:
      'Extreme close-up of a small, polished iridium pellet with a brilliant silvery-white luster being dropped into a glass beaker of bubbling, fuming aqua regia — the infamous golden-yellow acid mixture known for dissolving gold and platinum. The acid roils and fumes violently, orange-yellow vapors curling upward, but the iridium sits at the bottom completely untouched, its mirror-bright surface showing not a single pit or bubble. Minutes pass in time-lapse and the acid level drops from evaporation while the iridium pellet remains pristine and gleaming, utterly impervious. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  78: {
    // Platinum
    videoPrompt:
      'Extreme close-up of platinum metal chunks in a ceramic crucible being heated by an intense blue-white torch flame. The silvery-white metal slowly softens and collapses into a blindingly bright, shimmering molten pool — a liquid mirror of pure white-silver radiance. The crucible tips and the molten platinum pours in a thick, luminous stream, glowing with an intense pale white light, far brighter and whiter than molten gold. The heavy liquid metal splashes into a graphite mold with satisfying weight, pooling and swirling with mesmerizing viscosity, its surface reflecting light like liquid starlight. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  79: {
    // Gold
    propertyAction:
      'being heated in a crucible until it melts into a blindingly bright glowing orange-yellow liquid, then slowly poured in a molten stream, the liquid gold flowing like lava and pooling into a gleaming ingot mold',
  },
  80: {
    // Mercury
    videoPrompt:
      'Extreme close-up of brilliant liquid mercury being slowly poured from a glass flask into a wide glass dish. The impossibly dense silver liquid flows in a thick, heavy stream with a mirror-perfect surface, pooling into a shimmering metallic lake that reflects everything above it with stunning clarity. A solid iron bolt is gently dropped onto the mercury surface — and it floats, bobbing on the liquid metal like a cork on water. The mercury ripples and undulates with heavy, slow-motion waves, each ripple catching the light in dazzling silver flashes across its flawless mirror surface. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  81: { skipVideo: true }, // Thallium
  82: {
    // Lead
    videoPrompt:
      'Extreme close-up of a thick lead ingot being sliced with a sharp blade. The freshly cut surface reveals a stunning bright silvery-blue metallic sheen — far more beautiful than expected. Within seconds, a visible wave of dull gray oxide creeps across the fresh surface in real-time, consuming the brilliant blue-silver luster like a shadow rolling across a mirror. The camera holds tight on the transformation as the gleaming fresh metal surrenders to the familiar dull gray. Then the cut lead is placed over a flame where it quickly softens, slumps, and melts into a shimmering silvery liquid pool that flows easily into a mold. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  83: {
    // Bismuth
    videoPrompt:
      'Extreme close-up of molten bismuth in a steel crucible, glowing red-hot. As the surface cools, a thin silver skin forms and is carefully pulled aside to reveal stunning geometric hopper crystals growing beneath — perfect staircase spirals and cubic formations emerging from the liquid metal. The crystals are lifted out, and as they cool in air, a mesmerizing rainbow oxide layer blooms across their surfaces in real-time: gold shifting to magenta, then electric blue, then deep purple and iridescent green, the colors rippling across the crystalline steps like an oil slick made of metal. The final crystal is a dazzling geometric rainbow sculpture. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  84: {
    // Polonium
    videoPrompt:
      'Extreme close-up inside a sealed glass ampule in a pitch-dark laboratory. A tiny silvery speck of polonium-210 sits on a glass platform. The darkness reveals an ethereal blue glow emanating from the metal — not from the polonium itself, but from the air around it being ionized by the intense barrage of invisible alpha particles streaming from the sample. The blue luminescence pulses and shimmers softly, casting ghostly light on the glass walls of the ampule. A wisp of heat haze rises from the speck — this tiny grain generates enough heat to be warm to the touch, its atomic nuclei firing off radiation with furious intensity. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  85: { skipVideo: true }, // Astatine
  86: {
    // Radon
    videoPrompt:
      'Extreme close-up of a sealed glass tube being slowly cooled in a laboratory cryogenic setup. As the temperature drops, invisible radon gas begins to condense on the inner walls of the tube. The laboratory lights dim to total darkness, and the condensed radon reveals a stunning radioluminescent glow — first a soft yellow, then intensifying to a vivid orange-red as the temperature continues to drop. The glowing liquid clings to the cold glass walls, pulsing with an otherworldly luminescence powered entirely by its own radioactive decay. The tube glows like a tiny neon sign with no electricity — lit from within by pure atomic energy. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  87: { skipVideo: true }, // Francium
  88: {
    // Radium
    videoPrompt:
      'Extreme close-up of a sealed glass vial in a dimly lit laboratory. Inside the vial, a small amount of radium compound is mixed with zinc sulfide phosphor. The laboratory lights slowly fade to complete darkness, and the vial reveals a haunting, steady green glow — not faint or flickering, but a confident, luminous emerald radiance that needs no batteries, no charging, no sunlight. The camera slowly pushes in on the glowing vial as wisps of green light illuminate the glass surface and cast soft green reflections on the dark surroundings. This glow will last for decades, powered by nothing but the relentless decay of radium atoms firing radiation into the phosphor. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  89: {
    // Actinium
    videoPrompt:
      'A tiny metallic pellet sits on a dark surface. As the lights dim to total darkness, the pellet begins to reveal an ethereal pale blue glow emanating from its surface and the air immediately surrounding it. Faint luminous blue wisps drift and shimmer around the metal like a ghostly aura, the ionized air pulsing with soft radiance. Microscopic sparks of blue-white light flicker at the surface as alpha particles stream outward. The glow intensifies and fades in gentle waves, the blue light reflecting off the polished metallic surface beneath. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  90: {
    // Thorium
    videoPrompt:
      'Extreme close-up of fine silvery thorium metal turnings piled on a dark ceramic surface. A spark ignites the edge and the metal erupts into a blazing, brilliant white incandescence — far brighter than any ordinary flame. The turnings burn with an intense, almost blinding white-hot radiance, white sparks spraying outward like miniature fireworks. The fire crawls across the pile as each shaving catches and flares, the white glow so intense it washes out the surrounding area. Wisps of white thorium dioxide smoke curl upward, illuminated from below by the searing white combustion. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  91: { skipVideo: true }, // Protactinium
  92: { actinideProperty: 'a collection of uranium glass objects under UV light, erupting with an intense, eerie neon-green fluorescence that makes them glow brilliantly against the darkness' }, // Uranium
  93: {
    // Neptunium
    videoPrompt:
      'Extreme close-up of a small, freshly prepared silvery metallic neptunium sample gleaming under controlled lighting. As moist air reaches the surface, a vivid green patina begins to bloom across the metal — neptunium oxide forming in real time. The green color deepens and spreads like moss growing on stone, transforming the bright silver into a rich, emerald-tinged surface. The oxidation creeps across facets and edges of the metal, each crystal face catching the green transformation at slightly different rates, creating a mesmerizing mosaic of silver and green. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  94: {
    // Plutonium
    videoPrompt:
      'Extreme close-up of a small, dark, ceramic-like plutonium oxide pellet resting in a graphite container. In dim lighting, the pellet radiates a deep, smoldering red-orange glow from within — heated entirely by its own radioactive decay with no external flame or power source. The glow pulses subtly, like a living ember, casting warm orange-red light onto the surrounding surfaces. Heat shimmer ripples the air above the pellet. The incandescent glow shifts between deep cherry red and bright orange across the pellet\'s textured surface, an eternal fire powered by atomic decay. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  95: {
    // Americium
    videoPrompt:
      'Extreme close-up of the interior of an ionization smoke detector, revealing the small americium-241 source disc at the center of the ionization chamber. A faint silvery metallic disc sits between two metal plates. Invisible alpha particles stream outward from the source, visualized as subtle shimmering lines of ionized air filling the chamber with a delicate electric current. Then thin wisps of smoke drift into the chamber, disrupting the streams — the ionized pathways scatter and break apart as smoke particles absorb the alpha radiation. The disruption triggers the alarm circuit, a tiny LED flashing red. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  96: {
    // Curium
    videoPrompt:
      'Extreme close-up of a tiny silvery-white metallic curium sample in a sealed glass vial. As the surrounding light fades to total darkness, the sample reveals an otherworldly pinkish-purple glow — a soft, ethereal radiance emanating from the metal itself. The purple-pink luminescence pulses gently, casting a faint violet light on the inside of the glass vial. Microscopic scintillations of pink and violet flicker across the surface as the intense radioactivity ionizes the surrounding gas. The glow is steady and haunting, a jewel-like purple ember burning from pure atomic energy. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  97: { skipVideo: true }, // Berkelium
  98: {
    // Californium
    videoPrompt:
      'Extreme close-up of a tiny, sealed californium-252 source capsule — a small metallic cylinder barely larger than a pencil eraser. The capsule sits on a dark surface, looking deceptively ordinary. Then the visualization reveals what is invisible to the naked eye: streams of shimmering, ghost-like neutron particles radiate outward from the capsule in all directions, passing effortlessly through solid objects nearby — a metal plate, a block of concrete, a container of water. The neutrons are visualized as faint silvery-blue ripples, like sonar waves pulsing through matter. One hundred and seventy million neutrons per minute stream from this tiny source, an invisible atomic fountain. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  99: {
    // Einsteinium
    videoPrompt:
      'Extreme close-up of a microscopic sample of einsteinium metal sealed in a tiny glass capsule. In darkness, the sample emits a vivid blue glow — radiant and intense for such a minuscule amount of material. The blue luminescence flickers and shimmers as the element\'s ferocious radioactivity ionizes the surrounding gas. Visible heat distortion ripples above the capsule as the sample generates roughly 1000 watts per gram. Tiny fractures appear to spread across the crystalline surface in real time as the relentless radiation damages the metal\'s own atomic lattice, the element literally tearing itself apart from within. The blue glow persists, beautiful and self-destructive. Dark background, cinematic lighting, extreme close-up, no text, no watermarks, no logos.',
  },
  100: { skipVideo: true }, // Fermium
  101: { skipVideo: true }, // Mendelevium
  102: { skipVideo: true }, // Nobelium
  103: { skipVideo: true }, // Lawrencium
  104: { skipVideo: true }, // Rutherfordium
  105: { skipVideo: true }, // Dubnium
  106: { skipVideo: true }, // Seaborgium
  107: { skipVideo: true }, // Bohrium
  108: { skipVideo: true }, // Hassium
  109: { skipVideo: true }, // Meitnerium
  110: { skipVideo: true }, // Darmstadtium
  111: { skipVideo: true }, // Roentgenium
  112: { skipVideo: true }, // Copernicium
  113: { skipVideo: true }, // Nihonium
  114: { skipVideo: true }, // Flerovium
  115: { skipVideo: true }, // Moscovium
  116: { skipVideo: true }, // Livermorium
  117: { skipVideo: true }, // Tennessine
  118: {
    // Oganesson
    videoPrompt:
      'Close-up of a single luminous atom against pure black space. The atom pulses with inner light. Unlike normal atoms with neat orbital rings, this one has a diffuse, shimmering cloud of electrons that blur together like fog — no distinct shells, just a smooth, glowing haze. The camera slowly orbits the atom. Text fades in: "Element 118 — Oganesson." The electron cloud ripples and shifts, showing it is easily disturbed. Then the atom begins to glow brighter, destabilizes, and bursts apart into a shower of smaller glowing particles (alpha decay), each flying away and themselves breaking apart in a cascade. The whole sequence from stable atom to complete decay takes 5 seconds — matching oganesson\'s real half-life. Final frame: darkness, with a faint afterglow where the atom was. Mood: awe, fragility, the edge of existence. Color palette: deep blue-violet core, white-gold electron haze, warm orange decay particles.',
  },
};
