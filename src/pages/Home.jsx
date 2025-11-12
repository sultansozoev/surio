import React, { useState, useEffect } from 'react';
import Hero from '../components/home/Hero';
import ContentRow from '../components/home/ContentRow';
import ContinueWatching from '../components/home/ContinueWatching';
import { Spinner } from '../components/common/Spinner';
import { useAuth } from '../hooks/useAuth';
import {
    getContinueWatchingAll,
    getGenres,
    getAllByGenreWithFavorites,
    getUserFavorites, getTrendingAll, getVotedAll, getLastAddedAll
} from '../services/content.service';

const Home = () => {
    const { user } = useAuth();

    const [trending, setTrending] = useState([]);
    const [voted, setVoted] = useState([]);
    const [lastAdded, setLastAdded] = useState([]);
    const [continueWatching, setContinueWatching] = useState([]);
    const [genreRows, setGenreRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllContent();
    }, [user]);

    const fetchAllContent = async () => {
        try {
            setLoading(true);

            const userId = user?.user_id;

            // Fetch content in parallelo con i preferiti inclusi
            const [
                trendingData,
                votedData,
                lastAddedData,
                genresData
            ] = await Promise.all([
                getTrendingAll(userId),
                getVotedAll(userId),
                getLastAddedAll(userId),
                getGenres()
            ]);

            console.group('📊 Home Content Data Structure');
            console.log('🔥 Trending sample:', trendingData[0]);
            console.log('⭐ Voted sample:', votedData[0]);
            console.log('🆕 Last added sample:', lastAddedData[0]);
            console.groupEnd();

            setTrending(Array.isArray(trendingData) ? trendingData : []);
            setVoted(Array.isArray(votedData) ? votedData : []);
            setLastAdded(Array.isArray(lastAddedData) ? lastAddedData : []);

            // Fetch continue watching se l'utente è loggato
            if (user) {
                try {
                    const continueData = await getContinueWatchingAll(user.user_id);
                    console.log('▶️ Continue watching data:', continueData);
                    setContinueWatching(Array.isArray(continueData) ? continueData : []);
                } catch (error) {
                    console.error('Error fetching continue watching:', error);
                    setContinueWatching([]);
                }
            }

            // Fetch primi 3 generi con contenuti
            if (Array.isArray(genresData) && genresData.length > 0) {
                try {
                    const genrePromises = genresData.slice(0, 3).map(async (genre) => {
                        try {
                            const content = await getAllByGenreWithFavorites(genre.genre_id, userId);
                            return {
                                genre,
                                content: Array.isArray(content) ? content.slice(0, 20) : []
                            };
                        } catch (error) {
                            console.error(`Error fetching genre ${genre.genre_name}:`, error);
                            return {
                                genre,
                                content: []
                            };
                        }
                    });

                    const genreRowsData = await Promise.all(genrePromises);
                    setGenreRows(genreRowsData.filter(row => row.content.length > 0));
                } catch (error) {
                    console.error('Error fetching genre rows:', error);
                    setGenreRows([]);
                }
            }

        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContinueWatchingRemove = (contentId) => {
        setContinueWatching(prev =>
            prev.filter(item => item.movie_id !== contentId)
        );
    };

    // Aggiorna efficientemente solo lo stato dei preferiti
    const handleFavoriteChange = async () => {
        if (user?.user_id) {
            try {
                console.log('🔄 Updating favorite status...');

                // Ottieni i nuovi preferiti
                const newFavorites = await getUserFavorites(user.user_id);
                console.log('💖 New favorites:', newFavorites);

                // Funzione helper per aggiornare is_favorite
                const updateFavoriteStatus = (items) => {
                    return items.map(item => {
                        const contentId = item.id || item.movie_id || item.movieid;
                        const itemType = item.type || 'movie';

                        const isFavorite = itemType === 'movie'
                            ? newFavorites.movies.includes(contentId)
                            : newFavorites.tv.includes(contentId);

                        return { ...item, is_favorite: isFavorite };
                    });
                };

                // Aggiorna tutti gli stati
                setTrending(prev => updateFavoriteStatus(prev));
                setVoted(prev => updateFavoriteStatus(prev));
                setLastAdded(prev => updateFavoriteStatus(prev));
                setGenreRows(prev => prev.map(({ genre, content }) => ({
                    genre,
                    content: updateFavoriteStatus(content)
                })));

                console.log('✅ Favorite status updated successfully');

            } catch (error) {
                console.error('❌ Error updating favorite status:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-900">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Hero Section */}
            <Hero />

            {/* Content Sections */}
            <div className="relative -mt-32 space-y-8 pb-12 md:space-y-12">
                {/* Continue Watching - Solo se l'utente è loggato */}
                {user && Array.isArray(continueWatching) && continueWatching.length > 0 && (
                    <ContinueWatching
                        items={continueWatching}
                        onItemRemove={handleContinueWatchingRemove}
                    />
                )}

                {/* Trending */}
                {Array.isArray(trending) && trending.length > 0 && (
                    <ContentRow
                        title="Di tendenza ora"
                        items={trending}
                        type="mixed"
                        onFavoriteChange={handleFavoriteChange}
                    />
                )}

                {/* Top Rated */}
                {Array.isArray(voted) && voted.length > 0 && (
                    <ContentRow
                        title="I più votati"
                        items={voted}
                        type="mixed"
                        onFavoriteChange={handleFavoriteChange}
                    />
                )}

                {/* Genre Rows */}
                {Array.isArray(genreRows) && genreRows.map(({ genre, content }) => (
                    Array.isArray(content) && content.length > 0 && (
                        <ContentRow
                            key={genre.genre_id}
                            title={genre.genre_name}
                            items={content}
                            type="mixed"
                            onFavoriteChange={handleFavoriteChange}
                        />
                    )
                ))}

                {/* Recently Added */}
                {Array.isArray(lastAdded) && lastAdded.length > 0 && (
                    <ContentRow
                        title="Aggiunti di recente"
                        items={lastAdded}
                        type="mixed"
                        onFavoriteChange={handleFavoriteChange}
                    />
                )}
            </div>
        </div>
    );
};

export default Home;
