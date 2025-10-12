import {api} from './api';

// ============================================
// MOVIES
// ============================================

export const getMovieDetails = async (movieId) => {
    const response = await api.get(`/film?id=${movieId}`);
    return response.data.film[0];
};

export const getTrending = async () => {
    const response = await api.get('/getTrending');
    // Se response è già un array, restituiscilo direttamente
    return Array.isArray(response) ? response : response.data || response;
};

export const getVoted = async () => {
    const response = await api.get('/getVoted');
    return Array.isArray(response) ? response : response.data || response;
};

export const getLastAdded = async () => {
    const response = await api.get('/getLastAdded');
    return Array.isArray(response) ? response : response.data || response;
};

export const searchMovies = async (title) => {
    const response = await api.get(`/search?title=${encodeURIComponent(title)}`);
    return response.data.films;
};

export const getMoviesByGenre = async (genreId) => {
    const response = await api.get(`/getMoviesByGenre?genre=${genreId}`);
    return Array.isArray(response) ? response : response.data || response;
};

export const getMoviesByCategory = async (categoryId) => {
    const response = await api.get(`/getMoviesByCategory?category=${categoryId}`);
    return Array.isArray(response) ? response : response.data || response;
};

export const getMoviesBySaga = async (sagaId) => {
    const response = await api.get(`/getMoviesBySaga?saga=${sagaId}`);
    return Array.isArray(response) ? response : response.data || response;
};

// ============================================
// TV SERIES
// ============================================

export const getSerieDetails = async (serieId) => {
    const response = await api.get(`/serie_tv?id=${serieId}`);
    return response.results[0];
};

export const getSeriesTV = async () => {
    return await api.get('/getSeriesTV');
};

export const getVotedTV = async () => {
    return await api.get('/getVotedTV');
};

export const getLastAddedSerie = async () => {
    return await api.get('/getLastAddedSerie');
};

export const searchSeries = async (title) => {
    const response = await api.get(`/searchSerie?title=${encodeURIComponent(title)}`);
    return response.films;
};

export const getTVByGenre = async (genreId) => {
    return await api.get(`/getTVByGenre?genre=${genreId}`);
};

export const getSeasons = async (serieId) => {
    return await api.get(`/getSeasons?id=${serieId}`);
};

export const getEpisodes = async (seasonId) => {
    return await api.get(`/getEpisodes?id=${seasonId}`);
};

// ============================================
// MIXED CONTENT
// ============================================

export const getTrendingAll = async () => {
    return await api.get('/getTrendingAll');
};

export const getVotedAll = async () => {
    return await api.get('/getVotedAll');
};

export const getLastAddedAll = async () => {
    return await api.get('/getLastAddedAll');
};

export const searchAll = async (title) => {
    const response = await api.get(`/searchAll?title=${encodeURIComponent(title)}`);
    return response.films;
};

export const getAllByGenre = async (genreId) => {
    return await api.get(`/getAllByGenre?genre=${genreId}`);
};

// ============================================
// FAVORITES
// ============================================

export const addToFavourite = async (contentId, userId, type = 'movie') => {
    const endpoint = type === 'movie' ? '/addFavourite' : '/addFavouriteTV';
    return await api.post(endpoint, {
        movie_id: contentId,
        user_id: userId
    });
};

export const removeFromFavourite = async (contentId, userId, type = 'movie') => {
    const endpoint = type === 'movie' ? '/removeFavourite' : '/removeFavouriteTV';
    return await api.post(endpoint, {
        movie_id: contentId,
        user_id: userId
    });
};

export const checkFavorite = async (contentId, userId, type = 'movie') => {
    const endpoint = type === 'movie' ? '/getFavourite' : '/getFavouriteTV';
    return await api.post(endpoint, {
        movie_id: contentId,
        user_id: userId
    });
};

export const getFavouriteList = async (userId) => {
    return await api.post('/getFavouriteList', { user_id: userId });
};

export const getYourListAll = async (userId) => {
    return await api.get(`/getYourListAll?user_id=${userId}`);
};

// ============================================
// CONTINUE WATCHING
// ============================================

export const getContinueWatchingAll = async (userId) => {
    return await api.get(`/getMoviesByContinueListAll?user_id=${userId}`);
};

export const getContinueWatchingMovies = async (userId) => {
    return await api.get(`/getMoviesByContinueListMovie?user_id=${userId}`);
};

export const getContinueWatchingSeries = async (userId) => {
    return await api.get(`/getMoviesByContinueListSerie?user_id=${userId}`);
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
        const response = await api.get(`/trailerSelector?tv=${tvParam}`);

        console.log('=== DEBUG TRAILER ===');
        console.log('Response completo:', response);

        // axios restituisce response.data, ma a volte può essere che
        // l'interceptor di api.js già estrae .data
        // Quindi controlliamo entrambi i casi
        const data = response.data || response;

        console.log('Data estratto:', data);
        console.log('Type of data:', typeof data);

        // Gestisci diversi formati di risposta
        let trailer = null;

        // Caso 1: { trailer: {...} }
        if (data && data.trailer) {
            trailer = data.trailer;
        }
        // Caso 2: direttamente il trailer {...}
        else if (data && data.trailer_id) {
            trailer = data;
        }

        if (!trailer) {
            console.error('Nessun trailer trovato. Data ricevuto:', data);
            return null;
        }

        console.log('Trailer estratto:', trailer);

        // Verifica campi necessari
        const requiredFields = isTV
            ? ['trailer_id', 'title', 'serie_tv_id']
            : ['trailer_id', 'title', 'movie_id'];

        const missingFields = requiredFields.filter(field => !trailer[field]);

        if (missingFields.length > 0) {
            console.error('Campi mancanti:', missingFields);
            console.error('Trailer ricevuto:', trailer);
            return null;
        }

        console.log('✅ Trailer valido:', trailer);
        return trailer;
    } catch (error) {
        console.error('❌ Errore nel recupero del trailer:', error);
        if (error.response) {
            console.error('Risposta errore:', error.response.data);
            console.error('Status:', error.response.status);
        } else if (error.request) {
            console.error('Nessuna risposta ricevuta:', error.request);
        } else {
            console.error('Errore nella richiesta:', error.message);
        }
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