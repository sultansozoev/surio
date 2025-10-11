// src/pages/MyList.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import useFetch from '../hooks/useFetch';
import ContentCard from '../components/content/ContentCard';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';

const MyList = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useLocalStorage('mylist-active-tab', 'favourites');
    const [sortBy, setSortBy] = useState('addeddate');
    const [filterType, setFilterType] = useState('all');

    // Fetch user's favourite list
    const {
        data: favourites,
        loading: favouritesLoading,
        error: favouritesError,
        refetch: refetchFavourites
    } = useFetch('/getFavouriteList', {
        method: 'POST',
        body: { userid: user?.id },
        immediate: !!user?.id,
        cacheKey: `favourites-${user?.id}`,
        dependencies: [user?.id]
    });

    // Fetch continue watching list
    const {
        data: continueWatching,
        loading: continueLoading,
        error: continueError,
        refetch: refetchContinue
    } = useFetch('/getMoviesByContinueListAll', {
        method: 'GET',
        params: { userid: user?.id },
        immediate: !!user?.id,
        cacheKey: `continue-${user?.id}`,
        dependencies: [user?.id]
    });

    // Remove from favourites
    const handleRemoveFromFavourites = async (item) => {
        try {
            const endpoint = item.type === 'movie' ? '/removeFavourite' : '/removeFavouriteTV';
            const payload = {
                movieid: item.movieid,
                userid: user.id
            };

            const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000'}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (response.ok) {
                refetchFavourites();
            }
        } catch (error) {
            console.error('Error removing from favourites:', error);
        }
    };

    // Remove from continue watching
    const handleRemoveFromContinue = async (item) => {
        try {
            const endpoint = item.type === 'movie' ? '/deleteContinueList' : '/deleteContinueListSerie';
            const payload = {
                movieid: item.movieid,
                userid: user.id
            };

            const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000'}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });

            if (response.ok) {
                refetchContinue();
            }
        } catch (error) {
            console.error('Error removing from continue watching:', error);
        }
    };

    // Filter and sort data
    const getFilteredAndSortedData = (data) => {
        if (!data) return [];

        let filtered = [...data];

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(item => item.type === filterType);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'addeddate':
                    return new Date(b.addeddate) - new Date(a.addeddate);
                case 'releasedate':
                    return new Date(b.releasedate) - new Date(a.releasedate);
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const tabs = [
        { id: 'favourites', label: 'I Miei Preferiti', count: favourites?.length || 0 },
        { id: 'continue', label: 'Continua a Guardare', count: continueWatching?.length || 0 }
    ];

    const currentData = activeTab === 'favourites' ? favourites : continueWatching;
    const isLoading = activeTab === 'favourites' ? favouritesLoading : continueLoading;
    const error = activeTab === 'favourites' ? favouritesError : continueError;

    const filteredData = getFilteredAndSortedData(currentData);

    return (
        <div className="min-h-screen bg-black text-white py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">La Mia Lista</h1>
                    <p className="text-gray-400">I tuoi contenuti preferiti e quelli che stai guardando</p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-4 mb-6 border-b border-gray-800">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-2 font-medium transition-colors relative ${
                                activeTab === tab.id
                                    ? 'text-red-500 border-b-2 border-red-500'
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className="ml-2 bg-gray-700 text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Filters and Sort */}
                <div className="flex flex-wrap gap-4 mb-6 items-center">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-400">Filtra per:</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
                        >
                            <option value="all">Tutti</option>
                            <option value="movie">Film</option>
                            <option value="tv">Serie TV</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-400">Ordina per:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
                        >
                            <option value="addeddate">Data Aggiunta</option>
                            <option value="title">Titolo</option>
                            <option value="releasedate">Data Uscita</option>
                        </select>
                    </div>

                    {filteredData.length > 0 && (
                        <div className="text-sm text-gray-400 ml-auto">
                            {filteredData.length} elemento{filteredData.length !== 1 ? 'i' : ''}
                        </div>
                    )}
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Spinner size="large" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-6 py-4 rounded-lg inline-block">
                            Errore nel caricamento: {error}
                        </div>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-gray-400 mb-4">
                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <h3 className="text-xl font-semibold mb-2">
                                {activeTab === 'favourites' ? 'Nessun preferito ancora' : 'Nessun contenuto in visione'}
                            </h3>
                            <p className="mb-4">
                                {activeTab === 'favourites'
                                    ? 'Inizia ad aggiungere film e serie TV ai tuoi preferiti'
                                    : 'I contenuti che stai guardando appariranno qui'
                                }
                            </p>
                            <Button
                                onClick={() => window.location.href = '/'}
                                variant="primary"
                            >
                                Esplora Contenuti
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {filteredData.map((item) => (
                            <div key={`${item.type}-${item.movieid}`} className="relative group">
                                <ContentCard
                                    id={item.movieid}
                                    type={item.type}
                                    title={item.title}
                                    poster={item.poster}
                                    releaseDate={item.releasedate}
                                    progress={activeTab === 'continue' ? item.playertime : undefined}
                                    runtime={activeTab === 'continue' ? item.runtime : undefined}
                                />

                                {/* Remove Button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (activeTab === 'favourites') {
                                            handleRemoveFromFavourites(item);
                                        } else {
                                            handleRemoveFromContinue(item);
                                        }
                                    }}
                                    className="absolute top-2 right-2 bg-black/80 hover:bg-red-600 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                    title="Rimuovi"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyList;
