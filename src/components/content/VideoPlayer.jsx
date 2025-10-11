import React, { useRef, useState, useEffect } from 'react';
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    SkipBack,
    SkipForward,
    Settings,
    Subtitles
} from 'lucide-react';

const VideoPlayer = ({
                         src,
                         title,
                         subtitleSrc,
                         onTimeUpdate,
                         initialTime = 0,
                         onEnded,
                         autoPlay = false
                     }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const progressBarRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [currentTime, setCurrentTime] = useState(initialTime);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
            if (initialTime > 0) {
                video.currentTime = initialTime;
            }
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            onTimeUpdate?.(video.currentTime);
        };

        const handleWaiting = () => setIsBuffering(true);
        const handleCanPlay = () => setIsBuffering(false);
        const handleEnded = () => {
            setIsPlaying(false);
            onEnded?.();
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('ended', handleEnded);
        };
    }, [initialTime, onTimeUpdate, onEnded]);

    useEffect(() => {
        if (autoPlay && videoRef.current) {
            videoRef.current.play().catch(console.error);
        }
    }, [autoPlay]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = async () => {
        if (!containerRef.current) return;

        try {
            if (!isFullscreen) {
                await containerRef.current.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    };

    const handleProgressClick = (e) => {
        if (!progressBarRef.current || !videoRef.current) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * duration;

        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const skip = (seconds) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    };

    const changePlaybackRate = (rate) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
            setShowSettings(false);
        }
    };

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleMouseMove = () => {
        setShowControls(true);

        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }

        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className="relative aspect-video w-full bg-black"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                className="h-full w-full"
                src={src}
                onClick={togglePlay}
                crossOrigin="anonymous"
            >
                {subtitleSrc && subtitlesEnabled && (
                    <track
                        kind="subtitles"
                        src={subtitleSrc}
                        srcLang="it"
                        label="Italiano"
                        default
                    />
                )}
            </video>

            {/* Loading Spinner */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent" />
                </div>
            )}

            {/* Title Overlay */}
            <div
                className={`absolute left-0 right-0 top-0 bg-gradient-to-b from-black/80 to-transparent p-6 transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <h2 className="text-2xl font-bold text-white">{title}</h2>
            </div>

            {/* Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6 transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                }`}
            >
                {/* Progress Bar */}
                <div
                    ref={progressBarRef}
                    className="group mb-4 h-1 cursor-pointer rounded-full bg-gray-600 hover:h-2"
                    onClick={handleProgressClick}
                >
                    <div
                        className="h-full rounded-full bg-red-600 transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            className="text-white transition-transform hover:scale-110"
                        >
                            {isPlaying ? (
                                <Pause className="h-8 w-8 fill-current" />
                            ) : (
                                <Play className="h-8 w-8 fill-current" />
                            )}
                        </button>

                        {/* Skip Back */}
                        <button
                            onClick={() => skip(-10)}
                            className="text-white transition-transform hover:scale-110"
                        >
                            <SkipBack className="h-6 w-6" />
                        </button>

                        {/* Skip Forward */}
                        <button
                            onClick={() => skip(10)}
                            className="text-white transition-transform hover:scale-110"
                        >
                            <SkipForward className="h-6 w-6" />
                        </button>

                        {/* Volume */}
                        <div className="flex items-center gap-2">
                            <button onClick={toggleMute} className="text-white">
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="h-6 w-6" />
                                ) : (
                                    <Volume2 className="h-6 w-6" />
                                )}
                            </button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="h-1 w-20 cursor-pointer rounded-lg bg-gray-600"
                            />
                        </div>

                        {/* Time */}
                        <span className="text-sm text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Subtitles */}
                        {subtitleSrc && (
                            <button
                                onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
                                className={`text-white transition-colors ${
                                    subtitlesEnabled ? 'text-red-500' : ''
                                }`}
                            >
                                <Subtitles className="h-6 w-6" />
                            </button>
                        )}

                        {/* Settings */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                className="text-white"
                            >
                                <Settings className="h-6 w-6" />
                            </button>

                            {showSettings && (
                                <div className="absolute bottom-full right-0 mb-2 rounded-lg bg-black/90 p-4">
                                    <p className="mb-2 text-sm font-semibold text-white">Velocità</p>
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                        <button
                                            key={rate}
                                            onClick={() => changePlaybackRate(rate)}
                                            className={`block w-full px-4 py-2 text-left text-sm transition-colors ${
                                                playbackRate === rate
                                                    ? 'text-red-500'
                                                    : 'text-white hover:bg-gray-800'
                                            }`}
                                        >
                                            {rate}x
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Fullscreen */}
                        <button onClick={toggleFullscreen} className="text-white">
                            {isFullscreen ? (
                                <Minimize className="h-6 w-6" />
                            ) : (
                                <Maximize className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Center Play Button */}
            {!isPlaying && !isBuffering && (
                <button
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center transition-opacity hover:opacity-80"
                >
                    <div className="rounded-full bg-black/50 p-6 backdrop-blur-sm">
                        <Play className="h-16 w-16 fill-white text-white" />
                    </div>
                </button>
            )}
        </div>
    );
};

export default VideoPlayer;