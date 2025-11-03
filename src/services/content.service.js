// src/services/content.service.js
import {api} from './api';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Determina il tipo di contenuto basandosi sugli ID presenti
 */
const determineContentType = (item) => {
    if (!item) return 'movie';

    // Se ha già il campo type, usalo
    if (item.type) return item.type;

    // Controlla se ha ID di serie TV
    if (item.serie_tv_id || item.serietvid) return 'tv';

    // Default: film
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
    const normalized = normalizeContent(data);

    console.log('🔥 getTrendingAll normalized:', {
        originalLength: Array.isArray(data) ? data.length : 0,
        normalizedLength: Array.isArray(normalized) ? normalized.length : 0,
        sample: normalized[0]
    });

    return normalized;
};

export const getVotedAll = async () => {
    const data = await api.get('/getVotedAll');
    const normalized = normalizeContent(data);

    console.log('⭐ getVotedAll normalized:', {
        originalLength: Array.isArray(data) ? data.length : 0,
        normalizedLength: Array.isArray(normalized) ? normalized.length : 0,
        sample: normalized[0]
    });

    return normalized;
};

export const getLastAddedAll = async () => {
    const data = await api.get('/getLastAddedAll');
    const normalized = normalizeContent(data);

    console.log('🆕 getLastAddedAll normalized:', {
        originalLength: Array.isArray(data) ? data.length : 0,
        normalizedLength: Array.isArray(normalized) ? normalized.length : 0,
        sample: normalized[0]
    });

    return normalized;
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
// FAVORITES - VERSIONE CON DEBUG
// ============================================

export const addToFavourite = async (contentId, userId, type = 'movie') => {
    const endpoint = type === 'movie' ? '/addFavourite' : '/addFavouriteTV';

    console.log('🔥 Adding to favorite:', {
        contentId,
        userId,
        type,
        endpoint
    });

    const payload = {
        movie_id: contentId, // Il server si aspetta sempre movie_id, anche per le serie TV
        user_id: userId
    };

    console.log('📦 Add Favorite Payload:', payload);

    try {
        const response = await api.post(endpoint, payload);
        console.log('✅ Add favorite response:', response);
        return response;
    } catch (error) {
        console.error('❌ Add favorite error:', error);
        console.error('❌ Error details:', {
            endpoint,
            payload,
            errorMessage: error.message,
            errorStack: error.stack
        });
        throw error;
    }
};

export const removeFromFavourite = async (contentId, userId, type = 'movie') => {
    const endpoint = type === 'movie' ? '/removeFavourite' : '/removeFavouriteTV';

    console.log('🗑️ Removing from favorite:', {
        contentId,
        userId,
        type,
        endpoint
    });

    const payload = {
        movie_id: contentId, // Il server si aspetta sempre movie_id, anche per le serie TV
        user_id: userId
    };

    console.log('📦 Remove Favorite Payload:', payload);

    try {
        const response = await api.post(endpoint, payload);
        console.log('✅ Remove favorite response:', response);
        return response;
    } catch (error) {
        console.error('❌ Remove favorite error:', error);
        console.error('❌ Error details:', {
            endpoint,
            payload,
            errorMessage: error.message,
            errorStack: error.stack
        });
        throw error;
    }
};

export const checkFavorite = async (contentId, userId, type = 'movie') => {
    const endpoint = type === 'movie' ? '/getFavourite' : '/getFavouriteTV';

    console.log('🔍 Checking favorite:', {
        contentId,
        userId,
        type,
        endpoint
    });

    const payload = {
        movie_id: contentId,
        user_id: userId
    };

    try {
        const response = await api.post(endpoint, payload);
        console.log('✅ Check favorite response:', response);
        return response;
    } catch (error) {
        console.error('❌ Check favorite error:', error);
        throw error;
    }
};

export const getFavouriteList = async (userId) => {
    console.log('📋 Getting favorite list for user:', userId);

    try {
        const response = await api.post('/getFavouriteList', { user_id: userId });
        console.log('✅ Favorite list response:', response);
        return response;
    } catch (error) {
        console.error('❌ Get favorite list error:', error);
        throw error;
    }
};

export const getYourListAll = async (userId) => {
    const data = await api.get('/getYourListAll', { user_id: userId });
    return normalizeContent(data);
};

// ✅ FUNZIONE HELPER PER OTTENERE I PREFERITI DELL'UTENTE CON DEBUG
export const getUserFavorites = async (userId) => {
    if (!userId) {
        console.log('⚠️ getUserFavorites: No userId provided');
        return { movies: [], tv: [] };
    }

    console.log('📋 Getting user favorites for userId:', userId);

    try {
        const data = await getFavouriteList(userId);
        console.log('📋 Raw favorite list data:', data);

        // Separa film e serie TV dai preferiti
        const movies = Array.isArray(data)
            ? data.filter(item => item.type === 'movie').map(item => {
                console.log('🎬 Movie favorite:', item);
                return item.movie_id;
            })
            : [];

        const tv = Array.isArray(data)
            ? data.filter(item => item.type === 'tv').map(item => {
                console.log('📺 TV favorite:', item);
                return item.movie_id;
            })
            : [];

        const favorites = { movies, tv };
        console.log('✅ Processed favorites:', favorites);

        return favorites;
    } catch (error) {
        console.error('❌ Error fetching user favorites:', error);
        return { movies: [], tv: [] };
    }
};

// content.service.js - AGGIORNA questa funzione

const markFavorites = (items, favorites) => {
    if (!Array.isArray(items) || !favorites) {
        console.log('⚠️ markFavorites: Invalid input', {
            itemsIsArray: Array.isArray(items),
            favorites: !!favorites
        });
        return items;
    }

    console.log('🔄 Marking favorites for', items.length, 'items');
    console.log('💖 Available favorites:', favorites);

    const markedItems = items.map(item => {
        // ✅ Preserva TUTTI i campi originali
        const contentId = item.movie_id || item.movieid || item.serie_tv_id || item.serietvid || item.id;
        const itemType = item.type || 'movie';

        const isFavorite = itemType === 'movie'
            ? favorites.movies.includes(contentId)
            : favorites.tv.includes(contentId);

        console.log(`${isFavorite ? '💖' : '🤍'} Item ${contentId} (${itemType}): favorite=${isFavorite}`);

        return {
            ...item, // ✅ Preserva tutti i campi originali
            is_favorite: isFavorite,
            id: contentId,
            type: itemType
        };
    });

    console.log('✅ Marked items sample:', markedItems[0]);
    return markedItems;
};

// Funzioni *WithFavorites - Normalizzano automaticamente
export const getTrendingAllWithFavorites = async (userId) => {
    try {
        console.log('🔥 Getting trending all with favorites for user:', userId);

        const data = await getTrendingAll(); // Già normalizzato
        const normalizedData = normalizeContent(data); // Extra sicurezza

        console.log('🔥 Trending data (normalized):', normalizedData);

        if (!userId) {
            console.log('⚠️ No userId, returning data without favorites');
            const dataWithoutFavorites = Array.isArray(normalizedData) ? normalizedData.map(item => ({
                ...item,
                is_favorite: false,
                id: item.movie_id || item.movieid || item.serie_tv_id || item.serietvid,
                type: determineContentType(item)
            })) : [];

            console.log('🔥 Trending without favorites:', dataWithoutFavorites);
            return dataWithoutFavorites;
        }

        const favorites = await getUserFavorites(userId);
        console.log('💖 User favorites:', favorites);

        const markedData = markFavorites(normalizedData, favorites);
        console.log('🔥 Trending with favorites:', markedData);

        return markedData;
    } catch (error) {
        console.error('❌ Error in getTrendingAllWithFavorites:', error);
        return [];
    }
};

export const getVotedAllWithFavorites = async (userId) => {
    try {
        console.log('⭐ Getting voted all with favorites for user:', userId);

        const data = await getVotedAll(); // Già normalizzato
        const normalizedData = normalizeContent(data);

        console.log('⭐ Voted data (normalized):', normalizedData);

        if (!userId) {
            console.log('⚠️ No userId, returning data without favorites');
            const dataWithoutFavorites = Array.isArray(normalizedData) ? normalizedData.map(item => ({
                ...item,
                is_favorite: false,
                id: item.movie_id || item.movieid || item.serie_tv_id || item.serietvid,
                type: determineContentType(item)
            })) : [];

            console.log('⭐ Voted without favorites:', dataWithoutFavorites);
            return dataWithoutFavorites;
        }

        const favorites = await getUserFavorites(userId);
        console.log('💖 User favorites:', favorites);

        const markedData = markFavorites(normalizedData, favorites);
        console.log('⭐ Voted with favorites:', markedData);

        return markedData;
    } catch (error) {
        console.error('❌ Error in getVotedAllWithFavorites:', error);
        return [];
    }
};

export const getLastAddedAllWithFavorites = async (userId) => {
    try {
        console.log('🆕 Getting last added all with favorites for user:', userId);

        const data = await getLastAddedAll(); // Già normalizzato
        const normalizedData = normalizeContent(data);

        console.log('🆕 Last added data (normalized):', normalizedData);

        if (!userId) {
            console.log('⚠️ No userId, returning data without favorites');
            const dataWithoutFavorites = Array.isArray(normalizedData) ? normalizedData.map(item => ({
                ...item,
                is_favorite: false,
                id: item.movie_id || item.movieid || item.serie_tv_id || item.serietvid,
                type: determineContentType(item)
            })) : [];

            console.log('🆕 Last added without favorites:', dataWithoutFavorites);
            return dataWithoutFavorites;
        }

        const favorites = await getUserFavorites(userId);
        console.log('💖 User favorites:', favorites);

        const markedData = markFavorites(normalizedData, favorites);
        console.log('🆕 Last added with favorites:', markedData);

        return markedData;
    } catch (error) {
        console.error('❌ Error in getLastAddedAllWithFavorites:', error);
        return [];
    }
};

export const getAllByGenreWithFavorites = async (genreId, userId) => {
    try {
        console.log(`🎭 Getting genre ${genreId} with favorites for user:`, userId);

        const data = await getAllByGenre(genreId); // Già normalizzato
        const normalizedData = normalizeContent(data);

        console.log(`🎭 Genre ${genreId} data (normalized):`, normalizedData);

        if (!userId) {
            console.log('⚠️ No userId, returning data without favorites');
            const dataWithoutFavorites = Array.isArray(normalizedData) ? normalizedData.map(item => ({
                ...item,
                is_favorite: false,
                id: item.movie_id || item.movieid || item.serie_tv_id || item.serietvid,
                type: determineContentType(item)
            })) : [];

            console.log(`🎭 Genre ${genreId} without favorites:`, dataWithoutFavorites);
            return dataWithoutFavorites;
        }

        const favorites = await getUserFavorites(userId);
        console.log('💖 User favorites:', favorites);

        const markedData = markFavorites(normalizedData, favorites);
        console.log(`🎭 Genre ${genreId} with favorites:`, markedData);

        return markedData;
    } catch (error) {
        console.error(`❌ Error in getAllByGenreWithFavorites for genre ${genreId}:`, error);
        return [];
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

    // Mixed with Favorites
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