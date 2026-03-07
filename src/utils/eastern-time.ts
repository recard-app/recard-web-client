export function getEasternYear(): number {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
  ).getFullYear();
}
