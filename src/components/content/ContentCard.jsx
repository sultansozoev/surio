// src/components/content/ContentCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Plus, Check, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { addToFavourite, removeFromFavourite } from '../../services/content.service';

const ContentCard = ({ content, type, onFavoriteChange }) => {
    const { user } = useAuth();
    const [isFavorite, setIsFavorite] = useState(content?.is_favorite || false);
    const [isHovered, setIsHovered] = useState(false);
    const [loading, setLoading] = useState(false);

    // ✅ CORREZIONE: Gestione corretta degli ID per film e serie TV
    const getContentId = () => {
        const contentType = type || content?.type || 'movie';

        if (contentType === 'tv') {
            // Per le serie TV: cerca serie_tv_id o serietvid o movie_id (usato come fallback)
            return content?.serie_tv_id || content?.serietvid || content?.movie_id || content?.movieid || content?.id;
        } else {
            // Per i film: cerca movie_id o movieid o id
            return content?.movie_id || content?.movieid || content?.id;
        }
    };

    const contentId = getContentId();
    const contentType = type || content?.type || 'movie';

    console.log('🎬 ContentCard Debug:', {
        content,
        contentId,
        contentType,
        originalType: type,
        contentOriginalType: content?.type
    });

    const posterUrl = content?.poster
        ? (content.poster.startsWith('http')
            ? content.poster
            : `https://image.tmdb.org/t/p/w500${content.poster}`)
        : '/placeholder-poster.jpg';

    const handleFavoriteToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || !contentId) {
            console.error('❌ User not logged in or content ID missing:', { user: !!user, contentId });
            return;
        }

        console.log('💖 Toggle favorite:', {
            contentId,
            userId: user.user_id,
            contentType,
            currentFavorite: isFavorite
        });

        setLoading(true);
        try {
            if (isFavorite) {
                console.log('🗑️ Removing from favorites...');
                await removeFromFavourite(contentId, user.user_id, contentType);
                setIsFavorite(false);
                console.log('✅ Removed from favorites');
            } else {
                console.log('➕ Adding to favorites...');
                await addToFavourite(contentId, user.user_id, contentType);
                setIsFavorite(true);
                console.log('✅ Added to favorites');
            }
            onFavoriteChange?.();
        } catch (error) {
            console.error('❌ Error toggling favorite:', error);
            // Reverte lo stato in caso di errore
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
        ? (content.vote_average / 2).toFixed(1)
        : 'N/A';

    // Se non abbiamo un contenuto valido, non renderizzare niente
    if (!content || !contentId) {
        console.error('❌ ContentCard: Missing content data', { content, contentId });
        return null;
    }

    return (
        <Link
            to={`/${contentType}/${contentId}`}
            className="group relative block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gray-800 transition-transform duration-300 group-hover:scale-105">
                <img
                    src={posterUrl}
                    alt={content.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                />

                {/* Overlay gradiente */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                }`}>
                    {/* Azioni rapide */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <button
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110"
                                onClick={(e) => {
                                    e.preventDefault();
                                    // Gestito dal Link parent
                                }}
                            >
                                <Play className="h-5 w-5 fill-current" />
                            </button>

                            {/* Mostra bottone preferiti solo se l'utente è loggato */}
                            {user && (
                                <button
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                                        isFavorite
                                            ? 'border-green-500 bg-green-500 text-white'
                                            : 'border-white bg-transparent text-white hover:border-gray-300'
                                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={handleFavoriteToggle}
                                    disabled={loading}
                                    title={isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
                                >
                                    {loading ? (
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                    ) : isFavorite ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <Plus className="h-5 w-5" />
                                    )}
                                </button>
                            )}

                            <button
                                className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-transparent text-white transition-colors hover:border-gray-300"
                                onClick={(e) => {
                                    e.preventDefault();
                                    // Apre modal info
                                }}
                            >
                                <Info className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Info contenuto */}
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold text-white line-clamp-2">
                                {content.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <span>{year}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <span className="text-yellow-400">★</span>
                                    {rating}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badge tipo contenuto */}
                {contentType === 'tv' && (
                    <div className="absolute top-2 right-2 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                        SERIE
                    </div>
                )}

                {/* Indicatore continua a guardare */}
                {content.player_time && content.runtime && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                        <div
                            className="h-full bg-red-600 transition-all"
                            style={{
                                width: `${Math.min((content.player_time / content.runtime) * 100, 100)}%`
                            }}
                        />
                    </div>
                )}
            </div>
        </Link>
    );
};

export default ContentCard;
