import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { contentAPI, userAPI } from '../services/api';
import { getImageUrl, formatRuntime, getYear } from '../utils/helpers';
import { IMAGE_SIZES } from '../utils/constants';

const ContentDetail = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [content, setContent] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadContent();
    }, [type, id]);

    useEffect(() => {
        if (user && content) {
            checkFavorite();
        }
    }, [user, content]);

    useEffect(() => {
        if (selectedSeason) {
            loadEpisodes(selectedSeason.season_id);
        }
    }, [selectedSeason]);

    const loadContent = async () => {
        try {
            setLoading(true);
            setError(null);

            let response;
            if (type === 'movie') {
                response = await contentAPI.getMovie(id);
                setContent(response.data.film[0]);
            } else {
                response = await contentAPI.getSerie(id);
                setContent(response.data.results[0]);

                // Carica stagioni per serie TV
                const seasonsResponse = await contentAPI.getSeasons(id);
                const seasonsData = seasonsResponse.data || [];
                setSeasons(seasonsData);

                if (seasonsData.length > 0) {
                    setSelectedSeason(seasonsData[0]);
                }
            }
        } catch (err) {
            console.error('Error loading content:', err);
            setError('Errore nel caricamento dei dettagli');
        } finally {
            setLoading(false);
        }
    };

    const loadEpisodes = async (seasonId) => {
        try {
            const response = await contentAPI.getEpisodes(seasonId);
            setEpisodes(response.data || []);
        } catch (err) {
            console.error('Error loading episodes:', err);
        }
    };

    const checkFavorite = async () => {
        if (!user || !content) return;

        try {
            let response;
            if (type === 'movie') {
                response = await userAPI.isFavorite(id, user.user_id);
            } else {
                response = await userAPI.isFavoriteTV(id, user.user_id);
            }
            setIsFavorite(response.data && response.data.length > 0);
        } catch (err) {
            console.error('Error checking favorite:', err);
        }
    };

    const toggleFavorite = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            if (isFavorite) {
                if (type === 'movie') {
                    await userAPI.removeFavorite(id, user.user_id);
                } else {
                    await userAPI.removeFavoriteTV(id, user.user_id);
                }
            } else {
                if (type === 'movie') {
                    await userAPI.addFavorite(id, user.user_id);
                } else {
                    await userAPI.addFavoriteTV(id, user.user_id);
                }
            }
            setIsFavorite(!isFavorite);
        } catch (err) {
            console.error('Error toggling favorite:', err);
        }
    };

    const handlePlay = () => {
        navigate(`/watch/${type}/${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-2xl animate-pulse">Caricamento...</div>
            </div>
        );
    }

    if (error || !content) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-xl mb-4">{error || 'Contenuto non trovato'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors"
                    >
                        Torna indietro
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Hero Section */}
            <div className="relative h-[70vh] md:h-[80vh]">
                {/* Background */}
                <div className="absolute inset-0">
                    <img
                        src={getImageUrl(content.background_image, IMAGE_SIZES.BACKDROP_ORIGINAL)}
                        alt={content.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="relative h-full flex items-end px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
                    <div className="max-w-2xl space-y-6">
                        {/* Back Button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors mb-4"
                        >
                            <ArrowLeft size={20} />
                            <span>Indietro</span>
                        </button>

                        {/* Title */}
                        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                            {content.title}
                        </h1>

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                            <div className="flex items-center space-x-1">
                                <Star className="text-yellow-500" size={16} fill="currentColor" />
                                <span className="font-semibold">{content.vote_average?.toFixed(1) || 'N/A'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <Calendar size={16} />
                                <span>{getYear(content.release_date)}</span>
                            </div>
                            {content.runtime && (
                                <div className="flex items-center space-x-1">
                                    <Clock size={16} />
                                    <span>{formatRuntime(content.runtime)}</span>
                                </div>
                            )}
                            <span className="px-2 py-1 bg-gray-700/80 rounded text-xs font-semibold">HD</span>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={handlePlay}
                                className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-200 transition-all transform hover:scale-105"
                            >
                                <Play size={20} fill="currentColor" />
                                <span>Riproduci</span>
                            </button>

                            <button
                                onClick={toggleFavorite}
                                className="flex items-center space-x-2 bg-gray-700/80 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-600/80 transition-all backdrop-blur-sm"
                            >
                                {isFavorite ? <Check size={20} /> : <Plus size={20} />}
                                <span>{isFavorite ? 'Nella lista' : 'Aggiungi alla lista'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Description */}
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">Trama</h2>
                            <p className="text-gray-300 leading-relaxed">
                                {content.overview || 'Descrizione non disponibile.'}
                            </p>
                        </div>

                        {/* Seasons & Episodes (TV) */}
                        {type === 'tv' && seasons.length > 0 && (
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-4">Stagioni ed Episodi</h2>

                                {/* Season Selector */}
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {seasons.map((season) => (
                                        <button
                                            key={season.season_id}
                                            onClick={() => setSelectedSeason(season)}
                                            className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                                selectedSeason?.season_id === season.season_id
                                                    ? 'bg-primary text-white'
                                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                            }`}
                                        >
                                            Stagione {season.season_number}
                                        </button>
                                    ))}
                                </div>

                                {/* Episodes List */}
                                <div className="space-y-4">
                                    {episodes.map((episode, index) => (
                                        <div
                                            key={episode.episode_id}
                                            className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-shrink-0 w-32 h-20 bg-gray-800 rounded overflow-hidden">
                                                    {episode.background_image && (
                                                        <img
                                                            src={getImageUrl(episode.background_image, IMAGE_SIZES.BACKDROP_SMALL)}
                                                            alt={episode.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                            <span className="text-gray-400 text-sm">
                              {episode.episode_number}
                            </span>
                                                        <h3 className="text-white font-semibold">
                                                            {episode.title || `Episodio ${episode.episode_number}`}
                                                        </h3>
                                                    </div>
                                                    {episode.runtime && (
                                                        <p className="text-gray-500 text-sm">
                                                            {formatRuntime(episode.runtime)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Poster */}
                        <div className="rounded-lg overflow-hidden shadow-2xl">
                            <img
                                src={getImageUrl(content.poster, IMAGE_SIZES.POSTER_LARGE)}
                                alt={content.title}
                                className="w-full"
                            />
                        </div>

                        {/* Info */}
                        <div className="bg-gray-900 rounded-lg p-6 space-y-4">
                            <div>
                                <h3 className="text-gray-400 text-sm mb-1">Popolarità</h3>
                                <p className="text-white font-semibold">
                                    {content.popularity?.toFixed(0) || 'N/A'}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-gray-400 text-sm mb-1">Data di uscita</h3>
                                <p className="text-white font-semibold">
                                    {content.release_date || 'N/A'}
                                </p>
                            </div>

                            {type === 'tv' && (
                                <>
                                    <div>
                                        <h3 className="text-gray-400 text-sm mb-1">Stagioni</h3>
                                        <p className="text-white font-semibold">
                                            {seasons.length}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="text-gray-400 text-sm mb-1">Episodi totali</h3>
                                        <p className="text-white font-semibold">
                                            {seasons.reduce((acc, s) => acc + (s.episode_count || 0), 0)}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentDetail;