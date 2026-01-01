import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Rewind, FastForward, Zap, Subtitles, AlertCircle, Sparkles, Star } from 'lucide-react';
import partyService from '../../services/party.service';

const SyncedPlayerAdvanced = ({ party, isHost, canControl, onTimeUpdate }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const progressBarRef = useRef(null);
    const isRemoteAction = useRef(false);

    const [streamUrl, setStreamUrl] = useState('');
    const [isPlaying, setIsPlaying] = useState(party?.status === 'playing');
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [buffered, setBuffered] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(party?.playback_speed || 1);
    const [showSettings, setShowSettings] = useState(false);
    const [gesture, setGesture] = useState(null);
    const [ripples, setRipples] = useState([]);
    const [hoverTime, setHoverTime] = useState(null);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
    const [hasSubtitles, setHasSubtitles] = useState(false);
    const [showParticles, setShowParticles] = useState(false);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000';

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

    // Costruisci URL del video
    const getVideoUrl = () => {
        if (party.movie_id) {
            return `${API_BASE_URL}/stream?title=${party.movie_id}`;
        } else if (party.serie_tv_id && party.episode_id) {
            return `${API_BASE_URL}/stream?title=${party.episode_id}&tv=true`;
        }
        return null;
    };

    // Carica sottotitoli
    const loadSubtitles = async (title, isTVShow) => {
        try {
            const token = getCookie('jwt');
            const endpoint = isTVShow ? '/subtitleSerieTV' : '/subtitle';
            const subtitleUrl = `${API_BASE_URL}${endpoint}?film=${encodeURIComponent(title)}`;
            
            console.log('🎬 Tentativo caricamento sottotitoli:', subtitleUrl);
            
            const response = await fetch(subtitleUrl, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                console.log('✅ Sottotitoli disponibili');
                setHasSubtitles(true);
                
                // Aggiungi traccia sottotitoli al video
                if (videoRef.current) {
                    const video = videoRef.current;
                    
                    // Rimuovi solo le tracce esistenti
                    const existingTracks = Array.from(video.querySelectorAll('track'));
                    existingTracks.forEach(track => video.removeChild(track));
                    
                    // Crea e aggiungi nuova traccia
                    const track = document.createElement('track');
                    track.kind = 'subtitles';
                    track.label = 'Italiano';
                    track.srclang = 'it';
                    track.src = subtitleUrl;
                    track.default = true;
                    
                    track.addEventListener('load', function() {
                        console.log('✅ Track caricata');
                        try {
                            if (video.textTracks && video.textTracks.length > 0) {
                                video.textTracks[0].mode = 'showing';
                                console.log('✅ Sottotitoli attivati');
                            }
                        } catch (e) {
                            console.error('Errore attivazione sottotitoli:', e);
                        }
                    });
                    
                    track.addEventListener('error', function(e) {
                        console.warn('⚠️ Errore caricamento track sottotitoli:', e);
                        setHasSubtitles(false);
                    });
                    
                    video.appendChild(track);
                }
            } else {
                console.log('⚠️ Sottotitoli non disponibili');
                setHasSubtitles(false);
            }
        } catch (error) {
            console.error('❌ Errore caricamento sottotitoli:', error);
            setHasSubtitles(false);
        }
    };

    // Crea effetto particelle
    const createParticles = () => {
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 2000);
    };

    // Crea ripple effect
    const createRipple = (x, y) => {
        const ripple = {
            id: Date.now(),
            x,
            y
        };
        setRipples(prev => [...prev, ripple]);
        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.id !== ripple.id));
        }, 1000);
    };

    // Inizializza video URL e sottotitoli
    useEffect(() => {
        const url = getVideoUrl();
        if (url) {
            setStreamUrl(url);
            
            // Carica sottotitoli
            setTimeout(() => {
                if (party.movie_id) {
                    loadSubtitles(party.movie_id, false);
                } else if (party.episode_id) {
                    loadSubtitles(party.episode_id, true);
                }
            }, 1000);
        }
    }, [party]);

    // ========== CONTROLLI VIDEO ==========
    const togglePlay = useCallback(() => {
        if (!canControl) return;
        if (isRemoteAction.current) {
            isRemoteAction.current = false;
            return;
        }

        if (videoRef.current) {
            const currentTimestamp = videoRef.current.currentTime;
            if (isPlaying) {
                videoRef.current.pause();
                partyService.pause(party.party_id, currentTimestamp);
            } else {
                videoRef.current.play();
                partyService.play(party.party_id, currentTimestamp);
                createParticles();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying, canControl, party]);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            if (newVolume === 0) {
                setIsMuted(true);
            } else if (isMuted) {
                setIsMuted(false);
            }
        }
    };

    const skip = useCallback((seconds) => {
        if (!canControl) return;
        if (isRemoteAction.current) {
            isRemoteAction.current = false;
            return;
        }

        if (videoRef.current) {
            const newTime = videoRef.current.currentTime + seconds;
            videoRef.current.currentTime = newTime;
            partyService.seek(party.party_id, newTime);
            showGesture(seconds > 0 ? 'forward' : 'backward');
        }
    }, [canControl, party]);

    const changePlaybackRate = (rate) => {
        if (!canControl) return;
        if (isRemoteAction.current) {
            isRemoteAction.current = false;
            return;
        }

        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
            setShowSettings(false);
            partyService.changeSpeed(party.party_id, rate, videoRef.current.currentTime);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const showGesture = (type) => {
        setGesture(type);
        setTimeout(() => setGesture(null), 500);
    };

    const handleProgressClick = (e) => {
        if (!canControl) return;
        if (isRemoteAction.current) {
            isRemoteAction.current = false;
            return;
        }

        if (!progressBarRef.current || !videoRef.current) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * duration;
        videoRef.current.currentTime = newTime;
        partyService.seek(party.party_id, newTime);
        
        // Crea ripple effect al click
        createRipple(e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleProgressHover = (e) => {
        if (!progressBarRef.current) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        setHoverTime(pos * duration);
    };

    const toggleSubtitles = () => {
        if (!hasSubtitles) return;
        
        const newState = !subtitlesEnabled;
        setSubtitlesEnabled(newState);
        
        try {
            if (videoRef.current && videoRef.current.textTracks && videoRef.current.textTracks.length > 0) {
                videoRef.current.textTracks[0].mode = newState ? 'showing' : 'hidden';
                console.log(`🎬 Sottotitoli ${newState ? 'attivati' : 'disattivati'}`);
            }
        } catch (e) {
            console.error('Errore toggle sottotitoli:', e);
        }
    };

    const handleVideoClick = (e) => {
        if (!canControl) return;
        
        const now = Date.now();
        const timeSinceLastClick = now - lastClickTime;

        if (timeSinceLastClick < 300) {
            // Doppio click -> Fullscreen
            toggleFullscreen();
            setLastClickTime(0);
        } else {
            // Click singolo -> Play/Pause
            setLastClickTime(now);
            setTimeout(() => {
                if (Date.now() - now >= 300) {
                    togglePlay();
                }
            }, 300);
        }
    };

    // ========== SINCRONIZZAZIONE PARTY ==========
    useEffect(() => {
        const unsubscribers = [];

        // Play remoto
        unsubscribers.push(
            partyService.on('player-play', (data) => {
                console.log('▶️ Remote play at', data.currentTime);
                isRemoteAction.current = true;
                if (videoRef.current) {
                    videoRef.current.currentTime = data.currentTime;
                    videoRef.current.play();
                    setIsPlaying(true);
                    createParticles();
                }
            })
        );

        // Pause remoto
        unsubscribers.push(
            partyService.on('player-pause', (data) => {
                console.log('⏸️ Remote pause at', data.currentTime);
                isRemoteAction.current = true;
                if (videoRef.current) {
                    videoRef.current.currentTime = data.currentTime;
                    videoRef.current.pause();
                    setIsPlaying(false);
                }
            })
        );

        // Seek remoto
        unsubscribers.push(
            partyService.on('player-seek', (data) => {
                console.log('⏩ Remote seek to', data.currentTime);
                isRemoteAction.current = true;
                if (videoRef.current) {
                    videoRef.current.currentTime = data.currentTime;
                }
            })
        );

        // Speed change remoto
        unsubscribers.push(
            partyService.on('player-speed-changed', (data) => {
                console.log('🏃 Remote speed change to', data.speed);
                isRemoteAction.current = true;
                if (videoRef.current) {
                    videoRef.current.playbackRate = data.speed;
                    setPlaybackRate(data.speed);
                }
            })
        );

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [party]);

    // ========== VIDEO EVENTS ==========
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !streamUrl) return;

        const handleTimeUpdate = () => {
            const currentTimestamp = video.currentTime;
            setCurrentTime(currentTimestamp);
            if (onTimeUpdate) {
                onTimeUpdate(currentTimestamp);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
            // Imposta il tempo iniziale della party
            if (party.player_time && party.player_time > 0) {
                video.currentTime = party.player_time;
            }
            // Auto-play se la party è in playing
            if (party.status === 'playing') {
                video.play().catch(err => console.error('Error playing:', err));
                setIsPlaying(true);
            }
        };

        const handleProgress = () => {
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                setBuffered((bufferedEnd / video.duration) * 100);
            }
        };

        const handleError = (e) => {
            console.error('❌ VIDEO ERROR:', e);
            console.error('❌ Video error code:', video.error?.code);
            console.error('❌ Video error message:', video.error?.message);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('progress', handleProgress);
        video.addEventListener('error', handleError);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('progress', handleProgress);
            video.removeEventListener('error', handleError);
        };
    }, [streamUrl, party]);

    // Nascondi controlli dopo 3 secondi
    useEffect(() => {
        let timeout;
        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (isPlaying) setShowControls(false);
            }, 3000);
        };

        const container = containerRef.current;
        container?.addEventListener('mousemove', handleMouseMove);

        return () => {
            container?.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(timeout);
        };
    }, [isPlaying]);

    // Gestisce il posizionamento dinamico dei sottotitoli
    useEffect(() => {
        const updateSubtitlePosition = () => {
            const style = document.createElement('style');
            style.id = 'subtitle-position-style-party';
            
            const oldStyle = document.getElementById('subtitle-position-style-party');
            if (oldStyle) oldStyle.remove();
            
            if (showControls) {
                style.textContent = `
                    video::-webkit-media-text-track-container {
                        bottom: 180px !important;
                        transition: bottom 0.3s ease;
                    }
                `;
            } else {
                style.textContent = `
                    video::-webkit-media-text-track-container {
                        bottom: 80px !important;
                        transition: bottom 0.3s ease;
                    }
                `;
            }
            
            document.head.appendChild(style);
        };
        
        updateSubtitlePosition();
        
        return () => {
            const style = document.getElementById('subtitle-position-style-party');
            if (style) style.remove();
        };
    }, [showControls]);

    // Controlli da tastiera
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!canControl) return;
            
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'ArrowLeft':
                    skip(-10);
                    break;
                case 'ArrowRight':
                    skip(10);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setVolume(prev => Math.min(prev + 0.1, 1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setVolume(prev => Math.max(prev - 0.1, 0));
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
                case 'm':
                    toggleMute();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isPlaying, volume, canControl, togglePlay, skip, toggleMute]);

    if (!streamUrl) {
        return (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-white text-lg font-semibold">Errore nel caricamento del video</p>
                    <p className="text-gray-400 text-sm mt-2">Riprova più tardi</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden group">
            {/* Animated Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 via-red-600/5 to-red-900/5 animate-pulse pointer-events-none"></div>
            
            {/* Particles Effect */}
            {showParticles && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute animate-float"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        >
                            <Star className="w-4 h-4 text-orange-500 opacity-70" fill="currentColor" />
                        </div>
                    ))}
                </div>
            )}

            {/* Warning se non può controllare */}
            {!canControl && (
                <div className="absolute top-4 left-4 z-50 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl backdrop-blur-md border-2 border-white/30 animate-fade-in flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 animate-pulse" />
                    <span>Solo l'host può controllare il player</span>
                    <Sparkles className="w-4 h-4" />
                </div>
            )}

            {/* Video */}
            <video
                ref={videoRef}
                src={streamUrl}
                className="w-full h-full object-cover cursor-pointer"
                crossOrigin="use-credentials"
                onClick={handleVideoClick}
            />

            {/* Ripple Effects */}
            {ripples.map(ripple => (
                <div
                    key={ripple.id}
                    className="absolute pointer-events-none z-30"
                    style={{
                        left: ripple.x,
                        top: ripple.y,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <div className="w-24 h-24 border-4 border-orange-500 rounded-full animate-ping opacity-70"></div>
                    <div className="absolute inset-0 w-24 h-24 border-4 border-red-500 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.1s' }}></div>
                </div>
            ))}

            {/* Gesture Indicator */}
            {gesture && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                    <div className="relative bg-gradient-to-br from-orange-600/90 via-red-600/90 to-red-700/90 backdrop-blur-2xl rounded-3xl p-12 animate-scale-bounce border-4 border-white/30 shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-500/20 rounded-3xl animate-pulse"></div>
                        {gesture === 'forward' ? (
                            <FastForward className="relative h-24 w-24 text-white drop-shadow-2xl" />
                        ) : (
                            <Rewind className="relative h-24 w-24 text-white drop-shadow-2xl" />
                        )}
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full animate-ping"></div>
                        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white rounded-full animate-ping" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                </div>
            )}

            {/* Controls Overlay - Cinema Style */}
            <div
                className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-all duration-500 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ pointerEvents: showControls ? 'auto' : 'none' }}
            >
                <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end px-8 pb-8 pt-32">
                    {/* Progress Bar - Minimalist Cinema Style */}
                    <div className="space-y-3 mb-6">
                        <div
                            ref={progressBarRef}
                            className="relative h-1.5 bg-white/20 cursor-pointer group overflow-hidden transition-all hover:h-2"
                            onClick={handleProgressClick}
                            onMouseMove={handleProgressHover}
                            onMouseLeave={() => setHoverTime(null)}
                        >
                            {/* Buffered */}
                            <div
                                className="absolute h-full bg-white/30 transition-all"
                                style={{ width: `${buffered}%` }}
                            />
                            
                            {/* Progress - Netflix Style */}
                            <div
                                className="absolute h-full bg-gradient-to-r from-red-600 to-red-500 transition-all relative overflow-hidden"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                            </div>
                            
                            {/* Hover Time Tooltip */}
                            {hoverTime !== null && (
                                <div
                                    className="absolute -top-12 transform -translate-x-1/2 bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold text-white animate-fade-in"
                                    style={{ left: `${(hoverTime / duration) * 100}%` }}
                                >
                                    {formatTime(hoverTime)}
                                </div>
                            )}
                            
                            {/* Thumb - Appears on Hover */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
                            />
                        </div>

                        {/* Time Display - Minimalist */}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white font-medium text-shadow">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>
                    </div>

                    {/* Control Buttons - Cinema Style */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Skip Backward */}
                            <button
                                onClick={() => skip(-10)}
                                disabled={!canControl}
                                className="p-3 hover:bg-white/10 rounded-full transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Indietro 10s"
                            >
                                <Rewind className="h-6 w-6 text-white drop-shadow-lg" />
                            </button>

                            {/* Play/Pause - Clean Button */}
                            <button
                                onClick={togglePlay}
                                disabled={!canControl}
                                className="p-4 bg-white/90 hover:bg-white rounded-full transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl"
                                title={isPlaying ? 'Pausa' : 'Play'}
                            >
                                {isPlaying ? <Pause className="h-7 w-7 text-black" /> : <Play className="h-7 w-7 text-black ml-0.5" />}
                            </button>

                            {/* Skip Forward */}
                            <button
                                onClick={() => skip(10)}
                                disabled={!canControl}
                                className="p-3 hover:bg-white/10 rounded-full transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                                title="Avanti 10s"
                            >
                                <FastForward className="h-6 w-6 text-white drop-shadow-lg" />
                            </button>

                            {/* Volume */}
                            <div className="flex items-center gap-2 group/vol">
                                <button
                                    onClick={toggleMute}
                                    className="p-3 hover:bg-white/10 rounded-full transition-all"
                                    title={isMuted ? 'Attiva audio' : 'Disattiva audio'}
                                >
                                    {isMuted || volume === 0 ? <VolumeX className="h-5 w-5 text-white drop-shadow-lg" /> : <Volume2 className="h-5 w-5 text-white drop-shadow-lg" />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="w-0 group-hover/vol:w-24 transition-all opacity-0 group-hover/vol:opacity-100"
                                    style={{
                                        background: `linear-gradient(to right, #ffffff ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%, rgba(255,255,255,0.3) 100%)`
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Sottotitoli */}
                            {hasSubtitles && (
                                <button
                                    onClick={toggleSubtitles}
                                    className={`p-3 rounded-full transition-all ${
                                        subtitlesEnabled 
                                            ? 'bg-white/90 text-black' 
                                            : 'hover:bg-white/10 text-white'
                                    }`}
                                    title={subtitlesEnabled ? 'Disattiva sottotitoli' : 'Attiva sottotitoli'}
                                >
                                    <Subtitles className="h-5 w-5" />
                                </button>
                            )}

                            {/* Playback Speed */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    disabled={!canControl}
                                    className="flex items-center gap-1.5 px-3 py-2 hover:bg-white/10 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white"
                                    title="Velocità"
                                >
                                    <Zap className="h-4 w-4" />
                                    <span className="text-sm font-medium">{playbackRate}x</span>
                                </button>

                                {showSettings && (
                                    <div className="absolute bottom-full mb-2 right-0 bg-black/95 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl animate-fade-in min-w-[100px]">
                                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                                            <button
                                                key={rate}
                                                onClick={() => changePlaybackRate(rate)}
                                                className={`block w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-all ${
                                                    playbackRate === rate ? 'bg-white/20 text-white font-semibold' : 'text-gray-300'
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
                                className="p-3 hover:bg-white/10 rounded-full transition-all"
                                title="Schermo intero"
                            >
                                <Maximize className="h-5 w-5 text-white drop-shadow-lg" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .text-shadow {
                    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
                }
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
                @keyframes scale-bounce {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.05);
                    }
                }
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                @keyframes float {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100px) rotate(360deg);
                        opacity: 0;
                    }
                }
                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                .animate-scale-bounce {
                    animation: scale-bounce 0.5s ease-out;
                }
                .animate-shimmer {
                    animation: shimmer 2s linear infinite;
                }
                .animate-float {
                    animation: float linear infinite;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 2s ease-in-out infinite;
                }
                input[type="range"] {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 6px;
                    border-radius: 3px;
                    outline: none;
                }
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
                    cursor: pointer;
                    box-shadow: 0 0 15px rgba(220, 38, 38, 0.9), 0 0 30px rgba(234, 88, 12, 0.5);
                    border: 3px solid white;
                    transition: all 0.2s;
                }
                input[type="range"]::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                    box-shadow: 0 0 20px rgba(220, 38, 38, 1), 0 0 40px rgba(234, 88, 12, 0.7);
                }
                input[type="range"]::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
                    cursor: pointer;
                    border: 3px solid white;
                    box-shadow: 0 0 15px rgba(220, 38, 38, 0.9), 0 0 30px rgba(234, 88, 12, 0.5);
                    transition: all 0.2s;
                }
                input[type="range"]::-moz-range-thumb:hover {
                    transform: scale(1.2);
                    box-shadow: 0 0 20px rgba(220, 38, 38, 1), 0 0 40px rgba(234, 88, 12, 0.7);
                }
                
                /* Stili sottotitoli personalizzati */
                video::cue {
                    background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%);
                    color: white;
                    font-size: 1.5rem;
                    font-weight: 700;
                    text-shadow: 3px 3px 6px rgba(0, 0, 0, 1), 
                                 0 0 10px rgba(0, 0, 0, 0.9),
                                 0 0 20px rgba(220, 38, 38, 0.5);
                    padding: 0.4em 1em;
                    border-radius: 0.5em;
                    line-height: 1.4;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                }
                
                /* Posizionamento base dei sottotitoli */
                video::-webkit-media-text-track-container {
                    position: absolute;
                    width: 100%;
                    text-align: center;
                    pointer-events: none;
                }
                
                video::-webkit-media-text-track-display {
                    position: relative;
                }
            `}</style>
        </div>
    );
};

export default SyncedPlayerAdvanced;
