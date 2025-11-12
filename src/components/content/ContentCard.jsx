import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Check, Info, Star } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { addToFavourite, removeFromFavourite } from '../../services/content.service';

const ContentCard = ({ content, onFavoriteChange }) => {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(content?.is_favorite || false);
    const [isHovered, setIsHovered] = useState(false);
    const [loading, setLoading] = useState(false);

    const getContentId = () => {
        if (content?.serie_tv_id) {
            return content?.serie_tv_id;
        }
        return content?.movie_id;
    };

    const getContentType = () => {
        if (content?.type) {
            return content.type;
        }

        if (content?.serie_tv_id) {
            return 'tv';
        }

        return 'movie';
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

        if (!user || !contentId) {
            console.error('User not logged in or content ID missing:', { user: !!user, contentId });
            return;
        }

        setLoading(true);
        try {
            if (isFavorite) {
                await removeFromFavourite(contentId, user.user_id, contentType);
                setIsFavorite(false);
            } else {
                await addToFavourite(contentId, user.user_id, contentType);
                setIsFavorite(true);
            }
            onFavoriteChange?.();
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setIsFavorite(prev => !prev);
        } finally {
            setLoading(false);
        }
    };

    const year = content?.release_date
        ? new Date(content.release_date).getFullYear()
        : content?.releasedate
            ? new Date(content.releasedate).getFullYear()
            : content?.year || 'N/A';

    const rating = content?.vote_average
        ? (content.vote_average).toFixed(1)
        : 'N/A';

    if (!content || !contentId) {
        console.error('ContentCard: Missing content data', { content, contentId });
        return null;
    }

    const linkPath = `watch/${contentType}/${contentId}`;

    return (
        <Link
            to={linkPath}
            className="group relative block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`relative aspect-[2/3] overflow-hidden rounded-xl bg-gray-900 shadow-xl transition-all duration-500 ease-out ${
                isHovered ? 'scale-105 shadow-2xl ring-2 ring-red-500/50' : ''
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

                    {/* Top Section - Rating Badge Only */}
                    <div className="flex items-start justify-end">
                        {/* Rating Badge */}
                        {rating !== 'N/A' && (
                            <div className="flex items-center gap-1 rounded-md bg-black/80 px-2.5 py-1 text-xs font-semibold text-white shadow-lg backdrop-blur-sm">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{rating}</span>
                            </div>
                        )}
                    </div>

                    {/* Bottom Section - Actions and Info */}
                    <div className="space-y-3">
                        {/* Quick Actions */}
                        <div className="flex items-center gap-2">
                            {/* Play Button */}
                            <button
                                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-lg transition-all duration-300 ease-out hover:scale-110 hover:bg-red-500 hover:text-white active:scale-95"
                                onClick={(e) => {
                                    e.preventDefault();
                                }}
                            >
                                <Play className="h-5 w-5 fill-current ml-0.5" />
                            </button>

                            {/* Favorite Button */}
                            {user && (
                                <button
                                    className={`flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out hover:scale-110 active:scale-95 ${
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
        </Link>
    );
};

export default ContentCard;