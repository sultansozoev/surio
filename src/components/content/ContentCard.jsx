import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { addToFavourite, removeFromFavourite } from '../../services/content.service';

const ContentCard = ({ content, onFavoriteChange }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isFavorite, setIsFavorite] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (content) {
            setIsFavorite(!!content.is_favorite);
        }
    }, [content?.is_favorite, content?.movie_id, content?.serie_tv_id]);

    const getContentId = () => {
        return content?.serie_tv_id || content?.movie_id;
    };

    const getContentType = () => {
        if (content?.type) return content.type;
        return content?.serie_tv_id ? 'tv' : 'movie';
    };

    const contentId = getContentId();
    const contentType = getContentType();

    const posterUrl = content?.poster
        ? (content.poster.startsWith('http')
            ? content.poster
            : `https://image.tmdb.org/t/p/w500${content.poster}`)
        : '/placeholder-poster.jpg';

    const handleFavoriteToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || !contentId || loading) return;

        setLoading(true);
        const previousState = isFavorite;

        try {
            setIsFavorite(!previousState);

            if (previousState) {
                await removeFromFavourite(contentId, user.user_id, contentType);
            } else {
                await addToFavourite(contentId, user.user_id, contentType);
            }

            if (onFavoriteChange) {
                await onFavoriteChange();
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setIsFavorite(previousState);
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (e) => {
        if (e.target.closest('button') || e.target.closest('a')) {
            return;
        }
        navigate(linkPath);
    };

    const year = content?.release_date
        ? new Date(content.release_date).getFullYear()
        : content?.year || 'N/A';

    const rating = content?.vote_average
        ? (content.vote_average).toFixed(1)
        : 'N/A';

    if (!content || !contentId) {
        return null;
    }

    const linkPath = `/watch/${contentType}/${contentId}`;

    return (
        <div
            className="group relative block cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCardClick}
        >
            <div className={`relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-900 shadow-xl transition-all duration-500 ease-out ${
                isHovered ? 'scale-105 shadow-2xl' : ''
            }`}>
                {/* Poster Image */}
                <img
                    src={posterUrl}
                    alt={content.title}
                    className={`h-full w-full object-cover transition-transform duration-700 ease-out ${
                        isHovered ? 'scale-110' : ''
                    }`}
                    loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-500 ease-out ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                }`} />

                {/* Content Overlay */}
                <div className={`absolute inset-0 flex flex-col justify-between p-4 transition-opacity duration-500 ease-out ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                }`}>

                    {/* Top Section - Rating Badge */}
                    <div className="flex items-start justify-end">
                        {rating !== 'N/A' && (
                            <div className="flex items-center gap-1 rounded-md bg-black/80 px-2.5 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{rating}</span>
                            </div>
                        )}
                    </div>

                    {/* Bottom Section - Actions and Info */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            {/* Play Button */}
                            <Link
                                to={linkPath}
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-lg transition-all duration-300 ease-out hover:scale-110 hover:bg-red-500 hover:text-white active:scale-95 z-10"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Play className="h-5 w-5 fill-current ml-0.5" />
                            </Link>

                            {/* Favorite Button */}
                            {user && (
                                <button
                                    className={`flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out hover:scale-110 active:scale-95 z-10 ${
                                        isFavorite
                                            ? 'border-green-500 bg-green-500 text-white'
                                            : 'border-white/80 bg-black/50 text-white hover:border-white hover:bg-black/70'
                                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={handleFavoriteToggle}
                                    disabled={loading}
                                    title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                                >
                                    {loading ? (
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                    ) : isFavorite ? (
                                        <Check className="h-5 w-5 stroke-[3]" />
                                    ) : (
                                        <Plus className="h-5 w-5 stroke-[3]" />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Content Info */}
                        <div className="space-y-1.5 rounded-lg bg-black/60 p-3 backdrop-blur-sm">
                            <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight">
                                {content.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <span className="font-medium">{year}</span>
                                <span className="text-gray-500">•</span>
                                <span className={`font-medium ${contentType === 'tv' ? 'text-red-400' : 'text-blue-400'}`}>
                                    {contentType === 'tv' ? 'Serie TV' : 'Film'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar for Continue Watching */}
                {content.player_time && content.runtime && (
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800/80">
                        <div
                            className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300 ease-out shadow-lg"
                            style={{
                                width: `${Math.min((content.player_time / content.runtime) * 100, 100)}%`
                            }}
                        />
                    </div>
                )}

                {/* Subtle Shine Effect on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transition-opacity duration-700 ease-out ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                }`} />
            </div>
        </div>
    );
};

export default ContentCard;