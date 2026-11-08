import "server-only";
import { ApiError } from "./apiError.js";
import { getDb } from "./db.js";
import { getMovie, getSeasonEpisodes, getTvShow, searchMovies, searchTv } from "./tmdb.js";

const STATUSES = ["watchlist", "watching", "watched"];
const MAX_REVIEW_LENGTH = 2000;
const MAX_EPISODES_PER_UPDATE = 200;
const HISTORY_LIMIT = 100;

function assertMediaType(type) {
  if (type !== "movie" && type !== "tv") throw new ApiError(404, "We couldn't find that title.");
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(404, "We couldn't find that title.");
  return id;
}

export async function searchTitles(query) {
  const [movies, shows] = await Promise.all([searchMovies(query), searchTv(query)]);
  // Interleave so neither movies nor shows push the other off the list.
  const merged = [];
  for (let i = 0; i < 8; i += 1) {
    if (movies[i]) merged.push(movies[i]);
    if (shows[i]) merged.push(shows[i]);
  }
  return {
    results: merged.map((item) => ({
      mediaType: item.mediaType,
      tmdbId: item.tmdbId,
      title: item.title,
      posterUrl: item.posterUrl,
      year: item.releaseDate ? Number(item.releaseDate.slice(0, 4)) : null,
    })),
  };
}

const toLibraryItem = (row) => ({
  mediaType: row.media_type,
  tmdbId: row.tmdb_id,
  title: row.title,
  posterUrl: row.poster_url,
  year: row.release_date ? Number(row.release_date.slice(0, 4)) : null,
  status: row.status,
  rating: row.rating,
  review: row.review ?? "",
  episodeTotal: row.episode_total,
  watchedEpisodes: row.watched_episodes ?? 0,
  lastSeason: row.last_season ?? null,
  lastEpisode: row.last_episode ?? null,
});

export async function getLibrary(userId) {
  const sql = getDb();
  const rows = await sql`
    select t.media_type, t.tmdb_id, t.title, t.poster_url, t.release_date::text, t.status,
           t.rating::float as rating, t.review, t.episode_total,
           coalesce(e.watched, 0)::int as watched_episodes, last.season_number as last_season,
           last.episode_number as last_episode
    from tracked_titles t
    left join lateral (
      select count(*) as watched from tracked_episodes x
      where t.media_type = 'tv' and x.user_id = t.user_id and x.show_id = t.tmdb_id
    ) e on true
    left join lateral (
      select season_number, episode_number from tracked_episodes x
      where t.media_type = 'tv' and x.user_id = t.user_id and x.show_id = t.tmdb_id
      order by season_number desc, episode_number desc
      limit 1
    ) last on true
    where t.user_id = ${userId}
    order by t.updated_at desc
  `;
  return rows.map(toLibraryItem);
}

/** Adds a title, or changes its status if it's already in the library. Details come from TMDB. */
export async function addTitle(userId, input) {
  const mediaType = input?.mediaType;
  assertMediaType(mediaType);
  const tmdbId = parseId(input?.tmdbId);
  const status = STATUSES.includes(input?.status) ? input.status : "watchlist";

  const details = mediaType === "movie" ? await getMovie(tmdbId) : await getTvShow(tmdbId);
  const collectionId = mediaType === "movie" ? details.collectionId : null;
  const episodeTotal = mediaType === "tv" ? details.totalEpisodes : null;

  const sql = getDb();
  await sql`
    insert into tracked_titles
      (user_id, media_type, tmdb_id, title, poster_url, release_date, collection_id, episode_total, status, watched_at)
    values
      (${userId}, ${mediaType}, ${tmdbId}, ${details.title}, ${details.posterUrl}, ${details.releaseDate},
       ${collectionId}, ${episodeTotal}, ${status}, case when ${status}::text = 'watched' then now() end)
    on conflict (user_id, media_type, tmdb_id) do update set
      status = excluded.status,
      watched_at = case
        when excluded.status <> 'watched' then null
        else coalesce(tracked_titles.watched_at, now())
      end,
      updated_at = now()
  `;
  return getTitle(userId, mediaType, tmdbId);
}

