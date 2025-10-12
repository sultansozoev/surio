// ============================================
// STORAGE KEYS
// ============================================
export const STORAGE_KEYS = {
    USER: 'surio_user',
    TOKEN: 'surio_token',
    THEME: 'surio_theme',
};

// ============================================
// API CONFIGURATION
// ============================================
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000';

// ============================================
// TMDB CONFIGURATION
// ============================================
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
export const TMDB_POSTER_SIZES = {
    SMALL: 'w185',
    MEDIUM: 'w342',
    LARGE: 'w500',
    ORIGINAL: 'original',
};
export const TMDB_BACKDROP_SIZES = {
    SMALL: 'w300',
    MEDIUM: 'w780',
    LARGE: 'w1280',
    ORIGINAL: 'original',
};

// Alias per retrocompatibilità
export const IMAGE_SIZES = {
    POSTER: TMDB_POSTER_SIZES,
    BACKDROP: TMDB_BACKDROP_SIZES,
    PROFILE: {
        SMALL: 'w45',
        MEDIUM: 'w185',
        LARGE: 'h632',
        ORIGINAL: 'original',
    },
};

// ============================================
// CONTENT TYPES
// ============================================
export const CONTENT_TYPES = {
    MOVIE: 'movie',
    TV: 'tv',
};

// ============================================
// ROUTES
// ============================================
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    MOVIES: '/movies',
    TV_SHOWS: '/tv-shows',
    SEARCH: '/search',
    PLAYER: '/player',
    PROFILE: '/profile',
    ADMIN: '/admin',
    BLOG: '/blog',
    FAVOURITES: '/favourites',
    CONTINUE_WATCHING: '/continue-watching',
};

// ============================================
// PAGINATION
// ============================================
export const PAGINATION = {
    ITEMS_PER_PAGE: 20,
    MAX_VISIBLE_PAGES: 5,
};

// ============================================
// PLAYER SETTINGS
// ============================================
export const PLAYER = {
    UPDATE_INTERVAL: 5000, // ms - intervallo per salvare il progresso
    CONTINUE_THRESHOLD: 0.9, // 90% - se supera questa percentuale, rimuovi da "continua a guardare"
};

// ============================================
// TOAST MESSAGES
// ============================================
export const TOAST_MESSAGES = {
    LOGIN_SUCCESS: 'Login effettuato con successo!',
    LOGIN_ERROR: 'Credenziali non valide',
    LOGOUT_SUCCESS: 'Logout effettuato',
    ADD_FAVOURITE_SUCCESS: 'Aggiunto ai preferiti',
    REMOVE_FAVOURITE_SUCCESS: 'Rimosso dai preferiti',
    ADD_LIST_SUCCESS: 'Aggiunto alla lista',
    REMOVE_LIST_SUCCESS: 'Rimosso dalla lista',
    ERROR_GENERIC: 'Si è verificato un errore',
    NETWORK_ERROR: 'Errore di connessione',
};

// ============================================
// HTTP STATUS CODES
// ============================================
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
};

// ============================================
// SORTING OPTIONS
// ============================================
export const SORT_OPTIONS = {
    POPULARITY_DESC: 'popularity_desc',
    POPULARITY_ASC: 'popularity_asc',
    RATING_DESC: 'rating_desc',
    RATING_ASC: 'rating_asc',
    TITLE_ASC: 'title_asc',
    TITLE_DESC: 'title_desc',
    DATE_DESC: 'date_desc',
    DATE_ASC: 'date_asc',
};

// ============================================
// REGEX PATTERNS
// ============================================
export const PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
    PASSWORD: /^.{6,}$/,
};

// ============================================
// DEFAULT VALUES
// ============================================
export const DEFAULTS = {
    POSTER_PLACEHOLDER: '/assets/no-poster.png',
    AVATAR_PLACEHOLDER: '/assets/default-avatar.png',
    BACKDROP_PLACEHOLDER: '/assets/no-backdrop.png',
};