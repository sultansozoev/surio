import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, Grid, List } from 'lucide-react';
import ContentCard from '../content/ContentCard';
import SearchFilters from './SearchFilters';
import {Spinner} from '../common/Spinner';
import { searchAll } from '../../services/content.service';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        type: 'all', // 'all', 'movie', 'tv'
        sortBy: 'popularity', // 'popularity', 'rating', 'title', 'date'
        sortOrder: 'desc' // 'asc', 'desc'
    });

    useEffect(() => {
        if (query) {
            performSearch(query);
        }
    }, [query]);

    useEffect(() => {
        applyFilters();
    }, [results, filters]);

    const performSearch = async (searchQuery) => {
        try {
            setLoading(true);
            const data = await searchAll(searchQuery);
            setResults(data);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...results];

        // Filter by type
        if (filters.type !== 'all') {
            filtered = filtered.filter(item => item.type === filters.type);
        }

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;

            // eslint-disable-next-line default-case
            switch (filters.sortBy) {
                case 'popularity':
                    comparison = (b.popularity || 0) - (a.popularity || 0);
                    break;
                case 'rating':
                    comparison = (b.vote_average || 0) - (a.vote_average || 0);
                    break;
                case 'title':
                    comparison = (a.title || '').localeCompare(b.title || '');
                    break;
                case 'date':
                    comparison = new Date(b.release_date || 0) - new Date(a.release_date || 0);
                    break;
            }

            return filters.sortOrder === 'asc' ? -comparison : comparison;
        });

        setFilteredResults(filtered);
    };

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    const stats = {
        total: results.length,
        movies: results.filter(r => r.type === 'movie').length,
        tv: results.filter(r => r.type === 'tv').length
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-900">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!query) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-900">
                <div className="text-center">
                    <p className="text-xl text-gray-400">Inserisci una ricerca per iniziare</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
                        Risultati per "{query}"
                    </h1>
                    <p className="text-gray-400">
                        {filteredResults.length} {filteredResults.length === 1 ? 'risultato' : 'risultati'}
                        {filters.type !== 'all' && ` in ${filters.type === 'movie' ? 'Film' : 'Serie TV'}`}
                    </p>
                </div>

                {/* Stats & Controls */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    {/* Stats Pills */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleFilterChange({ type: 'all' })}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                filters.type === 'all'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            Tutti ({stats.total})
                        </button>
                        <button
                            onClick={() => handleFilterChange({ type: 'movie' })}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                filters.type === 'movie'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            Film ({stats.movies})
                        </button>
                        <button
                            onClick={() => handleFilterChange({ type: 'tv' })}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                filters.type === 'tv'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            Serie TV ({stats.tv})
                        </button>
                    </div>

                    {/* View & Filter Controls */}
                    <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex rounded-lg bg-gray-800 p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`rounded p-2 transition-colors ${
                                    viewMode === 'grid'
                                        ? 'bg-gray-700 text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                                aria-label="Grid view"
                            >
                                <Grid className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`rounded p-2 transition-colors ${
                                    viewMode === 'list'
                                        ? 'bg-gray-700 text-white'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                                aria-label="List view"
                            >
                                <List className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Filters Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                        >
                            <Filter className="h-5 w-5" />
                            <span className="hidden sm:inline">Filtri</span>
                        </button>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <SearchFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClose={() => setShowFilters(false)}
                    />
                )}

                {/* Results Grid/List */}
                {filteredResults.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {filteredResults.map((item) => (
                                <ContentCard
                                    key={`${item.type}-${item.movie_id}`}
                                    content={item}
                                    type={item.type}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredResults.map((item) => {
                                const posterUrl = item.poster
                                    ? `https://image.tmdb.org/t/p/w185${item.poster}`
                                    : '/placeholder-poster.jpg';

                                return (
                                    <div
                                        key={`${item.type}-${item.movie_id}`}
                                        onClick={() => navigate(`/${item.type}/${item.movie_id}`)}
                                        className="flex cursor-pointer gap-4 rounded-lg bg-gray-800 p-4 transition-all hover:bg-gray-700"
                                    >
                                        <img
                                            src={posterUrl}
                                            alt={item.title}
                                            className="h-32 w-24 flex-shrink-0 rounded object-cover"
                                        />

                                        <div className="flex-1">
                                            <h3 className="mb-2 text-xl font-bold text-white">
                                                {item.title}
                                            </h3>

                                            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-400">
                        <span className="rounded bg-gray-700 px-2 py-1 text-xs font-semibold uppercase">
                          {item.type === 'movie' ? 'Film' : 'Serie TV'}
                        </span>

                                                {item.popularity && (
                                                    <span>Popolarità: {Math.round(item.popularity)}</span>
                                                )}

                                                {item.vote_average && (
                                                    <span className="flex items-center gap-1">
                            <span className="text-yellow-400">★</span>
                                                        {(item.vote_average / 2).toFixed(1)}
                          </span>
                                                )}
                                            </div>

                                            {item.overview && (
                                                <p className="line-clamp-2 text-sm text-gray-300">
                                                    {item.overview}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg bg-gray-800 py-16">
                        <p className="mb-2 text-xl font-semibold text-white">
                            Nessun risultato trovato
                        </p>
                        <p className="text-gray-400">
                            Prova a modificare i filtri o effettuare una nuova ricerca
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;