import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ContentCard from '../content/ContentCard';

const ContentRow = ({ title, items, type = 'movie', onFavoriteChange }) => {
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

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

        // Mostra/nascondi frecce in base alla posizione dello scroll
        setShowLeftArrow(container.scrollLeft > 0);
        setShowRightArrow(
            container.scrollLeft < container.scrollWidth - container.clientWidth - 10
        );
    };

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="group relative mb-8 px-4 md:mb-12">
            {/* Title */}
            <h2 className="mb-4 text-xl font-bold text-white md:text-2xl">
                {title}
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
                    {items.map((item) => (
                        <div
                            key={item.movie_id || item.serie_tv_id || item.id}
                            className="flex-shrink-0 w-32 sm:w-40 md:w-48 lg:w-56"
                        >
                            <ContentCard
                                content={item}
                                type={type}
                                onFavoriteChange={onFavoriteChange}
                            />
                        </div>
                    ))}
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

export default ContentRow;