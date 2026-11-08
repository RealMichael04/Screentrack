import "server-only";

// The source of truth for titles, runtimes, release dates and episode lists.
// The AI only ever chooses from what these functions return.

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w342";
const ONE_DAY = 60 * 60 * 24;

async function tmdb(path, params = {}) {
  if (!process.env.TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY is not set.");
  }

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", process.env.TMDB_API_KEY);
  url.searchParams.set("language", "en-US");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  // Errors name only the path, because the full URL contains the API key.
  let response;
  try {
    response = await fetch(url, {
      next: { revalidate: ONE_DAY },
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new Error(`Couldn't reach TMDB (${path}).`);
  }
  if (!response.ok) {
    throw new Error(`TMDB request failed (${path}, status ${response.status}).`);
  }
  return response.json();
}

const posterUrl = (path) => (path ? `${IMAGE_URL}${path}` : null);
// TMDB uses 0 or an empty string for "unknown". Never treat those as real values.
const positiveOrNull = (value) => (Number.isFinite(value) && value > 0 ? value : null);
const dateOrNull = (value) => value || null;

function toMovieSummary(movie) {
  return {
    tmdbId: movie.id,
    mediaType: "movie",
    title: movie.title,
    overview: movie.overview || "",
    releaseDate: dateOrNull(movie.release_date),
    posterUrl: posterUrl(movie.poster_path),
    genreIds: movie.genre_ids ?? movie.genres?.map((g) => g.id) ?? [],
    rating: movie.vote_average ?? null,
  };
}

function toTvSummary(show) {
  return {
    tmdbId: show.id,
    mediaType: "tv",
    title: show.name,
    overview: show.overview || "",
    releaseDate: dateOrNull(show.first_air_date),
    posterUrl: posterUrl(show.poster_path),
    genreIds: show.genre_ids ?? show.genres?.map((g) => g.id) ?? [],
    rating: show.vote_average ?? null,
  };
}

/** The genres TMDB uses for "movie" or "tv", as [{ id, name }]. */
export async function getGenres(mediaType) {
  const { genres } = await tmdb(`/genre/${mediaType}/list`);
  return genres;
}

/** Looks up a topic such as "chess" and returns its TMDB keyword ID, or null. */
export async function findKeywordId(keyword) {
  const { results } = await tmdb("/search/keyword", { query: keyword });
  return results[0]?.id ?? null;
}

/** Titles TMDB recommends to fans of the given movie or show. */
export async function getSimilarTitles(mediaType, tmdbId) {
  const { results } = await tmdb(`/${mediaType}/${tmdbId}/recommendations`);
  return results.map(mediaType === "movie" ? toMovieSummary : toTvSummary);
}

// In TMDB filters a comma means "all of these" and a pipe means "any of these".
const joinIds = (ids, mode = "all") => ids?.join(mode === "any" ? "|" : ",");

export async function searchMovies(query, page = 1) {
  const { results } = await tmdb("/search/movie", { query, page, include_adult: false });
  return results.map(toMovieSummary);
}

export async function searchTv(query, page = 1) {
  const { results } = await tmdb("/search/tv", { query, page, include_adult: false });
  return results.map(toTvSummary);
}

/**
 * Finds movies by filters.
 * @param {{genreIds?: number[], genreMode?: "all"|"any", keywordIds?: number[],
 *          maxRuntime?: number, minRuntime?: number,
 *          releasedAfter?: string, releasedBefore?: string, page?: number}} filters
 */
export async function discoverMovies(filters = {}) {
  const { results } = await tmdb("/discover/movie", {
    include_adult: false,
    sort_by: "popularity.desc",
    "vote_count.gte": 100,
    with_genres: joinIds(filters.genreIds, filters.genreMode),
    with_keywords: joinIds(filters.keywordIds, "any"),
    "with_runtime.lte": filters.maxRuntime,
    "with_runtime.gte": filters.minRuntime,
    "primary_release_date.gte": filters.releasedAfter,
    "primary_release_date.lte": filters.releasedBefore,
    page: filters.page ?? 1,
  });
  return results.map(toMovieSummary);
}

/**
 * Finds TV shows by filters.
 * @param {{genreIds?: number[], genreMode?: "all"|"any", keywordIds?: number[],
 *          maxRuntime?: number, minRuntime?: number,
 *          releasedAfter?: string, releasedBefore?: string, page?: number}} filters
 */
export async function discoverTv(filters = {}) {
  const { results } = await tmdb("/discover/tv", {
    include_adult: false,
    sort_by: "popularity.desc",
    "vote_count.gte": 100,
    with_genres: joinIds(filters.genreIds, filters.genreMode),
    with_keywords: joinIds(filters.keywordIds, "any"),
    "with_runtime.lte": filters.maxRuntime,
    "with_runtime.gte": filters.minRuntime,
    "first_air_date.gte": filters.releasedAfter,
    "first_air_date.lte": filters.releasedBefore,
    page: filters.page ?? 1,
  });
  return results.map(toTvSummary);
}

/** Full movie details, including its runtime in minutes (null if TMDB has none). */
export async function getMovie(tmdbId) {
  const movie = await tmdb(`/movie/${tmdbId}`);
  return { ...toMovieSummary(movie), runtimeMinutes: positiveOrNull(movie.runtime) };
}

/** Full show details and its list of seasons (specials are season 0 and left out). */
export async function getTvShow(tmdbId) {
  const show = await tmdb(`/tv/${tmdbId}`);
  return {
    ...toTvSummary(show),
    status: show.status,
    typicalEpisodeMinutes:
      positiveOrNull(show.episode_run_time?.[0]) ?? positiveOrNull(show.last_episode_to_air?.runtime),
    seasons: (show.seasons ?? [])
      .filter((s) => s.season_number > 0)
      .map((s) => ({
        seasonNumber: s.season_number,
        name: s.name,
        episodeCount: s.episode_count,
        airDate: dateOrNull(s.air_date),
      })),
  };
}

/** Every episode in one season. `runtimeMinutes` is null if TMDB has no runtime for it. */
export async function getSeasonEpisodes(tvId, seasonNumber) {
  const season = await tmdb(`/tv/${tvId}/season/${seasonNumber}`);
  return (season.episodes ?? []).map((episode) => ({
    tmdbId: episode.id,
    mediaType: "episode",
    showId: tvId,
    title: episode.name,
    seasonNumber: episode.season_number,
    episodeNumber: episode.episode_number,
    releaseDate: dateOrNull(episode.air_date),
    runtimeMinutes: positiveOrNull(episode.runtime),
  }));
}

/** Finds movie franchises, such as "Star Wars Collection". */
export async function searchFranchises(query) {
  const { results } = await tmdb("/search/collection", { query });
  return results.map((collection) => ({
    tmdbId: collection.id,
    mediaType: "collection",
    title: collection.name,
    overview: collection.overview || "",
    posterUrl: posterUrl(collection.poster_path),
  }));
}

/** A franchise and its movies with runtimes, in release order. */
export async function getFranchise(collectionId) {
  const collection = await tmdb(`/collection/${collectionId}`);
  const movies = await Promise.all((collection.parts ?? []).map((part) => getMovie(part.id)));
  movies.sort((a, b) => {
    // Unannounced dates sort last.
    if (!a.releaseDate) return 1;
    if (!b.releaseDate) return -1;
    return a.releaseDate.localeCompare(b.releaseDate);
  });
  return {
    tmdbId: collection.id,
    mediaType: "collection",
    title: collection.name,
    overview: collection.overview || "",
    posterUrl: posterUrl(collection.poster_path),
    movies,
  };
}
