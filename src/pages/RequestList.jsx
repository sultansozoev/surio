import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Film, Tv, Star, Calendar, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import authService from '../services/auth.services';

const RequestList = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('date');

    useEffect(() => {
        if (user?.user_id) {
            fetchRequests();
        }
    }, [user?.user_id]);

    const fetchRequests = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000'}/getList`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...authService.getAuthHeader()
                    },
                    body: JSON.stringify({ user_id: user.user_id }),
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📋 Requests data:', data);
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveRequest = async (request) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000'}/elimina`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authService.getAuthHeader()
                },
                body: JSON.stringify({
                    list_id: request.list_id,
                    user_id: user.user_id,
                    request_id: request.req_id
                }),
                credentials: 'include'
            });

            if (response.ok) {
                fetchRequests();
            }
        } catch (error) {
            console.error('Error removing request:', error);
        }
    };

    const getFilteredAndSortedData = () => {
        let filtered = [...requests];

        if (filterType !== 'all') {
            filtered = filtered.filter(item => item.type === filterType);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return (a.title || '').localeCompare(b.title || '');
                case 'date':
                    return new Date(b.added_date || 0) - new Date(a.added_date || 0);
                case 'vote':
                    return (b.vote_average || 0) - (a.vote_average || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const filteredRequests = getFilteredAndSortedData();

    const getVoteColor = (vote) => {
        if (vote >= 7.5) return 'text-green-400';
        if (vote >= 6) return 'text-yellow-400';
        return 'text-red-400';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
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

                {/* Filters and Sort */}
                <div className="flex flex-wrap gap-4 mb-6 items-center">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-400">Filtra per:</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-600 transition-colors"
                        >
                            <option value="all">Tutti</option>
                            <option value="movie">Film</option>
                            <option value="tv">Serie TV</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-400">Ordina per:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-600 transition-colors"
                        >
                            <option value="date">Data Richiesta</option>
                            <option value="title">Titolo</option>
                            <option value="vote">Valutazione</option>
                        </select>
                    </div>

                    {filteredRequests.length > 0 && (
                        <div className="text-sm text-gray-400 ml-auto">
                            {filteredRequests.length} richiesta{filteredRequests.length !== 1 ? 'e' : ''}
                        </div>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Spinner size="large" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <div className="bg-red-600/10 border border-red-600/30 text-red-400 px-6 py-4 rounded-lg inline-block backdrop-blur-sm">
                            Errore nel caricamento: {error}
                        </div>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-gray-400 mb-4 bg-gray-800/20 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-gray-700/30">
                            <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold mb-2 text-white">
                                Nessuna richiesta
                            </h3>
                            <p className="mb-4">
                                Non hai ancora richiesto alcun contenuto
                            </p>
                            <Button
                                onClick={() => window.location.href = '/request'}
                                variant="primary"
                            >
                                Richiedi Contenuti
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredRequests.map((request) => {
                            const movieKey = `${request.type}-${request.req_id || request.movie_id}-${request.list_id}`;
                            
                            return (
                                <div
                                    key={movieKey}
                                    className="group relative transform transition-all duration-300 hover:scale-105 hover:z-10"
                                >
                                    <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-900 shadow-xl">
                                        {/* Poster */}
                                        <img
                                            src={`https://image.tmdb.org/t/p/w500${request.poster}`}
                                            alt={request.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                                        {/* Type Badge */}
                                        <div className="absolute top-2 right-2">
                                            <div className={`px-2.5 py-1 rounded-lg backdrop-blur-md font-bold text-[10px] flex items-center gap-1 shadow-lg ${
                                                request.type === 'tv'
                                                    ? 'bg-red-600/90 text-white'
                                                    : 'bg-blue-600/90 text-white'
                                            }`}>
                                                {request.type === 'tv' ? (
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

                                        {/* Vote Average */}
                                        {request.vote_average > 0 && (
                                            <div className="absolute top-2 left-2">
                                                <div className={`px-2 py-1 rounded-lg backdrop-blur-md font-bold text-xs flex items-center gap-1 shadow-lg bg-gradient-to-r ${
                                                    request.vote_average >= 7.5 ? 'from-green-500 to-emerald-600' :
                                                    request.vote_average >= 6 ? 'from-yellow-500 to-orange-500' :
                                                    'from-red-500 to-pink-600'
                                                }`}>
                                                    <Star className="w-3 h-3 fill-white text-white" />
                                                    <span className="text-white">
                                                        {parseFloat(request.vote_average).toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveRequest(request);
                                            }}
                                            className="absolute bottom-2 right-2 bg-red-600/90 hover:bg-red-600 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm shadow-lg hover:scale-110 z-10"
                                            title="Rimuovi richiesta"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        {/* Hover Content */}
                                        <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <h3 className="text-white font-bold text-sm leading-tight mb-1 line-clamp-2 drop-shadow-lg">
                                                {request.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-200 mb-2">
                                                <Calendar className="w-3 h-3" />
                                                <span>{request.year || 'N/A'}</span>
                                            </div>
                                            <div className="text-xs text-gray-300 opacity-75">
                                                Richiesto: {formatDate(request.added_date)}
                                            </div>
                                        </div>

                                        {/* Shine Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestList;
