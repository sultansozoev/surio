// src/pages/Watch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import VideoPlayer from '../components/content/VideoPlayer';
import EpisodeList from '../components/content/EpisodeList';
import {Spinner} from '../components/common/Spinner';
import {Button} from '../components/common/Button';

const Watch = () => {
    const { type, id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [currentSeason, setCurrentSeason] = useState(1);
    const [showEpisodes, setShowEpisodes] = useState(false);
    const [playerTime, setPlayerTime] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const playerRef = useRef(null);

    // Fetch content details
    const {
        data: content,
        loading: contentLoading,
        error: contentError
    } = useFetch(type === 'movie' ? '/film' : '/serietv', {
        method: 'GET',
        params: { id },
        immediate: true,
        cacheKey: `${type}-${id}`,
    });

    // Fetch seasons for TV series
    const {
        data: seasons,
        loading: seasonsLoading
    } = useFetch('/getSeasons', {
        method: 'GET',
        params: { id },
        immediate: type === 'tv',
        cacheKey: `seasons-${id}`,
    });

    // Fetch episodes for current season
    const {
        data: episodes,
        loading: episodesLoading,
        execute: fetchEpisodes
    } = useFetch('/getEpisodes', {
        immediate: false,
        cacheKey: `episodes-${id}-${currentSeason}`,
    });

    // Fetch user's watch progress
    const { data: watchProgress } = useFetch(
        type === 'movie' ? '/getPlayerTime' : '/getPlayerTimeSerie',
        {
            method: 'POST',
            body: type === 'movie'
                ? { userid: user?.id, movieid: id }
                : { userid: user?.id, serietvid: id },
            immediate: !!user?.id,
            cacheKey: `progress-${type}-${id}-${user?.id}`,
        }
    );

    // Load episodes when season changes
    useEffect(() => {
        if (type === 'tv' && seasons && seasons.length > 0) {
            const season = seasons.find(s => s.seasonnumber === currentSeason);
            if (season) {
                fetchEpisodes('/getEpisodes', { params: { id: season.seasonid } });
            }
        }
    }, [currentSeason, seasons, type, fetchEpisodes]);

    // Set initial episode for TV series
    useEffect(() => {
        if (type === 'tv' && episodes && episodes.length > 0 && !currentEpisode) {
            // Try to resume from last watched episode or start from first
            const lastWatched = watchProgress && watchProgress[0];
            const episode = lastWatched
                ? episodes.find(ep => ep.episodeid === lastWatched.episodeid) || episodes[0]
                : episodes[0];

            setCurrentEpisode(episode);
            setPlayerTime(lastWatched?.playertime || 0);
        }
    }, [episodes, watchProgress, type, currentEpisode]);

    // Set initial player time for movies
    useEffect(() => {
        if (type === 'movie' && watchProgress && watchProgress[0]) {
            setPlayerTime(watchProgress[0].playertime || 0);
        }
    }, [watchProgress, type]);

    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Save watch progress
    const handleTimeUpdate = async (currentTime, duration) => {
        if (!user) return;

        const timeToSave = Math.floor(currentTime);

        try {
            const endpoint = type === 'movie' ? '/setPlayerTime' : '/setPlayerTimeSerie';
            const payload = type === 'movie'
                ? {
                    userid: user.id,
                    movieid: id,
                    playertime: timeToSave
                }
                : {
                    userid: user.id,
                    serietvid: id,
                    playertime: timeToSave,
                    episodeid: currentEpisode?.episodeid,
                    seasonid: currentEpisode?.seasonid
                };

            await fetch(`${process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000'}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include'
            });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    // Handle episode selection
    const handleEpisodeSelect = (episode) => {
        setCurrentEpisode(episode);
        setPlayerTime(0);
        setShowEpisodes(false);
    };

    // Handle season change
    const handleSeasonChange = (seasonNumber) => {
        setCurrentSeason(seasonNumber);
        setCurrentEpisode(null);
        setShowEpisodes(true);
    };

    // Navigate to next/previous episode
    const handleEpisodeNavigation = (direction) => {
        if (!episodes || !currentEpisode) return;

        const currentIndex = episodes.findIndex(ep => ep.episodeid === currentEpisode.episodeid);
        const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (nextIndex >= 0 && nextIndex < episodes.length) {
            handleEpisodeSelect(episodes[nextIndex]);
        }
    };

    // Get video stream URL
    const getStreamUrl = () => {
        if (type === 'movie') {
            return `/stream?title=${encodeURIComponent(content[0]?.title)}&tv=false`;
        } else if (currentEpisode) {
            return `/stream?title=${encodeURIComponent(currentEpisode.title)}&tv=true`;
        }
        return null;
    };

    // Get subtitle URL
    const getSubtitleUrl = () => {
        if (type === 'tv' && currentEpisode) {
            return `/subtitleSerieTV?film=${encodeURIComponent(currentEpisode.title)}`;
        }
        return null;
    };

    if (contentLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Spinner size="large" />
            </div>
        );
    }

    if (contentError || !content) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Contenuto non trovato</h2>
                    <Button onClick={() => navigate('/')} variant="primary">
                        Torna alla Home
                    </Button>
                </div>
            </div>
        );
    }

    const contentData = content[0];
    const streamUrl = getStreamUrl();

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-black text-white`}>
            {/* Video Player */}
            <div className={`relative ${isFullscreen ? 'w-full h-full' : 'w-full'}`}>
                {streamUrl ? (
                    <VideoPlayer
                        ref={playerRef}
                        src={streamUrl}
                        poster={contentData.backgroundimage}
                        title={type === 'movie' ? contentData.title : currentEpisode?.title}
                        subtitles={getSubtitleUrl()}
                        initialTime={playerTime}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => {
                            if (type === 'tv') {
                                handleEpisodeNavigation('next');
                            }
                        }}
                    />
                ) : (
                    <div className="aspect-video bg-gray-900 flex items-center justify-center">
                        <div className="text-center">
                            <Spinner size="large" className="mb-4" />
                            <p className="text-gray-400">Caricamento video...</p>
                        </div>
                    </div>
                )}

                {/* Back Button (only when not fullscreen) */}
                {!isFullscreen && (
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 bg-black/50 hover:bg-black/75 rounded-full p-3 transition-all z-10"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Content Info & Episodes (only when not fullscreen) */}
            {!isFullscreen && (
                <div className="container mx-auto px-4 py-6">
                    {/* Content Info */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-2">
                            {type === 'movie' ? contentData.title : contentData.title}
                        </h1>

                        {type === 'tv' && currentEpisode && (
                            <div className="text-gray-400 mb-2">
                                Stagione {currentSeason} • Episodio {currentEpisode.episodenumber} • {currentEpisode.title}
                            </div>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{new Date(contentData.releasedate).getFullYear()}</span>
                            {contentData.runtime && (
                                <span>{Math.floor(contentData.runtime / 60)}h {contentData.runtime % 60}m</span>
                            )}
                            {contentData.voteaverage && (
                                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                                    {contentData.voteaverage.toFixed(1)}
                </span>
                            )}
                        </div>
                    </div>

                    {/* Episodes Section for TV Series */}
                    {type === 'tv' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                {/* Season Selector */}
                                {seasons && seasons.length > 1 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">Stagione:</label>
                                        <select
                                            value={currentSeason}
                                            onChange={(e) => handleSeasonChange(Number(e.target.value))}
                                            className="bg-gray-800 border border-gray-700 rounded px-3 py-2"
                                        >
                                            {seasons.map((season) => (
                                                <option key={season.seasonid} value={season.seasonnumber}>
                                                    Stagione {season.seasonnumber} ({season.episodecount} episodi)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Episodes List */}
                                {episodes && (
                                    <EpisodeList
                                        episodes={episodes}
                                        currentEpisode={currentEpisode}
                                        onEpisodeSelect={handleEpisodeSelect}
                                        loading={episodesLoading}
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Watch;
