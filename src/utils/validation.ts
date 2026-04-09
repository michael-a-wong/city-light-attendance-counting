/**
 * Validates that a number is non-negative
 */
export const isNonNegativeNumber = (value: string | number): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num >= 0;
};

/**
 * Validates that a date is not in the future
 */
export const isNotFutureDate = (dateString: string): boolean => {
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return inputDate <= today;
};

/**
 * Validates that a string is not empty
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validates that at least one section has a count
 */
export const hasAtLeastOneCount = (counts: Record<string, string>): boolean => {
  return Object.values(counts).some(value => {
    const num = parseInt(value);
    return !isNaN(num) && num > 0;
  });
};

/**
 * Validates total matches sum of parts
 */
export const validateTotal = (
  parts: number[],
  expectedTotal: number,
  tolerance: number = 0
): boolean => {
  const sum = parts.reduce((acc, val) => acc + val, 0);
  return Math.abs(sum - expectedTotal) <= tolerance;
};
