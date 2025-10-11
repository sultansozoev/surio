import React from 'react';
import { X, ArrowUpDown } from 'lucide-react';

const SearchFilters = ({ filters, onFilterChange, onClose }) => {
    const sortOptions = [
        { value: 'popularity', label: 'Popolarità' },
        { value: 'rating', label: 'Valutazione' },
        { value: 'title', label: 'Titolo' },
        { value: 'date', label: 'Data di uscita' }
    ];

    const handleSortChange = (sortBy) => {
        onFilterChange({ sortBy });
    };

    const toggleSortOrder = () => {
        onFilterChange({
            sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
        });
    };

    const handleReset = () => {
        onFilterChange({
            type: 'all',
            sortBy: 'popularity',
            sortOrder: 'desc'
        });
    };

    return (
        <div className="mb-6 rounded-lg bg-gray-800 p-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Filtri e ordinamento</h3>
                <button
                    onClick={onClose}
                    className="text-gray-400 transition-colors hover:text-white"
                    aria-label="Chiudi filtri"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Sort By */}
                <div>
                    <label className="mb-3 block text-sm font-semibold text-gray-300">
                        Ordina per
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleSortChange(option.value)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                    filters.sortBy === option.value
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort Order */}
                <div>
                    <label className="mb-3 block text-sm font-semibold text-gray-300">
                        Ordine
                    </label>
                    <button
                        onClick={toggleSortOrder}
                        className="flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                    >
                        <ArrowUpDown className="h-4 w-4" />
                        {filters.sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
                    </button>
                </div>

                {/* Reset Button */}
                <div className="flex justify-end border-t border-gray-700 pt-4">
                    <button
                        onClick={handleReset}
                        className="rounded-lg bg-gray-700 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-600"
                    >
                        Ripristina filtri
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchFilters;