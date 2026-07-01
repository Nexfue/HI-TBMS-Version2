// Pure date helpers used by the flight search form.
// `dateStr` is always an ISO date-only string, e.g. "2026-07-04".

export const todayISO = () => new Date().toISOString().split('T')[0];

export function getDayPart(dateStr) {
  if (!dateStr) return '';
  return String(Number(dateStr.split('-')[2]));
}

export function getMonthYearPart(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const month = new Date(y, m - 1, d).toLocaleString('en-GB', { month: 'short' });
  return `${month}'${String(y).slice(2)}`;
}

export function getDayName(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleString('en-GB', { weekday: 'long' });
}
