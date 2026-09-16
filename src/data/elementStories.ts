import { elements, getElementBySymbol } from './elements';
import type { Element } from '../types/element';

/**
 * Verified discovery stories for the elements that have no video: protactinium (91)
 * and americium through oganesson (95–118). The voice agent fetches these through
 * the `get_element_story` client tool instead of answering from memory.
 *
 * Every fact here is rewritten from docs/superheavy-element-videos.md. Do not add a
 * number, date, lab, person, or claim that is not in that document.
 */
export interface ElementStory {
  atomicNumber: number;
  symbol: string;
  story: string;
}

// Shared by the fusion-made elements (101–118); from "The premise to avoid" in the source doc.
const FUSION_PREMISE =
  'How elements like this get made: not in a giant collider that smashes things apart. ' +
  'The Large Hadron Collider smashes protons to break matter into fragments. ' +
  'Making these elements uses a beam that is about a million times gentler per particle, ' +
  'and the goal is the opposite: get two nuclei to barely touch and stick. ' +
  'Too slow and they push each other away and bounce off. Too fast and the merged nucleus is so hot it breaks apart instantly. ' +
  'The right energy window is only a few MeV wide, and it is different for every beam and target pairing. ' +
  'It is a docking maneuver, not a demolition derby.';

// Shared by the GSI Darmstadt elements (107–112); from the Era 5 intro in the source doc.
const GSI_WORKSHOP =
  'This element is one of six made at GSI in Darmstadt. All six used a lead or bismuth target and gave off exactly one neutron, ' +
  'in the same building, with the same separator called SHIP. Peter Armbruster and Gottfried Münzenberg led the discoveries of elements 107 to 109, ' +
  'and Sigurd Hofmann led the team that found elements 110 to 112, with Armbruster and Münzenberg still on it.';

// Shared by 114–118; from the Era 6 intro in the source doc.
const HOT_FUSION =
  'This is one of the hot fusion elements: a calcium-48 beam aimed at some of the rarest targets on Earth.';

