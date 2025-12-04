import { formatMinor, majorToMinor, minorToMajor } from './money.util';

describe('money util', () => {
  it('converts minor to major for two-decimal currencies', () => {
    expect(minorToMajor(12345, 'EUR')).toBeCloseTo(123.45);
  });

  it('handles zero-decimal currencies', () => {
    expect(minorToMajor(1500, 'JPY')).toBe(1500);
  });

  it('converts major to minor respecting currency exponent', () => {
    expect(majorToMinor(12.5, 'USD')).toBe(1250);
  });

  it('formats minor amounts with currency', () => {
    const formatted = formatMinor(2500, 'USD', 'en-US');
    expect(formatted).toContain('$');
    expect(formatted).toContain('25');
  });
});
