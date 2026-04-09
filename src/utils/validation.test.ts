import { describe, it, expect } from 'vitest';
import {
  isNonNegativeNumber,
  isNotFutureDate,
  isNotEmpty,
  hasAtLeastOneCount,
  validateTotal,
} from './validation';

describe('isNonNegativeNumber', () => {
  it('should return true for positive numbers', () => {
    expect(isNonNegativeNumber(5)).toBe(true);
    expect(isNonNegativeNumber('10')).toBe(true);
    expect(isNonNegativeNumber(0)).toBe(true);
    expect(isNonNegativeNumber('0')).toBe(true);
  });

  it('should return false for negative numbers', () => {
    expect(isNonNegativeNumber(-5)).toBe(false);
    expect(isNonNegativeNumber('-10')).toBe(false);
  });

  it('should return false for NaN values', () => {
    expect(isNonNegativeNumber('abc')).toBe(false);
    expect(isNonNegativeNumber(NaN)).toBe(false);
  });

  it('should handle decimal numbers', () => {
    expect(isNonNegativeNumber(5.5)).toBe(true);
    expect(isNonNegativeNumber('10.25')).toBe(true);
    expect(isNonNegativeNumber(-5.5)).toBe(false);
  });
});

describe('isNotFutureDate', () => {
  it('should return true for past dates', () => {
    expect(isNotFutureDate('2020-01-01')).toBe(true);
    expect(isNotFutureDate('2023-06-15')).toBe(true);
  });

  it('should return true for today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(isNotFutureDate(today)).toBe(true);
  });

  it('should return false for future dates', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];
    expect(isNotFutureDate(futureDateString)).toBe(false);
  });
});

describe('isNotEmpty', () => {
  it('should return true for non-empty strings', () => {
    expect(isNotEmpty('hello')).toBe(true);
    expect(isNotEmpty('John Doe')).toBe(true);
  });

  it('should return false for empty strings', () => {
    expect(isNotEmpty('')).toBe(false);
    expect(isNotEmpty('   ')).toBe(false);
    expect(isNotEmpty('\t\n')).toBe(false);
  });
});

describe('hasAtLeastOneCount', () => {
  it('should return true when at least one count is greater than 0', () => {
    expect(hasAtLeastOneCount({ farLeft: '5', left: '0' })).toBe(true);
    expect(hasAtLeastOneCount({ farLeft: '0', left: '10' })).toBe(true);
    expect(hasAtLeastOneCount({ farLeft: '5', left: '10' })).toBe(true);
  });

  it('should return false when all counts are 0', () => {
    expect(hasAtLeastOneCount({ farLeft: '0', left: '0' })).toBe(false);
    expect(hasAtLeastOneCount({ farLeft: '', left: '0' })).toBe(false);
  });

  it('should handle invalid number strings', () => {
    expect(hasAtLeastOneCount({ farLeft: 'abc', left: '0' })).toBe(false);
    expect(hasAtLeastOneCount({ farLeft: 'abc', left: '5' })).toBe(true);
  });
});

describe('validateTotal', () => {
  it('should return true when sum matches expected total', () => {
    expect(validateTotal([10, 20, 30], 60)).toBe(true);
    expect(validateTotal([5, 5, 5], 15)).toBe(true);
  });

  it('should return false when sum does not match expected total', () => {
    expect(validateTotal([10, 20, 30], 50)).toBe(false);
    expect(validateTotal([5, 5, 5], 20)).toBe(false);
  });

  it('should respect tolerance parameter', () => {
    expect(validateTotal([10, 20, 30], 62, 2)).toBe(true);
    expect(validateTotal([10, 20, 30], 58, 2)).toBe(true);
    expect(validateTotal([10, 20, 30], 65, 2)).toBe(false);
  });

  it('should handle empty arrays', () => {
    expect(validateTotal([], 0)).toBe(true);
    expect(validateTotal([], 5)).toBe(false);
  });
});
