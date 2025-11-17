import {api} from './api';

//TODO: da migliorare (duplicate)

/**
 * Determina il tipo di contenuto basandosi sugli ID presenti
 */
const determineContentType = (item) => {
    if (!item) return 'movie';

    if (item.type) return item.type;

    if (item.serie_tv_id || item.serietvid) return 'tv';

    return 'movie';
};

/**
 * Normalizza un array di contenuti aggiungendo il campo type
 */
const normalizeContent = (items) => {
    if (!Array.isArray(items)) return items;

    return items.map(item => ({
        ...item,
        type: determineContentType(item)
    }));
};

/**
 * Normalizza il campo is_favourite da backend (0/1) a boolean
 */
const normalizeFavourites = (items) => {
    if (!Array.isArray(items)) return items;

    return items.map(item => ({
        ...item,
        is_favorite: item.is_favourite === 1 || item.is_favourite === true
    }));
};

// ============================================
// MOVIES
// ============================================

export const getMovieDetails = async (movieId) => {
    const response = await api.get(`/film?id=${movieId}`);
    return response.data.film[0];
};

export const getTrending = async () => {
    const response = await api.get('/getTrending');
    const data = Array.isArray(response) ? response : response.data || response;
    return normalizeContent(data);
};

export const getVoted = async () => {
    const response = await api.get('/getVoted');
    const data = Array.isArray(response) ? response : response.data || response;
    return normalizeContent(data);
};

export const getLastAdded = async () => {
    const response = await api.get('/getLastAdded');
    const data = Array.isArray(response) ? response : response.data || response;
    return normalizeContent(data);
};

export const searchMovies = async (title) => {
    const response = await api.get(`/search?title=${encodeURIComponent(title)}`);
    return normalizeContent(response.data.films);
};

export const getMoviesByGenre = async (genreId) => {
    const response = await api.get(`/getMoviesByGenre?genre=${genreId}`);
    const data = Array.isArray(response) ? response : response.data || response;
    return normalizeContent(data);
};

export const getMoviesByCategory = async (categoryId) => {
    const response = await api.get(`/getMoviesByCategory?category=${categoryId}`);
    const data = Array.isArray(response) ? response : response.data || response;
    return normalizeContent(data);
};

export const getMoviesBySaga = async (sagaId) => {
    const response = await api.get(`/getMoviesBySaga?saga=${sagaId}`);
    const data = Array.isArray(response) ? response : response.data || response;
    return normalizeContent(data);
};

// ============================================
// TV SERIES
// ============================================

export const getSerieDetails = async (serieId) => {
    const response = await api.get(`/serie_tv?id=${serieId}`);
    return response.results[0];
};

export const getSeriesTV = async () => {
    const data = await api.get('/getSeriesTV');
    return normalizeContent(data);
};

export const getVotedTV = async () => {
    const data = await api.get('/getVotedTV');
    return normalizeContent(data);
};

export const getLastAddedSerie = async () => {
    const data = await api.get('/getLastAddedSerie');
    return normalizeContent(data);
};

export const searchSeries = async (title) => {
    const response = await api.get(`/searchSerie?title=${encodeURIComponent(title)}`);
    return normalizeContent(response.films);
};

export const getTVByGenre = async (genreId) => {
    const data = await api.get(`/getTVByGenre?genre=${genreId}`);
    return normalizeContent(data);
};

export const getSeasons = async (serieId) => {
    return await api.get(`/getSeasons?id=${serieId}`);
};

export const getEpisodes = async (seasonId) => {
    return await api.get(`/getEpisodes?id=${seasonId}`);
};

// ============================================
// MIXED CONTENT - CON NORMALIZZAZIONE AUTOMATICA
// ============================================

export const getTrendingAll = async () => {
    const data = await api.get('/getTrendingAll');
    return normalizeContent(data);
};

export const getVotedAll = async () => {
    const data = await api.get('/getVotedAll');
    return normalizeContent(data);
};

