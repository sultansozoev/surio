import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, List, ChevronLeft, ChevronRight, Rewind, FastForward, Zap, X, Check, Subtitles, Users } from 'lucide-react';
import { api } from '../services/api';

const Watch = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const progressBarRef = useRef(null);
    const isInitializedRef = useRef(false); // Previene inizializzazioni multiple
    const lastSaveTimeRef = useRef(0); // Previene salvataggi multipli

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
    const [lastClickTime, setLastClickTime] = useState(0);
    const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
    const [hasSubtitles, setHasSubtitles] = useState(false);

    // Stati per Surio Party
    const [isCreatingParty, setIsCreatingParty] = useState(false);
    const [showPartyOptions, setShowPartyOptions] = useState(false);
    const [allowGuestsControl, setAllowGuestsControl] = useState(false);

    // Stati per le Serie TV
    const [seasons, setSeasons] = useState([]);
    const [episodes, setEpisodes] = useState([]);
    const [currentSeason, setCurrentSeason] = useState(null);
    const [currentEpisode, setCurrentEpisode] = useState(null);
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
    const [showEpisodesModal, setShowEpisodesModal] = useState(false);
    const [selectedSeasonForModal, setSelectedSeasonForModal] = useState(null);
    const [seasonEpisodes, setSeasonEpisodes] = useState([]);

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
            console.error('Error loading episodes:', error);
            return [];
        }
    };

    const changeEpisode = async (episode) => {
        if (!episode) return;

        try {
            console.log('🔄 Cambio episodio:', episode);
            setCurrentEpisode(episode);

            const episodeIndex = episodes.findIndex(ep => ep.episode_id === episode.episode_id);
            setCurrentEpisodeIndex(episodeIndex);

            const season = seasons.find(s => s.season_id === episode.season_id);
            setCurrentSeason(season);

            const videoUrl = `${API_BASE_URL}/stream?title=${episode.episode_id}&tv=true`;
            console.log('🎥 Nuovo stream URL:', videoUrl);
            setStreamUrl(videoUrl);
            setIsPlaying(true);

            // Carica sottotitoli per il nuovo episodio
            setTimeout(() => {
                loadSubtitles(episode.episode_id, true);
            }, 1000);

            setShowEpisodesModal(false);
        } catch (error) {
            console.error('❌ Error changing episode:', error);
        }
    };

    const nextEpisode = useCallback(() => {
        if (currentEpisodeIndex < episodes.length - 1) {
            const nextEp = episodes[currentEpisodeIndex + 1];
            changeEpisode(nextEp);
        }
    }, [currentEpisodeIndex, episodes]);

    const previousEpisode = () => {
        if (currentEpisodeIndex > 0) {
            const prevEp = episodes[currentEpisodeIndex - 1];
            changeEpisode(prevEp);
        }
    };

    // Carica gli episodi della stagione selezionata per la modale
    const loadSeasonEpisodes = async (season) => {
        setSelectedSeasonForModal(season);
        const eps = await fetchEpisodes(season.season_id);
        setSeasonEpisodes(eps);
    };

    // Naviga alla stagione precedente
    const goToPreviousSeason = async () => {
        if (!selectedSeasonForModal || !seasons.length) return;

        const currentIndex = seasons.findIndex(s => s.season_id === selectedSeasonForModal.season_id);
        if (currentIndex > 0) {
            await loadSeasonEpisodes(seasons[currentIndex - 1]);
        }
    };

    // Naviga alla stagione successiva
    const goToNextSeason = async () => {
        if (!selectedSeasonForModal || !seasons.length) return;

        const currentIndex = seasons.findIndex(s => s.season_id === selectedSeasonForModal.season_id);
        if (currentIndex < seasons.length - 1) {
            await loadSeasonEpisodes(seasons[currentIndex + 1]);
        }
    };

    // ========== CONTROLLI VIDEO ==========
    const togglePlay = useCallback(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    }, [isPlaying]);

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
        if (videoRef.current) {
            videoRef.current.currentTime += seconds;
            showGesture(seconds > 0 ? 'forward' : 'backward');
        }
    }, []);

    const changePlaybackRate = (rate) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackRate(rate);
            setShowSettings(false);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    // ========== SURIO PARTY ==========
    const handleCreateParty = async () => {
        if (isCreatingParty) return;

        setIsCreatingParty(true);
        try {
            const partyData = {
                allow_guests_control: allowGuestsControl,
                max_participants: 10, // Default
            };

            if (isTVShow) {
                // Per le serie TV
                partyData.serie_tv_id = id;
                if (currentEpisode) {
                    partyData.episode_id = currentEpisode.episode_id;
                }
            } else {
                // Per i film
                partyData.movie_id = id;
            }

            console.log('🎉 Creating party with data:', partyData);
            const response = await api.post('/party/create', partyData);

            if (response.party_code) {
                console.log('✅ Party created:', response.party_code);
                // Naviga alla party appena creata
                navigate(`/party/${response.party_code}`);
            }
        } catch (error) {
            console.error('❌ Error creating party:', error);
            alert('Errore nella creazione della party. Riprova.');
        } finally {
            setIsCreatingParty(false);
            setShowPartyOptions(false);
        }
    };

    const showGesture = (type) => {
        setGesture(type);
        setTimeout(() => setGesture(null), 500);
    };

    const handleProgressClick = (e) => {
        if (!progressBarRef.current || !videoRef.current) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * duration;
    };

    const handleProgressHover = (e) => {
        if (!progressBarRef.current) return;

        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        setHoverTime(pos * duration);
    };

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

                    // Rimuovi solo le tracce esistenti, non tutti i child
                    const existingTracks = Array.from(video.querySelectorAll('track'));
                    existingTracks.forEach(track => video.removeChild(track));

                    // Crea e aggiungi nuova traccia
                    const track = document.createElement('track');
                    track.kind = 'subtitles';
                    track.label = 'Italiano';
                    track.srclang = 'it';
                    track.src = subtitleUrl;
                    track.default = true;

                    // Gestisci eventi di caricamento
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

    // ========== EFFECTS ==========
    useEffect(() => {
        let isMounted = true; // Flag per prevenire aggiornamenti dopo unmount
        const abortController = new AbortController(); // Per cancellare le richieste

        // Ritarda l'esecuzione per evitare richieste cancellate da React StrictMode
        const timeoutId = setTimeout(() => {
            // Previeni esecuzioni multiple (React StrictMode in dev)
            if (isInitializedRef.current) {
                console.log('⚠️ Inizializzazione già in corso, skip');
                return;
            }
            isInitializedRef.current = true;

            const initializeContent = async () => {
                try {
                    console.log('🎬 Inizializzazione player - type:', type, 'id:', id);
                    const token = getCookie('jwt');
                    console.log('🔑 Token JWT:', token ? 'presente' : 'mancante');

                    if (isTVShow) {
                        console.log('📺 Caricamento serie TV...');
                        const response = await fetch(`${API_BASE_URL}/serie_tv?id=${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                            signal: abortController.signal
                        });
                        const data = await response.json();
                        console.log('📺 Dati serie TV ricevuti:', data);
                        // L'API restituisce { "results": [...] } quindi estraiamo il primo elemento
                        if (!isMounted) return;
                        setContent(data.results?.[0] || data);

                        const allEps = await loadAllEpisodes();
                        console.log('📺 Episodi caricati:', allEps.length);
                        const savedProgress = await getPlayerTimeSerie();
                        console.log('💾 Progresso salvato:', savedProgress);

                        let episodeToPlay = null;

                        if (savedProgress && savedProgress.episode_id) {
                            episodeToPlay = allEps.find(ep => ep.episode_id === savedProgress.episode_id);
                        }

                        if (!episodeToPlay && allEps.length > 0) {
                            episodeToPlay = allEps[0];
                        }

                        if (episodeToPlay) {
                            const streamUrl = `${API_BASE_URL}/stream?title=${episodeToPlay.episode_id}&tv=true`;
                            console.log('🎥 Stream URL serie TV (formato originale):', streamUrl);
                            if (!isMounted) return;
                            setStreamUrl(streamUrl);

                            // Carica sottotitoli per la serie TV
                            setTimeout(() => {
                                if (isMounted) loadSubtitles(episodeToPlay.episode_id, true);
                            }, 1000);
                            setCurrentEpisode(episodeToPlay);

                            // IMPORTANTE: usa episodeToPlay.season_id direttamente invece di cercare in seasons
                            // perché seasons potrebbe non essere ancora popolato nello stato
                            const seasonData = await fetchSeasons();
                            const season = seasonData.find(s => s.season_id === episodeToPlay.season_id);
                            console.log('🎯 Stagione corrente impostata:', season);
                            if (!isMounted) return;
                            setCurrentSeason(season);

                            const episodeIndex = allEps.findIndex(ep => ep.episode_id === episodeToPlay.episode_id);
                            setCurrentEpisodeIndex(episodeIndex);

                            if (savedProgress && savedProgress.episode_id === episodeToPlay.episode_id) {
                                setTimeout(() => {
                                    if (isMounted && videoRef.current && savedProgress.player_time < videoRef.current.duration - 30) {
                                        videoRef.current.currentTime = savedProgress.player_time;
                                    }
                                    if (isMounted) setIsLoadingPosition(false);
                                }, 500);
                            } else {
                                if (isMounted) setIsLoadingPosition(false);
                            }
                        }
                    } else {
                        console.log('🎬 Caricamento film...');
                        const response = await fetch(`${API_BASE_URL}/film?id=${id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                            signal: abortController.signal
                        });
                        const data = await response.json();
                        console.log('🎬 Dati film ricevuti:', data);
                        // L'API restituisce { "film": [...] } quindi estraiamo il primo elemento
                        if (!isMounted) return;
                        setContent(data.film?.[0] || data);

                        // Provo il formato con title query param (formato originale)
                        const streamUrl = `${API_BASE_URL}/stream?title=${id}`;
                        console.log('🎥 Stream URL film (senza token):', streamUrl);
                        setStreamUrl(streamUrl);

                        // Carica sottotitoli per il film
                        setTimeout(() => {
                            if (isMounted) loadSubtitles(id, false);
                        }, 1000);

                        const savedTime = await getPlayerTime(id);
                        console.log('💾 Tempo salvato:', savedTime);
                        setTimeout(() => {
                            if (isMounted && videoRef.current && savedTime > 0) {
                                videoRef.current.currentTime = savedTime;
                            }
                            if (isMounted) setIsLoadingPosition(false);
                        }, 500);
                    }
                } catch (error) {
                    // Ignora errori di abort (sono normali durante il cleanup)
                    if (error.name === 'AbortError') {
                        console.log('🛑 Richiesta cancellata (cleanup)');
                        return;
                    }
                    console.error('❌ Error initializing content:', error);
                    if (isMounted) setIsLoadingPosition(false);
                }
            };

            initializeContent();
        }, 10); // Ritardo minimo per evitare richieste cancellate da StrictMode

        // Cleanup function per prevenire aggiornamenti dopo unmount e cancellare richieste in corso
        return () => {
            clearTimeout(timeoutId); // Cancella il timeout se il componente viene smontato prima
            isMounted = false;
            abortController.abort(); // Cancella tutte le fetch in corso
            isInitializedRef.current = false; // Reset per il prossimo mount
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, type]);

    // Gestisce il play quando cambia streamUrl
    useEffect(() => {
        const video = videoRef.current;
        console.log('🔄 useEffect streamUrl triggered - streamUrl:', streamUrl, 'video:', video ? 'presente' : 'null', 'isPlaying:', isPlaying);
        if (!video || !streamUrl) return;

        // Listener per errori
        const handleError = (e) => {
            console.error('❌ VIDEO ERROR:', e);
            console.error('❌ Video error code:', video.error?.code);
            console.error('❌ Video error message:', video.error?.message);
            console.error('❌ Video networkState:', video.networkState);
            console.error('❌ Video readyState:', video.readyState);
            console.error('❌ Stream URL che ha causato errore:', streamUrl);
        };

        const handleLoadStart = () => {
            console.log('🔄 Video load start - URL:', streamUrl);
        };

        const handleLoadedMetadata = () => {
            console.log('📊 Video metadata caricati - duration:', video.duration);
            if (isPlaying) {
                console.log('▶️ Avvio riproduzione...');
                video.play().catch(err => {
                    console.error('❌ Error playing video:', err);
                    setTimeout(() => {
                        video.play().catch(e => console.error('❌ Secondo tentativo fallito:', e));
                    }, 100);
                });
            }
        };

        const handleCanPlay = () => {
            console.log('✅ Video can play');
        };

        video.addEventListener('error', handleError);
        video.addEventListener('loadstart', handleLoadStart);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('canplay', handleCanPlay);

        return () => {
            video.removeEventListener('error', handleError);
            video.removeEventListener('loadstart', handleLoadStart);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('canplay', handleCanPlay);
        };
    }, [streamUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            const currentTimestamp = video.currentTime;
            setCurrentTime(currentTimestamp);

            // Salva la posizione solo ogni 5 secondi e previeni chiamate multiple
            const currentSecond = Math.floor(currentTimestamp);
            if (currentSecond % 5 === 0 && currentSecond !== lastSaveTimeRef.current) {
                lastSaveTimeRef.current = currentSecond;
                if (isTVShow && currentEpisode && currentSeason) {
                    setPlayerTimeSerie(currentEpisode.episode_id, currentSeason.season_id, currentTimestamp);
                } else if (!isTVShow) {
                    setPlayerTime(id, currentTimestamp);
                }
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleProgress = () => {
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                setBuffered((bufferedEnd / video.duration) * 100);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            if (isTVShow && currentEpisodeIndex < episodes.length - 1) {
                setTimeout(() => {
                    nextEpisode();
                }, 2000);
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('progress', handleProgress);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('progress', handleProgress);
            video.removeEventListener('ended', handleEnded);
        };
    }, [id, isTVShow, currentEpisode, currentSeason, currentEpisodeIndex, episodes.length, nextEpisode]);

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
            style.id = 'subtitle-position-style';

            // Rimuovi lo style precedente se esiste
            const oldStyle = document.getElementById('subtitle-position-style');
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
            const style = document.getElementById('subtitle-position-style');
            if (style) style.remove();
        };
    }, [showControls]);

    useEffect(() => {
        const handleKeyPress = (e) => {
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
    }, [isPlaying, volume, togglePlay, skip, toggleMute, toggleFullscreen]);

    // Apri la modale con la stagione corrente
    const openEpisodesModal = async () => {
        if (seasons.length > 0) {
            // Usa la stagione corrente se disponibile, altrimenti la prima
            let seasonToShow = seasons[0];

            if (currentSeason) {
                // Trova la stagione corrente nell'array seasons
                const foundSeason = seasons.find(s => s.season_id === currentSeason.season_id);
                if (foundSeason) {
                    seasonToShow = foundSeason;
                }
            }

            console.log('🎬 Apertura modale sulla stagione:', seasonToShow);
            await loadSeasonEpisodes(seasonToShow);
            setShowEpisodesModal(true);
        }
    };

    return (
        <div ref={containerRef} className="relative h-screen bg-black overflow-hidden">
            {/* Video */}
            <video
                ref={videoRef}
                src={streamUrl}
                className="w-full h-full object-contain"
                crossOrigin="use-credentials"
                onClick={handleVideoClick}
            />

            {/* Overlay Loading Position */}
            {isLoadingPosition && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-white text-lg">Caricamento...</p>
                    </div>
                </div>
            )}

            {/* Ripple Effect */}
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
                    <div className="w-20 h-20 border-2 border-white rounded-full animate-ping opacity-75"></div>
                </div>
            ))}

            {/* Gesture Indicator */}
            {gesture && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-8 animate-fade-in border border-white/20">
                        {gesture === 'forward' ? (
                            <FastForward className="h-16 w-16 text-white" />
                        ) : (
                            <Rewind className="h-16 w-16 text-white" />
                        )}
                    </div>
                </div>
            )}

            {/* Episodes Modal */}
            {showEpisodesModal && selectedSeasonForModal && (
                <div className="absolute inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/30">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-1">{content?.title}</h2>
                                <p className="text-gray-400">Seleziona un episodio</p>
                            </div>
                            <button
                                onClick={() => setShowEpisodesModal(false)}
                                className="p-3 hover:bg-white/10 rounded-full transition-all"
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>

                        {/* Season Selector with Navigation */}
                        <div className="flex items-center justify-center gap-4 p-6 bg-black/20">
                            <button
                                onClick={goToPreviousSeason}
                                disabled={seasons.findIndex(s => s.season_id === selectedSeasonForModal.season_id) === 0}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 group"
                            >
                                <ChevronLeft className="h-6 w-6 text-white group-disabled:text-gray-600" />
                            </button>

                            <div className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600/30 to-red-500/30 rounded-2xl border border-white/20 backdrop-blur-sm">
                                {selectedSeasonForModal.background_image ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${selectedSeasonForModal.background_image}`}
                                        alt={selectedSeasonForModal.season_name}
                                        className="w-12 h-16 rounded-xl object-cover shadow-lg"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-700 to-red-500 flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-lg">{selectedSeasonForModal.season_number}</span>
                                    </div>
                                )}
                                <div>
                                    <p className="text-white font-semibold text-lg">{selectedSeasonForModal.season_name}</p>
                                    <p className="text-gray-400 text-sm">{seasonEpisodes.length} episodi</p>
                                </div>
                            </div>

                            <button
                                onClick={goToNextSeason}
                                disabled={seasons.findIndex(s => s.season_id === selectedSeasonForModal.season_id) === seasons.length - 1}
                                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5 group"
                            >
                                <ChevronRight className="h-6 w-6 text-white group-disabled:text-gray-600" />
                            </button>
                        </div>

                        {/* Episodes Grid */}
                        <div className="overflow-y-auto max-h-[calc(90vh-220px)] p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {seasonEpisodes.map((episode, index) => {
                                    const isCurrentEpisode = currentEpisode?.episode_id === episode.episode_id;
                                    const isWatched = false; // Puoi implementare la logica per episodi guardati

                                    return (
                                        <div
                                            key={episode.episode_id}
                                            onClick={() => changeEpisode(episode)}
                                            className={`group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border ${
                                                isCurrentEpisode
                                                    ? 'border-red-600 shadow-lg shadow-red-600/70'
                                                    : 'border-white/10 hover:border-white/30'
                                            }`}
                                        >
                                            {/* Thumbnail placeholder */}
                                            <div className="relative aspect-video bg-gradient-to-br from-red-900/40 to-red-800/40 flex items-center justify-center overflow-hidden">
                                                {episode.background_image ? (
                                                    <>
                                                        <img
                                                            src={`https://image.tmdb.org/t/p/original${episode.background_image}`}
                                                            alt={episode.title}
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                                                        <Play className="relative h-12 w-12 text-white/80 group-hover:text-white group-hover:scale-110 transition-all z-10" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all"></div>
                                                        <Play className="h-12 w-12 text-white/60 group-hover:text-white group-hover:scale-110 transition-all" />
                                                    </>
                                                )}

                                                {/* Episode Number Badge */}
                                                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg">
                                                    <span className="text-white font-semibold text-sm">EP {episode.episode_number}</span>
                                                </div>

                                                {/* Current Episode Badge */}
                                                {isCurrentEpisode && (
                                                    <div className="absolute top-3 right-3 bg-gradient-to-r from-red-700 to-red-500 px-3 py-1 rounded-lg flex items-center gap-1">
                                                        <Play className="h-3 w-3 text-white fill-white" />
                                                        <span className="text-white font-semibold text-xs">In riproduzione</span>
                                                    </div>
                                                )}

                                                {/* Watched Badge */}
                                                {isWatched && !isCurrentEpisode && (
                                                    <div className="absolute top-3 right-3 bg-green-500 p-1.5 rounded-lg">
                                                        <Check className="h-3 w-3 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Episode Info */}
                                            <div className="p-4">
                                                <h3 className="text-white font-semibold text-base mb-1 line-clamp-1 group-hover:text-red-500 transition-colors">
                                                    {episode.title}
                                                </h3>
                                                {episode.description && (
                                                    <p className="text-gray-400 text-sm line-clamp-2">
                                                        {episode.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Progress Bar (se disponibile) */}
                                            {isWatched && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                                                    <div className="h-full bg-gradient-to-r from-red-700 to-red-500" style={{ width: '100%' }}></div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls Overlay */}
            <div
                className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-300 ${
                    showControls ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ pointerEvents: showControls ? 'auto' : 'none' }}
            >
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-xl transition-all border border-white/10"
                        >
                            <ArrowLeft className="h-5 w-5" />
                            <span>Indietro</span>
                        </button>

                        {isTVShow && currentEpisode && (
                            <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/10">
                                {content?.title && (
                                    <p className="text-gray-400 text-xs mb-1 uppercase tracking-wide">
                                        {content.title}
                                    </p>
                                )}
                                <p className="text-white font-semibold">
                                    {currentSeason?.season_name} - {currentEpisode.title}
                                </p>
                                <p className="text-gray-400 text-sm">
                                    Episodio {currentEpisode.episode_number}
                                </p>
                            </div>
                        )}

                        {!isTVShow && content && (
                            <div className="bg-black/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/10">
                                <p className="text-white font-semibold">{content.title}</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Controls */}
                    <div className="space-y-4">
                        {/* Progress Bar */}
                        <div
                            ref={progressBarRef}
                            className="relative h-2 bg-white/10 rounded-full cursor-pointer group"
                            onClick={handleProgressClick}
                            onMouseMove={handleProgressHover}
                            onMouseLeave={() => setHoverTime(null)}
                        >
                            {/* Buffered */}
                            <div
                                className="absolute h-full bg-white/20 rounded-full transition-all"
                                style={{ width: `${buffered}%` }}
                            />
                            {/* Progress */}
                            <div
                                className="absolute h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                            {/* Hover Time Tooltip */}
                            {hoverTime !== null && (
                                <div
                                    className="absolute -top-10 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm px-3 py-1 rounded-lg text-sm border border-white/20"
                                    style={{ left: `${(hoverTime / duration) * 100}%` }}
                                >
                                    {formatTime(hoverTime)}
                                </div>
                            )}
                            {/* Thumb */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                                style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
                            />
                        </div>

                        {/* Time Display */}
                        <div className="flex items-center justify-between text-sm">
                            <button
                                onClick={() => setShowTimeRemaining(!showTimeRemaining)}
                                className="text-white hover:text-red-500 transition-colors"
                            >
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </button>
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
                                    className="p-4 bg-gradient-to-r from-red-700 to-red-500 hover:from-red-600 hover:to-red-400 rounded-full transition-all hover:scale-110 shadow-lg shadow-red-600/70"
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
                                            background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Sottotitoli - Appare solo se disponibili */}
                                {hasSubtitles && (
                                    <button
                                        onClick={toggleSubtitles}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all backdrop-blur-sm border shadow-lg ${
                                            subtitlesEnabled
                                                ? 'bg-red-600/40 border-red-600 text-red-300 shadow-red-600/50'
                                                : 'hover:bg-white/10 border-white/10 text-gray-400'
                                        }`}
                                        title={subtitlesEnabled ? 'Disattiva sottotitoli' : 'Attiva sottotitoli'}
                                    >
                                        <Subtitles className="h-5 w-5" />
                                        <span className="text-sm font-semibold">
                                            {subtitlesEnabled ? 'Sottotitoli ON' : 'Sottotitoli OFF'}
                                        </span>
                                    </button>
                                )}

                                {/* Crea Surio Party */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowPartyOptions(!showPartyOptions)}
                                        disabled={isCreatingParty}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg transition-all backdrop-blur-sm border border-white/20 shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Crea Surio Party"
                                    >
                                        <Users className="h-5 w-5" />
                                        <span className="text-sm font-semibold">
                                            {isCreatingParty ? 'Creazione...' : 'Crea Party'}
                                        </span>
                                    </button>

                                    {/* Menu opzioni party */}
                                    {showPartyOptions && (
                                        <div className="absolute bottom-full mb-2 right-0 bg-black/95 backdrop-blur-xl rounded-xl border border-orange-900/50 overflow-hidden shadow-2xl w-72 z-50">
                                            <div className="p-4 space-y-4">
                                                <div className="text-white font-semibold border-b border-white/10 pb-2">
                                                    Opzioni Party
                                                </div>

                                                {/* Opzione: Permetti controllo ospiti */}
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={allowGuestsControl}
                                                        onChange={(e) => setAllowGuestsControl(e.target.checked)}
                                                        className="w-5 h-5 rounded border-2 border-white/30 bg-black/50 checked:bg-red-600 checked:border-red-600 transition-all cursor-pointer"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-white text-sm font-medium group-hover:text-red-400 transition-colors">
                                                            Permetti controllo ospiti
                                                        </div>
                                                        <div className="text-gray-400 text-xs">
                                                            Gli ospiti potranno controllare il player
                                                        </div>
                                                    </div>
                                                </label>

                                                {/* Pulsanti */}
                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => setShowPartyOptions(false)}
                                                        className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white text-sm"
                                                    >
                                                        Annulla
                                                    </button>
                                                    <button
                                                        onClick={handleCreateParty}
                                                        disabled={isCreatingParty}
                                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg transition-all text-white text-sm font-semibold disabled:opacity-50"
                                                    >
                                                        Crea
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Lista Episodi (solo per serie TV) */}
                                {isTVShow && (
                                    <button
                                        onClick={openEpisodesModal}
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
                                                        playbackRate === rate ? 'bg-gradient-to-r from-red-600/30 to-red-500/30 text-red-500' : ''
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
                    box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
                }
                input[type="range"]::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
                }
                
                /* Stili sottotitoli personalizzati */
                video::cue {
                    background-color: rgba(220, 38, 38, 0.95);
                    color: white;
                    font-size: 1.5rem;
                    font-weight: 600;
                    text-shadow: 2px 2px 4px rgba(0, 0, 0, 1), 
                                 0 0 8px rgba(0, 0, 0, 0.8);
                    padding: 0.3em 0.8em;
                    border-radius: 0.25em;
                    line-height: 1.3;
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

export default Watch;