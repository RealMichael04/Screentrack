-- ReelGuide tables. Safe to run more than once: existing tables are left alone.
-- user_id is the ID of the signed-in user from Neon Auth.

CREATE TABLE IF NOT EXISTS preferences (
  user_id          text PRIMARY KEY,
  genres           text[] NOT NULL DEFAULT '{}',
  favorites        text[] NOT NULL DEFAULT '{}',
  tones            text[] NOT NULL DEFAULT '{}',
  pacing           text,
  media_preference text CHECK (media_preference IN ('movies', 'tv', 'both')),
  max_runtime      integer CHECK (max_runtime > 0),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schedules (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             text NOT NULL,
  title               text NOT NULL,
  media_type          text NOT NULL CHECK (media_type IN ('collection', 'tv')),
  tmdb_id             integer NOT NULL,
  start_date          date NOT NULL,
  deadline            date NOT NULL,
  viewing_days        smallint[] NOT NULL,
  max_minutes_per_day integer NOT NULL CHECK (max_minutes_per_day > 0),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CHECK (deadline >= start_date)
);

CREATE INDEX IF NOT EXISTS schedules_user_id_idx ON schedules (user_id);

CREATE TABLE IF NOT EXISTS schedule_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id     uuid NOT NULL REFERENCES schedules (id) ON DELETE CASCADE,
  position        integer NOT NULL,
  media_type      text NOT NULL CHECK (media_type IN ('movie', 'episode')),
  tmdb_id         integer NOT NULL,
  title           text NOT NULL,
  season_number   integer,
  episode_number  integer,
  runtime_minutes integer NOT NULL CHECK (runtime_minutes > 0),
  release_date    date,
  scheduled_date  date NOT NULL,
  watched_at      timestamptz,
  UNIQUE (schedule_id, position)
);

CREATE INDEX IF NOT EXISTS schedule_items_date_idx ON schedule_items (schedule_id, scheduled_date);

-- Counts AI requests per person per day, to protect the OpenAI budget.
CREATE TABLE IF NOT EXISTS ai_usage (
  user_id text NOT NULL,
  day     date NOT NULL DEFAULT current_date,
  kind    text NOT NULL,
  count   integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day, kind)
);

-- Added for the scheduler.
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS blocked_dates date[] NOT NULL DEFAULT '{}';
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS viewing_order text NOT NULL DEFAULT 'release';
ALTER TABLE schedules ADD COLUMN IF NOT EXISTS skipped_count integer NOT NULL DEFAULT 0;
ALTER TABLE schedule_items ADD COLUMN IF NOT EXISTS runtime_estimated boolean NOT NULL DEFAULT false;
ALTER TABLE schedule_items ADD COLUMN IF NOT EXISTS keep_with_next boolean NOT NULL DEFAULT false;
