/**
 * Date utility functions
 * Handles date parsing and formatting to avoid timezone issues
 */

/**
 * Parse date string as local date (not UTC) to avoid timezone issues
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object in local timezone
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

/**
 * Format date for display in long format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "Sunday, January 1, 2023")
 */
export const formatLongDate = (dateString: string): string => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date for display in short format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "Jan 1")
 */
export const formatShortDate = (dateString: string): string => {
  return parseLocalDate(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date for display in medium format
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., "January 1, 2023")
 */
export const formatMediumDate = (dateString: string): string => {
  return parseLocalDate(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Get unique dates from records, sorted by newest first
 * @param dates - Array of date strings
 * @returns Sorted array of unique date strings
 */
export const getUniqueSortedDates = (dates: string[]): string[] => {
  return [...new Set(dates.map(d => d.split('T')[0]))]
    .sort((a, b) => parseLocalDate(b).getTime() - parseLocalDate(a).getTime());
};

/**
 * Sort dates in ascending order (oldest first)
 * @param dates - Array of date strings
 * @returns Sorted array
 */
export const sortDatesAscending = (dates: string[]): string[] => {
  return [...dates].sort((a, b) =>
    parseLocalDate(a).getTime() - parseLocalDate(b).getTime()
  );
};

/**
 * Sort dates in descending order (newest first)
 * @param dates - Array of date strings
 * @returns Sorted array
 */
export const sortDatesDescending = (dates: string[]): string[] => {
  return [...dates].sort((a, b) =>
    parseLocalDate(b).getTime() - parseLocalDate(a).getTime()
  );
};
