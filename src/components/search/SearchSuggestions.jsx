import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Star, Calendar } from 'lucide-react';
import { getTrendingAllWithFavorites, getGenres } from '../../services/content.service';

const SearchSuggestions = ({ onSearchSelect }) => {
    const navigate = useNavigate();
    const [trending, setTrending] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const [trendingData, genresData] = await Promise.all([
                getTrendingAllWithFavorites(),
                getGenres()
            ]);

            setTrending(trendingData.slice(0, 6));
            setGenres(genresData.slice(0, 8));
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTrendingClick = (item) => {
        const contentType = item.type === 'movie' ? 'movie' : 'tv';
        navigate(`/${contentType}/${item.movie_id}`);
        onSearchSelect?.();
    };

    const handleGenreClick = (genre) => {
        navigate(`/genre/${genre.genre_id}`);
        onSearchSelect?.();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            {/* Trending Section */}
            <div>
                <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-bold text-white">Di tendenza</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                    {trending.map((item) => {
                        const posterUrl = item.poster
                            ? `https://image.tmdb.org/t/p/w185${item.poster}`
                            : '/placeholder-poster.jpg';

                        return (
                            <button
                                key={`${item.type}-${item.movie_id}`}
                                onClick={() => handleTrendingClick(item)}
                                className="group relative overflow-hidden rounded-lg transition-transform hover:scale-105"
                            >
                                <div className="relative aspect-[2/3]">
                                    <img
                                        src={posterUrl}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                                    {/* Type Badge */}
                                    <div className="absolute right-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                                        {item.type === 'movie' ? 'Film' : 'Serie'}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Genres Section */}
            <div>
                <div className="mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-bold text-white">Sfoglia per genere</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {genres.map((genre) => (
                        <button
                            key={genre.genre_id}
                            onClick={() => handleGenreClick(genre)}
                            className="rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 p-4 text-left transition-all hover:scale-105 hover:from-red-900 hover:to-gray-900"
                        >
                            <h4 className="font-semibold text-white">{genre.genre_name}</h4>
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Links */}
            <div>
                <div className="mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-bold text-white">Scopri</h3>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    <button
                        onClick={() => {
                            navigate('/movies/trending');
                            onSearchSelect?.();
                        }}
                        className="flex items-center gap-3 rounded-lg bg-gray-800 p-4 transition-colors hover:bg-gray-700"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-semibold text-white">Film di tendenza</h4>
                            <p className="text-xs text-gray-400">I più popolari ora</p>
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            navigate('/movies/top-rated');
                            onSearchSelect?.();
                        }}
                        className="flex items-center gap-3 rounded-lg bg-gray-800 p-4 transition-colors hover:bg-gray-700"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-600">
                            <Star className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-semibold text-white">I più votati</h4>
                            <p className="text-xs text-gray-400">Le migliori valutazioni</p>
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            navigate('/movies/recent');
                            onSearchSelect?.();
                        }}
                        className="flex items-center gap-3 rounded-lg bg-gray-800 p-4 transition-colors hover:bg-gray-700"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                            <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left">
                            <h4 className="font-semibold text-white">Aggiunti di recente</h4>
                            <p className="text-xs text-gray-400">Le ultime novità</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchSuggestions;