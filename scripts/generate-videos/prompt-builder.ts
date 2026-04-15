import { elements } from '../../src/data/elements.ts';
import type { Element } from '../../src/types/element.ts';
import { VIDEO_CATEGORIES } from './video-categories.ts';
import { elementOverrides } from './element-overrides.ts';
import { STYLE_ANCHOR, IMAGE_STYLE_ANCHOR, NEGATIVE_PROMPT } from './config.ts';

export interface BuiltPrompt {
  atomicNumber: number;
  symbol: string;
  name: string;
  prompt: string;
  startFramePrompt: string;
  endFramePrompt: string;
  negativePrompt: string;
  skipVideo: boolean;
}

/**
 * Fills every `{token}` in a template string with values from the data map.
 * Unrecognised tokens are left as-is so callers can spot gaps.
 */
function fillTemplate(template: string, data: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    return key in data ? (data[key] ?? match) : match;
  });
}

/**
 * Lowercase the first character of a string so appearance values like
 * "Silvery-white metal" become "silvery-white metal" when embedded mid-sentence.
 */
function lcFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function buildPrompt(element: Element): string {
  const category = VIDEO_CATEGORIES[element.category];
  const override = elementOverrides[element.atomicNumber] ?? {};

  // If a full research-based videoPrompt exists, use it directly with the style anchor
  if (override.videoPrompt) {
    return `${override.videoPrompt} ${STYLE_ANCHOR}`;
  }

  // Fall back to category template with per-element token substitution
  const rawAppearance = lcFirst(element.appearance ?? 'metallic');
  // Clean up speculative appearances for synthetic elements so they read naturally
  // "Unknown, presumably metallic" → "silvery metallic substance"
  // "Presumably metallic" → "silvery metallic substance"
  // "Unknown, presumably a gas or solid" → "ethereal substance"
  const appearance = rawAppearance
    .replace(/^unknown, presumably a gas or solid$/i, 'ethereal, transient substance')
    .replace(/^unknown, presumably metallic$/i, 'silvery metallic substance')
    .replace(/^presumably metallic$/i, 'silvery metallic substance');

  // Pick "a" or "an" based on first letter of appearance
  const article = /^[aeiou]/i.test(appearance) ? 'an' : 'a';

  const data: Record<string, string> = {
    name: element.name,
    symbol: element.symbol,
    appearance,
    aAppearance: `${article} ${appearance}`,
    flameColor: override.flameColor ?? 'white',
    glowColor: override.glowColor ?? 'soft white',
    propertyAction: override.propertyAction ?? `showing its ${appearance} surface under soft lighting`,
    transitionAction: override.transitionAction ?? `demonstrating its physical properties under controlled conditions`,
    reactionDescription: override.reactionDescription ?? `A scientific demonstration of ${element.name} (${element.symbol}) showing its characteristic chemical behavior`,
    volatilityDescription: override.volatilityDescription ?? `A sealed glass vessel containing ${element.name} (${element.symbol}), showing its behavior at room temperature`,
    lanthanideProperty: override.lanthanideProperty ?? `its distinctive rare-earth properties under laboratory conditions`,
    actinideProperty: override.actinideProperty ?? `abstract particle visualization representing its radioactive nature`,
  };

  const filledTemplate = fillTemplate(category.promptTemplate, data);
  return `${filledTemplate} ${STYLE_ANCHOR}`;
}

export function buildStartFramePrompt(element: Element): string {
  const override = elementOverrides[element.atomicNumber] ?? {};
  if (override.startFramePrompt) {
    return `${override.startFramePrompt} ${IMAGE_STYLE_ANCHOR}`;
  }
  return '';
}

export function buildEndFramePrompt(element: Element): string {
  const override = elementOverrides[element.atomicNumber] ?? {};
  if (override.endFramePrompt) {
    return `${override.endFramePrompt} ${IMAGE_STYLE_ANCHOR}`;
  }
  return '';
}

export function buildNegativePrompt(): string {
  return NEGATIVE_PROMPT;
}

export function buildAllPrompts(): BuiltPrompt[] {
  return elements.map((element) => {
    const override = elementOverrides[element.atomicNumber] ?? {};
    return {
      atomicNumber: element.atomicNumber,
      symbol: element.symbol,
      name: element.name,
      prompt: buildPrompt(element),
      startFramePrompt: buildStartFramePrompt(element),
      endFramePrompt: buildEndFramePrompt(element),
      negativePrompt: buildNegativePrompt(),
      skipVideo: override.skipVideo === true,
    };
  });
}
