// Formatting helpers for Indonesian Rupiah. One job: turn numbers into
// the exact strings the site shows, with dot thousand separators.

export function fmtRp(n) {
  const v = Math.round(Number(n) || 0);
  const sign = v < 0 ? '-' : '';
  const digits = String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}Rp${digits}`;
}

export function fmtNum(n) {
  return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function fmtPct(n, digits = 1) {
  return `${(Number(n) || 0).toFixed(digits)}%`;
}

export function fmtDate(iso) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [y, m, d] = String(iso).split('-').map(Number);
  return `${d} ${months[(m || 1) - 1]} ${y}`;
}