export const getLastAddedAll = async () => {
    const data = await api.get('/getLastAddedAll');
    return normalizeContent(data);
};

export const searchAll = async (title) => {
    const response = await api.get(`/searchAll?title=${encodeURIComponent(title)}`);
    return normalizeContent(response.films);
};

export const getAllByGenre = async (genreId) => {
    const data = await api.get(`/getAllByGenre?genre=${genreId}`);
    return normalizeContent(data);
};

// ============================================
// MIXED CONTENT - WITH FAVOURITES (NEW OPTIMIZED VERSION)
// ============================================

/**
 * Ottiene i contenuti trending con stato favourites dal backend
 * Usa la nuova API ottimizzata che restituisce direttamente is_favourite
 */
export const getTrendingAllWithFavorites = async (userId) => {
    try {
        if (!userId) {
            // Fallback alla versione senza favourites se non c'è user_id
            const data = await getTrendingAll();
            return Array.isArray(data) ? data.map(item => ({
                ...item,
                is_favorite: false
            })) : [];
        }

        // Usa la nuova API ottimizzata
        const data = await api.get('/getTrendingAllWithFavourites', { user_id: userId });
        const normalized = normalizeContent(data);
        return normalizeFavourites(normalized);
    } catch (error) {
        console.error('Error in getTrendingAllWithFavorites:', error);
        return [];
    }
};

/**
 * Ottiene i contenuti votati con stato favourites dal backend
 * Usa la nuova API ottimizzata che restituisce direttamente is_favourite
 */
export const getVotedAllWithFavorites = async (userId) => {
    try {
        if (!userId) {
            const data = await getVotedAll();
            return Array.isArray(data) ? data.map(item => ({
                ...item,
                is_favorite: false
            })) : [];
        }

        // Usa la nuova API ottimizzata
        const data = await api.get('/getVotedAllWithFavourites', { user_id: userId });
        const normalized = normalizeContent(data);
        return normalizeFavourites(normalized);
    } catch (error) {
        console.error('Error in getVotedAllWithFavorites:', error);
        return [];
    }
};

/**
 * Ottiene gli ultimi contenuti aggiunti con stato favourites dal backend
 * Usa la nuova API ottimizzata che restituisce direttamente is_favourite
 */
export const getLastAddedAllWithFavorites = async (userId) => {
    try {
        if (!userId) {
            const data = await getLastAddedAll();
            return Array.isArray(data) ? data.map(item => ({
                ...item,
                is_favorite: false
            })) : [];
        }

        // Usa la nuova API ottimizzata
        const data = await api.get('/getLastAddedAllWithFavourites', { user_id: userId });
        const normalized = normalizeContent(data);
        return normalizeFavourites(normalized);
    } catch (error) {
        console.error('Error in getLastAddedAllWithFavorites:', error);
        return [];
    }
};

/**
 * Ottiene contenuti per genere con stato favourites dal backend
 * Usa la nuova API ottimizzata che restituisce direttamente is_favourite
 */
export const getAllByGenreWithFavorites = async (genreId, userId) => {
    try {
        if (!userId) {
            const data = await getAllByGenre(genreId);
            return Array.isArray(data) ? data.map(item => ({
                ...item,
                is_favorite: false
            })) : [];
        }

        // Usa la nuova API ottimizzata
        const data = await api.get('/getAllByGenreWithFavourites', {
            genre: genreId,
            user_id: userId
        });
        const normalized = normalizeContent(data);
        return normalizeFavourites(normalized);
    } catch (error) {
        console.error('Error in getAllByGenreWithFavorites:', error);
        return [];
    }
};

// ============================================
// FAVORITES
// ============================================

export const addToFavourite = async (contentId, userId, type = 'movie') => {
    const endpoint = type === 'movie' ? '/addFavourite' : '/addFavouriteTV';

    const payload = {
        movie_id: contentId,
        user_id: userId
    };

    try {
        return await api.post(endpoint, payload);
    } catch (error) {
        throw error;
    }
};

