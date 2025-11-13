import React from 'react';
import ContentCard from '../content/ContentCard';
import { Spinner } from '../common/Spinner';
import { Button } from '../common/Button';

/**
 * Componente per il rendering delle sezioni comuni delle pagine di contenuto
 */

// Filtro generi
export const GenreFilter = ({ genres, selectedGenre, onGenreChange }) => {
    if (!genres || genres.length === 0) return null;

    // Normalizza selectedGenre per il confronto
    const normalizedSelected = selectedGenre ? selectedGenre.toString() : '';

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Generi</h3>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => onGenreChange('')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        !normalizedSelected
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                >
                    Tutti
                </button>
                {genres.map((genre) => {
                    const genreIdStr = genre.genre_id?.toString();
                    const isSelected = normalizedSelected === genreIdStr;

                    return (
                        <button
                            key={genre.genre_id}
                            onClick={() => onGenreChange(genre.genre_id)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                isSelected
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            {genre.genre_name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// Controlli (ordinamento e vista)
export const ContentControls = ({
                                    sortBy,
                                    sortOptions,
                                    onSortChange,
                                    viewMode,
                                    onViewModeChange,
                                    selectedGenre,
                                    genres,
                                    totalItems,
                                    isLoading,
                                    contentType
                                }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Ordina per:</label>
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white"
                >
                    {sortOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Vista:</span>
                <div className="flex bg-gray-800 rounded overflow-hidden">
                    <button
                        onClick={() => onViewModeChange('grid')}
                        className={`p-2 ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        title="Vista griglia"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
                        </svg>
                    </button>
                    <button
                        onClick={() => onViewModeChange('list')}
                        className={`p-2 ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        title="Vista lista"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        {/* Results info */}
        {!isLoading && (
            <div className="text-sm text-gray-400">
                {selectedGenre ? (
                    <>Genere: <span className="text-white">
                        {genres?.find(g => g.genre_id?.toString() === selectedGenre)?.genre_name}
                    </span> - </>
                ) : null}
                <span className="text-white">{totalItems}</span> {contentType} trovat{contentType === 'film' ? 'i' : 'e'}
            </div>
        )}
    </div>
);

// Stato di caricamento
export const LoadingState = () => (
    <div className="flex items-center justify-center py-20">
        <Spinner size="large" />
    </div>
);

// Stato di errore
export const ErrorState = ({ message, onRetry }) => (
    <div className="text-center py-20">
        <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-6 py-4 rounded-lg inline-block mb-4">
            {message}
        </div>
        <br />
        <Button onClick={onRetry} variant="primary">
            Riprova
        </Button>
    </div>
);

// Stato vuoto (nessun risultato)
export const EmptyState = ({ icon, contentType }) => (
    <div className="text-center py-20">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">
            Nessun {contentType} disponibile
        </h3>
        <p className="text-gray-400 mb-4">
            Non ci sono {contentType} in questa categoria
        </p>
    </div>
);

// Griglia/Lista di contenuti
export const ContentGrid = ({ items, viewMode, type, idKey, renderListItem }) => (
    <div className={
        viewMode === 'grid'
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8'
            : 'space-y-4 mb-8'
    }>
        {items.map((item) => (
            viewMode === 'grid' ? (
                <ContentCard
                    key={item[idKey]}
                    content={item}
                    type={type}
                />
            ) : (
                renderListItem(item)
            )
        ))}
    </div>
);

// Paginazione
export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center space-x-2">
            <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="secondary"
                size="sm"
            >
                Precedente
            </Button>

            <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                        pageNum = i + 1;
                    } else if (currentPage <= 3) {
                        pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                    } else {
                        pageNum = currentPage - 2 + i;
                    }

                    return (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`px-3 py-1 text-sm rounded ${
                                currentPage === pageNum
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}
            </div>

            <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="secondary"
                size="sm"
            >
                Successiva
            </Button>
        </div>
    );
};