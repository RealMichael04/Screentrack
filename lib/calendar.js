// Fits movies and episodes onto real dates. This is plain arithmetic with no AI,
// so a schedule can never go over a daily limit or past a deadline.
// Dates are "YYYY-MM-DD" strings. Weekdays are 0 (Sunday) to 6 (Saturday).

const DAY_MS = 86_400_000;
const FURTHEST_LOOKAHEAD_DAYS = 365 * 10;

const toMs = (date) => Date.parse(`${date}T00:00:00Z`);

export function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const ms = toMs(value);
  return !Number.isNaN(ms) && new Date(ms).toISOString().slice(0, 10) === value;
}

export const addDays = (date, days) => new Date(toMs(date) + days * DAY_MS).toISOString().slice(0, 10);
export const daysBetween = (from, to) => Math.round((toMs(to) - toMs(from)) / DAY_MS);
export const weekdayOf = (date) => new Date(toMs(date)).getUTCDay();

function viewingDates({ startDate, lastDate, viewingDays, blockedDates = [] }) {
  const blocked = new Set(blockedDates);
  const dates = [];
  for (let date = startDate; date <= lastDate; date = addDays(date, 1)) {
    if (viewingDays.includes(weekdayOf(date)) && !blocked.has(date)) dates.push(date);
  }
  return dates;
}

/** Groups items that must be watched on the same day (such as two-part episodes). */
function toBlocks(items, maxMinutesPerDay) {
  const blocks = [];
  let current = null;
  for (const item of items) {
    if (!current) current = { items: [], minutes: 0 };
    current.items.push(item);
    current.minutes += item.runtimeMinutes;
    if (!item.keepWithNext) {
      blocks.push(current);
      current = null;
    }
  }
  if (current) blocks.push(current);

  // A group too long for one day is split back up rather than made impossible.
  return blocks.flatMap((block) =>
    block.minutes <= maxMinutesPerDay || block.items.length === 1
      ? [block]
      : block.items.map((item) => ({ items: [item], minutes: item.runtimeMinutes }))
  );
}

/** Whether blocks from `from` onward can all fit, packing each day as full as allowed. */
function fitsFrom(blocks, from, capacities, dayIndex) {
  let day = dayIndex;
  let used = 0;
  for (let b = from; b < blocks.length; b += 1) {
    while (day < capacities.length && used + blocks[b].minutes > capacities[day]) {
      day += 1;
      used = 0;
    }
    if (day >= capacities.length) return false;
    used += blocks[b].minutes;
  }
  return true;
}

function capacitiesFor(dates, maxMinutesPerDay, minutesAlreadyUsed) {
  return dates.map((date) => Math.max(0, maxMinutesPerDay - (minutesAlreadyUsed[date] ?? 0)));
}

/** Works out what would make an impossible schedule possible. */
function explainShortfall(blocks, options) {
  const { startDate, deadline, viewingDays, blockedDates, maxMinutesPerDay, minutesAlreadyUsed } = options;
  const suggestions = {};

  const further = viewingDates({
    startDate,
    lastDate: addDays(startDate, FURTHEST_LOOKAHEAD_DAYS),
    viewingDays,
    blockedDates,
  });
  const capacities = capacitiesFor(further, maxMinutesPerDay, minutesAlreadyUsed);
  let day = 0;
  let used = 0;
  for (const block of blocks) {
    while (day < further.length && used + block.minutes > capacities[day]) {
      day += 1;
      used = 0;
    }
    if (day >= further.length) break;
    used += block.minutes;
  }
  if (day < further.length && further[day] > deadline) suggestions.deadline = further[day];

  const dates = viewingDates({ startDate, lastDate: deadline, viewingDays, blockedDates });
  if (dates.length > 0) {
    let low = maxMinutesPerDay + 1;
    let high = 1440;
    const works = (limit) => {
      const limited = toBlocks(blocks.flatMap((b) => b.items), limit);
      return fitsFrom(limited, 0, capacitiesFor(dates, limit, minutesAlreadyUsed), 0);
    };
    if (works(high)) {
      while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (works(middle)) high = middle;
        else low = middle + 1;
      }
      suggestions.maxMinutesPerDay = high;
    }
  }
  return suggestions;
}

/**
 * Spreads items evenly across the available days, keeping them in order.
 *
 * @param {Array<{runtimeMinutes: number, keepWithNext?: boolean, title: string}>} items - In viewing order
 * @param {object} options
 * @param {string} options.startDate
 * @param {string} options.deadline
 * @param {number[]} options.viewingDays
 * @param {number} options.maxMinutesPerDay
 * @param {string[]} [options.blockedDates]
 * @param {Record<string, number>} [options.minutesAlreadyUsed] - Minutes already watched on a date
 * @returns {{ok: true, assignments: object[], viewingDayCount: number}
 *          | {ok: false, code: string, message: string, suggestions: object}}
 */
export function buildCalendar(items, options) {
  const { startDate, deadline, viewingDays, maxMinutesPerDay, blockedDates = [], minutesAlreadyUsed = {} } = options;

  if (items.length === 0) {
    return { ok: true, assignments: [], viewingDayCount: 0 };
  }

  const tooLong = items.find((item) => item.runtimeMinutes > maxMinutesPerDay);
  if (tooLong) {
    return {
      ok: false,
      code: "item_too_long",
      message: `"${tooLong.title}" runs ${tooLong.runtimeMinutes} minutes, which is longer than your daily limit of ${maxMinutesPerDay}.`,
      suggestions: { maxMinutesPerDay: tooLong.runtimeMinutes },
    };
  }

  const dates = viewingDates({ startDate, lastDate: deadline, viewingDays, blockedDates });
  if (dates.length === 0) {
    return {
      ok: false,
      code: "no_days",
      message: "There are no viewing days between those dates.",
      suggestions: {},
    };
  }

  const blocks = toBlocks(items, maxMinutesPerDay);
  const capacities = capacitiesFor(dates, maxMinutesPerDay, minutesAlreadyUsed);
  const context = { ...options, blockedDates, minutesAlreadyUsed };

  if (!fitsFrom(blocks, 0, capacities, 0)) {
    return {
      ok: false,
      code: "not_enough_time",
      message: "That's more than fits before your deadline.",
      suggestions: explainShortfall(blocks, context),
    };
  }

  const assignments = [];
  const totalMinutes = blocks.reduce((sum, block) => sum + block.minutes, 0);
  let scheduled = 0;
  let b = 0;

  for (let day = 0; day < dates.length && b < blocks.length; day += 1) {
    // How many minutes should be done by the end of today to keep a steady pace.
    const paceLine = (totalMinutes * (day + 1)) / dates.length;
    let used = 0;

    while (b < blocks.length) {
      const block = blocks[b];
      if (used + block.minutes > capacities[day]) break;

      const mustTakeToday = !fitsFrom(blocks, b, capacities, day + 1);
      const keepsPace = scheduled + block.minutes / 2 <= paceLine;
      if (!mustTakeToday && !keepsPace) break;

      for (const item of block.items) assignments.push({ ...item, scheduledDate: dates[day] });
      used += block.minutes;
      scheduled += block.minutes;
      b += 1;
    }
  }

  return { ok: true, assignments, viewingDayCount: new Set(assignments.map((a) => a.scheduledDate)).size };
}
