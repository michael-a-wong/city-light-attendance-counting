/**
 * Chart utility functions
 * Handles chart configuration and color management
 */

import { CHART_HEIGHT, CHART_AXIS_HEIGHT, CHART_FONT_SIZE, CHART_ICON_SIZE } from './constants';

export interface ChartColors {
  mcMain: string;
  mcOverflow: string;
  svu: string;
  totalAdults: string;
  totalKids: string;
  combinedTotal: string;
  adultTotal: string;
  kids: string;
  grid: string;
  axis: string;
}

/**
 * Get chart colors from CSS variables
 * @returns Object containing all chart colors
 */
export const getChartColors = (): ChartColors => {
  const root = document.documentElement;
  const style = getComputedStyle(root);

  return {
    mcMain: style.getPropertyValue('--chart-mc-main').trim(),
    mcOverflow: style.getPropertyValue('--chart-mc-overflow').trim(),
    svu: style.getPropertyValue('--chart-svu').trim(),
    totalAdults: style.getPropertyValue('--chart-total-adults').trim(),
    totalKids: style.getPropertyValue('--chart-total-kids').trim(),
    combinedTotal: style.getPropertyValue('--chart-combined').trim(),
    adultTotal: style.getPropertyValue('--chart-total-adults').trim(),
    kids: style.getPropertyValue('--chart-total-kids').trim(),
    grid: style.getPropertyValue('--chart-grid').trim(),
    axis: style.getPropertyValue('--chart-axis').trim(),
  };
};

/**
 * Get chart height based on device type
 * @param isMobile - Whether device is mobile
 * @returns Chart height in pixels
 */
export const getChartHeight = (isMobile: boolean): number => {
  return isMobile ? CHART_HEIGHT.MOBILE : CHART_HEIGHT.DESKTOP;
};

/**
 * Get X-axis configuration based on device type
 * @param isMobile - Whether device is mobile
 * @returns Configuration object for X-axis
 */
export const getXAxisConfig = (isMobile: boolean) => ({
  angle: isMobile ? -45 : 0,
  textAnchor: isMobile ? 'end' as const : 'middle' as const,
  height: isMobile ? CHART_AXIS_HEIGHT.MOBILE : CHART_AXIS_HEIGHT.DESKTOP,
  fontSize: isMobile ? CHART_FONT_SIZE.MOBILE.AXIS : CHART_FONT_SIZE.DESKTOP.AXIS,
});

/**
 * Get Y-axis configuration based on device type
 * @param isMobile - Whether device is mobile
 * @returns Configuration object for Y-axis
 */
export const getYAxisConfig = (isMobile: boolean) => ({
  fontSize: isMobile ? CHART_FONT_SIZE.MOBILE.AXIS : CHART_FONT_SIZE.DESKTOP.AXIS,
});

/**
 * Get tooltip configuration based on device type and theme
 * @param isMobile - Whether device is mobile
 * @param isDarkMode - Whether dark mode is enabled
 * @param gridColor - Grid color from CSS
 * @returns Configuration object for tooltip
 */
export const getTooltipConfig = (isMobile: boolean, isDarkMode: boolean, gridColor: string) => ({
  contentStyle: {
    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
    border: `1px solid ${gridColor}`,
    fontSize: isMobile ? `${CHART_FONT_SIZE.MOBILE.TOOLTIP}px` : `${CHART_FONT_SIZE.DESKTOP.TOOLTIP}px`,
  },
});

/**
 * Get legend configuration based on device type
 * @param isMobile - Whether device is mobile
 * @returns Configuration object for legend
 */
export const getLegendConfig = (isMobile: boolean) => ({
  wrapperStyle: {
    fontSize: isMobile ? `${CHART_FONT_SIZE.MOBILE.LEGEND}px` : `${CHART_FONT_SIZE.DESKTOP.LEGEND}px`,
  },
  iconSize: isMobile ? CHART_ICON_SIZE.MOBILE : CHART_ICON_SIZE.DESKTOP,
});
