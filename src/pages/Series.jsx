import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import useLocalStorage from '../hooks/useLocalStorage';
import ContentCard from '../components/content/ContentCard';
import SearchBar from '../components/search/SearchBar';
import {Spinner} from '../components/common/Spinner';
import {Button} from '../components/common/Button';

const Series = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();

    const [activeFilter, setActiveFilter] = useLocalStorage('series-filter', 'all');
    const [selectedGenre, setSelectedGenre] = useLocalStorage('series-genre', '');
    const [sortBy, setSortBy] = useLocalStorage('series-sort', 'popularity');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [viewMode, setViewMode] = useLocalStorage('series-view', 'grid');
    const [itemsPerPage] = useState(24);

    useEffect(() => {
        const genre = searchParams.get('genre');
        const filter = searchParams.get('filter');
        const search = searchParams.get('q');

        if (genre) setSelectedGenre(genre);
        if (filter) setActiveFilter(filter);
        if (search) setSearchQuery(search);
    }, [searchParams, setSelectedGenre, setActiveFilter]);

    const { data: genres } = useFetch('/getGenresTV', {
        immediate: true,
        cacheKey: 'tv-genres',
        cacheTime: 30 * 60 * 1000,
    });

    const getSeriesEndpoint = () => {
        if (searchQuery) return null;

        switch (activeFilter) {
            case 'trending':
                return '/getSeriesTV';
            case 'voted':
                return '/getVotedTV';
            case 'recent':
                return '/getLastAddedSerie';
            case 'genre':
                return selectedGenre ? `/getTVByGenre?genre=${selectedGenre}` : '/getSeriesTV';
            default:
                return '/getSeriesTV';
        }
    };

    const {
        data: series,
        loading: seriesLoading,
        error: seriesError,
        refetch: refetchSeries
    } = useFetch(getSeriesEndpoint(), {
        immediate: !!getSeriesEndpoint(),
        cacheKey: `series-${activeFilter}-${selectedGenre}`,
        cacheTime: 10 * 60 * 1000, // 10 minutes
        dependencies: [activeFilter, selectedGenre],
    });

    const {
        data: searchResults,
        loading: searchLoading,
        execute: executeSearch
    } = useFetch('/searchSerie', {
        immediate: false,
        cacheKey: `search-series-${searchQuery}`,
    });

    useEffect(() => {
        if (searchQuery.trim()) {
            executeSearch('/searchSerie', { params: { title: `%${searchQuery}%` } });
        }
    }, [searchQuery, executeSearch]);

    const getCurrentData = () => {
        if (searchQuery.trim()) {
            return searchResults?.films || [];
        }
        return series || [];
    };

    const getSortedAndPaginatedData = () => {
        let data = [...getCurrentData()];

        data.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'release_date':
                    return new Date(b.release_date) - new Date(a.release_date);
                case 'vote_average':
                    return (b.vote_average || 0) - (a.vote_average || 0);
                case 'added_date':
                    return new Date(b.added_date) - new Date(a.added_date);
                case 'popularity':
                default:
                    return (b.popularity || 0) - (a.popularity || 0);
            }
        });

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return {
            items: data.slice(startIndex, endIndex),
            totalItems: data.length,
            totalPages: Math.ceil(data.length / itemsPerPage)
        };
    };

    const { items: displayedSeries, totalItems, totalPages } = getSortedAndPaginatedData();

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setSelectedGenre('');
        setCurrentPage(1);
        setSearchQuery('');

        const newParams = new URLSearchParams();
        if (filter !== 'all') newParams.set('filter', filter);
        setSearchParams(newParams);
    };

    const handleGenreChange = (genreId) => {
        setSelectedGenre(genreId);
        setActiveFilter('genre');
        setCurrentPage(1);
        setSearchQuery('');

        const newParams = new URLSearchParams();
        if (genreId) {
            newParams.set('genre', genreId);
            newParams.set('filter', 'genre');
        }
        setSearchParams(newParams);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        setCurrentPage(1);

        const newParams = new URLSearchParams();
        if (query.trim()) {
            newParams.set('q', query);
        }
        setSearchParams(newParams);
    };

    const handleSortChange = (sort) => {
        setSortBy(sort);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isLoading = seriesLoading || searchLoading;
    const hasError = seriesError;

    const filterOptions = [
        { id: 'all', label: 'Tutte le Serie', icon: '📺' },
        { id: 'trending', label: 'Più Popolari', icon: '🔥' },
        { id: 'voted', label: 'Più Votate', icon: '⭐' },
        { id: 'recent', label: 'Aggiunte di Recente', icon: '🆕' },
    ];

    const sortOptions = [
        { id: 'popularity', label: 'Popolarità' },
        { id: 'vote_average', label: 'Voto' },
        { id: 'release_date', label: 'Data Uscita' },
        { id: 'added_date', label: 'Data Aggiunta' },
        { id: 'title', label: 'Titolo' },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="bg-gradient-to-b from-gray-900 to-black py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            Serie TV
                        </h1>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            Scopri le migliori serie televisive, dai classici intramontabili alle ultime novità
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <SearchBar
                            onSearch={handleSearch}
                            initialValue={searchQuery}
                            placeholder="Cerca serie TV..."
                        />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Filters and Controls */}
                <div className="mb-8">
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
                        {filterOptions.map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => handleFilterChange(filter.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                    activeFilter === filter.id
                                        ? 'bg-red-600 text-white shadow-lg'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                            >
                                <span>{filter.icon}</span>
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    {/* Genre Filter */}
                    {genres && genres.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-3">Generi</h3>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handleGenreChange('')}
                                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                        !selectedGenre
                                            ? 'bg-red-600 text-white'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    Tutti
                                </button>
                                {genres.map((genre) => (
                                    <button
                                        key={genre.genre_id}
                                        onClick={() => handleGenreChange(genre.genre_id)}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                            selectedGenre === genre.genre_id?.toString()
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        }`}
                                    >
                                        {genre.genre_name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-400">Ordina per:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.id} value={option.id}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400">Vista:</span>
                                <div className="flex bg-gray-800 rounded overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                        title="Vista griglia"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                        title="Vista lista"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results info */}
                        {!isLoading && (
                            <div className="text-sm text-gray-400">
                                {searchQuery ? (
                                    <>Risultati per "<span className="text-white">{searchQuery}</span>": </>
                                ) : activeFilter === 'genre' && selectedGenre ? (
                                    <>Genere: <span className="text-white">
                                        {genres?.find(g => g.genre_id?.toString() === selectedGenre)?.genre_name}
                                    </span> - </>
                                ) : null}
                                <span className="text-white">{totalItems}</span> serie trovate
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Spinner size="large" />
                    </div>
                ) : hasError ? (
                    <div className="text-center py-20">
                        <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-6 py-4 rounded-lg inline-block mb-4">
                            Errore nel caricamento delle serie TV
                        </div>
                        <br />
                        <Button onClick={refetchSeries} variant="primary">
                            Riprova
                        </Button>
                    </div>
                ) : displayedSeries.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">📺</div>
                        <h3 className="text-xl font-semibold mb-2">
                            {searchQuery ? 'Nessuna serie trovata' : 'Nessuna serie disponibile'}
                        </h3>
                        <p className="text-gray-400 mb-4">
                            {searchQuery
                                ? `Non ci sono risultati per "${searchQuery}"`
                                : 'Non ci sono serie TV in questa categoria'
                            }
                        </p>
                        {searchQuery && (
                            <Button onClick={() => handleSearch('')} variant="secondary">
                                Mostra tutte le serie
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Series Grid/List */}
                        <div className={
                            viewMode === 'grid'
                                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8'
                                : 'space-y-4 mb-8'
                        }>
                            {displayedSeries.map((serie) => (
                                viewMode === 'grid' ? (
                                    <ContentCard
                                        key={serie.serie_tv_id}
                                        content={serie}
                                        type="tv"
                                    />
                                ) : (
                                    <div key={serie.serie_tv_id} className="bg-gray-900 rounded-lg p-4 flex gap-4">
                                        <div className="flex-shrink-0">
                                            <img
                                                src={serie.poster ? `https://image.tmdb.org/t/p/w200${serie.poster}` : '/placeholder-poster.jpg'}
                                                alt={serie.title}
                                                className="w-20 h-30 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-poster.jpg';
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold mb-2">{serie.title}</h3>
                                            <div className="text-sm text-gray-400 space-y-1">
                                                <p>Anno: {serie.release_date ? new Date(serie.release_date).getFullYear() : 'N/A'}</p>
                                                {serie.total_seasons && (
                                                    <p>{serie.total_seasons} stagioni • {serie.total_episodes} episodi</p>
                                                )}
                                                {serie.vote_average && (
                                                    <div className="flex items-center gap-1">
                                                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                                        </svg>
                                                        {serie.vote_average.toFixed(1)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <Button
                                                onClick={() => window.location.href = `/tv/${serie.serie_tv_id}`}
                                                variant="primary"
                                                size="sm"
                                            >
                                                Dettagli
                                            </Button>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2">
                                <Button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    variant="secondary"
                                    size="sm"
                                >
                                    Precedente
                                </Button>

                                <div className="flex space-x-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`px-3 py-1 text-sm rounded ${
                                                    currentPage === pageNum
                                                        ? 'bg-red-600 text-white'
                                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <Button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    variant="secondary"
                                    size="sm"
                                >
                                    Successiva
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Series;