import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, List, ChevronLeft, ChevronRight, Rewind, FastForward, Zap } from 'lucide-react';

const Watch = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const progressBarRef = useRef(null);

    const [streamUrl, setStreamUrl] = useState('');
    const [content, setContent] = useState(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [buffered, setBuffered] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [gesture, setGesture] = useState(null);
    const [ripples, setRipples] = useState([]);
    const [isLoadingPosition, setIsLoadingPosition] = useState(true);
    const [showTimeRemaining, setShowTimeRemaining] = useState(false);
    const [hoverTime, setHoverTime] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [lastClickTime, setLastClickTime] = useState(0);

    // Stati per le Serie TV
    const [seasons, setSeasons] = useState([]);
    const [episodes, setEpisodes] = useState([]);
    const [currentSeason, setCurrentSeason] = useState(null);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
    const [showEpisodesModal, setShowEpisodesModal] = useState(false);
    const [modalView, setModalView] = useState('seasons'); // 'seasons' o 'episodes'

    const API_BASE_URL = 'https://surio.ddns.net:4000';
    const isTVShow = type === 'tv';

    // Funzione helper per i cookie
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    // Formato tempo con ore - SEMPRE H:MM:SS
    const formatTime = (time) => {
        if (isNaN(time) || time < 0) return '0:00:00';
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // ========== FUNZIONI PER FILM ==========
    const setPlayerTime = async (movie_id, player_time) => {
        try {
            const user_id = getCookie('user');
            if (!user_id) return;

            await fetch(`${API_BASE_URL}/setPlayerTime`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, movie_id, player_time })
            });
        } catch (error) {
            console.error('Error saving player time:', error);
        }
    };

    const getPlayerTime = async (movie_id) => {
        try {
            const user_id = getCookie('user');
            if (!user_id) return 0;

            const response = await fetch(`${API_BASE_URL}/getPlayerTime`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, movie_id })
            });

            const data = await response.json();
            return data && data[0] ? data[0].player_time : 0;
        } catch (error) {
            console.error('Error getting player time:', error);
            return 0;
        }
    };

    // ========== FUNZIONI PER SERIE TV ==========
    const setPlayerTimeSerie = async (episodeId, seasonId, playerTime) => {
        try {
            const user_id = getCookie('user');
            if (!user_id || !episodeId || !seasonId) return;

            await fetch(`${API_BASE_URL}/setPlayerTimeSerie`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id,
                    serie_tv_id: id,
                    episode_id: episodeId,
                    season_id: seasonId,
                    player_time: playerTime
                })
            });
        } catch (error) {
            console.error('Error saving serie player time:', error);
        }
    };

    const getPlayerTimeSerie = async () => {
        try {
            const user_id = getCookie('user');
            if (!user_id) return null;

            const response = await fetch(`${API_BASE_URL}/getPlayerTimeSerie`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id, serie_tv_id: id })
            });

            const data = await response.json();
            return data && data.length > 0 ? data[0] : null;
        } catch (error) {
            console.error('Error getting serie player time:', error);
            return null;
        }
    };

    const fetchSeasons = async () => {
        try {
            const token = getCookie('jwt');
            const response = await fetch(`${API_BASE_URL}/getSeasons?id=${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setSeasons(Array.isArray(data) ? data : []);
            return data;
        } catch (error) {
            console.error('Error fetching seasons:', error);
            return [];
        }
    };

    const fetchEpisodes = async (seasonId) => {
        try {
            const token = getCookie('jwt');
            const response = await fetch(`${API_BASE_URL}/getEpisodes?id=${seasonId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching episodes:', error);
            return [];
        }
    };

    const loadAllEpisodes = async () => {
        try {
            const seasonsData = await fetchSeasons();
            let allEpisodes = [];

            for (const season of seasonsData) {
                const episodesData = await fetchEpisodes(season.season_id);
                allEpisodes.push(...episodesData);
            }

            setEpisodes(allEpisodes);
            return allEpisodes;
        } catch (error) {
            console.error('Error loading all episodes:', error);
            return [];
        }
    };

    const playEpisode = async (episode, autoPlay = true) => {
        try {
            setCurrentEpisode(episode);
            setCurrentSeason(episode.season_id);

            // Trova l'indice dell'episodio nella lista completa
            const index = episodes.findIndex(ep => ep.episode_id === episode.episode_id);
            setCurrentEpisodeIndex(index);

            const videoUrl = `${API_BASE_URL}/stream?title=${episode.episode_id}&tv=true`;
            setStreamUrl(videoUrl);

            if (videoRef.current && autoPlay) {
                videoRef.current.load();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Error playing episode:', error);
        }
    };

    const nextEpisode = () => {
        if (currentEpisodeIndex < episodes.length - 1) {
            const next = episodes[currentEpisodeIndex + 1];
            playEpisode(next);
        }
    };

    const previousEpisode = () => {
        if (currentEpisodeIndex > 0) {
            const prev = episodes[currentEpisodeIndex - 1];
            playEpisode(prev);
        }
    };

    // ========== INIZIALIZZAZIONE ==========
    useEffect(() => {
        const initializePlayer = async () => {
            try {
                if (isTVShow) {
                    // Carica info serie TV
                    const token = getCookie('jwt');
                    const response = await fetch(`${API_BASE_URL}/serie_tv?id=${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (data.results && data.results[0]) {
                        setContent(data.results[0]);
                    }

                    // Carica tutti gli episodi
                    const allEpisodes = await loadAllEpisodes();

                    if (allEpisodes.length > 0) {
                        // Cerca l'episodio salvato
                        const savedState = await getPlayerTimeSerie();

                        if (savedState && savedState.episode_id) {
                            const savedEpisode = allEpisodes.find(ep => ep.episode_id === savedState.episode_id);
                            if (savedEpisode) {
                                await playEpisode(savedEpisode, false);
                                // Imposta il tempo salvato dopo il caricamento
                                setTimeout(() => {
                                    if (videoRef.current) {
                                        videoRef.current.currentTime = savedState.player_time || 0;
                                    }
                                }, 500);
                            } else {
                                // Episodio salvato non trovato, carica il primo
                                await playEpisode(allEpisodes[0], false);
                            }
                        } else {
                            // Nessuno stato salvato, carica il primo episodio
                            await playEpisode(allEpisodes[0], false);
                        }
                    }
                } else {
                    // Film - gestione normale
                    const response = await fetch(`${API_BASE_URL}/film?id=${id}`);
                    const data = await response.json();
                    if (data.film && data.film[0]) {
                        setContent(data.film[0]);
                    }

                    const url = `${API_BASE_URL}/stream?title=${id}`;
                    setStreamUrl(url);
                }
            } catch (error) {
                console.error('Error initializing player:', error);
            } finally {
                setIsLoadingPosition(false);
            }
        };

        initializePlayer();
    }, [id, isTVShow]);

    // Salvataggio automatico della posizione
    useEffect(() => {
        if (!streamUrl) return;

        const saveInterval = setInterval(() => {
            if (videoRef.current && currentTime > 0) {
                if (isTVShow && currentEpisode && currentSeason) {
                    setPlayerTimeSerie(currentEpisode.episode_id, currentSeason, currentTime);
                } else if (!isTVShow) {
                    setPlayerTime(id, currentTime);
                }
            }
        }, 5000);

        return () => clearInterval(saveInterval);
    }, [streamUrl, currentTime, isTVShow, currentEpisode, currentSeason, id]);

    // Ripristino posizione per i film
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamUrl || isTVShow) return;

        const handleLoadedMetadata = async () => {
            try {
                const savedPosition = await getPlayerTime(id);
                if (savedPosition && savedPosition > 0 && !isNaN(savedPosition)) {
                    if (video.readyState >= 2) {
                        video.currentTime = savedPosition;
                    } else {
                        video.addEventListener('loadeddata', () => {
                            video.currentTime = savedPosition;
                        }, { once: true });
                    }
                }
            } catch (error) {
                console.error('Error loading saved position:', error);
            }
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [streamUrl, id, isTVShow]);

    // Gestione eventi video
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamUrl) return;

        const updateTime = () => {
            if (!isNaN(video.currentTime) && !isDragging) {
                setCurrentTime(video.currentTime);
            }
        };

        const updateDuration = () => {
            if (!isNaN(video.duration) && isFinite(video.duration)) {
                setDuration(video.duration);
            }
        };

        const updateBuffered = () => {
            if (video.buffered.length > 0 && !isNaN(video.duration) && video.duration > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                setBuffered((bufferedEnd / video.duration) * 100);
            }
        };

        const handleCanPlay = () => {
            updateDuration();
        };

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('loadedmetadata', updateDuration);
        video.addEventListener('progress', updateBuffered);
        video.addEventListener('durationchange', updateDuration);
        video.addEventListener('canplay', handleCanPlay);

        if (!isNaN(video.duration) && isFinite(video.duration) && video.duration > 0) {
            setDuration(video.duration);
        }

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('loadedmetadata', updateDuration);
            video.removeEventListener('progress', updateBuffered);
            video.removeEventListener('durationchange', updateDuration);
            video.removeEventListener('canplay', handleCanPlay);
        };
    }, [streamUrl, isDragging]);

    // Auto-hide controls
    useEffect(() => {
        let timeout;
        const container = containerRef.current;

        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (isPlaying) {
                    setShowControls(false);
                }
            }, 3000);
        };

        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('touchstart', handleMouseMove);
        }

        return () => {
            clearTimeout(timeout);
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('touchstart', handleMouseMove);
            }
        };
    }, [isPlaying]);

    // Gestione tasti
    useEffect(() => {
        const handleKeyPress = (e) => {
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    skip(-10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    skip(10);
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    changeVolume(0.1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    changeVolume(-0.1);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    // Controlli video
    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setIsMuted(newVolume === 0);
        }
    };

    const changeVolume = (delta) => {
        const newVolume = Math.max(0, Math.min(1, volume + delta));
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setIsMuted(newVolume === 0);
        }
    };

    const skip = (seconds) => {
        if (videoRef.current) {
            const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);

            setGesture(seconds > 0 ? 'forward' : 'backward');
            setTimeout(() => setGesture(null), 500);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const changePlaybackRate = (rate) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
            setShowSettings(false);
        }
    };

    const handleProgressBarClick = (e) => {
        const progressBar = progressBarRef.current;
        if (!progressBar || !videoRef.current) return;

        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * duration;

        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleProgressMouseMove = (e) => {
        const progressBar = progressBarRef.current;
        if (!progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const time = Math.max(0, Math.min(duration, pos * duration));
        setHoverTime(time);
    };

    const handleProgressMouseDown = (e) => {
        setIsDragging(true);
        handleProgressBarClick(e);
    };

    const handleProgressMouseUp = () => {
        setIsDragging(false);
    };

    const handleProgressDrag = (e) => {
        if (isDragging) {
            handleProgressBarClick(e);
        }
    };

    const toggleTimeDisplay = () => {
        setShowTimeRemaining(!showTimeRemaining);
    };

    const handleVideoClick = (e) => {
        const now = Date.now();
        if (now - lastClickTime < 300) {
            // Doppio click - fullscreen
            toggleFullscreen();
        } else {
            // Single click - play/pause
            togglePlay();
        }
        setLastClickTime(now);
    };

    if (isLoadingPosition) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="text-white text-xl">Caricamento...</div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative h-screen w-screen bg-black overflow-hidden"
            onMouseMove={() => setShowControls(true)}
        >
            {/* Video */}
            <video
                ref={videoRef}
                src={streamUrl}
                className="h-full w-full"
                onClick={handleVideoClick}
                autoPlay
            />

            {/* Gesture Indicators */}
            {gesture && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/70 backdrop-blur-xl rounded-full p-8 animate-fade-in">
                        {gesture === 'forward' ? (
                            <FastForward className="h-16 w-16 text-white" />
                        ) : (
                            <Rewind className="h-16 w-16 text-white" />
                        )}
                    </div>
                </div>
            )}

            {/* Modal Episodi per Serie TV */}
            {isTVShow && showEpisodesModal && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 overflow-y-auto">
                    <div className="container mx-auto px-4 py-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-white">
                                {modalView === 'seasons' ? 'Stagioni' : 'Episodi'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowEpisodesModal(false);
                                    setModalView('seasons');
                                }}
                                className="p-3 hover:bg-white/10 rounded-full transition-all"
                            >
                                <ArrowLeft className="h-6 w-6 text-white" />
                            </button>
                        </div>

                        {modalView === 'seasons' ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {seasons.map(season => (
                                    <div
                                        key={season.season_id}
                                        onClick={async () => {
                                            const eps = await fetchEpisodes(season.season_id);
                                            setEpisodes(eps);
                                            setModalView('episodes');
                                        }}
                                        className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                                    >
                                        <img
                                            src={season.background_image
                                                ? `https://image.tmdb.org/t/p/original${season.background_image}`
                                                : '/placeholder-poster.jpg'}
                                            alt={season.season_name}
                                            className="w-full aspect-video object-cover"
                                        />
                                        <div className="p-4">
                                            <h3 className="text-white font-semibold">
                                                {season.season_number}. {season.season_name}
                                            </h3>
                                            <p className="text-gray-400 text-sm mt-1">
                                                {season.episode_count} episodi
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <button
                                    onClick={() => setModalView('seasons')}
                                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-4"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                    Torna alle stagioni
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {episodes.map((episode, index) => (
                                        <div
                                            key={episode.episode_id}
                                            onClick={() => {
                                                playEpisode(episode);
                                                setShowEpisodesModal(false);
                                                setModalView('seasons');
                                            }}
                                            className={`bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-all ${
                                                currentEpisode?.episode_id === episode.episode_id ? 'ring-2 ring-cyan-500' : ''
                                            }`}
                                        >
                                            <div className="flex gap-4 p-4">
                                                <img
                                                    src={episode.background_image
                                                        ? `https://image.tmdb.org/t/p/original${episode.background_image}`
                                                        : '/placeholder-poster.jpg'}
                                                    alt={episode.title}
                                                    className="w-32 aspect-video object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <h3 className="text-white font-semibold">
                                                            {episode.episode_number}. {episode.title}
                                                        </h3>
                                                        {currentEpisode?.episode_id === episode.episode_id && (
                                                            <span className="text-cyan-400 text-xs">In riproduzione</span>
                                                        )}
                                                    </div>
                                                    {episode.overview && (
                                                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                                                            {episode.overview}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <div className="px-8 pb-8 pt-20">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-all backdrop-blur-sm"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Indietro</span>
                        </button>
                        <h1 className="text-2xl font-bold">
                            {isTVShow && currentEpisode
                                ? `${content?.title || ''} - S${currentEpisode.season_number} E${currentEpisode.episode_number}: ${currentEpisode.title}`
                                : content?.title || 'Loading...'}
                        </h1>
                        <div className="w-32" />
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div
                            ref={progressBarRef}
                            className="relative h-2 bg-white/20 rounded-full cursor-pointer group"
                            onClick={handleProgressBarClick}
                            onMouseMove={handleProgressMouseMove}
                            onMouseLeave={() => setHoverTime(null)}
                            onMouseDown={handleProgressMouseDown}
                            onMouseUp={handleProgressMouseUp}
                            onMouseMoveCapture={handleProgressDrag}
                        >
                            {/* Buffered */}
                            <div
                                className="absolute h-full bg-white/30 rounded-full transition-all"
                                style={{ width: `${buffered}%` }}
                            />
                            {/* Progress */}
                            <div
                                className="absolute h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                            {/* Thumb */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                                style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
                            />

                            {/* Hover Time Tooltip */}
                            {hoverTime !== null && (
                                <div
                                    className="absolute bottom-6 bg-black/90 backdrop-blur-xl text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-xl pointer-events-none whitespace-nowrap"
                                    style={{
                                        left: `${(hoverTime / duration) * 100}%`,
                                        transform: 'translateX(-50%)'
                                    }}
                                >
                                    {formatTime(hoverTime)}
                                </div>
                            )}

                            {/* Drag Time Tooltip */}
                            {isDragging && (
                                <div
                                    className="absolute bottom-6 bg-cyan-500/90 backdrop-blur-xl text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-xl border border-cyan-300/50 whitespace-nowrap pointer-events-none"
                                    style={{
                                        left: `${(currentTime / duration) * 100}%`,
                                        transform: 'translateX(-50%)'
                                    }}
                                >
                                    {formatTime(currentTime)}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between text-sm mt-2 text-gray-400">
                            <span>{formatTime(currentTime)}</span>
                            <button
                                onClick={toggleTimeDisplay}
                                className="hover:text-white transition-colors cursor-pointer"
                            >
                                {showTimeRemaining
                                    ? `-${formatTime(duration - currentTime)}`
                                    : formatTime(duration)
                                }
                            </button>
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Episodio Precedente (solo per serie TV) */}
                            {isTVShow && (
                                <button
                                    onClick={previousEpisode}
                                    disabled={currentEpisodeIndex <= 0}
                                    className="p-3 hover:bg-white/10 rounded-full transition-all hover:scale-110 backdrop-blur-sm border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Episodio precedente"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                            )}

                            {/* Skip Backward */}
                            <button
                                onClick={() => skip(-10)}
                                className="p-3 hover:bg-white/10 rounded-full transition-all hover:scale-110 backdrop-blur-sm border border-white/10"
                            >
                                <Rewind className="h-5 w-5" />
                            </button>

                            {/* Play/Pause */}
                            <button
                                onClick={togglePlay}
                                className="p-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 rounded-full transition-all hover:scale-110 shadow-lg shadow-cyan-500/50"
                            >
                                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                            </button>

                            {/* Skip Forward */}
                            <button
                                onClick={() => skip(10)}
                                className="p-3 hover:bg-white/10 rounded-full transition-all hover:scale-110 backdrop-blur-sm border border-white/10"
                            >
                                <FastForward className="h-5 w-5" />
                            </button>

                            {/* Episodio Successivo (solo per serie TV) */}
                            {isTVShow && (
                                <button
                                    onClick={nextEpisode}
                                    disabled={currentEpisodeIndex >= episodes.length - 1}
                                    className="p-3 hover:bg-white/10 rounded-full transition-all hover:scale-110 backdrop-blur-sm border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Episodio successivo"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            )}

                            {/* Volume */}
                            <div className="flex items-center gap-2 group">
                                <button
                                    onClick={toggleMute}
                                    className="p-3 hover:bg-white/10 rounded-full transition-all backdrop-blur-sm border border-white/10"
                                >
                                    {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-0 group-hover:w-24 transition-all opacity-0 group-hover:opacity-100"
                                    style={{
                                        background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Lista Episodi (solo per serie TV) */}
                            {isTVShow && (
                                <button
                                    onClick={() => setShowEpisodesModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-all backdrop-blur-sm border border-white/10"
                                    title="Episodi"
                                >
                                    <List className="h-5 w-5" />
                                    <span className="text-sm">Episodi</span>
                                </button>
                            )}

                            {/* Playback Speed */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-all backdrop-blur-sm border border-white/10"
                                >
                                    <Zap className="h-4 w-4" />
                                    <span className="text-sm">{playbackRate}x</span>
                                </button>

                                {showSettings && (
                                    <div className="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden shadow-2xl">
                                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                                            <button
                                                key={rate}
                                                onClick={() => changePlaybackRate(rate)}
                                                className={`block w-full px-6 py-2 text-left hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-purple-500/20 transition-all ${
                                                    playbackRate === rate ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400' : ''
                                                }`}
                                            >
                                                {rate}x
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Fullscreen */}
                            <button
                                onClick={toggleFullscreen}
                                className="p-3 hover:bg-white/10 rounded-full transition-all hover:scale-110 backdrop-blur-sm border border-white/10"
                            >
                                <Maximize className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: scale(0.8);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                input[type="range"] {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 4px;
                    border-radius: 2px;
                    outline: none;
                }
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
                }
                input[type="range"]::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
                }
            `}</style>
        </div>
    );
};

export default Watch;