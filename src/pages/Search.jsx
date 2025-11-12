import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import SearchResults from '../components/search/SearchResults';
import SearchSuggestions from '../components/search/SearchSuggestions';

const Search = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q');

    const [showMobileSearch, setShowMobileSearch] = useState(false);

    useEffect(() => {
        if (query) {
            setShowMobileSearch(false);
        }
    }, [query]);

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header con Search Bar */}
            <div className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-6">
                    <SearchBar />
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8">
                {query ? (
                    <SearchResults />
                ) : (
                    <div>
                        <h2 className="mb-6 text-2xl font-bold text-white md:text-3xl">
                            Cosa vuoi guardare?
                        </h2>
                        <SearchSuggestions />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;