import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Rewind, FastForward, Zap, Subtitles } from 'lucide-react';

/**
 * CustomVideoPlayer - Player video personalizzato riutilizzabile
 * Può essere usato sia standalone che sincronizzato con Surio Party
 */
const CustomVideoPlayer = ({ 
    videoUrl, 
    subtitleUrl,
    onTimeUpdate,
    onPlay,
    onPause,
    onSeeked,
    onRateChange,
    canControl = true,
    initialTime = 0,
    initialSpeed = 1,
    autoPlay = false,
    partyMode = false
}) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const progressBarRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [buffered, setBuffered] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(initialSpeed);
    const [showSettings, setShowSettings] = useState(false);
    const [gesture, setGesture] = useState(null);
    const [ripples, setRipples] = useState([]);
    const [showTimeRemaining, setShowTimeRemaining] = useState(false);
    const [hoverTime, setHoverTime] = useState(null);
    const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);

    // Ref per tracciare se un'azione è remota (party mode)
    const isRemoteAction = useRef(false);

    // Formato tempo con ore
    const formatTime = (time) => {
        if (isNaN(time) || time < 0) return '0:00:00';
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Carica tempo iniziale
    useEffect(() => {
        if (videoRef.current && initialTime > 0) {
            videoRef.current.currentTime = initialTime;
        }
    }, [initialTime]);

    // Carica velocità iniziale
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = initialSpeed;
        }
    }, [initialSpeed]);

    // Auto-play
    useEffect(() => {
        if (videoRef.current && autoPlay) {
            videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
        }
    }, [autoPlay]);

    // Event listeners del video
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            if (onTimeUpdate) {
                onTimeUpdate(video.currentTime);
            }
        };

        const handleDurationChange = () => {
            setDuration(video.duration);
        };

        const handleProgress = () => {
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1));
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('progress', handleProgress);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('progress', handleProgress);
        };
    }, [onTimeUpdate]);

    // Gestione play/pause
    const togglePlay = () => {
        if (!canControl && partyMode) return;

        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPlaying(true);
            if (onPlay && !isRemoteAction.current) {
                onPlay(video.currentTime);
            }
        } else {
            video.pause();
            setIsPlaying(false);
            if (onPause && !isRemoteAction.current) {
                onPause(video.currentTime);
            }
        }
        isRemoteAction.current = false;
    };

    // Gestione volume
    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = !video.muted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        const video = videoRef.current;
        if (!video) return;

        video.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    // Gestione progress bar
    const handleProgressClick = (e) => {
        if (!canControl && partyMode) return;

        const video = videoRef.current;
        const progressBar = progressBarRef.current;
        if (!video || !progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * duration;
        
        video.currentTime = newTime;
        
        if (onSeeked && !isRemoteAction.current) {
            onSeeked(newTime);
        }
        isRemoteAction.current = false;
    };

    // Skip forward/backward
    const skip = (seconds) => {
        if (!canControl && partyMode) return;

        const video = videoRef.current;
        if (!video) return;

        const newTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
        video.currentTime = newTime;
        
        // Mostra gesture
        setGesture(seconds > 0 ? 'forward' : 'backward');
        setTimeout(() => setGesture(null), 500);
        
        if (onSeeked && !isRemoteAction.current) {
            onSeeked(newTime);
        }
        isRemoteAction.current = false;
    };

    // Cambio velocità
    const changeSpeed = (newRate) => {
        if (!canControl && partyMode) return;

        const video = videoRef.current;
        if (!video) return;

        video.playbackRate = newRate;
        setPlaybackRate(newRate);
        
        if (onRateChange && !isRemoteAction.current) {
            onRateChange(newRate, video.currentTime);
        }
        isRemoteAction.current = false;
    };

    // Fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    // Toggle sottotitoli
    const toggleSubtitles = () => {
        const video = videoRef.current;
        if (!video) return;

        const tracks = video.textTracks;
        if (tracks.length > 0) {
            tracks[0].mode = subtitlesEnabled ? 'hidden' : 'showing';
            setSubtitlesEnabled(!subtitlesEnabled);
        }
    };

    // Metodi pubblici per controllo remoto (party mode)
    useEffect(() => {
        if (!partyMode) return;

        // Esponi metodi per controllo remoto
        window.partyPlayer = {
            play: () => {
                isRemoteAction.current = true;
                const video = videoRef.current;
                if (video) {
                    video.play();
                    setIsPlaying(true);
                }
            },
            pause: () => {
                isRemoteAction.current = true;
                const video = videoRef.current;
                if (video) {
                    video.pause();
                    setIsPlaying(false);
                }
            },
            seek: (time) => {
                isRemoteAction.current = true;
                const video = videoRef.current;
                if (video) {
                    video.currentTime = time;
                }
            },
            setSpeed: (rate) => {
                isRemoteAction.current = true;
                const video = videoRef.current;
                if (video) {
                    video.playbackRate = rate;
                    setPlaybackRate(rate);
                }
            }
        };

        return () => {
            delete window.partyPlayer;
        };
    }, [partyMode]);

    // Hide controls dopo 3 secondi
    useEffect(() => {
        let timeout;
        if (showControls && isPlaying) {
            timeout = setTimeout(() => setShowControls(false), 3000);
        }
        return () => clearTimeout(timeout);
    }, [showControls, isPlaying]);

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full bg-black group"
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* Warning se non può controllare */}
            {!canControl && partyMode && (
                <div className="absolute top-4 left-4 z-50 bg-yellow-500/90 text-black px-4 py-2 rounded-lg text-sm font-medium">
                    Solo l'host può controllare il player
                </div>
            )}

            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full"
                src={videoUrl}
                crossOrigin="anonymous"
                onClick={togglePlay}
            >
                {subtitleUrl && (
                    <track
                        kind="captions"
                        label="Italiano"
                        srcLang="it"
                        src={subtitleUrl}
                        default
                    />
                )}
            </video>

            {/* Gesture Indicator */}
            {gesture && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
                    <div className="bg-black/70 rounded-full p-6 animate-ping">
                        {gesture === 'forward' ? (
                            <FastForward className="w-12 h-12 text-white" />
                        ) : (
                            <Rewind className="w-12 h-12 text-white" />
                        )}
                    </div>
                </div>
            )}

            {/* Controls Overlay */}
            <div 
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                } z-30`}
            >
                {/* Progress Bar */}
                <div 
                    ref={progressBarRef}
                    className="w-full h-1 bg-gray-600 rounded-full cursor-pointer mb-4 hover:h-2 transition-all"
                    onClick={handleProgressClick}
                >
                    {/* Buffered */}
                    <div 
                        className="absolute h-full bg-gray-500 rounded-full"
                        style={{ width: `${(buffered / duration) * 100}%` }}
                    />
                    {/* Progress */}
                    <div 
                        className="absolute h-full bg-red-600 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between text-white">
                    {/* Left Controls */}
                    <div className="flex items-center space-x-4">
                        {/* Play/Pause */}
                        <button 
                            onClick={togglePlay}
                            disabled={!canControl && partyMode}
                            className="hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>

                        {/* Skip Backward */}
                        <button 
                            onClick={() => skip(-10)}
                            disabled={!canControl && partyMode}
                            className="hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                            <Rewind size={20} />
                        </button>

                        {/* Skip Forward */}
                        <button 
                            onClick={() => skip(10)}
                            disabled={!canControl && partyMode}
                            className="hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                            <FastForward size={20} />
                        </button>

                        {/* Volume */}
                        <div className="flex items-center space-x-2">
                            <button onClick={toggleMute} className="hover:text-red-600 transition-colors">
                                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                            />
                        </div>

                        {/* Time */}
                        <div className="text-sm">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center space-x-4">
                        {/* Subtitles */}
                        {subtitleUrl && (
                            <button 
                                onClick={toggleSubtitles}
                                className={`hover:text-red-600 transition-colors ${subtitlesEnabled ? 'text-red-600' : ''}`}
                            >
                                <Subtitles size={20} />
                            </button>
                        )}

                        {/* Speed */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowSettings(!showSettings)}
                                disabled={!canControl && partyMode}
                                className="flex items-center space-x-1 hover:text-red-600 transition-colors disabled:opacity-50"
                            >
                                <Zap size={20} />
                                <span className="text-sm">{playbackRate}x</span>
                            </button>

                            {showSettings && (
                                <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 space-y-1">
                                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                                        <button
                                            key={rate}
                                            onClick={() => {
                                                changeSpeed(rate);
                                                setShowSettings(false);
                                            }}
                                            className={`block w-full text-left px-3 py-1 rounded hover:bg-red-600 transition-colors ${
                                                playbackRate === rate ? 'bg-red-600' : ''
                                            }`}
                                        >
                                            {rate}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fullscreen */}
                        <button onClick={toggleFullscreen} className="hover:text-red-600 transition-colors">
                            <Maximize size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomVideoPlayer;
