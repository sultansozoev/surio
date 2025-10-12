import React, { useState, useEffect } from 'react';
import Hero from '../components/home/Hero';
import ContentRow from '../components/home/ContentRow';
import ContinueWatching from '../components/home/ContinueWatching';
import TrailerSection from '../components/home/TrailerSection';
import {Spinner} from '../components/common/Spinner';
import { useAuth } from '../hooks/useAuth';
import {
    getTrendingAll,
    getVotedAll,
    getLastAddedAll,
    getContinueWatchingAll,
    getGenres,
    getAllByGenre
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

            // Fetch content in parallelo
            const [
                trendingData,
                votedData,
                lastAddedData,
                genresData
            ] = await Promise.all([
                getTrendingAll(),
                getVotedAll(),
                getLastAddedAll(),
                getGenres()
            ]);

            setTrending(trendingData);
            setVoted(votedData);
            setLastAdded(lastAddedData);

            // Fetch continue watching se l'utente è loggato
            if (user) {
                const continueData = await getContinueWatchingAll(user.user_id);
                setContinueWatching(continueData);
            }

            // Fetch primi 3 generi con contenuti
            const genrePromises = genresData.slice(0, 3).map(async (genre) => {
                const content = await getAllByGenre(genre.genre_id);
                return {
                    genre,
                    content: content.slice(0, 20) // Limita a 20 item per genere
                };
            });

            const genreRowsData = await Promise.all(genrePromises);
            setGenreRows(genreRowsData);

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

    const handleFavoriteChange = () => {
        // Potresti voler ricaricare i dati o aggiornare lo stato locale
        // Per ora non facciamo nulla, ma è utile per futuri aggiornamenti
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
                {user && continueWatching.length > 0 && (
                    <ContinueWatching
                        items={continueWatching}
                        onItemRemove={handleContinueWatchingRemove}
                    />
                )}

                {/* Trending */}
                {trending.length > 0 && (
                    <ContentRow
                        title="Di tendenza ora"
                        items={trending}
                        type="mixed"
                        onFavoriteChange={handleFavoriteChange}
                    />
                )}

                {/* Trailer Section */}
                <TrailerSection type="movie" />

                {/* Top Rated */}
                {voted.length > 0 && (
                    <ContentRow
                        title="I più votati"
                        items={voted}
                        type="mixed"
                        onFavoriteChange={handleFavoriteChange}
                    />
                )}

                {/* Genre Rows */}
                {genreRows.map(({ genre, content }) => (
                    content.length > 0 && (
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
                {lastAdded.length > 0 && (
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