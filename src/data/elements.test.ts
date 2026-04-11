import { describe, it, expect } from 'vitest';
import { elements, getElementBySymbol } from './elements';

describe('elements data', () => {
  it('contains all 118 elements', () => {
    expect(elements).toHaveLength(118);
  });

  it('has unique symbols', () => {
    const symbols = new Set(elements.map((e) => e.symbol));
    expect(symbols.size).toBe(118);
  });

  it('has sequential atomic numbers 1..118', () => {
    const numbers = elements.map((e) => e.atomicNumber).sort((a, b) => a - b);
    expect(numbers[0]).toBe(1);
    expect(numbers[117]).toBe(118);
  });
});

describe('getElementBySymbol', () => {
  it('finds an element by canonical symbol', () => {
    expect(getElementBySymbol('H')?.name).toBe('Hydrogen');
    expect(getElementBySymbol('Au')?.name).toBe('Gold');
    expect(getElementBySymbol('Og')?.name).toBe('Oganesson');
  });

  it('is case-insensitive', () => {
    expect(getElementBySymbol('au')?.name).toBe('Gold');
    expect(getElementBySymbol('AU')?.name).toBe('Gold');
    expect(getElementBySymbol('aU')?.name).toBe('Gold');
  });

  it('trims whitespace', () => {
    expect(getElementBySymbol('  Fe  ')?.symbol).toBe('Fe');
  });

  it('returns undefined for unknown symbols', () => {
    expect(getElementBySymbol('Xx')).toBeUndefined();
    expect(getElementBySymbol('')).toBeUndefined();
    expect(getElementBySymbol('not-a-symbol')).toBeUndefined();
  });
});