export const removeFromFavourite = async (contentId, userId, type = 'movie') => {
    const endpoint = type === 'movie' ? '/removeFavourite' : '/removeFavouriteTV';

    const payload = {
        movie_id: contentId,
        user_id: userId
    };


    try {
        return await api.post(endpoint, payload);
    } catch (error) {
        throw error;
    }
};

export const checkFavorite = async (contentId, userId, type = 'movie') => {
    const endpoint = type === 'movie' ? '/getFavourite' : '/getFavouriteTV';

    const payload = {
        movie_id: contentId,
        user_id: userId
    };

    try {
        return await api.post(endpoint, payload);
    } catch (error) {
        throw error;
    }
};

export const getFavouriteList = async (userId) => {

    try {
        return await api.post('/getFavouriteList', {user_id: userId});
    } catch (error) {
        throw error;
    }
};

export const getYourListAll = async (userId) => {
    const data = await api.get('/getYourListAll', { user_id: userId });
    return normalizeContent(data);
};

export const getUserFavorites = async (userId) => {
    if (!userId) {
        return { movies: [], tv: [] };
    }

    try {
        const data = await getFavouriteList(userId);

        const movies = Array.isArray(data)
            ? data.filter(item => item.type === 'movie').map(item => {
                return item.movie_id;
            })
            : [];

        const tv = Array.isArray(data)
            ? data.filter(item => item.type === 'tv').map(item => {
                return item.movie_id;
            })
            : [];

        return {movies, tv};
    } catch (error) {
        return { movies: [], tv: [] };
    }
};
// ============================================
// CONTINUE WATCHING - CON NORMALIZZAZIONE
// ============================================

export const getContinueWatchingAll = async (userId) => {
    const data = await api.get('/getMoviesByContinueListAll', { user_id: userId });
    return normalizeContent(data);
};

export const getContinueWatchingMovies = async (userId) => {
    const data = await api.get('/getMoviesByContinueListMovie', { user_id: userId });
    return normalizeContent(data);
};

export const getContinueWatchingSeries = async (userId) => {
    const data = await api.get('/getMoviesByContinueListSerie', { user_id: userId });
    return normalizeContent(data);
};

export const deleteContinueMovie = async (movieId, userId) => {
    return await api.post('/deleteContinueList', {
        movie_id: movieId,
        user_id: userId
    });
};

export const deleteContinueSerie = async (serieId, userId) => {
    return await api.post('/deleteContinueListSerie', {
        movie_id: serieId,
        user_id: userId
    });
};

// ============================================
// PLAYER TIME
// ============================================

export const setPlayerTime = async (userId, movieId, playerTime) => {
    return await api.post('/setPlayerTime', {
        user_id: userId,
        movie_id: movieId,
        player_time: playerTime
    });
};

export const getPlayerTime = async (userId, movieId) => {
    return await api.post('/getPlayerTime', {
        user_id: userId,
        movie_id: movieId
    });
};

export const setPlayerTimeSerie = async (userId, serieId, playerTime, episodeId, seasonId) => {
    return await api.post('/setPlayerTimeSerie', {
        user_id: userId,
        serie_tv_id: serieId,
        player_time: playerTime,
        episode_id: episodeId,
        season_id: seasonId
    });
};

export const getPlayerTimeSerie = async (userId, serieId) => {
    return await api.post('/getPlayerTimeSerie', {
        user_id: userId,
        serie_tv_id: serieId
    });
};

// ============================================
// STREAMING
// ============================================

export const getStreamUrl = (title, isTv = false) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000';
    const tvParam = isTv ? '&tv=true' : '';
    return `${baseUrl}/stream?title=${encodeURIComponent(title)}${tvParam}`;
};

export const getTrailerUrl = (fileName, isTv = false) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000';
    const tvParam = isTv ? '&tv=true' : '';
    return `${baseUrl}/trailer?fileName=${encodeURIComponent(fileName)}${tvParam}`;
};

export const getSubtitleUrl = (title) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000';
    return `${baseUrl}/subtitleSerieTV?film=${encodeURIComponent(title)}`;
};

