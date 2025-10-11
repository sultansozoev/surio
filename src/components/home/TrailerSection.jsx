import React, { useState, useEffect, useRef } from 'react';
import { Play, X, Volume2, VolumeX } from 'lucide-react';
import { getRandomTrailer } from '../../services/content.service';

const TrailerSection = ({ type = 'movie' }) => {
    const [trailer, setTrailer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [loading, setLoading] = useState(true);
    const videoRef = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        fetchTrailer();
    }, [type]);

    useEffect(() => {
        if (isPlaying) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isPlaying]);

    const fetchTrailer = async () => {
        try {
            setLoading(true);
            const data = await getRandomTrailer(type === 'tv');
            setTrailer(data);
        } catch (error) {
            console.error('Error fetching trailer:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlayTrailer = () => {
        setIsPlaying(true);
        if (videoRef.current) {
            videoRef.current.play();
        }
    };

    const handleCloseTrailer = () => {
        setIsPlaying(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
        }
    };

    const handleModalClick = (e) => {
        if (e.target === modalRef.current) {
            handleCloseTrailer();
        }
    };

    if (loading || !trailer) {
        return null;
    }

    const backdropUrl = trailer.background_image
        ? `https://image.tmdb.org/t/p/original${trailer.background_image}`
        : null;

    const trailerUrl = trailer.trailer_id
        ? `https://surio.ddns.net:4000/trailer?fileName=${trailer.trailer_id}${type === 'tv' ? '&tv=true' : ''}`
        : null;

    return (
        <>
            {/* Trailer Card */}
            <div className="relative mb-8 px-4 md:mb-12">
                <h2 className="mb-4 text-xl font-bold text-white md:text-2xl">
                    Trailer in evidenza
                </h2>

                <div className="group relative overflow-hidden rounded-lg bg-gray-800 transition-transform hover:scale-[1.02]">
                    <div className="relative aspect-video">
                        {backdropUrl && (
                            <img
                                src={backdropUrl}
                                alt={trailer.title}
                                className="h-full w-full object-cover"
                            />
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                            <h3 className="mb-2 text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                                {trailer.title}
                            </h3>

                            <button
                                onClick={handlePlayTrailer}
                                className="flex w-fit items-center gap-2 rounded-lg bg-white px-6 py-3 text-lg font-semibold text-black transition-all hover:bg-gray-200 hover:scale-105"
                            >
                                <Play className="h-6 w-6 fill-current" />
                                Guarda il trailer
                            </button>
                        </div>

                        {/* Play Icon Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="rounded-full bg-black/50 p-6 backdrop-blur-sm">
                                <Play className="h-16 w-16 fill-white text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fullscreen Video Modal */}
            {isPlaying && trailerUrl && (
                <div
                    ref={modalRef}
                    onClick={handleModalClick}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
                >
                    <div className="relative w-full max-w-6xl">
                        {/* Close Button */}
                        <button
                            onClick={handleCloseTrailer}
                            className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all hover:bg-white/20"
                            aria-label="Chiudi"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Video Container */}
                        <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                            <video
                                ref={videoRef}
                                className="h-full w-full"
                                controls
                                muted={isMuted}
                                autoPlay
                            >
                                <source src={trailerUrl} type="video/mp4" />
                                Il tuo browser non supporta i video HTML5.
                            </video>

                            {/* Mute Button */}
                            <button
                                onClick={toggleMute}
                                className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70"
                                aria-label={isMuted ? 'Attiva audio' : 'Disattiva audio'}
                            >
                                {isMuted ? (
                                    <VolumeX className="h-5 w-5" />
                                ) : (
                                    <Volume2 className="h-5 w-5" />
                                )}
                            </button>
                        </div>

                        {/* Title */}
                        <div className="mt-4 text-center">
                            <h3 className="text-xl font-bold text-white md:text-2xl">
                                {trailer.title}
                            </h3>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TrailerSection;