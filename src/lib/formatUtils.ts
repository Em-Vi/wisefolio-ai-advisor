
/**
 * Formats a number as currency
 * @param value The value to format
 * @param abbreviate Whether to abbreviate large numbers (e.g., $1.2B)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, abbreviate = false): string {
  if (abbreviate && Math.abs(value) >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  } else if (abbreviate && Math.abs(value) >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  } else if (abbreviate && Math.abs(value) >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a number with comma separators
 * @param value The value to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(1)}B`;
  } else if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Formats a percentage
 * @param value The value to format (e.g., 0.15 for 15%)
 * @returns Formatted percentage string
 */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