export const elementStories: ElementStory[] = [
  {
    atomicNumber: 91,
    symbol: 'Pa',
    story:
      'Protactinium is not a synthetic element. It is natural, and it is pulled out of uranium ore. ' +
      'It is found in a mineral called uraninite at about 0.3 to 3 parts per million, because protactinium-231 forms when uranium-235 decays. ' +
      'Kasimir Fajans and Oswald Göhring first identified element 91 in 1913, as a short-lived form they called brevium. ' +
      'Then in 1917 and 1918, two teams working separately found its long-lived form, protactinium-231: Lise Meitner and Otto Hahn in Germany, and Frederick Soddy and John Cranston in the UK. ' +
      'The name protactinium was made official in 1949. Protactinium-231 has a half-life of 32,760 years. ' +
      'The big story: in 1961 the UK Atomic Energy Authority ran 60 tonnes of waste through a 12-stage plant to get out just 127 grams of 99.9 percent pure protactinium-231, ' +
      'at a cost of about 500,000 dollars. That was the world\'s supply for decades. ' +
      'Scientists use it to date ocean sediment going back 175,000 years, like reading clocks in the seafloor.',
  },
  {
    atomicNumber: 95,
    symbol: 'Am',
    story:
      'Americium was first identified in late 1944 at the Metallurgical Laboratory at the University of Chicago, by Glenn Seaborg, Ralph James, Leon Morgan, and Albert Ghiorso. ' +
      'They made it by hitting plutonium with neutrons in a nuclear reactor. ' +
      'It was kept secret through the Manhattan Project. Then in November 1945 it was announced publicly on a children\'s radio quiz show, ' +
      'so Seaborg told kids before he told scientists! ' +
      'Today it is produced when plutonium-239 takes in two neutrons to become plutonium-241, which beta decays into americium-241. ' +
      'There is about 100 grams of it in every tonne of spent fuel. Americium-241 has a half-life of 432 years and decays to neptunium-237. ' +
      'Some of it might be in your house, inside a smoke detector. A smoke detector holds just 0.29 micrograms, about 1 microcurie. ' +
      'Its alpha particles ionize the air between two plates so a tiny current flows, and when smoke gets in the way it interrupts the current.',
  },
  {
    atomicNumber: 96,
    symbol: 'Cm',
    story:
      'Curium was made at Berkeley in 1944 by Glenn Seaborg, Ralph James, and Albert Ghiorso. ' +
      'They hit plutonium-239 with helium-4, which made curium-242 and one neutron. ' +
      'Curium-247 has a half-life of 15.6 million years. ' +
      'Curium glows purple in the dark from its own radioactivity. ' +
      'And it has been to space: curium-244 is the alpha source in the APXS instruments flown on Sojourner on Mars, the Mars Exploration Rovers, and the Philae comet lander. ' +
      'This element has touched rocks on another planet and on a comet.',
  },
  {
    atomicNumber: 97,
    symbol: 'Bk',
    story:
      'Berkelium was first made at Berkeley in 1949 by hitting americium-241 with helium-4, which made berkelium-243 and two neutrons. ' +
      'Today berkelium-249 is bred in the HFIR reactor at Oak Ridge, where plutonium-239 captures neutron after neutron, and decays along the way, until it becomes curium-249, which beta decays into berkelium-249. ' +
      'Berkelium-249 has a half-life of 330 days, and berkelium-247 has a half-life of 1,380 years. ' +
      'Here is how rare it is: just over one gram total has been made at Oak Ridge since 1967, at roughly 1 million dollars per batch. ' +
      'It is one of the scarcest materials on Earth, and it is what scientists used to make tennessine, element 117.',
  },
  {
    atomicNumber: 98,
    symbol: 'Cf',
    story:
      'Californium was first made at Berkeley in 1950 by hitting curium-242 with helium-4, which made californium-245 and one neutron. ' +
      'That first batch was about 5,000 atoms, with a 44-minute half-life. ' +
      'Today Oak Ridge makes about 0.25 grams a year and Russia\'s RIAR makes about 0.025 grams a year, going by 2003 figures. ' +
      'Californium-251 has a half-life of 898 years, and californium-252 has a half-life of 2.645 years. ' +
      'Californium-252 is a real product people buy. Just one microgram throws off 139 million neutrons per minute. ' +
      'It is used for neutron radiography, which is about 77 percent of its use, and for scanning fuel rods, starting up reactors, oil-well logging, and finding cracks in aircraft. ' +
      'It is a working industrial tool, not a lab curiosity. It even goes down oil wells as a neutron source.',
  },
  {
    atomicNumber: 99,
    symbol: 'Es',
    story:
      'Einsteinium was found in the debris of Ivy Mike, the first thermonuclear test, at Enewetak Atoll in the Pacific on November 1, 1952. ' +
      'Aircraft flew through the mushroom cloud trailing paper filters to catch the debris, and more was later washed out of coral shipped back from the atoll. ' +
      'Albert Ghiorso identified it in December 1952, working with Berkeley, Argonne, and Los Alamos. ' +
      'Fewer than 200 atoms were recovered, using ion exchange. Einsteinium-252 has a half-life of 471.7 days. ' +
      'It was kept secret until 1955, when Ghiorso announced it at the first Geneva Atomic Conference. ' +
      'Einsteinium glows, and it gives off about 1,000 watts of heat per gram. Even a speck of it is visibly, dangerously hot.',
  },
  {
    atomicNumber: 100,
    symbol: 'Fm',
    story:
      'Fermium was found in the same Ivy Mike bomb test debris as einsteinium, about 2 months after the test. ' +
      'Scientists spotted fermium-255 by its alpha particles, which had an energy of 7.1 MeV. ' +
      'It was made when uranium-238 absorbed neutron after neutron in the instant of the explosion. ' +
      'Fermium-257 has a half-life of 100.5 days. ' +
      'Here is why fermium is special: it is the wall. Think of a ladder of neutron captures, climbing one rung at a time. ' +
      'Past fermium-257, spontaneous fission happens so fast that neutron capture cannot climb any higher. This is called the fermium gap. ' +
      'Every element above 100 needs a completely different way of being made.',
  },
  {
    atomicNumber: 101,
    symbol: 'Md',
    story:
      'Mendelevium was made at Berkeley in 1955 with the 60-inch cyclotron. ' +
      'The target was einsteinium-253, only about a billion atoms of it, and they hit it with alpha particles. ' +
      'That made mendelevium-256, with a half-life of 77.7 minutes, and they detected 17 atoms. ' +
      'Mendelevium-258 has a half-life of 51.6 days. ' +
      'It was the first isotope of any element ever made one atom at a time. ' +
      'They used a clever trick: the einsteinium sat on the far side of the target, so each new mendelevium atom recoiled out and got caught on a gold foil behind it. ' +
      FUSION_PREMISE,
  },
  {
    atomicNumber: 102,
    symbol: 'No',
    story:
      'The name nobelium remembers a discovery that did not happen! ' +
      'In 1957 the Nobel Institute in Sweden claimed element 102 and named it. ' +
      'But their signal turned out to be thorium-225 contamination, and they took the claim back. ' +
      'Berkeley could not reproduce it either; their results turned out to be fermium isomers. ' +
      'The discovery was confirmed at Dubna in 1966: uranium-238 hit with neon-22 made nobelium-254 and 6 neutrons. ' +
      'In 1992 IUPAC and IUPAP ruled that only Dubna\'s 1966 work was correct. The Soviet team proposed the name joliotium, ' +
      'but the wrong name had stuck too hard to change. So scientists fixed the mistake, but the name stayed anyway. ' +
      'Nobelium-259 has a half-life of 58 minutes. ' +
      FUSION_PREMISE,
  },
  {
    atomicNumber: 103,
    symbol: 'Lr',
    story:
      'Lawrencium was made at Berkeley on February 14, 1961, with an accelerator called the HILAC. ' +
      'The target was 3 milligrams of three different californium isotopes, hit with boron-10 and boron-11. ' +
      'For example, californium-252 hit with boron-11 made lawrencium-258 and 5 neutrons. ' +
      'Lawrencium-266 has a half-life of 11 hours. ' +
      'Dubna disputed the discovery. In 1992 IUPAC credited both teams, but noted that only Berkeley\'s 1971 runs gave full confidence. ' +
      'The coolest part: people still argue about where lawrencium belongs on the periodic table! ' +
      'In 2015 its first ionization energy was measured at 4.96 electron volts, the lowest of any lanthanide or actinide. ' +
      'That is evidence for putting it in group 3 with scandium and yttrium, instead of in the f-block. ' +
      FUSION_PREMISE,
  },
  {
    atomicNumber: 104,
    symbol: 'Rf',
    story:
      'Rutherfordium was one of the first big fights in the Transfermium Wars, a Cold War argument over who discovered new elements and what to call them. ' +
      'Dubna claimed element 104 in 1964, but that early claim did not hold up. ' +
      'Dubna kept working on it between 1966 and 1969, hitting plutonium-242 with neon-22. ' +
      'Berkeley made it in 1969 by hitting californium-249 with carbon-12, which made rutherfordium-257 and 4 neutrons. ' +
      'The Soviets proposed the name kurchatovium, with the symbol K. U., and the Americans proposed rutherfordium. ' +
      'In 1992 a working group credited both teams. IUPAC only settled on rutherfordium in 1997, nearly 30 years after the discovery. ' +
      'Rutherfordium-267 has a half-life of about 48 minutes. ' +
      FUSION_PREMISE,
  },
  {
    atomicNumber: 105,
    symbol: 'Db',
    story:
      'Dubnium was claimed by two Cold War rivals. Dubna made it in April 1968 by hitting americium-243 with neon-22. ' +
      'Berkeley made it in April 1970 by hitting californium-249 with nitrogen-15, which made dubnium-260 and 4 neutrons. ' +
      'The naming fight got silly: four different names were in play, nielsbohrium, hahnium, joliotium, and dubnium, before it was settled in 1997. ' +
      'Dubnium-268 has a half-life of about 16 hours, a number revised in 2022. That makes it the longest-lived of any element above 103. ' +
      'Dubnium-270 lasts about 1 hour, and that is known from only three observed atoms. ' +
      FUSION_PREMISE,
  },
  {
    atomicNumber: 106,
    symbol: 'Sg',
    story:
      'Seaborgium was made in 1974 by Berkeley together with Lawrence Livermore National Lab. ' +
      'They hit californium-249 with oxygen-18, which made seaborgium-263m and 4 neutrons. ' +
      'Seaborgium-267 has a half-life of about 9.8 minutes. ' +
      'The naming story: in August 1994 IUPAC ruled that no element may be named after a living person, and Glenn Seaborg was still alive. ' +
      'Seaborg said: "This would be the first time in history that the acknowledged and uncontested discoverers of an element are denied the privilege of naming it." ' +
      'IUPAC changed its mind and approved the name in August 1997. Seaborg died in February 1999, about 18 months later. ' +
      FUSION_PREMISE,
  },
  {
    atomicNumber: 107,
    symbol: 'Bh',
    story:
      'Bohrium was made at GSI in 1981 by hitting bismuth-209 with chromium-54, which made bohrium-262 and one neutron. Only five atoms. ' +
      'Bohrium-270 has a half-life of about 2.4 minutes. ' +
      'It is named for Niels Bohr. The name was originally nielsbohrium, and it was shortened in 1994. ' +
      'In 2000 the Paul Scherrer Institute made a volatile oxychloride of bohrium and measured how it stuck to a surface. ' +
      'That was chemistry done on just a handful of atoms, and it confirmed bohrium behaves like a group 7 element. ' +
      GSI_WORKSHOP + ' ' + FUSION_PREMISE,
  },
  {
    atomicNumber: 108,
    symbol: 'Hs',
    story:
      'Hassium was made at GSI in 1984 by hitting lead-208 with iron-58, which made hassium-265. Only three atoms. ' +
      'Hassium-271 has a half-life of 46 seconds. It is named for Hassia, the Latin name for Hesse. ' +
      'Hassium-270, with 108 protons and 162 neutrons, is a candidate deformed doubly-magic nucleus: a stability sweet spot that is not the famous island of stability. ' +
      'Hassium tetroxide is volatile and behaves like the heavier twin of osmium. ' +
      GSI_WORKSHOP + ' ' + FUSION_PREMISE,
  },
  {
    atomicNumber: 109,
    symbol: 'Mt',
    story:
      'Meitnerium was made at GSI on August 29, 1982, by hitting bismuth-209 with iron-58, which made meitnerium-266 and one neutron. ' +
      'Just one single atom! It was confirmed at Dubna three years later. Meitnerium-278 has a half-life of 4.5 seconds. ' +
      'It is named for Lise Meitner, who co-discovered protactinium and co-discovered nuclear fission, and was passed over for the Nobel. ' +
      'Hers is the only element named specifically after a woman who was not from mythology. ' +
      GSI_WORKSHOP + ' ' + FUSION_PREMISE,
  },
  {
    atomicNumber: 110,
    symbol: 'Ds',
    story:
      'Darmstadtium was made at GSI on November 9, 1994, by hitting lead-208 with nickel-62, which made darmstadtium-269 and one neutron. ' +
      'They got one atom on the 9th, and two more on the 12th and the 17th. It decays by giving off an alpha particle, turning into hassium-265. ' +
      'Darmstadtium-281 has a half-life of about 14 seconds. ' +
      'Fun fact: they nearly named it wixhausium, after Wixhausen, the ordinary suburb where the accelerator sits. ' +
      GSI_WORKSHOP + ' ' + FUSION_PREMISE,
  },
  {
    atomicNumber: 111,
    symbol: 'Rg',
    story:
      'Roentgenium was made at GSI on December 8, 1994, by hitting bismuth-209 with nickel-64, which made roentgenium-272 and one neutron. ' +
      'They saw three nuclei, and three more when the experiment was repeated in 2002. ' +
      'Roentgenium-282 has a half-life of 100 seconds. ' +
      'It is named for Wilhelm Röntgen, the man who discovered X-rays. Like him, scientists can only "see" this element through the radiation it gives off. ' +
      GSI_WORKSHOP + ' ' + FUSION_PREMISE,
  },
  {
    atomicNumber: 112,
    symbol: 'Cn',
    story:
      'Copernicium was made at GSI on February 9, 1996, by hitting lead-208 with zinc-70, which made copernicium-277 and one neutron. ' +
      'One atom was confirmed. A second atom was taken back because the data for it had been faked, and science corrected itself. ' +
      'Copernicium-285 has a half-life of about 30 seconds. ' +
      'It is named for Copernicus, and the name was accepted on February 19, 2010, the 537th anniversary of his birth. ' +
      'Relativistic effects make copernicium more volatile than mercury, with behavior like a noble gas. It might be the first gaseous metal! ' +
      GSI_WORKSHOP + ' ' + FUSION_PREMISE,
  },
  {
    atomicNumber: 113,
    symbol: 'Nh',
    story:
      'Nihonium was made at RIKEN in Japan, by a team led by Kosuke Morita, by hitting bismuth-209 with zinc-70, which made nihonium-278 and one neutron. ' +
      'It is the ultimate patience story: three atoms in nine years. ' +
      'The bombardment started in September 2003. The first atom came in July 2004, the second in April 2005, ' +
      'and the decisive third in August 2012, after 450 more days of irradiation. ' +
      'Each atom left a decay chain. Nihonium-278 became roentgenium-274, then meitnerium-270, then bohrium-266, then dubnium-262. ' +
      'For the first two atoms, dubnium-262 split apart by fission. ' +
      'But in the decisive 2012 atom the chain kept going: dubnium-262 gave off an alpha particle to become lawrencium-258, then another to become mendelevium-254. That is six alpha decays in a row! ' +
      'Unlike its neighbors from 114 to 118, nihonium was made by cold fusion, not with a calcium-48 beam. ' +
      'Nihonium-286 has a half-life of about 10 seconds. ' +
      'RIKEN\'s claim was recognized in 2015, making nihonium the first element discovered in Asia. ' +
      FUSION_PREMISE,
  },
  {
    atomicNumber: 114,
    symbol: 'Fl',
    story:
      'Flerovium was made at JINR in Dubna. In December 1998 they fired calcium-48 at plutonium-244 and saw a single atom that lasted about 30 seconds. ' +
      'It was first labelled flerovium-289, and that was later reassigned. ' +
      'In 1999 more atoms came from plutonium-242, which made flerovium-287, and from another plutonium-244 run. ' +
      'IUPAC credited the discovery to the team\'s later experiments, in 2004. ' +
      'Flerovium-289 has a half-life of about 1.9 seconds. ' +
      'Flerovium is tied to the island of stability. Flerovium-298, with 114 protons and 184 neutrons, is predicted to be doubly magic: ' +
      'a superheavy that might last far longer than anything made so far. Nobody has reached it yet. ' +
      'Chemistry experiments in 2007 and 2008 found flerovium unexpectedly volatile for group 14. It sticks to gold the way copernicium does, and it may be a gas. ' +
      HOT_FUSION + ' ' + FUSION_PREMISE,
  },
  {
    atomicNumber: 115,
    symbol: 'Mc',
    story:
      'Moscovium was made in August 2003 by JINR in Dubna together with Lawrence Livermore National Lab. ' +
      'They hit americium-243 with calcium-48, which made moscovium-288 and 3 neutrons, and also moscovium-287 and 4 neutrons. ' +
      'Moscovium-288 gives off an alpha particle and turns into nihonium, element 113, with a half-life of about 190 milliseconds. ' +
      'So this is where nihonium comes from when you make it the other way! ' +
      'Moscovium-290 has a half-life of 650 milliseconds. It is named for Moscow Oblast. ' +
      HOT_FUSION + ' ' + FUSION_PREMISE,
  },
  {
    atomicNumber: 116,
    symbol: 'Lv',
    story:
      'Livermorium was made on July 19, 2000, by JINR in Dubna together with Lawrence Livermore National Lab. ' +
      'They hit curium-248 with calcium-48, which made livermorium-293 and 3 neutrons. ' +
      'It was a single atom, and it gave off an alpha particle to become flerovium. Livermorium-293 has a half-life of about 80 milliseconds. ' +
      'IUPAC recognized it on June 1, 2011. ' +
      'The name has a fun chain: it is named for Lawrence Livermore National Lab, which is named for the town of Livermore, California, ' +
      'which is named for Robert Livermore, a rancher. So the name traces all the way back to a 19th-century cattleman! ' +
      HOT_FUSION + ' ' + FUSION_PREMISE,
  },
  {
    atomicNumber: 117,
    symbol: 'Ts',
    story:
      'Tennessine was made in 2010 by a team from JINR in Dubna, Oak Ridge, Lawrence Livermore National Lab, and Vanderbilt. ' +
      'They hit berkelium-249 with calcium-48. That made tennessine-294 and 3 neutrons once, and tennessine-293 and 4 neutrons five times. Six atoms in all. ' +
      'Tennessine-294 has a half-life of about 112 milliseconds, and tennessine-293 about 21 milliseconds. ' +
      'One of the best stories on the table is how they got the target. ' +
      'The berkelium-249 was bred in the HFIR reactor at Oak Ridge over a 250-day irradiation that ended in late December 2008, and it made just 22 milligrams. ' +
      'Then it needed 90 days of cooling and 90 days of chemical processing. ' +
      'Then it had to get to Dubna before too much of it decayed, because berkelium-249 has a half-life of 330 days. ' +
      'But Russian customs rejected the shipment twice because the paperwork was incomplete, and the berkelium crossed the Atlantic five times! ' +
      'It finally entered Russia in June 2009, was laid down as a thin film on titanium, and reached Dubna in July 2009. ' +
      'One of the rarest materials on Earth was stuck in customs, decaying the whole time. ' +
      HOT_FUSION + ' ' + FUSION_PREMISE,
  },
  {
    atomicNumber: 118,
    symbol: 'Og',
    story:
      'Oganesson was made by JINR in Dubna together with Lawrence Livermore National Lab, by hitting californium-249 with calcium-48, which made oganesson-294 and 3 neutrons. ' +
      'It was made in 2002 and announced in 2006. Only about five atoms have ever been detected. Oganesson-294 has a half-life of 0.7 milliseconds. ' +
      'Its decay chain: oganesson-294 becomes livermorium-290, then flerovium-286, then copernicium-282, which ends in spontaneous fission. ' +
      'The naming story: it is named for Yuri Oganessian, who was alive and on the call. ' +
      'In a March 2016 conference call among the discoverers of elements 115 to 118, they waited for Oganessian to leave the call, then all agreed to name it after him. ' +
      'The name became official on November 28, 2016. ' +
      'Oganesson sits in the noble gas column, but it probably is not really one. ' +
      'Relativistic effects should make it far more reactive than radon, possibly with a positive electron affinity. The last element on the table breaks the table\'s pattern! ' +
      HOT_FUSION + ' ' + FUSION_PREMISE,
  },
];

