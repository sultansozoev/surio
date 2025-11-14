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
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black relative overflow-hidden">
            {/* Sfondo decorativo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/30 to-black" />
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl animate-pulse"
                     style={{ animationDelay: '1.5s' }} />
                <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
                     style={{ animationDelay: '3s' }} />
                <div className="absolute inset-0 opacity-[0.01]"
                     style={{
                         backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                         backgroundSize: '40px 40px'
                     }}
                />
            </div>

            {/* Header con Search Bar */}
            <div className="sticky top-0 z-40 border-b border-gray-800/50 bg-gray-900/80 backdrop-blur-xl">
                <div className="container mx-auto px-4 py-6">
                    <SearchBar />
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-8 relative z-10">
                {query ? (
                    <SearchResults />
                ) : (
                    <div>
                        <h2 className="mb-6 text-2xl font-bold md:text-3xl bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
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