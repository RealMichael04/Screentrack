import "server-only";
import { getDb } from "./db.js";
import {
  EMPTY_PREFERENCES,
  GENRES,
  MAX_FAVORITES,
  MAX_FAVORITE_LENGTH,
  MEDIA,
  PACING,
  RUNTIMES,
  TONES,
} from "./preferenceOptions.js";

export async function getPreferences(userId) {
  const sql = getDb();
  const [row] = await sql`select * from preferences where user_id = ${userId}`;
  if (!row) return { ...EMPTY_PREFERENCES };
  return {
    genres: row.genres,
    favorites: row.favorites,
    tones: row.tones,
    pacing: row.pacing,
    mediaPreference: row.media_preference ?? "both",
    maxRuntime: row.max_runtime,
  };
}

const onlyAllowed = (value, allowed) =>
  Array.isArray(value) ? [...new Set(value)].filter((item) => allowed.includes(item)) : [];

/** Keeps only recognized survey answers, so bad input can't be stored. */
export function cleanPreferences(input) {
  const favorites = Array.isArray(input?.favorites) ? input.favorites : [];
  return {
    genres: onlyAllowed(input?.genres, GENRES),
    tones: onlyAllowed(input?.tones, TONES),
    pacing: PACING.includes(input?.pacing) ? input.pacing : null,
    mediaPreference: MEDIA.some((m) => m.value === input?.mediaPreference) ? input.mediaPreference : "both",
    maxRuntime: RUNTIMES.some((r) => r.value === input?.maxRuntime) ? input.maxRuntime : null,
    favorites: [
      ...new Set(
        favorites
          .filter((item) => typeof item === "string")
          .map((item) => item.trim().slice(0, MAX_FAVORITE_LENGTH))
          .filter(Boolean)
      ),
    ].slice(0, MAX_FAVORITES),
  };
}

export async function savePreferences(userId, input) {
  const p = cleanPreferences(input);
  const sql = getDb();
  await sql`
    insert into preferences (user_id, genres, favorites, tones, pacing, media_preference, max_runtime, updated_at)
    values (${userId}, ${p.genres}, ${p.favorites}, ${p.tones}, ${p.pacing}, ${p.mediaPreference}, ${p.maxRuntime}, now())
    on conflict (user_id) do update set
      genres = excluded.genres,
      favorites = excluded.favorites,
      tones = excluded.tones,
      pacing = excluded.pacing,
      media_preference = excluded.media_preference,
      max_runtime = excluded.max_runtime,
      updated_at = now()
  `;
  return p;
}
