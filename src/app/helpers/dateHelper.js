export function toLocalDate(date, timeZone = 'Europe/Belgrade') {
  return new Date(new Date(date).toLocaleString('en-US', { timeZone }));
}
