// The choices offered in the taste survey. Shared by the page and the server.

export const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Fantasy",
  "History", "Horror", "Music", "Mystery", "Romance", "Science Fiction", "Thriller", "War", "Western",
];

export const TONES = ["Lighthearted", "Dark & gritty", "Thought-provoking", "Feel-good"];

export const PACING = ["Slow-burn", "Balanced", "Fast-paced"];

export const MEDIA = [
  { value: "movies", label: "Movies" },
  { value: "both", label: "Both" },
  { value: "tv", label: "TV Shows" },
];

export const RUNTIMES = [
  { value: null, label: "Any length" },
  { value: 90, label: "Up to 90 min" },
  { value: 120, label: "Up to 2 hours" },
  { value: 150, label: "Up to 2.5 hours" },
];

export const EMPTY_PREFERENCES = {
  genres: [],
  favorites: [],
  tones: [],
  pacing: null,
  mediaPreference: "both",
  maxRuntime: null,
};

export const MAX_FAVORITES = 12;
export const MAX_FAVORITE_LENGTH = 60;
