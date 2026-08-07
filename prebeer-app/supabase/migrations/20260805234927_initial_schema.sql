-- ==========================================================
-- PRE-BEER LEAGUE PICK 'EM
-- Migration 001 (Part 1 - Core)
-- ==========================================================

create extension if not exists pgcrypto;

-- ==========================================================
-- PROFILES
-- ==========================================================

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null,
    avatar_url text,
    is_commissioner boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

comment on table public.profiles is
'Application profiles linked to Supabase Authentication.';

-- ==========================================================
-- SEASONS
-- ==========================================================

create table if not exists public.seasons (
    season_id integer generated always as identity primary key,
    season_name text not null unique,
    start_year integer not null,
    end_year integer not null,
    is_current boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint chk_season_years check (end_year = start_year + 1)
);

-- ==========================================================
-- CLUBS
-- ==========================================================

create table if not exists public.clubs (
    club_id integer primary key,
    club_name text not null,
    short_name text,
    abbreviation text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index if not exists idx_clubs_name
    on public.clubs (club_name);

-- ==========================================================
-- MEMBERS
-- ==========================================================

create table if not exists public.members (
    member_id integer generated always as identity primary key,
    profile_id uuid unique
        references public.profiles(id)
        on delete set null,

    first_name text not null,
    last_name text not null,
    display_name text not null,
    email text,
    team_name text not null,
    active boolean not null default true,

    joined_date date default current_date,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index if not exists idx_members_team_name
    on public.members(team_name);

create unique index if not exists idx_members_email
    on public.members(email)
    where email is not null;

comment on table public.members is
'League members participating in Pre-Beer League Pick ''Em.';

-- ==========================================================
-- END OF PART 1
-- ==========================================================
-- ==========================================================
-- PRE-BEER LEAGUE PICK 'EM
-- Migration 001 (Part 2 - Competition)
-- ==========================================================

-- ==========================================================
-- PLAYERS
-- ==========================================================

create table if not exists public.players (
    player_id integer primary key,
    club_id integer not null
        references public.clubs(club_id)
        on delete restrict,

    first_name text not null,
    last_name text not null,
    web_name text not null,

    position text not null,
    active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint chk_player_position
        check (position in ('GK','DEF','MID','FWD'))
);

create index if not exists idx_players_club
    on public.players(club_id);

create index if not exists idx_players_name
    on public.players(web_name);

-- ==========================================================
-- MATCHWEEKS
-- ==========================================================

create table if not exists public.matchweeks (
    matchweek_id integer generated always as identity primary key,

    season_id integer not null
        references public.seasons(season_id)
        on delete cascade,

    week_number integer not null,
    deadline timestamptz not null,

    status text not null default 'UPCOMING',

    fixture_count integer default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint chk_matchweek_status
        check (status in ('UPCOMING','OPEN','LOCKED','COMPLETE')),

    constraint uq_season_week
        unique (season_id, week_number)
);

create index if not exists idx_matchweeks_deadline
    on public.matchweeks(deadline);

-- ==========================================================
-- FIXTURES
-- ==========================================================

create table if not exists public.fixtures (
    fixture_id integer primary key,

    season_id integer not null
        references public.seasons(season_id),

    matchweek_id integer not null
        references public.matchweeks(matchweek_id),

    kickoff_time timestamptz not null,

    home_club_id integer not null
        references public.clubs(club_id),

    away_club_id integer not null
        references public.clubs(club_id),

    home_score integer,
    away_score integer,

    started boolean not null default false,
    finished boolean not null default false,
    provisional boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint chk_not_same_club
        check (home_club_id <> away_club_id)
);

create index if not exists idx_fixture_matchweek
    on public.fixtures(matchweek_id);

create index if not exists idx_fixture_kickoff
    on public.fixtures(kickoff_time);

create index if not exists idx_fixture_home
    on public.fixtures(home_club_id);

create index if not exists idx_fixture_away
    on public.fixtures(away_club_id);

comment on table public.fixtures is
'Premier League fixtures synchronized from the Fantasy Premier League API.';

-- ==========================================================
-- END OF PART 2
-- ==========================================================
-- ==========================================================
-- PRE-BEER LEAGUE PICK 'EM
-- Migration 001 (Part 3 - Gameplay)
-- ==========================================================

-- ==========================================================
-- MATCH PICKS
-- ==========================================================

create table if not exists public.match_picks (
    pick_id bigint generated always as identity primary key,

    member_id integer not null
        references public.members(member_id)
        on delete cascade,

    fixture_id integer not null
        references public.fixtures(fixture_id)
        on delete cascade,

    predicted_result text not null,

    points_awarded integer not null default 0,

    submitted_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint chk_predicted_result
        check (predicted_result in ('HOME','DRAW','AWAY')),

    constraint uq_member_fixture
        unique(member_id, fixture_id)
);

create index if not exists idx_match_picks_member
    on public.match_picks(member_id);

create index if not exists idx_match_picks_fixture
    on public.match_picks(fixture_id);

-- ==========================================================
-- BONUS PICKS
-- ==========================================================

create table if not exists public.bonus_picks (
    bonus_pick_id bigint generated always as identity primary key,

    member_id integer not null
        references public.members(member_id)
        on delete cascade,

    matchweek_id integer not null
        references public.matchweeks(matchweek_id)
        on delete cascade,

    bonus_type text not null,

    fixture_id integer
        references public.fixtures(fixture_id),

    player_id integer
        references public.players(player_id),

    predicted_value text,

    points_awarded integer not null default 0,

    submitted_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint chk_bonus_type
        check (
            bonus_type in (
                'DOUBLE_POINTS',
                'TRIPLE_POINTS',
                'FIRST_GOALSCORER',
                'HIGHEST_SCORING_MATCH',
                'CUSTOM'
            )
        )
);

create unique index if not exists idx_bonus_unique
    on public.bonus_picks(member_id, matchweek_id, bonus_type);

comment on table public.match_picks is
'Weekly fixture predictions submitted by league members.';

comment on table public.bonus_picks is
'Weekly bonus predictions and multiplier selections.';

-- ==========================================================
-- END OF PART 3
-- ==========================================================
-- ==========================================================
-- PRE-BEER LEAGUE PICK 'EM
-- Migration 001 (Part 4 - Results & League)
-- ==========================================================

-- RESULTS
create table if not exists public.results (
    result_id bigint generated always as identity primary key,

    fixture_id integer not null unique
        references public.fixtures(fixture_id)
        on delete cascade,

    winning_side text not null,
    home_score integer not null default 0,
    away_score integer not null default 0,

    processed boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint chk_winning_side
        check (winning_side in ('HOME','DRAW','AWAY'))
);

-- GOALS
create table if not exists public.goals (
    goal_id bigint generated always as identity primary key,

    fixture_id integer not null
        references public.fixtures(fixture_id) on delete cascade,

    player_id integer not null
        references public.players(player_id),

    minute integer,
    own_goal boolean not null default false,
    penalty boolean not null default false,

    created_at timestamptz not null default now()
);

-- ASSISTS
create table if not exists public.assists (
    assist_id bigint generated always as identity primary key,

    fixture_id integer not null
        references public.fixtures(fixture_id) on delete cascade,

    player_id integer not null
        references public.players(player_id),

    created_at timestamptz not null default now()
);

-- CLEAN SHEETS
create table if not exists public.clean_sheets (
    clean_sheet_id bigint generated always as identity primary key,

    fixture_id integer not null
        references public.fixtures(fixture_id) on delete cascade,

    club_id integer not null
        references public.clubs(club_id),

    created_at timestamptz not null default now(),

    unique (fixture_id, club_id)
);

-- WEEKLY SCORES
create table if not exists public.weekly_scores (
    weekly_score_id bigint generated always as identity primary key,

    member_id integer not null
        references public.members(member_id) on delete cascade,

    matchweek_id integer not null
        references public.matchweeks(matchweek_id) on delete cascade,

    score integer not null default 0,
    rank integer,

    created_at timestamptz not null default now(),

    unique(member_id, matchweek_id)
);

-- STANDINGS
create table if not exists public.standings (
    standing_id bigint generated always as identity primary key,

    season_id integer not null
        references public.seasons(season_id) on delete cascade,

    member_id integer not null
        references public.members(member_id) on delete cascade,

    total_points integer not null default 0,
    position integer,

    updated_at timestamptz not null default now(),

    unique(season_id, member_id)
);

-- HISTORY
create table if not exists public.history (
    history_id bigint generated always as identity primary key,

    member_id integer not null
        references public.members(member_id),

    season_id integer not null
        references public.seasons(season_id),

    event_type text not null,
    description text,
    created_at timestamptz not null default now()
);

create index if not exists idx_weekly_scores_member
    on public.weekly_scores(member_id);

create index if not exists idx_standings_season
    on public.standings(season_id);

comment on table public.standings is
'Current season standings for each league member.';

-- ==========================================================
-- END OF INITIAL SCHEMA
-- ==========================================================