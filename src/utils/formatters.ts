/**
 * Utility function to format numbers with compact k / M notation
 * (e.g. 999 -> 999, 1000 -> 1k, 1500 -> 1.5k, 1000000 -> 1M)
 */
export const formatCompactNumber = (val: number): string => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  if (val < 1000) {
    return val.toString();
  }
  if (val < 1000000) {
    const k = val / 1000;
    // If it's a whole number or ends with .0, drop decimal
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  const m = val / 1000000;
  return m % 1 === 0 ? `${m}M` : `${m.toFixed(1).replace(/\.0$/, '')}M`;
};
