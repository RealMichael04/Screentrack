// Display helpers shared by the schedule pages.

export const WEEKDAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

/** Today's date on this person's device, as YYYY-MM-DD. */
export function localToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function addDaysTo(date, days) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

export function formatDate(date, options = { weekday: "short", month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

/** Turns the server's "here's what would fit" numbers into a readable line. */
export function describeSuggestions(suggestions) {
  if (!suggestions) return "";
  const options = [];
  if (suggestions.deadline) options.push(`move your deadline to ${formatDate(suggestions.deadline)}`);
  if (suggestions.maxMinutesPerDay) options.push(`raise your daily limit to ${formatMinutes(suggestions.maxMinutesPerDay)}`);
  return options.length > 0 ? `To make it fit, ${options.join(" or ")}.` : "";
}
