import React, {useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';
import { getRandomTrailer } from '../../services/content.service';

const Hero = () => {
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [showVideo, setShowVideo] = useState(false);
    const didFetchRef = useRef(false);
    const videoRef = useRef(null);

    useEffect(() => {
        if (didFetchRef.current) return;
        didFetchRef.current = true;
        fetchRandomContent();
    }, []);

    useEffect(() => {
        if (!content) return;

        const timer = setTimeout(() => {
            setShowVideo(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, [content]);

    useEffect(() => {
        if (showVideo && videoRef.current) {
            const playVideo = async () => {
                try {
                    await videoRef.current.play();
                } catch (error) {
                    console.error('Error playing video:', error);
                }
            };
            playVideo();
        }
    }, [showVideo]);

    const fetchRandomContent = async () => {
        try {
            setLoading(true);
            const response = await getRandomTrailer(false);

            if (!response) {
                throw new Error('Risposta vuota dal server');
            }

            const isValidTrailer = response &&
                response.trailer_id != null &&
                response.title &&
                (response.movie_id || response.serie_tv_id);

            if (!isValidTrailer) {
                console.error('Trailer non valido:', response);
                throw new Error('Struttura del trailer non valida');
            }

            setContent(response);
        } catch (error) {
            console.error('Error fetching random trailer:', error.message);
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
            <div className="relative h-screen w-full bg-gradient-to-br from-gray-950 via-gray-900 to-black">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-white border-t-transparent" />
                </div>
            </div>
        );
    }

    const trailerUrl = content.trailer_id
        ? `https://surio.ddns.net:4000/trailer?fileName=${content.movie_id}`
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
                        ref={videoRef}
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

            {/* Gradient Overlays - Migliorati per maggiore profondità */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-gray-900/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-gray-900/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/30" />
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-gray-900/80 to-transparent" />

            {/* Effetto vignette sui lati */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4 pb-20">
                    <div className="max-w-2xl space-y-6">
                        <h1 className="animate-fade-in text-5xl font-bold text-white md:text-6xl lg:text-7xl drop-shadow-2xl">
                            {content.title}
                        </h1>

                        {content.overview && (
                            <p className="animate-fade-in-delay line-clamp-3 text-lg leading-relaxed text-gray-100 md:text-xl drop-shadow-lg">
                                {content.overview}
                            </p>
                        )}

                        <div className="animate-fade-in-delay-2 flex flex-wrap gap-4">
                            <button
                                onClick={handlePlayClick}
                                className="flex items-center gap-3 rounded-lg bg-white px-8 py-3 text-lg font-semibold text-black transition-all hover:bg-gray-200 hover:scale-105 shadow-xl"
                            >
                                <Play className="h-6 w-6 fill-current" />
                                Riproduci
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mute Button */}
            {trailerUrl && showVideo && (
                <button
                    onClick={toggleMute}
                    className="absolute bottom-24 right-8 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-black/40 text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-110 shadow-lg"
                    aria-label={isMuted ? 'Attiva audio' : 'Disattiva audio'}
                >
                    {isMuted ? (
                        <VolumeX className="h-6 w-6" />
                    ) : (
                        <Volume2 className="h-6 w-6" />
                    )}
                </button>
            )}
        </div>
    );
};

export default Hero;