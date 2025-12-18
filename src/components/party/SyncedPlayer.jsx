import React, { useEffect, useRef, useState } from 'react';
import partyService from '../../services/party.service';
import CustomVideoPlayer from '../common/CustomVideoPlayer';

const SyncedPlayer = ({ party, isHost, canControl, onTimeUpdate }) => {
    const [isReady, setIsReady] = useState(false);
    const isRemoteAction = useRef(false);

    // Costruisci URL del video
    const getVideoUrl = () => {
        const baseUrl = process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000';
        
        if (party.movie_id) {
            return `${baseUrl}/stream?title=${party.movie_id}`;
        } else if (party.serie_tv_id && party.episode_id) {
            return `${baseUrl}/stream?title=${party.episode_id}&tv=true`;
        }
        return null;
    };

    const getSubtitleUrl = () => {
        const baseUrl = process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000';
        
        if (party.movie_id) {
            return `${baseUrl}/subtitle?film=${party.movie_id}`;
        } else if (party.episode_id) {
            return `${baseUrl}/subtitleSerieTV?film=${party.episode_id}`;
        }
        return null;
    };

    // Handlers per eventi locali (quando l'utente controlla)
    const handlePlay = (currentTime) => {
        if (isRemoteAction.current) {
            isRemoteAction.current = false;
            return;
        }

        if (!canControl) return;
        
        partyService.play(party.party_id, currentTime);
    };

    const handlePause = (currentTime) => {
        if (isRemoteAction.current) {
            isRemoteAction.current = false;
            return;
        }

        if (!canControl) return;
        
        partyService.pause(party.party_id, currentTime);
    };

    const handleSeeked = (currentTime) => {
        if (isRemoteAction.current) {
            isRemoteAction.current = false;
            return;
        }

        if (!canControl) return;
        
        partyService.seek(party.party_id, currentTime);
    };

    const handleRateChange = (speed, currentTime) => {
        if (isRemoteAction.current) {
            isRemoteAction.current = false;
            return;
        }

        if (!canControl) return;
        
        partyService.changeSpeed(party.party_id, speed, currentTime);
    };

    const handleTimeUpdate = (currentTime) => {
        if (onTimeUpdate) {
            onTimeUpdate(currentTime);
        }
    };

    // Ascolta eventi di sincronizzazione remoti
    useEffect(() => {
        const unsubscribers = [];

        // Play remoto
        unsubscribers.push(
            partyService.on('player-play', (data) => {
                isRemoteAction.current = true;
                if (window.partyPlayer) {
                    window.partyPlayer.seek(data.currentTime);
                    window.partyPlayer.play();
                }
                console.log('▶️ Remote play at', data.currentTime);
            })
        );

        // Pause remoto
        unsubscribers.push(
            partyService.on('player-pause', (data) => {
                isRemoteAction.current = true;
                if (window.partyPlayer) {
                    window.partyPlayer.seek(data.currentTime);
                    window.partyPlayer.pause();
                }
                console.log('⏸️ Remote pause at', data.currentTime);
            })
        );

        // Seek remoto
        unsubscribers.push(
            partyService.on('player-seek', (data) => {
                isRemoteAction.current = true;
                if (window.partyPlayer) {
                    window.partyPlayer.seek(data.currentTime);
                }
                console.log('⏩ Remote seek to', data.currentTime);
            })
        );

        // Speed change remoto
        unsubscribers.push(
            partyService.on('player-speed-changed', (data) => {
                isRemoteAction.current = true;
                if (window.partyPlayer) {
                    window.partyPlayer.setSpeed(data.speed);
                }
                console.log('🏃 Remote speed change to', data.speed);
            })
        );

        setIsReady(true);

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, []);

    const videoUrl = getVideoUrl();
    const subtitleUrl = getSubtitleUrl();

    if (!videoUrl) {
        return (
            <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
                <p className="text-white">Errore nel caricamento del video</p>
            </div>
        );
    }

    return (
        <div className="w-full aspect-video">
            <CustomVideoPlayer
                videoUrl={videoUrl}
                subtitleUrl={subtitleUrl}
                onTimeUpdate={handleTimeUpdate}
                onPlay={handlePlay}
                onPause={handlePause}
                onSeeked={handleSeeked}
                onRateChange={handleRateChange}
                canControl={canControl}
                initialTime={party.player_time || 0}
                initialSpeed={party.playback_speed || 1}
                autoPlay={party.status === 'playing'}
                partyMode={true}
            />
        </div>
    );
};

export default SyncedPlayer;
