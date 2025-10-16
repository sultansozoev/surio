import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward, Rewind, FastForward, Zap } from 'lucide-react';

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
    const [quality, setQuality] = useState('auto');
    const [gesture, setGesture] = useState(null);
    const [ripples, setRipples] = useState([]);
    const [isLoadingPosition, setIsLoadingPosition] = useState(true);
    const [showTimeRemaining, setShowTimeRemaining] = useState(false);
    const [hoverTime, setHoverTime] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragTime, setDragTime] = useState(0);

    const API_BASE_URL = 'https://surio.ddns.net:4000';

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

    // Carica informazioni del contenuto
    useEffect(() => {
        const fetchContentInfo = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/film?id=${id}`);
                const data = await response.json();
                if (data.film && data.film[0]) {
                    setContent(data.film[0]);
                }
            } catch (error) {
                console.error('Error fetching content info:', error);
            }
        };

        fetchContentInfo();
    }, [id]);

    // Imposta URL dello stream
    useEffect(() => {
        const isTV = type === 'tv';
        const url = isTV
            ? `${API_BASE_URL}/stream?title=${id}&tv=true`
            : `${API_BASE_URL}/stream?title=${id}`;
        setStreamUrl(url);
    }, [type, id]);

    // Funzioni per salvare/recuperare la posizione
    const setPlayerTime = async (movie_id, player_time) => {
        try {
            const user_id = getCookie('user');
            if (!user_id) return;

            await fetch(`${API_BASE_URL}/setPlayerTime`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id, movie_id })
            });

            const data = await response.json();
            return data && data[0] ? data[0].player_time : 0;
        } catch (error) {
            console.error('Error getting player time:', error);
            return 0;
        }
    };

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
                console.log('Duration loaded:', video.duration);
            }
        };

        const updateBuffered = () => {
            if (video.buffered.length > 0 && !isNaN(video.duration) && video.duration > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                setBuffered((bufferedEnd / video.duration) * 100);
            }
        };

        const handleLoadedMetadata = async () => {
            console.log('Metadata loaded');
            updateDuration();

            try {
                const savedPosition = await getPlayerTime(id);
                console.log('Saved position:', savedPosition);
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
            setIsLoadingPosition(false);
        };

        const handleCanPlay = () => {
            console.log('Video can play, duration:', video.duration);
            updateDuration();
        };

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('progress', updateBuffered);
        video.addEventListener('durationchange', updateDuration);
        video.addEventListener('canplay', handleCanPlay);

        if (!isNaN(video.duration) && isFinite(video.duration) && video.duration > 0) {
            setDuration(video.duration);
        }

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('progress', updateBuffered);
            video.removeEventListener('durationchange', updateDuration);
            video.removeEventListener('canplay', handleCanPlay);
        };
    }, [id, streamUrl, isDragging]);

    useEffect(() => {
        let timeout;
        if (showControls && !isDragging) {
            timeout = setTimeout(() => setShowControls(false), 3000);
        }
        return () => clearTimeout(timeout);
    }, [showControls, isDragging]);

    // Salva la posizione ogni 5 secondi
    useEffect(() => {
        if (isLoadingPosition) return;

        const interval = setInterval(() => {
            if (videoRef.current && !isNaN(videoRef.current.currentTime)) {
                setPlayerTime(id, videoRef.current.currentTime);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [id, isLoadingPosition]);

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

    // Funzione helper per ottenere il tempo dalla posizione del mouse
    const getTimeFromPosition = (e, element) => {
        const rect = element.getBoundingClientRect();
        const pos = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
        return pos * duration;
    };

    // Gestione drag della progress bar
    const handleProgressMouseDown = (e) => {
        if (!duration || isNaN(duration) || duration === 0) return;

        setIsDragging(true);
        const time = getTimeFromPosition(e, e.currentTarget);
        setDragTime(time);
        setCurrentTime(time);
    };

    const handleProgressMouseMove = (e) => {
        if (isDragging && duration && !isNaN(duration) && duration > 0) {
            const time = getTimeFromPosition(e, progressBarRef.current);
            setDragTime(time);
            setCurrentTime(time);
        } else if (!isDragging && duration && !isNaN(duration) && duration > 0) {
            const time = getTimeFromPosition(e, e.currentTarget);
            setHoverTime(time);
        }
    };

    const handleProgressClick = (e) => {
        if (!duration || isNaN(duration) || duration === 0 || isDragging) return;

        const time = getTimeFromPosition(e, e.currentTarget);
        if (videoRef.current) {
            if (videoRef.current.readyState >= 2) {
                videoRef.current.currentTime = time;
                setCurrentTime(time);
            } else {
                videoRef.current.addEventListener('canplay', () => {
                    videoRef.current.currentTime = time;
                    setCurrentTime(time);
                }, { once: true });
            }
        }
    };

    const handleProgressMouseLeave = () => {
        setHoverTime(null);
    };

    // Gestione drag globale
    useEffect(() => {
        if (isDragging) {
            const handleGlobalMouseMove = (e) => {
                if (progressBarRef.current && duration && !isNaN(duration) && duration > 0) {
                    const time = getTimeFromPosition(e, progressBarRef.current);
                    setDragTime(time);
                    setCurrentTime(time);
                }
            };

            const handleGlobalMouseUp = () => {
                if (videoRef.current) {
                    videoRef.current.currentTime = dragTime;
                }
                setIsDragging(false);
            };

            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleGlobalMouseMove);
                document.removeEventListener('mouseup', handleGlobalMouseUp);
            };
        }
    }, [isDragging, dragTime, duration]);

    const skip = (seconds) => {
        const video = videoRef.current;
        if (!video || !duration || isNaN(duration)) return;

        const newTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
        video.currentTime = newTime;
        setCurrentTime(newTime);
        showGesture(seconds > 0 ? 'forward' : 'backward', seconds);
    };

    const changePlaybackRate = (rate) => {
        setPlaybackRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
        setShowSettings(false);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const showGesture = (type, value) => {
        setGesture({ type, value });
        setTimeout(() => setGesture(null), 800);
    };

    const createRipple = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newRipple = { x, y, id: Date.now() };
        setRipples(prev => [...prev, newRipple]);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 1000);
    };

    const handleVideoClick = (e) => {
        createRipple(e);
        togglePlay();
    };

    const toggleTimeDisplay = () => {
        setShowTimeRemaining(!showTimeRemaining);
    };

    if (!streamUrl) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="relative">
                    <div className="h-24 w-24 animate-spin rounded-full border-4 border-transparent border-t-cyan-500 border-r-purple-500"></div>
                    <div className="absolute inset-0 h-24 w-24 animate-ping rounded-full border-4 border-cyan-500 opacity-20"></div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="relative min-h-screen bg-black text-white overflow-hidden"
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20"></div>
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>

            {/* Video Container */}
            <div className="relative h-screen w-full flex items-center justify-center">
                <video
                    ref={videoRef}
                    className="max-h-full max-w-full"
                    autoPlay
                    src={streamUrl}
                    onClick={handleVideoClick}
                    preload="metadata"
                    playsInline
                />

                {/* Ripple Effects */}
                {ripples.map(ripple => (
                    <div
                        key={ripple.id}
                        className="absolute pointer-events-none"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div className="w-20 h-20 rounded-full border-2 border-cyan-500 animate-ping opacity-75"></div>
                    </div>
                ))}

                {/* Gesture Indicator */}
                {gesture && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                        <div className="bg-black/80 backdrop-blur-md rounded-2xl px-8 py-6 flex items-center gap-4 animate-fade-in">
                            {gesture.type === 'forward' ? (
                                <FastForward className="h-12 w-12 text-cyan-400" />
                            ) : (
                                <Rewind className="h-12 w-12 text-purple-400" />
                            )}
                            <span className="text-3xl font-bold">{Math.abs(gesture.value)}s</span>
                        </div>
                    </div>
                )}

                {/* Top Controls */}
                <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md px-4 py-2 border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            Indietro
                        </button>

                        {content && (
                            <div className="text-right">
                                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                                    {content.title}
                                </h2>
                                {content.release_date && (
                                    <p className="text-sm text-gray-400 mt-1">
                                        {new Date(content.release_date).getFullYear()}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Controls */}
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Progress Bar */}
                    <div className="mb-6 relative">
                        <div
                            ref={progressBarRef}
                            className="relative h-2 bg-white/20 rounded-full cursor-pointer group overflow-visible backdrop-blur-sm"
                            onClick={handleProgressClick}
                            onMouseDown={handleProgressMouseDown}
                            onMouseMove={handleProgressMouseMove}
                            onMouseLeave={handleProgressMouseLeave}
                        >
                            {/* Buffered */}
                            <div
                                className="absolute h-full bg-white/30 rounded-full transition-all pointer-events-none"
                                style={{ width: `${buffered}%` }}
                            />
                            {/* Progress */}
                            <div
                                className="absolute h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full pointer-events-none"
                                style={{
                                    width: `${(currentTime / duration) * 100}%`,
                                    transition: isDragging ? 'none' : 'width 0.1s linear'
                                }}
                            >
                                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-cyan-500/50 transition-transform ${isDragging || hoverTime !== null ? 'scale-150' : 'group-hover:scale-150'}`}></div>
                            </div>

                            {/* Hover Time Tooltip */}
                            {hoverTime !== null && !isDragging && (
                                <div
                                    className="absolute bottom-6 bg-black/90 backdrop-blur-xl text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-xl border border-white/20 whitespace-nowrap pointer-events-none"
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
                            {/* Skip Backward */}
                            <button
                                onClick={() => skip(-10)}
                                className="p-3 hover:bg-white/10 rounded-full transition-all hover:scale-110 backdrop-blur-sm border border-white/10"
                            >
                                <SkipBack className="h-5 w-5" />
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
                                <SkipForward className="h-5 w-5" />
                            </button>

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