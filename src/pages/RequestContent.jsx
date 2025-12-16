import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Film, Tv, Star, Calendar, Plus, Check, AlertCircle } from 'lucide-react';
import { Spinner } from '../components/common/Spinner';
import authService from '../services/auth.services';

const RequestContent = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [requestingIds, setRequestingIds] = useState(new Set());
    const [successIds, setSuccessIds] = useState(new Set());
    const [errorMessages, setErrorMessages] = useState({});

    const TMDB_API_KEY = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3NjhjYmM2YzFhMjQ1ZWU5N2MxNTNjNTVmYWZiN2I2MiIsInN1YiI6IjYwMTFjNWE2NDU4MTk5MDAzYzIxZTQ3YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.LNtZ__C8hNms7aOYLF6R44lHIarYsTCrE8eAohKAt8E';

    // Ricerca in tempo reale
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                searchContent(searchQuery);
            } else {
                setSearchResults([]);
            }
        }, 500); // Debounce di 500ms

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const searchContent = async (query) => {
        if (!query.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=it-IT&page=1`,
                {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        Authorization: TMDB_API_KEY
                    }
                }
            );

            const data = await response.json();
            const filteredResults = data.results.filter(
                item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv')
            );
            setSearchResults(filteredResults);
        } catch (error) {
            console.error('Error searching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const addRequest = async (movie) => {
        if (!user?.user_id) {
            return;
        }

        const movieKey = `${movie.media_type}-${movie.id}`;
        setRequestingIds(prev => new Set(prev).add(movieKey));
        setErrorMessages(prev => {
            const newErrors = { ...prev };
            delete newErrors[movieKey];
            return newErrors;
        });

        const title = movie.media_type === 'tv' ? movie.name : movie.title;
        const releaseDate = movie.media_type === 'tv' ? movie.first_air_date : movie.release_date;
        const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000'}/addList`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeader()
                },
                body: JSON.stringify({
                    user_id: user.user_id,
                    year,
                    poster: movie.poster_path,
                    vote_average: movie.vote_average,
                    req_id: movie.id,
                    type: movie.media_type,
                    title
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (data.code === 'ER_DUP_ENTRY') {
                setErrorMessages(prev => ({ ...prev, [movieKey]: 'Già richiesto' }));
            } else if (data === 'Record exists' || data.message === 'Record exists') {
                setErrorMessages(prev => ({ ...prev, [movieKey]: 'Già presente' }));
            } else {
                setSuccessIds(prev => new Set(prev).add(movieKey));
                setTimeout(() => {
                    setSuccessIds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(movieKey);
                        return newSet;
                    });
                }, 3000);
            }
        } catch (error) {
            console.error('Error adding request:', error);
            setErrorMessages(prev => ({ ...prev, [movieKey]: 'Errore di rete' }));
        } finally {
            setRequestingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(movieKey);
                return newSet;
            });
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.getFullYear();
    };

    const getVoteColor = (vote) => {
        if (vote >= 7.5) return 'from-green-500 to-emerald-600';
        if (vote >= 6) return 'from-yellow-500 to-orange-500';
        return 'from-red-500 to-pink-600';
    };

    const getVoteTextColor = (vote) => {
        if (vote >= 7.5) return 'text-green-400';
        if (vote >= 6) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white py-8 relative overflow-hidden">
            {/* Sfondo decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/30 to-black" />
                <div className="absolute top-20 left-1/3 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl animate-pulse"
                     style={{ animationDelay: '1.5s' }} />
                <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-pink-500/8 rounded-full blur-3xl animate-pulse"
                     style={{ animationDelay: '3s' }} />
            </div>

            <div className="container mx-auto px-4 relative z-10">

                {/* Search Bar */}
                <div className="mb-12 max-w-3xl mx-auto">
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cerca film, serie TV..."
                            className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl px-14 py-5 text-white text-lg placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            autoFocus
                        />
                        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                        {loading && (
                            <div className="absolute right-5 top-1/2 transform -translate-y-1/2">
                                <Spinner size="small" />
                            </div>
                        )}
                    </div>
                    {searchQuery && (
                        <p className="text-gray-500 text-sm mt-3 text-center">
                            {searchResults.length > 0 
                                ? `${searchResults.length} risultat${searchResults.length !== 1 ? 'i' : 'o'} trovat${searchResults.length !== 1 ? 'i' : 'o'}`
                                : !loading && 'Nessun risultato trovato'}
                        </p>
                    )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {searchResults.map((movie) => {
                            const title = movie.media_type === 'tv' ? movie.name : movie.title;
                            const releaseDate = movie.media_type === 'tv' ? movie.first_air_date : movie.release_date;
                            const movieKey = `${movie.media_type}-${movie.id}`;
                            const isRequesting = requestingIds.has(movieKey);
                            const isSuccess = successIds.has(movieKey);
                            const errorMessage = errorMessages[movieKey];

                            return (
                                <div
                                    key={movieKey}
                                    onClick={() => !isRequesting && !isSuccess && addRequest(movie)}
                                    className={`group relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-10 ${
                                        isRequesting ? 'opacity-75 cursor-wait' : ''
                                    } ${isSuccess ? 'opacity-75' : ''}`}
                                >
                                    <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-900 shadow-xl">
                                        {/* Poster */}
                                        <img
                                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                            alt={title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                                        {/* Type Badge */}
                                        <div className="absolute top-2 right-2">
                                            <div className={`px-2.5 py-1 rounded-lg backdrop-blur-md font-bold text-[10px] flex items-center gap-1 shadow-lg ${
                                                movie.media_type === 'tv'
                                                    ? 'bg-red-600/90 text-white'
                                                    : 'bg-blue-600/90 text-white'
                                            }`}>
                                                {movie.media_type === 'tv' ? (
                                                    <>
                                                        <Tv className="w-3 h-3" />
                                                        TV
                                                    </>
                                                ) : (
                                                    <>
                                                        <Film className="w-3 h-3" />
                                                        FILM
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Vote Badge */}
                                        {movie.vote_average > 0 && (
                                            <div className="absolute top-2 left-2">
                                                <div className={`px-2 py-1 rounded-lg backdrop-blur-md font-bold text-xs flex items-center gap-1 shadow-lg bg-gradient-to-r ${getVoteColor(movie.vote_average)}`}>
                                                    <Star className="w-3 h-3 fill-white text-white" />
                                                    <span className="text-white">{movie.vote_average.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Hover Content */}
                                        <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <h3 className="text-white font-bold text-sm leading-tight mb-1 line-clamp-2 drop-shadow-lg">
                                                {title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-200 mb-2">
                                                <Calendar className="w-3 h-3" />
                                                <span>{formatDate(releaseDate)}</span>
                                            </div>

                                            {/* Action Button/Status */}
                                            <div className="w-full">
                                                {isRequesting ? (
                                                    <div className="flex items-center justify-center gap-2 bg-gray-800/90 backdrop-blur-md rounded-lg py-2 text-xs font-semibold text-white">
                                                        <Spinner size="small" />
                                                        Richiesta...
                                                    </div>
                                                ) : isSuccess ? (
                                                    <div className="flex items-center justify-center gap-2 bg-green-600/90 backdrop-blur-md rounded-lg py-2 text-xs font-semibold text-white animate-pulse">
                                                        <Check className="w-4 h-4" />
                                                        Richiesto!
                                                    </div>
                                                ) : errorMessage ? (
                                                    <div className="flex items-center justify-center gap-2 bg-red-600/90 backdrop-blur-md rounded-lg py-2 text-xs font-semibold text-white">
                                                        <AlertCircle className="w-4 h-4" />
                                                        {errorMessage}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 backdrop-blur-md rounded-lg py-2 text-xs font-bold text-white shadow-lg shadow-purple-500/50 group-hover:shadow-purple-500/80 transition-shadow">
                                                        <Plus className="w-4 h-4" />
                                                        Clicca per richiedere
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Shine Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : !loading && searchQuery ? (
                    <div className="text-center py-20">
                        <div className="text-gray-400 mb-4 bg-gray-800/20 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto border border-gray-700/30">
                            <Search className="w-20 h-20 mx-auto mb-6 opacity-30" />
                            <h3 className="text-2xl font-semibold mb-3 text-white">
                                Nessun risultato
                            </h3>
                            <p className="text-gray-500">Prova con un altro termine di ricerca</p>
                        </div>
                    </div>
                ) : !searchQuery ? (
                    <div className="text-center py-20">
                        <div className="text-gray-400 mb-4 bg-gray-800/20 backdrop-blur-sm rounded-2xl p-12 max-w-lg mx-auto border border-gray-700/30">
                            <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                <Search className="w-12 h-12 text-purple-400" />
                            </div>
                            <h3 className="text-2xl font-semibold mb-3 text-white">
                                Cerca un contenuto
                            </h3>
                            <p className="text-gray-400 mb-6 text-lg">
                                Digita il titolo di un film o serie TV che vorresti vedere su Surio
                            </p>
                            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Film className="w-5 h-5 text-blue-400" />
                                    <span>Film</span>
                                </div>
                                <div className="w-px h-4 bg-gray-700" />
                                <div className="flex items-center gap-2">
                                    <Tv className="w-5 h-5 text-red-400" />
                                    <span>Serie TV</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default RequestContent;