export const getRandomTrailer = async (isTV = false) => {
    try {
        const tvParam = isTV ? 'true' : 'false';
        const response = await api.get('/trailerSelector', { tv: tvParam });

        const data = response.data || response;
        let trailer = null;

        if (data && data.trailer) {
            trailer = data.trailer;
        } else if (data && data.trailer_id) {
            trailer = data;
        }

        if (!trailer) {
            console.error('Nessun trailer trovato. Data ricevuto:', data);
            return null;
        }

        const requiredFields = isTV
            ? ['trailer_id', 'title', 'serie_tv_id']
            : ['trailer_id', 'title', 'movie_id'];

        const missingFields = requiredFields.filter(field => !trailer[field]);

        if (missingFields.length > 0) {
            console.error('Campi mancanti:', missingFields);
            return null;
        }

        return trailer;
    } catch (error) {
        console.error('Errore nel recupero del trailer:', error);
        return null;
    }
};

// ============================================
// GENRES & CATEGORIES
// ============================================

export const getGenres = async () => {
    return await api.get('/getGenres');
};

export const getGenresTV = async () => {
    return await api.get('/getGenresTV');
};

export const getCategories = async () => {
    return await api.get('/getCategories');
};

export const getSagas = async () => {
    return await api.get('/getSagas');
};

// ============================================
// PERSON SEARCH
// ============================================

export const searchPerson = async (name) => {
    const response = await api.get(`/searchPerson?name=${encodeURIComponent(name)}`);
    return response.persons;
};

// ============================================
// REQUEST LIST (Admin)
// ============================================

export const getAllList = async () => {
    return await api.post('/getAllList');
};

export const addToList = async (userId, year, poster, voteAverage, reqId, type, title) => {
    return await api.post('/addList', {
        user_id: userId,
        year,
        poster,
        vote_average: voteAverage,
        req_id: reqId,
        type,
        title
    });
};

export const deleteFromList = async (listId, userId) => {
    return await api.post('/elimina', {
        list_id: listId,
        user_id: userId
    });
};

// ============================================
// INSERT CONTENT (Admin)
// ============================================

export const insertFilm = async (filmData) => {
    return await api.post('/insertFilm', filmData);
};

export const insertSerieTV = async (serieData) => {
    return await api.post('/insertSerieTV', serieData);
};

export default {
    // Movies
    getMovieDetails,
    getTrending,
    getVoted,
    getLastAdded,
    searchMovies,
    getMoviesByGenre,
    getMoviesByCategory,
    getMoviesBySaga,

    // TV Series
    getSerieDetails,
    getSeriesTV,
    getVotedTV,
    getLastAddedSerie,
    searchSeries,
    getTVByGenre,
    getSeasons,
    getEpisodes,

    // Mixed
    getTrendingAll,
    getVotedAll,
    getLastAddedAll,
    searchAll,
    getAllByGenre,

    // Mixed with Favorites (OPTIMIZED - uses backend API)
    getTrendingAllWithFavorites,
    getVotedAllWithFavorites,
    getLastAddedAllWithFavorites,
    getAllByGenreWithFavorites,
    getUserFavorites,

    // Favorites
    addToFavourite,
    removeFromFavourite,
    checkFavorite,
    getFavouriteList,
    getYourListAll,

    // Continue Watching
    getContinueWatchingAll,
    getContinueWatchingMovies,
    getContinueWatchingSeries,
    deleteContinueMovie,
    deleteContinueSerie,

    // Player Time
    setPlayerTime,
    getPlayerTime,
    setPlayerTimeSerie,
    getPlayerTimeSerie,

    // Streaming
    getStreamUrl,
    getTrailerUrl,
    getSubtitleUrl,
    getRandomTrailer,

    // Genres & Categories
    getGenres,
    getGenresTV,
    getCategories,
    getSagas,

    // Person
    searchPerson,

    // Request List
    getAllList,
    addToList,
    deleteFromList,

    // Insert Content
    insertFilm,
    insertSerieTV
};