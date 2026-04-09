/**
 * Summary generation utilities
 * Creates formatted text summaries for attendance data
 */

import { formatLongDate } from './dateHelpers';
import { formatLocationName, formatLocationFullName, LocationFilter } from './locationHelpers';

interface WeeklySummaryData {
  date: string;
  totalAdults: number;
  totalKids: number;
  totalCombined: number;
  locationBreakdown?: Record<string, { adults: number; kids: number; count: number }>;
}

/**
 * Generate formatted weekly summary text for copying to clipboard
 * @param summary - Weekly summary data
 * @param locationFilter - Current location filter
 * @returns Formatted summary text
 */
export const generateWeeklySummaryText = (
  summary: WeeklySummaryData,
  locationFilter: LocationFilter
): string => {
  const formattedDate = formatLongDate(summary.date);

  let text = `Weekly Attendance Summary - ${formattedDate}\n`;
  text += `${'='.repeat(60)}\n\n`;

  if (locationFilter === 'all') {
    text += `Total Adults: ${summary.totalAdults}\n`;
    text += `Total Kids: ${summary.totalKids}\n`;
    text += `Total Combined: ${summary.totalCombined}\n\n`;

    if (summary.locationBreakdown) {
      text += `Breakdown by Location:\n`;
      text += `${'-'.repeat(40)}\n`;
      Object.entries(summary.locationBreakdown).forEach(([loc, data]) => {
        const locationName = formatLocationName(loc);
        text += `${locationName}:\n`;
        text += `  Adults: ${data.adults}\n`;
        text += `  Kids: ${data.kids}\n`;
        text += `  Total: ${data.adults + data.kids}\n\n`;
      });
    }
  } else {
    const locationName = formatLocationFullName(locationFilter);
    text += `Location: ${locationName}\n\n`;
    text += `Total Adults: ${summary.totalAdults}\n`;
    text += `Total Kids: ${summary.totalKids}\n`;
    text += `Total Combined: ${summary.totalCombined}\n`;
  }

  return text;
};

/**
 * Generate formatted attendance summary for form data
 * @param date - Date string (YYYY-MM-DD)
 * @param location - Location type
 * @param totalAdults - Total adults count
 * @param totalKids - Total kids count
 * @returns Formatted summary text
 */
export const generateAttendanceSummaryText = (
  date: string,
  location: string,
  totalAdults: number,
  totalKids: number
): string => {
  const formattedDate = formatLongDate(date);
  const locationName = formatLocationFullName(location);
  const totalCombined = totalAdults + totalKids;

  let text = `Weekly Attendance Summary - ${formattedDate}\n`;
  text += `${'='.repeat(60)}\n\n`;
  text += `Location: ${locationName}\n\n`;
  text += `Total Adults: ${totalAdults}\n`;
  text += `Total Kids: ${totalKids}\n`;
  text += `Total Combined: ${totalCombined}\n`;

  return text;
};

/**
 * Copy text to clipboard with error handling
 * @param text - Text to copy
 * @returns Promise that resolves to true if successful
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};
