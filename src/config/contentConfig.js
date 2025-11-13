/**
 * Configurazione degli endpoint per le pagine di contenuto
 */

export const moviesConfig = {
    type: 'movie',
    endpoints: {
        genres: '/getGenres',
        all: '/getTrending',
        byGenre: (genreId) => `/getMoviesByGenre?genre=${genreId}`,
    },
    sortOptions: [
        { id: 'popularity', label: 'Popolarità' },
        { id: 'vote_average', label: 'Voto' },
        { id: 'release_date', label: 'Data Uscita' },
        { id: 'added_date', label: 'Data Aggiunta' },
        { id: 'title', label: 'Titolo' },
    ],
    pageInfo: {
        title: 'Film',
        emptyIcon: '🎬',
        contentType: 'film',
        idKey: 'film_id',
        detailsPath: '/movie/',
    },
};

export const seriesConfig = {
    type: 'series',
    endpoints: {
        genres: '/getGenresTV',
        all: '/getSeriesTV',
        byGenre: (genreId) => `/getTVByGenre?genre=${genreId}`,
    },
    sortOptions: [
        { id: 'popularity', label: 'Popolarità' },
        { id: 'vote_average', label: 'Voto' },
        { id: 'release_date', label: 'Data Uscita' },
        { id: 'added_date', label: 'Data Aggiunta' },
        { id: 'title', label: 'Titolo' },
    ],
    pageInfo: {
        title: 'Serie TV',
        emptyIcon: '📺',
        contentType: 'serie',
        idKey: 'serie_tv_id',
        detailsPath: '/tv/',
    },
};