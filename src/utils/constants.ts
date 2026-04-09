/**
 * Application-wide constants
 * Centralizes magic numbers and strings for easier maintenance
 */

import { LocationType } from '../types/attendance-types';

// Location constants
export const LOCATIONS = {
  MISSION_COLLEGE_MAIN: 'mission-college-main' as LocationType,
  MISSION_COLLEGE_OVERFLOW: 'mission-college-overflow' as LocationType,
  SILICON_VALLEY_UNIVERSITY: 'silicon-valley-university' as LocationType,
} as const;

export const LOCATION_DISPLAY_NAMES = {
  [LOCATIONS.MISSION_COLLEGE_MAIN]: 'MC Main',
  [LOCATIONS.MISSION_COLLEGE_OVERFLOW]: 'MC Overflow',
  [LOCATIONS.SILICON_VALLEY_UNIVERSITY]: 'SVU',
} as const;

export const LOCATION_FULL_NAMES = {
  [LOCATIONS.MISSION_COLLEGE_MAIN]: 'Mission College Main',
  [LOCATIONS.MISSION_COLLEGE_OVERFLOW]: 'Mission College Overflow',
  [LOCATIONS.SILICON_VALLEY_UNIVERSITY]: 'Silicon Valley University',
} as const;

// UI constants
export const MOBILE_BREAKPOINT = 768;
export const RECORDS_PER_PAGE = 10;
export const MAX_PAGINATION_PAGES = 10;
export const RECENT_WEEKS_COUNT = 10;

// Chart dimensions
export const CHART_HEIGHT = {
  DESKTOP: 400,
  MOBILE: 300,
} as const;

export const CHART_AXIS_HEIGHT = {
  DESKTOP: 30,
  MOBILE: 60,
} as const;

export const CHART_FONT_SIZE = {
  DESKTOP: {
    AXIS: 12,
    LEGEND: 14,
    TOOLTIP: 14,
  },
  MOBILE: {
    AXIS: 10,
    LEGEND: 11,
    TOOLTIP: 12,
  },
} as const;

export const CHART_ICON_SIZE = {
  DESKTOP: 14,
  MOBILE: 10,
} as const;

// Touch target size for accessibility
export const MIN_TOUCH_TARGET = 44;
