export const fmtMin = (m: number) => {
  const r = Math.round(m);
  if (r < 60) return `${r}m`;
  const mins = r % 60;
  return `${Math.floor(r / 60)}h${mins ? ` ${mins}m` : ''}`;
};

export const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