async function loadRow(userId, mediaType, tmdbId) {
  const sql = getDb();
  const [row] = await sql`
    select t.media_type, t.tmdb_id, t.title, t.poster_url, t.release_date::text, t.status,
           t.rating::float as rating, t.review, t.episode_total,
           (select count(*)::int from tracked_episodes x
             where t.media_type = 'tv' and x.user_id = t.user_id and x.show_id = t.tmdb_id) as watched_episodes
    from tracked_titles t
    where t.user_id = ${userId} and t.media_type = ${mediaType} and t.tmdb_id = ${tmdbId}
  `;
  return row ?? null;
}

/** One title from the library with its seasons, or null if it isn't in the library. */
export async function getTitle(userId, type, rawId) {
  assertMediaType(type);
  const tmdbId = parseId(rawId);
  const row = await loadRow(userId, type, tmdbId);
  if (!row) return null;

  const item = toLibraryItem(row);
  if (type !== "tv") return item;

  const show = await getTvShow(tmdbId);
  if (show.totalEpisodes && show.totalEpisodes !== row.episode_total) {
    const sql = getDb();
    await sql`
      update tracked_titles set episode_total = ${show.totalEpisodes}
      where user_id = ${userId} and media_type = 'tv' and tmdb_id = ${tmdbId}
    `;
    item.episodeTotal = show.totalEpisodes;
  }
  return { ...item, showStatus: show.status, seasons: show.seasons };
}

export async function updateTitle(userId, type, rawId, input) {
  assertMediaType(type);
  const tmdbId = parseId(rawId);

  const row = await loadRow(userId, type, tmdbId);
  if (!row) throw new ApiError(404, "That title isn't in your library.");

  let { status, rating } = row;
  let review = row.review;

  if (input?.status !== undefined) {
    if (!STATUSES.includes(input.status)) throw new ApiError(400, "That status isn't valid.");
    status = input.status;
  }
  if (input?.rating !== undefined) {
    const valid = input.rating === null || (input.rating >= 0.5 && input.rating <= 5 && (input.rating * 2) % 1 === 0);
    if (!valid) throw new ApiError(400, "Ratings go from half a star to five stars.");
    rating = input.rating;
  }
  if (input?.review !== undefined) {
    if (typeof input.review !== "string") throw new ApiError(400, "That review isn't valid.");
    if (input.review.length > MAX_REVIEW_LENGTH) {
      throw new ApiError(400, `Please keep your review under ${MAX_REVIEW_LENGTH} characters.`);
    }
    review = input.review.trim() || null;
  }

  const sql = getDb();
  await sql`
    update tracked_titles set
      status = ${status}, rating = ${rating}, review = ${review}, updated_at = now(),
      watched_at = case when ${status}::text <> 'watched' then null else coalesce(watched_at, now()) end
    where user_id = ${userId} and media_type = ${type} and tmdb_id = ${tmdbId}
  `;
  return toLibraryItem(await loadRow(userId, type, tmdbId));
}

export async function removeTitle(userId, type, rawId) {
  assertMediaType(type);
  const tmdbId = parseId(rawId);
  const sql = getDb();
  const [titleRows] = await sql.transaction([
    sql`delete from tracked_titles where user_id = ${userId} and media_type = ${type} and tmdb_id = ${tmdbId} returning tmdb_id`,
    sql`delete from tracked_episodes where user_id = ${userId} and show_id = ${tmdbId} and ${type}::text = 'tv'`,
  ]);
  return titleRows.length > 0;
}

/* ---------- Episodes ---------- */

export async function getSeasonProgress(userId, type, rawId, rawSeason) {
  if (type !== "tv") throw new ApiError(404, "We couldn't find that show.");
  const tmdbId = parseId(rawId);
  const seasonNumber = Number(rawSeason);
  if (!Number.isInteger(seasonNumber) || seasonNumber < 1) throw new ApiError(404, "We couldn't find that season.");
  if (!(await loadRow(userId, "tv", tmdbId))) throw new ApiError(404, "That show isn't in your library.");

  const sql = getDb();
  const [episodes, watched] = await Promise.all([
    getSeasonEpisodes(tmdbId, seasonNumber),
    sql`
      select episode_number from tracked_episodes
      where user_id = ${userId} and show_id = ${tmdbId} and season_number = ${seasonNumber}
    `,
  ]);
  const watchedSet = new Set(watched.map((r) => r.episode_number));
  return {
    seasonNumber,
    episodes: episodes.map((e) => ({
      seasonNumber: e.seasonNumber,
      episodeNumber: e.episodeNumber,
      title: e.title,
      releaseDate: e.releaseDate,
      runtimeMinutes: e.runtimeMinutes,
      watched: watchedSet.has(e.episodeNumber),
    })),
  };
}

