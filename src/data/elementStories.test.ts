import { describe, it, expect } from 'vitest';
import { elementStories, getElementStory, getElementStoryToolResponse } from './elementStories';
import { elements } from './elements';

const EXPECTED_ATOMIC_NUMBERS = [91, ...Array.from({ length: 24 }, (_, i) => 95 + i)];

describe('elementStories data', () => {
  it('has 25 stories with unique atomic numbers exactly {91, 95..118}', () => {
    expect(elementStories).toHaveLength(25);
    const numbers = elementStories.map((s) => s.atomicNumber);
    expect(new Set(numbers).size).toBe(25);
    expect([...numbers].sort((a, b) => a - b)).toEqual(EXPECTED_ATOMIC_NUMBERS);
  });

  it('uses the symbol from elements.ts for each atomic number', () => {
    for (const story of elementStories) {
      const element = elements.find((el) => el.atomicNumber === story.atomicNumber);
      expect(story.symbol).toBe(element?.symbol);
    }
  });

  it('contains no markdown or animator directions', () => {
    for (const { symbol, story } of elementStories) {
      expect(story, symbol).not.toContain('Visual');
      expect(story, symbol).not.toContain('*');
      expect(story, symbol).not.toContain('#');
      expect(story.trim().length, symbol).toBeGreaterThan(0);
    }
  });
});

describe('getElementStory', () => {
  it('finds a story by symbol, case-insensitively', () => {
    expect(getElementStory('Ts')?.atomicNumber).toBe(117);
    expect(getElementStory('ts')?.atomicNumber).toBe(117);
    expect(getElementStory('TS')?.atomicNumber).toBe(117);
  });

  it('finds a story by name, case-insensitively', () => {
    expect(getElementStory('Tennessine')?.symbol).toBe('Ts');
    expect(getElementStory('tennessine')?.symbol).toBe('Ts');
    expect(getElementStory('  PROTACTINIUM ')?.symbol).toBe('Pa');
  });

  it('returns undefined for unknown input', () => {
    expect(getElementStory('Unobtainium')).toBeUndefined();
    expect(getElementStory('Xx')).toBeUndefined();
    expect(getElementStory('')).toBeUndefined();
  });

  it('returns undefined for elements that are not in the superheavy set', () => {
    expect(getElementStory('Gold')).toBeUndefined();
    expect(getElementStory('U')).toBeUndefined();
    expect(getElementStory('Np')).toBeUndefined();
    expect(getElementStory('Plutonium')).toBeUndefined();
  });
});

describe('getElementStoryToolResponse', () => {
  const tennessine = getElementStory('Ts')!.story;

  it('returns the story for a named element', () => {
    expect(getElementStoryToolResponse('tennessine', null)).toBe(tennessine);
    expect(getElementStoryToolResponse('Ts', 79)).toBe(tennessine);
  });

  it('falls back to the open element when name is missing or blank', () => {
    expect(getElementStoryToolResponse(undefined, 117)).toBe(tennessine);
    expect(getElementStoryToolResponse('', 117)).toBe(tennessine);
    expect(getElementStoryToolResponse('   ', 117)).toBe(tennessine);
  });

  it('coerces non-string names instead of throwing', () => {
    expect(getElementStoryToolResponse(117, null)).toBe(tennessine);
    expect(getElementStoryToolResponse(null, 117)).toBe(tennessine);
    expect(getElementStoryToolResponse({}, 117)).toBe(tennessine);
    expect(getElementStoryToolResponse(79, null)).toMatch(/no verified story for Gold/i);
  });

  it('resolves a numeric string by atomic number', () => {
    expect(getElementStoryToolResponse('117', null)).toBe(tennessine);
    expect(getElementStoryToolResponse(' 91 ', null)).toBe(getElementStory('Pa')!.story);
    expect(getElementStoryToolResponse('999', null)).toMatch(/no verified story/i);
  });

  it('tells the agent not to guess when there is no story', () => {
    for (const response of [
      getElementStoryToolResponse('Gold', null),
      getElementStoryToolResponse('Unobtainium', null),
      getElementStoryToolResponse(undefined, 79),
      getElementStoryToolResponse(undefined, null),
    ]) {
      expect(response).toMatch(/no verified story/i);
      expect(response).toMatch(/general knowledge/i);
      expect(response).toMatch(/do not guess specific numbers/i);
    }
    expect(getElementStoryToolResponse('Gold', null)).toContain('Gold');
  });
});
