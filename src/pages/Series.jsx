import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useContentPage } from '../hooks/useContentPage';
import { seriesConfig } from '../config/contentConfig';
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

const Series = () => {
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
        type: seriesConfig.type,
        endpoints: seriesConfig.endpoints,
    });

    const { pageInfo, sortOptions } = seriesConfig;

    // Render della vista lista per le serie
    const renderListItem = (serie) => (
        <div key={serie[pageInfo.idKey]} className="bg-gray-900 rounded-lg p-4 flex gap-4">
            <div className="flex-shrink-0">
                <img
                    src={serie.poster ? `https://image.tmdb.org/t/p/w200${serie.poster}` : '/placeholder-poster.jpg'}
                    alt={serie.title}
                    className="w-20 h-30 object-cover rounded"
                    onError={(e) => {
                        e.target.src = '/placeholder-poster.jpg';
                    }}
                />
            </div>
            <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{serie.title}</h3>
                <div className="text-sm text-gray-400 space-y-1">
                    <p>Anno: {serie.release_date ? new Date(serie.release_date).getFullYear() : 'N/A'}</p>
                    {serie.total_seasons && (
                        <p>{serie.total_seasons} stagioni • {serie.total_episodes} episodi</p>
                    )}
                    {serie.vote_average && (
                        <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            {serie.vote_average.toFixed(1)}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-shrink-0">
                <Link to={`${pageInfo.detailsPath}${serie[pageInfo.idKey]}`}>
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
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-6">{pageInfo.title}</h1>

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
                        message="Errore nel caricamento delle serie TV"
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
                            type={seriesConfig.type}
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

export default Series;