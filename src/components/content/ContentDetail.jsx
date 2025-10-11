import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import {
    getMovieDetails,
    getSerieDetails,
    checkFavorite,
    addToFavourite,
    removeFromFavourite
} from '../../services/content.service';
import Spinner from '../common/Spinner';

const ContentDetail = ({ type = 'movie' }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [content, setContent] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [trailerPlaying, setTrailerPlaying] = useState(false);

    useEffect(() => {
        fetchContentDetails();
    }, [id, type]);

    useEffect(() => {
        if (user && content) {
            checkIfFavorite();
        }
    }, [user, content]);

    const fetchContentDetails = async () => {
        try {
            setLoading(true);
            const data = type === 'movie'
                ? await getMovieDetails(id)
                : await getSerieDetails(id);
            setContent(data);
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkIfFavorite = async () => {
        try {
            const result = await checkFavorite(content.movie_id || content.serie_tv_id, user.user_id, type);
            setIsFavorite(result.length > 0);
        } catch (error) {
            console.error('Error checking favorite:', error);
        }
    };

    const handleFavoriteToggle = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const contentId = content.movie_id || content.serie_tv_id;
            if (isFavorite) {
                await removeFromFavourite(contentId, user.user_id, type);
                setIsFavorite(false);
            } else {
                await addToFavourite(contentId, user.user_id, type);
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handlePlayClick = () => {
        if (!user) {
            navigate('/login');
            return;
        }

        const contentId = content.movie_id || content.serie_tv_id;
        if (type === 'movie') {
            navigate(`/watch/movie/${contentId}`);
        } else {
            navigate(`/watch/tv/${contentId}`);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!content) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900">
                <p className="text-white">Contenuto non trovato</p>
            </div>
        );
    }

    const backdropUrl = content.background_image
        ? `https://image.tmdb.org/t/p/original${content.background_image}`
        : null;

    const posterUrl = content.poster
        ? `https://image.tmdb.org/t/p/w500${content.poster}`
        : '/placeholder-poster.jpg';

    const year = content.release_date
        ? new Date(content.release_date).getFullYear()
        : 'N/A';

    const rating = content.vote_average
        ? (content.vote_average / 2).toFixed(1)
        : 'N/A';

    const runtime = content.runtime
        ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m`
        : null;

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Hero Section */}
            <div className="relative h-screen">
                {/* Background Image */}
                {backdropUrl && (
                    <div className="absolute inset-0">
                        <img
                            src={backdropUrl}
                            alt={content.title}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-transparent" />
                    </div>
                )}

                {/* Content */}
                <div className="relative z-10 flex h-full items-end">
                    <div className="container mx-auto px-4 pb-20">
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-end">
                            {/* Poster */}
                            <div className="hidden flex-shrink-0 lg:block">
                                <img
                                    src={posterUrl}
                                    alt={content.title}
                                    className="w-64 rounded-lg shadow-2xl"
                                />
                            </div>

                            {/* Info */}
                            <div className="max-w-3xl space-y-6">
                                <div>
                                    <h1 className="text-5xl font-bold text-white lg:text-6xl">
                                        {content.title}
                                    </h1>

                                    <div className="mt-4 flex flex-wrap items-center gap-4 text-gray-300">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                            <span className="text-lg font-semibold">{rating}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5" />
                                            <span>{year}</span>
                                        </div>

                                        {runtime && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-5 w-5" />
                                                <span>{runtime}</span>
                                            </div>
                                        )}

                                        {type === 'tv' && (
                                            <span className="rounded bg-red-600 px-3 py-1 text-sm font-semibold">
                        SERIE TV
                      </span>
                                        )}
                                    </div>
                                </div>

                                {content.overview && (
                                    <p className="text-lg leading-relaxed text-gray-200">
                                        {content.overview}
                                    </p>
                                )}

                                {/* Buttons */}
                                <div className="flex flex-wrap gap-4">
                                    <button
                                        onClick={handlePlayClick}
                                        className="flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-lg font-semibold text-black transition-transform hover:scale-105"
                                    >
                                        <Play className="h-6 w-6 fill-current" />
                                        Riproduci
                                    </button>

                                    <button
                                        onClick={handleFavoriteToggle}
                                        className={`flex items-center gap-2 rounded-lg px-8 py-3 text-lg font-semibold transition-all ${
                                            isFavorite
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-gray-700 text-white hover:bg-gray-600'
                                        }`}
                                    >
                                        {isFavorite ? (
                                            <>
                                                <Check className="h-6 w-6" />
                                                Nella tua lista
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-6 w-6" />
                                                Aggiungi alla lista
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Genres */}
                                {content.genres && content.genres.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {content.genres.map((genre) => (
                                            <span
                                                key={genre.id}
                                                className="rounded-full border border-gray-600 px-4 py-1 text-sm text-gray-300"
                                            >
                        {genre.name}
                      </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Additional Info Sections */}
            <div className="container mx-auto px-4 py-12">
                {/* Cast & Crew */}
                {content.credits && (
                    <section className="mb-12">
                        <h2 className="mb-6 text-2xl font-bold text-white">Cast</h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                            {content.credits.cast?.slice(0, 6).map((person) => (
                                <div key={person.id} className="text-center">
                                    <img
                                        src={
                                            person.profile_path
                                                ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                                                : '/placeholder-avatar.jpg'
                                        }
                                        alt={person.name}
                                        className="mb-2 aspect-square w-full rounded-lg object-cover"
                                    />
                                    <p className="text-sm font-semibold text-white">{person.name}</p>
                                    <p className="text-xs text-gray-400">{person.character}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Similar Content */}
                {content.similar && content.similar.length > 0 && (
                    <section>
                        <h2 className="mb-6 text-2xl font-bold text-white">Simili</h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {content.similar.slice(0, 6).map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        const newId = item.movie_id || item.serie_tv_id || item.id;
                                        navigate(`/${type}/${newId}`);
                                    }}
                                    className="cursor-pointer transition-transform hover:scale-105"
                                >
                                    <img
                                        src={
                                            item.poster
                                                ? `https://image.tmdb.org/t/p/w342${item.poster}`
                                                : '/placeholder-poster.jpg'
                                        }
                                        alt={item.title}
                                        className="w-full rounded-lg"
                                    />
                                    <p className="mt-2 text-sm text-white line-clamp-2">{item.title}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ContentDetail;