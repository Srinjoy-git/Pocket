/** Light mode 6:00–17:59, dark mode 18:00–5:59 */
export function getThemeByTime(date = new Date()) {
  const hour = date.getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

export function msUntilNextThemeBoundary(date = new Date()) {
  const next = new Date(date);
  const hour = date.getHours();
  if (hour >= 6 && hour < 18) {
    next.setHours(18, 0, 0, 0);
  } else if (hour >= 18) {
    next.setDate(next.getDate() + 1);
    next.setHours(6, 0, 0, 0);
  } else {
    next.setHours(6, 0, 0, 0);
  }
  return Math.max(next.getTime() - date.getTime(), 1000);
}
