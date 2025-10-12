import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ContentRow from '../components/home/ContentRow';

const Movies = () => {
    const [trending, setTrending] = useState([]);
    const [voted, setVoted] = useState([]);
    const [lastAdded, setLastAdded] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sagas, setSagas] = useState([]);
    const [categoryContent, setCategoryContent] = useState({});
    const [sagaContent, setSagaContent] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadMoviesData();
    }, []);

    const loadMoviesData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [
                trendingData,
                votedData,
                lastAddedData,
                categoriesData,
                sagasData
            ] = await Promise.all([
                api.getTrending(),
                api.getVoted(),
                api.getLastAdded(),
                api.getCategories(),
                api.getSagas()
            ]);

            // Filtra solo i film
            const moviesOnly = (data) => data.filter(item => item.type === 'movie');

            setTrending(moviesOnly(trendingData.data || []));
            setVoted(moviesOnly(votedData.data || []));
            setLastAdded(moviesOnly(lastAddedData.data || []));
            setCategories(categoriesData.data || []);
            setSagas(sagasData.data || []);

            // Carica contenuti per categorie
            await loadCategoryContent(categoriesData.data || []);
            await loadSagaContent(sagasData.data || []);

        } catch (err) {
            console.error('Error loading movies:', err);
            setError('Errore nel caricamento dei film');
        } finally {
            setLoading(false);
        }
    };

    const loadCategoryContent = async (cats) => {
        const content = {};
        const topCategories = cats.slice(0, 3);

        try {
            const promises = topCategories.map(category =>
                api.getMoviesByCategory(category.category_id)
                    .then(res => ({ categoryId: category.category_id, data: res.data }))
                    .catch(err => {
                        console.error(`Error loading category ${category.category_id}:`, err);
                        return { categoryId: category.category_id, data: [] };
                    })
            );

            const results = await Promise.all(promises);
            results.forEach(({ categoryId, data }) => {
                content[categoryId] = data || [];
            });

            setCategoryContent(content);
        } catch (err) {
            console.error('Error loading category content:', err);
        }
    };

    const loadSagaContent = async (sagas) => {
        const content = {};
        const topSagas = sagas.slice(0, 3);

        try {
            const promises = topSagas.map(saga =>
                api.getMoviesBySaga(saga.saga_id)
                    .then(res => ({ sagaId: saga.saga_id, data: res.data }))
                    .catch(err => {
                        console.error(`Error loading saga ${saga.saga_id}:`, err);
                        return { sagaId: saga.saga_id, data: [] };
                    })
            );

            const results = await Promise.all(promises);
            results.forEach(({ sagaId, data }) => {
                content[sagaId] = data || [];
            });

            setSagaContent(content);
        } catch (err) {
            console.error('Error loading saga content:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-white text-2xl animate-pulse">
                    Caricamento film...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-xl mb-4">{error}</p>
                    <button
                        onClick={loadMoviesData}
                        className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors"
                    >
                        Riprova
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black pt-8 pb-20">
            {/* Hero Header */}
            <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Film
                </h1>
                <p className="text-gray-400 text-lg">
                    Scopri migliaia di film da guardare
                </p>
            </div>

            {/* Content Sections */}
            <div className="space-y-8">
                {trending.length > 0 && (
                    <ContentRow title="Film in Tendenza" items={trending} />
                )}

                {voted.length > 0 && (
                    <ContentRow title="Film Più Votati" items={voted} />
                )}

                {lastAdded.length > 0 && (
                    <ContentRow title="Film Aggiunti di Recente" items={lastAdded} />
                )}

                {/* Sagas */}
                {sagas.slice(0, 3).map(saga => {
                    const items = sagaContent[saga.saga_id];
                    if (!items || items.length === 0) return null;

                    return (
                        <ContentRow
                            key={saga.saga_id}
                            title={saga.saga_name}
                            items={items}
                        />
                    );
                })}

                {/* Categories */}
                {categories.slice(0, 3).map(category => {
                    const items = categoryContent[category.category_id];
                    if (!items || items.length === 0) return null;

                    return (
                        <ContentRow
                            key={category.category_id}
                            title={category.category_name}
                            items={items}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Movies;