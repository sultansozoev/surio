import React, { useState, useEffect } from 'react';
import { Play, Check } from 'lucide-react';
import { getSeasons, getEpisodes } from '../../services/content.service';
import {Spinner} from '../common/Spinner';

const EpisodeList = ({ serieId, onEpisodeSelect, currentEpisode }) => {
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);

    useEffect(() => {
        fetchSeasons();
    }, [serieId]);

    useEffect(() => {
        if (selectedSeason) {
            fetchEpisodes(selectedSeason.season_id);
        }
    }, [selectedSeason]);

    const fetchSeasons = async () => {
        try {
            setLoading(true);
            const data = await getSeasons(serieId);
            setSeasons(data);

            // Seleziona automaticamente la prima stagione
            if (data.length > 0) {
                setSelectedSeason(data[0]);
            }
        } catch (error) {
            console.error('Error fetching seasons:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEpisodes = async (seasonId) => {
        try {
            setLoadingEpisodes(true);
            const data = await getEpisodes(seasonId);
            setEpisodes(data);
        } catch (error) {
            console.error('Error fetching episodes:', error);
        } finally {
            setLoadingEpisodes(false);
        }
    };

    const handleSeasonChange = (season) => {
        setSelectedSeason(season);
    };

    const formatRuntime = (runtime) => {
        if (!runtime) return '';
        return `${runtime}m`;
    };

    const isCurrentEpisode = (episode) => {
        return currentEpisode?.episode_id === episode.episode_id;
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Season Selector */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Episodi</h2>

                <div className="relative">
                    <select
                        value={selectedSeason?.season_id || ''}
                        onChange={(e) => {
                            const season = seasons.find(s => s.season_id === parseInt(e.target.value));
                            handleSeasonChange(season);
                        }}
                        className="w-full appearance-none rounded-lg bg-gray-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-600 md:w-64"
                    >
                        {seasons.map((season) => (
                            <option key={season.season_id} value={season.season_id}>
                                {season.season_name} ({season.episode_count} episodi)
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                </div>

                {selectedSeason && (
                    <div className="rounded-lg bg-gray-800 p-4">
                        <div className="flex items-start gap-4">
                            {selectedSeason.background_image && (
                                <img
                                    src={`https://image.tmdb.org/t/p/w300${selectedSeason.background_image}`}
                                    alt={selectedSeason.season_name}
                                    className="w-24 rounded-lg"
                                />
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    {selectedSeason.season_name}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {selectedSeason.episode_count} episodi
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Episodes List */}
            {loadingEpisodes ? (
                <div className="flex justify-center py-12">
                    <Spinner size="md" />
                </div>
            ) : (
                <div className="space-y-4">
                    {episodes.map((episode, index) => (
                        <div
                            key={episode.episode_id}
                            className={`group relative rounded-lg bg-gray-800 transition-all hover:bg-gray-700 ${
                                isCurrentEpisode(episode) ? 'ring-2 ring-red-600' : ''
                            }`}
                        >
                            <div className="flex gap-4 p-4">
                                {/* Episode Number & Thumbnail */}
                                <div className="relative flex-shrink-0">
                                    <div className="relative aspect-video w-40 overflow-hidden rounded-lg bg-gray-900">
                                        {episode.background_image ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w300${episode.background_image}`}
                                                alt={episode.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                        <span className="text-4xl font-bold text-gray-700">
                          {episode.episode_number}
                        </span>
                                            </div>
                                        )}

                                        {/* Play Button Overlay */}
                                        <button
                                            onClick={() => onEpisodeSelect(episode, selectedSeason)}
                                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <div className="rounded-full bg-white/90 p-3">
                                                <Play className="h-6 w-6 fill-black text-black" />
                                            </div>
                                        </button>

                                        {/* Current Episode Indicator */}
                                        {isCurrentEpisode(episode) && (
                                            <div className="absolute bottom-2 right-2 rounded-full bg-red-600 p-1">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-2 text-center text-sm font-semibold text-gray-400">
                                        Episodio {episode.episode_number}
                                    </div>
                                </div>

                                {/* Episode Info */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white group-hover:text-red-500">
                                                {episode.title}
                                            </h3>
                                            {episode.runtime && (
                                                <span className="text-sm text-gray-400">
                          {formatRuntime(episode.runtime)}
                        </span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => onEpisodeSelect(episode, selectedSeason)}
                                            className="flex-shrink-0 rounded-full bg-white p-2 text-black transition-transform hover:scale-110"
                                        >
                                            <Play className="h-5 w-5 fill-current" />
                                        </button>
                                    </div>

                                    {episode.overview && (
                                        <p className="line-clamp-2 text-sm leading-relaxed text-gray-300">
                                            {episode.overview}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar (if watched) */}
                            {episode.player_time && episode.runtime && (
                                <div className="h-1 w-full bg-gray-700">
                                    <div
                                        className="h-full bg-red-600 transition-all"
                                        style={{
                                            width: `${Math.min((episode.player_time / (episode.runtime * 60)) * 100, 100)}%`
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}

                    {episodes.length === 0 && (
                        <div className="rounded-lg bg-gray-800 p-12 text-center">
                            <p className="text-gray-400">Nessun episodio disponibile</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EpisodeList;