import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { searchAll } from '../../services/content.service';

//TODO: da testare search bar
const SearchBar = ({ onClose, isExpanded = false }) => {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        // Carica ricerche recenti dal localStorage
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        if (isExpanded && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isExpanded]);

    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            performSearch(debouncedQuery);
        } else {
            setResults([]);
            setShowDropdown(query.length > 0);
        }
    }, [debouncedQuery]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                !inputRef.current?.contains(e.target)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const performSearch = async (searchQuery) => {
        try {
            setLoading(true);
            const data = await searchAll(searchQuery);
            setResults(data.slice(0, 8)); // Limita a 8 risultati nel dropdown
            setShowDropdown(true);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const saveRecentSearch = (searchTerm) => {
        const updated = [
            searchTerm,
            ...recentSearches.filter(s => s !== searchTerm)
        ].slice(0, 5); // Mantieni solo le ultime 5

        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            saveRecentSearch(query.trim());
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setShowDropdown(false);
            onClose?.();
        }
    };

    const handleResultClick = (item) => {
        const contentType = item.type === 'movie' ? 'movie' : 'tv';
        const contentId = item.movie_id;

        saveRecentSearch(item.title);
        navigate(`/${contentType}/${contentId}`);
        setShowDropdown(false);
        setQuery('');
        onClose?.();
    };

    const handleRecentSearchClick = (searchTerm) => {
        setQuery(searchTerm);
        performSearch(searchTerm);
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const handleKeyDown = (e) => {
        if (!showDropdown || results.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < results.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && results[selectedIndex]) {
                    handleResultClick(results[selectedIndex]);
                } else {
                    handleSubmit(e);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                onClose?.();
                break;
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full">
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center">
                    <Search className="absolute left-4 h-5 w-5 text-gray-400" />

                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Cerca film, serie TV..."
                        className="w-full rounded-lg border border-gray-600 bg-gray-800 py-3 pl-12 pr-12 text-white placeholder-gray-400 transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    />

                    {query && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-4 text-gray-400 transition-colors hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </form>

            {/* Dropdown Results */}
            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full z-50 mt-2 max-h-96 w-full overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 shadow-2xl"
                >
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
                        </div>
                    ) : results.length > 0 ? (
                        <>
                            {/* Search Results */}
                            <div className="p-2">
                                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    Risultati
                                </p>
                                {results.map((item, index) => {
                                    const posterUrl = item.poster
                                        ? `https://image.tmdb.org/t/p/w92${item.poster}`
                                        : '/placeholder-poster.jpg';

                                    return (
                                        <button
                                            key={`${item.movie_id}-${index}`}
                                            onClick={() => handleResultClick(item)}
                                            className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors ${
                                                selectedIndex === index
                                                    ? 'bg-gray-700'
                                                    : 'hover:bg-gray-700'
                                            }`}
                                        >
                                            <img
                                                src={posterUrl}
                                                alt={item.title}
                                                className="h-16 w-12 flex-shrink-0 rounded object-cover"
                                            />

                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="truncate font-semibold text-white">
                                                    {item.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="rounded bg-gray-700 px-2 py-0.5 uppercase">
                            {item.type === 'movie' ? 'Film' : 'Serie TV'}
                          </span>
                                                    {item.popularity && (
                                                        <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                                                            {Math.round(item.popularity)}
                            </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* View All Results Link */}
                            {results.length >= 8 && (
                                <div className="border-t border-gray-700 p-3">
                                    <button
                                        onClick={() => {
                                            navigate(`/search?q=${encodeURIComponent(query)}`);
                                            setShowDropdown(false);
                                            onClose?.();
                                        }}
                                        className="w-full rounded-lg bg-red-600 py-2 text-center font-semibold text-white transition-colors hover:bg-red-700"
                                    >
                                        Vedi tutti i risultati
                                    </button>
                                </div>
                            )}
                        </>
                    ) : query.length >= 2 ? (
                        <div className="py-8 text-center">
                            <p className="text-gray-400">Nessun risultato trovato</p>
                        </div>
                    ) : (
                        // Recent Searches
                        recentSearches.length > 0 && (
                            <div className="p-2">
                                <div className="mb-2 flex items-center justify-between px-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Ricerche recenti
                                    </p>
                                    <button
                                        onClick={clearRecentSearches}
                                        className="text-xs text-gray-400 hover:text-white"
                                    >
                                        Cancella
                                    </button>
                                </div>
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleRecentSearchClick(search)}
                                        className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-gray-700"
                                    >
                                        <Clock className="h-5 w-5 flex-shrink-0 text-gray-400" />
                                        <span className="flex-1 truncate text-white">{search}</span>
                                    </button>
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;