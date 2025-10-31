import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { deleteContinueMovie, deleteContinueSerie } from '../../services/content.service';

const ContinueWatching = ({ items, onItemRemove }) => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [removingId, setRemovingId] = useState(null);

    const scroll = (direction) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = container.clientWidth * 0.8;
        const targetScroll = direction === 'left'
            ? container.scrollLeft - scrollAmount
            : container.scrollLeft + scrollAmount;

        container.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
    };

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        setShowLeftArrow(container.scrollLeft > 0);
        setShowRightArrow(
            container.scrollLeft < container.scrollWidth - container.clientWidth - 10
        );
    };

    const handleRemove = async (e, item) => {
        e.preventDefault();
        e.stopPropagation();

        const contentId = item.movie_id;
        setRemovingId(contentId);

        try {
            const userId = JSON.parse(localStorage.getItem('user'))?.user_id;
            if (!userId) return;

            if (item.type === 'movie') {
                await deleteContinueMovie(contentId, userId);
            } else {
                await deleteContinueSerie(contentId, userId);
            }

            onItemRemove?.(contentId);
        } catch (error) {
            console.error('Error removing item:', error);
        } finally {
            setRemovingId(null);
        }
    };

    const handleItemClick = (item) => {
        const contentId = item.movie_id;
        navigate(`/watch/${item.type}/${contentId}`);
    };

    const calculateProgress = (item) => {
        if (!item.player_time || !item.runtime) return 0;
        const runtimeInSeconds = item.runtime * 60;
        if (runtimeInSeconds === 0) return 0;
        return Math.min((item.player_time / runtimeInSeconds) * 100, 100);
    };

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="group relative mb-8 px-4 md:mb-12">
            {/* Title */}
            <h2 className="mb-4 text-xl font-bold text-white md:text-2xl">
                Continua a guardare
            </h2>

            {/* Scroll Container */}
            <div className="relative">
                {/* Left Arrow */}
                {showLeftArrow && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-0 z-10 flex h-full w-12 items-center justify-center bg-gradient-to-r from-gray-900 to-transparent opacity-0 transition-opacity group-hover:opacity-100 md:w-16"
                        aria-label="Scorri a sinistra"
                    >
                        <ChevronLeft className="h-8 w-8 text-white md:h-12 md:w-12" />
                    </button>
                )}

                {/* Cards Container */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex gap-2 overflow-x-auto scrollbar-hide md:gap-4"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    {items.map((item) => {
                        const contentId = item.movie_id;
                        const progress = calculateProgress(item);
                        const backdropUrl = item.background_image
                            ? `https://image.tmdb.org/t/p/w500${item.background_image}`
                            : '/placeholder-backdrop.jpg';

                        return (
                            <div
                                key={contentId}
                                className="group/card relative flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-80 cursor-pointer"
                                onClick={() => handleItemClick(item)}
                            >
                                {/* Card */}
                                <div className="relative overflow-hidden rounded-lg bg-gray-800 transition-transform duration-300 hover:scale-105">
                                    {/* Image */}
                                    <div className="relative aspect-video">
                                        <img
                                            src={backdropUrl}
                                            alt="Continue watching"
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />

                                        {/* Gradient Overlay on Hover */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />

                                        {/* Play Icon on Hover */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                                            <div className="rounded-full bg-white/90 p-4">
                                                <svg
                                                    className="h-8 w-8 text-black"
                                                    fill="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M8 5v14l11-7z" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={(e) => handleRemove(e, item)}
                                            disabled={removingId === contentId}
                                            className="absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-all hover:bg-black/90 hover:scale-110 group-hover/card:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Rimuovi"
                                        >
                                            {removingId === contentId ? (
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            ) : (
                                                <X className="h-5 w-5" />
                                            )}
                                        </button>

                                        {/* Type Badge */}
                                        {item.type === 'tv' && (
                                            <div className="absolute left-2 top-2 rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                                                SERIE
                                            </div>
                                        )}
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                        <div
                                            className="h-full bg-red-600 transition-all"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Info below card */}
                                <div className="mt-2 px-1">
                                    <p className="text-sm text-gray-400">
                                        {progress < 5 ? 'Appena iniziato' :
                                            progress > 95 ? 'Quasi finito' :
                                                `${Math.round(progress)}% completato`}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Right Arrow */}
                {showRightArrow && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-0 z-10 flex h-full w-12 items-center justify-center bg-gradient-to-l from-gray-900 to-transparent opacity-0 transition-opacity group-hover:opacity-100 md:w-16"
                        aria-label="Scorri a destra"
                    >
                        <ChevronRight className="h-8 w-8 text-white md:h-12 md:w-12" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ContinueWatching;
