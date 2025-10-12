import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';
import { getRandomTrailer } from '../../services/content.service';

const Hero = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [showVideo, setShowVideo] = useState(false);

    useEffect(() => {
        fetchRandomContent();
    }, []);

    useEffect(() => {
        // Mostra il video dopo un breve delay per permettere il caricamento
        const timer = setTimeout(() => {
            setShowVideo(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, [content]);

    const fetchRandomContent = async () => {
        try {
            setLoading(true);
            const response = await getRandomTrailer(false);

            // Controlli di validazione più dettagliati
            if (!response) {
                throw new Error('Risposta vuota dal server');
            }

            // Verifica la struttura completa della risposta
            // trailer_id può essere sia string che number
            const isValidTrailer = response &&
                response.trailer_id != null &&
                response.title &&
                (response.movie_id || response.serie_tv_id);

            if (!isValidTrailer) {
                console.error('Trailer non valido:', response);
                throw new Error('Struttura del trailer non valida');
            }

            console.log('✅ Trailer impostato correttamente:', response);
            setContent(response);
        } catch (error) {
            console.error('Error fetching random trailer:', error.message);
            // Imposta un contenuto di fallback o null
            setContent(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePlayClick = () => {
        if (!content) return;

        const contentType = content.movie_id ? 'movie' : 'tv';
        const contentId = content.movie_id || content.serie_tv_id;

        navigate(`/watch/${contentType}/${contentId}`);
    };

    const handleInfoClick = () => {
        if (!content) return;

        const contentType = content.movie_id ? 'movie' : 'tv';
        const contentId = content.movie_id || content.serie_tv_id;

        navigate(`/${contentType}/${contentId}`);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    if (loading || !content) {
        return (
            <div className="relative h-screen w-full bg-gray-900">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent" />
                </div>
            </div>
        );
    }

    const trailerUrl = content.trailer_id
        ? `https://surio.ddns.net:4000/trailer?fileName=${content.trailer_id}${content.serie_tv_id ? '&tv=true' : ''}`
        : null;

    const backdropUrl = content.background_image
        ? `https://image.tmdb.org/t/p/original${content.background_image}`
        : null;

    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Video Background */}
            {trailerUrl && showVideo ? (
                <div className="absolute inset-0">
                    <video
                        autoPlay
                        loop
                        muted={isMuted}
                        playsInline
                        className="h-full w-full object-cover"
                        poster={backdropUrl}
                    >
                        <source src={trailerUrl} type="video/mp4" />
                    </video>
                </div>
            ) : backdropUrl ? (
                <div className="absolute inset-0">
                    <img
                        src={backdropUrl}
                        alt={content.title}
                        className="h-full w-full object-cover"
                    />
                </div>
            ) : null}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4 pb-20">
                    <div className="max-w-2xl space-y-6">
                        {/* Title */}
                        <h1 className="animate-fade-in text-5xl font-bold text-white md:text-6xl lg:text-7xl">
                            {content.title}
                        </h1>

                        {/* Description (if available) */}
                        {content.overview && (
                            <p className="animate-fade-in-delay line-clamp-3 text-lg leading-relaxed text-gray-200 md:text-xl">
                                {content.overview}
                            </p>
                        )}

                        {/* Buttons */}
                        <div className="animate-fade-in-delay-2 flex flex-wrap gap-4">
                            <button
                                onClick={handlePlayClick}
                                className="flex items-center gap-3 rounded-lg bg-white px-8 py-3 text-lg font-semibold text-black transition-all hover:bg-gray-200 hover:scale-105"
                            >
                                <Play className="h-6 w-6 fill-current" />
                                Riproduci
                            </button>

                            <button
                                onClick={handleInfoClick}
                                className="flex items-center gap-3 rounded-lg bg-gray-700/80 px-8 py-3 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:bg-gray-600/80 hover:scale-105"
                            >
                                <Info className="h-6 w-6" />
                                Altre info
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mute Button */}
            {trailerUrl && showVideo && (
                <button
                    onClick={toggleMute}
                    className="absolute bottom-24 right-8 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-transparent text-white backdrop-blur-sm transition-all hover:bg-white/20"
                    aria-label={isMuted ? 'Attiva audio' : 'Disattiva audio'}
                >
                    {isMuted ? (
                        <VolumeX className="h-6 w-6" />
                    ) : (
                        <Volume2 className="h-6 w-6" />
                    )}
                </button>
            )}

            {/* Fade to content indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
        </div>
    );
};

export default Hero;