const storiesByAtomicNumber = new Map(elementStories.map((s) => [s.atomicNumber, s]));

/** Resolves a trimmed, non-empty element name, symbol, or atomic number string (case-insensitive). */
function resolveElement(query: string): Element | undefined {
  if (/^\d+$/.test(query)) return elements.find((el) => el.atomicNumber === Number(query));
  const lower = query.toLowerCase();
  return getElementBySymbol(query) ?? elements.find((el) => el.name.toLowerCase() === lower);
}

/** Case-insensitive lookup by element name or symbol. Returns undefined for elements without a story. */
export function getElementStory(nameOrSymbol: string): ElementStory | undefined {
  const target = nameOrSymbol.trim();
  const element = target ? resolveElement(target) : undefined;
  return element ? storiesByAtomicNumber.get(element.atomicNumber) : undefined;
}

/**
 * Response text for the voice agent's `get_element_story` client tool.
 * `name` comes from the LLM, so it is not trusted to be a string: numbers are
 * stringified, and anything blank or non-string falls back to the element
 * currently open (by atomic number).
 */
export function getElementStoryToolResponse(
  name: unknown,
  currentAtomicNumber: number | null,
): string {
  const requested =
    typeof name === 'string' ? name.trim()
    : typeof name === 'number' && Number.isFinite(name) ? String(name)
    : '';
  const element = requested
    ? resolveElement(requested)
    : elements.find((el) => el.atomicNumber === currentAtomicNumber);
  const story = element ? storiesByAtomicNumber.get(element.atomicNumber) : undefined;
  if (story) return story.story;

  const subject = element?.name ?? (requested ? `"${requested}"` : 'this element');
  return `There is no verified story for ${subject}. Answer from general knowledge, and do not guess specific numbers, dates, or names.`;
}