/** Checks episodes on or off, and keeps the show's status in step with its progress. */
export async function setEpisodesWatched(userId, type, rawId, input) {
  if (type !== "tv") throw new ApiError(404, "We couldn't find that show.");
  const tmdbId = parseId(rawId);

  const list = Array.isArray(input?.episodes) ? input.episodes : [];
  const valid = list.every((e) => Number.isInteger(e?.seasonNumber) && e.seasonNumber > 0 && Number.isInteger(e?.episodeNumber) && e.episodeNumber > 0);
  if (!valid || list.length === 0 || list.length > MAX_EPISODES_PER_UPDATE || typeof input?.watched !== "boolean") {
    throw new ApiError(400, "That didn't look right. Please try again.");
  }

  const row = await loadRow(userId, "tv", tmdbId);
  if (!row) throw new ApiError(404, "That show isn't in your library.");

  const seasons = list.map((e) => e.seasonNumber);
  const numbers = list.map((e) => e.episodeNumber);
  const sql = getDb();

  if (input.watched) {
    await sql`
      insert into tracked_episodes (user_id, show_id, season_number, episode_number)
      select ${userId}, ${tmdbId}, * from unnest(${seasons}::int[], ${numbers}::int[])
      on conflict do nothing
    `;
  } else {
    await sql`
      delete from tracked_episodes e
      using unnest(${seasons}::int[], ${numbers}::int[]) as v(season_number, episode_number)
      where e.user_id = ${userId} and e.show_id = ${tmdbId}
        and e.season_number = v.season_number and e.episode_number = v.episode_number
    `;
  }

  const [{ count }] = await sql`
    select count(*)::int as count from tracked_episodes where user_id = ${userId} and show_id = ${tmdbId}
  `;

  const show = await getTvShow(tmdbId);
  const finished = ["Ended", "Canceled"].includes(show.status) && show.totalEpisodes && count >= show.totalEpisodes;
  let status = row.status;
  if (finished) status = "watched";
  else if (count > 0 && status !== "watching") status = "watching";

  if (status !== row.status) {
    await sql`
      update tracked_titles set
        status = ${status}, updated_at = now(),
        watched_at = case when ${status}::text = 'watched' then now() end
      where user_id = ${userId} and media_type = 'tv' and tmdb_id = ${tmdbId}
    `;
  } else {
    await sql`update tracked_titles set updated_at = now() where user_id = ${userId} and media_type = 'tv' and tmdb_id = ${tmdbId}`;
  }
  return { status, watchedEpisodes: count };
}

/* ---------- History ---------- */

export async function getHistory(userId) {
  const sql = getDb();
  const rows = await sql`
    (select 'title' as kind, media_type, tmdb_id, title as name, poster_url, null::int as season, null::int as episode,
            null::text as episode_title, watched_at as happened_at, rating::float as rating
     from tracked_titles
     where user_id = ${userId} and status = 'watched' and watched_at is not null)
    union all
    (select 'episode', 'tv', t.tmdb_id, t.title, t.poster_url, e.season_number, e.episode_number,
            null, e.watched_at, null
     from tracked_episodes e
     join tracked_titles t
       on t.user_id = e.user_id and t.media_type = 'tv' and t.tmdb_id = e.show_id
     where e.user_id = ${userId})
    union all
    (select 'schedule', i.media_type, s.tmdb_id,
            case when i.media_type = 'movie' then i.title else s.title end, null,
            i.season_number, i.episode_number, null, i.watched_at, null
     from schedule_items i
     join schedules s on s.id = i.schedule_id
     where s.user_id = ${userId} and i.watched_at is not null)
    order by happened_at desc
    limit ${HISTORY_LIMIT}
  `;
  return rows.map((r) => ({
    kind: r.kind,
    mediaType: r.media_type,
    tmdbId: r.tmdb_id,
    title: r.name,
    posterUrl: r.poster_url,
    seasonNumber: r.season,
    episodeNumber: r.episode,
    happenedAt: new Date(r.happened_at).toISOString(),
    rating: r.rating,
  }));
}
