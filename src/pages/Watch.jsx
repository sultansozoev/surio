import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward, Rewind, FastForward, Zap } from 'lucide-react';

const Watch = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const containerRef = useRef(null);

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

    const API_BASE_URL = 'https://surio.ddns.net:4000';

    useEffect(() => {
        const isTV = type === 'tv';
        const url = isTV
            ? `${API_BASE_URL}/stream?title=${id}&tv=true`
            : `${API_BASE_URL}/stream?title=${id}`;
        setStreamUrl(url);
    }, [type, id]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => setCurrentTime(video.currentTime);
        const updateDuration = () => setDuration(video.duration);
        const updateBuffered = () => {
            if (video.buffered.length > 0) {
                setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
            }
        };

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('loadedmetadata', updateDuration);
        video.addEventListener('progress', updateBuffered);

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('loadedmetadata', updateDuration);
            video.removeEventListener('progress', updateBuffered);
        };
    }, []);

    useEffect(() => {
        let timeout;
        if (showControls) {
            timeout = setTimeout(() => setShowControls(false), 3000);
        }
        return () => clearTimeout(timeout);
    }, [showControls]);

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

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const time = pos * duration;
        if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
    };

    const skip = (seconds) => {
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
            showGesture(seconds > 0 ? 'forward' : 'backward', seconds);
        }
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

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
                                    {content[0]?.title || content.title}
                                </h2>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Controls */}
                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div
                            className="relative h-2 bg-white/20 rounded-full cursor-pointer group overflow-hidden backdrop-blur-sm"
                            onClick={handleSeek}
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
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-cyan-500/50 group-hover:scale-150 transition-transform"></div>
                            </div>
                        </div>
                        <div className="flex justify-between text-sm mt-2 text-gray-400">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
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