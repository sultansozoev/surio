import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useContentPage } from '../hooks/useContentPage';
import { moviesConfig } from '../config/contentConfig';
import {
    GenreFilter,
    ContentControls,
    LoadingState,
    ErrorState,
    EmptyState,
    ContentGrid,
    Pagination,
} from '../components/layout/ContentPageLayout';
import { Button } from '../components/common/Button';

const Movies = () => {
    const { user } = useAuth();
    const {
        selectedGenre,
        sortBy,
        currentPage,
        viewMode,
        genres,
        displayedItems,
        totalItems,
        totalPages,
        isLoading,
        hasError,
        handleGenreChange,
        handleSortChange,
        handlePageChange,
        setViewMode,
        refetchContent,
    } = useContentPage({
        type: moviesConfig.type,
        endpoints: moviesConfig.endpoints,
    });

    const { pageInfo, sortOptions } = moviesConfig;

    // Render della vista lista per i film
    const renderListItem = (movie) => (
        <div key={movie[pageInfo.idKey]} className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 flex gap-4 border border-gray-700/50 hover:border-gray-600/50 transition-all">
            <div className="flex-shrink-0">
                <img
                    src={movie.poster ? `https://image.tmdb.org/t/p/w200${movie.poster}` : '/placeholder-poster.jpg'}
                    alt={movie.title}
                    className="w-20 h-30 object-cover rounded shadow-lg"
                    onError={(e) => {
                        e.target.src = '/placeholder-poster.jpg';
                    }}
                />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
                <div className="text-sm text-gray-400 space-y-1">
                    <p>Anno: {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
                    {movie.runtime && (
                        <p>Durata: {movie.runtime} min</p>
                    )}
                    {movie.vote_average && (
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            {movie.vote_average.toFixed(1)}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-shrink-0">
                <Link to={`${pageInfo.detailsPath}${movie[pageInfo.idKey]}`}>
                    <Button
                        variant="primary"
                        size="sm"
                    >
                        Dettagli
                    </Button>
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white relative overflow-hidden">
            {/* Sfondo decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/30 to-black" />
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse"
                     style={{ animationDelay: '1.5s' }} />
                <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl animate-pulse"
                     style={{ animationDelay: '3s' }} />
                <div className="absolute inset-0 opacity-[0.01]"
                     style={{
                         backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                         backgroundSize: '40px 40px'
                     }}
                />
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                        {pageInfo.title}
                    </h1>

                    <GenreFilter
                        genres={genres}
                        selectedGenre={selectedGenre}
                        onGenreChange={handleGenreChange}
                    />

                    <ContentControls
                        sortBy={sortBy}
                        sortOptions={sortOptions}
                        onSortChange={handleSortChange}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        selectedGenre={selectedGenre}
                        genres={genres}
                        totalItems={totalItems}
                        isLoading={isLoading}
                        contentType={pageInfo.contentType}
                    />
                </div>

                {isLoading ? (
                    <LoadingState />
                ) : hasError ? (
                    <ErrorState
                        message="Errore nel caricamento dei film"
                        onRetry={refetchContent}
                    />
                ) : displayedItems.length === 0 ? (
                    <EmptyState
                        icon={pageInfo.emptyIcon}
                        contentType={pageInfo.contentType}
                    />
                ) : (
                    <>
                        <ContentGrid
                            items={displayedItems}
                            viewMode={viewMode}
                            type={moviesConfig.type}
                            idKey={pageInfo.idKey}
                            renderListItem={renderListItem}
                        />

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default Movies;