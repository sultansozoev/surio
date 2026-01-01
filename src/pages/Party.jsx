import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Copy, Check, LogOut, Users, X } from 'lucide-react';
import { useParty } from '../hooks/useParty';
import PartyLobby from '../components/party/PartyLobby';
import PartyFloatingChat from '../components/party/PartyFloatingChat';
import PartyParticipantsPills from '../components/party/PartyParticipantsPills';
import SyncedPlayerAdvanced from '../components/party/SyncedPlayerAdvanced';
import PartyJoinRequests from '../components/party/PartyJoinRequests';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';

const Party = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {
        party,
        participants,
        messages,
        isHost,
        isConnected,
        error,
        joinParty,
        leaveParty,
        endParty,
        sendMessage,
        sendReaction,
        loadMessages,
        partyService
    } = useParty();

    const [copied, setCopied] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [bufferingUsers, setBufferingUsers] = useState([]);
    const [showHeader, setShowHeader] = useState(true);
    const [headerTimer, setHeaderTimer] = useState(null);

    // Auto-join se c'è un codice nell'URL
    useEffect(() => {
        if (code && !party) {
            // Attiva la connessione e fai join
            joinParty(code);
        }
    }, [code, party, joinParty]);

    // Carica messaggi quando entri nella party
    useEffect(() => {
        if (party) {
            loadMessages();
        }
    }, [party]);

    // Auto-hide header dopo 3 secondi
    useEffect(() => {
        setShowHeader(true);
        
        if (headerTimer) {
            clearTimeout(headerTimer);
        }

        const timer = setTimeout(() => {
            setShowHeader(false);
        }, 3000);

        setHeaderTimer(timer);

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [party]);

    // Mostra header al movimento del mouse
    useEffect(() => {
        const handleMouseMove = () => {
            setShowHeader(true);
            
            if (headerTimer) {
                clearTimeout(headerTimer);
            }

            const timer = setTimeout(() => {
                setShowHeader(false);
            }, 3000);

            setHeaderTimer(timer);
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [headerTimer]);

    // Ascolta eventi buffering
    useEffect(() => {
        if (!party) return;

        const unsubscribe = partyService.on('user-buffering', (data) => {
            setBufferingUsers(prev => {
                if (!prev.includes(data.user_id)) {
                    return [...prev, data.user_id];
                }
                return prev;
            });

            // Rimuovi dopo 5 secondi
            setTimeout(() => {
                setBufferingUsers(prev => prev.filter(id => id !== data.user_id));
            }, 5000);
        });

        return () => unsubscribe();
    }, [party]);

    const handleJoin = (partyCode) => {
        joinParty(partyCode);
    };

    const handleLeave = () => {
        leaveParty();
        navigate('/');
    };

    const handleEndParty = async () => {
        if (window.confirm('Sei sicuro di voler terminare la party per tutti?')) {
            await endParty();
            navigate('/');
        }
    };

    const handleCopyCode = () => {
        if (party) {
            navigator.clipboard.writeText(party.party_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const canControl = isHost || party?.allow_guests_control === 1;

    // Loading state - solo se si sta cercando di entrare in una party specifica
    if (code && !party && !isConnected && !error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Spinner size="lg" />
                    <p className="text-white mt-4">Connessione al server...</p>
                </div>
            </div>
        );
    }

    // Join state
    if (!party) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-4">
                <div className="w-full max-w-6xl">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-white text-center">
                            {error}
                        </div>
                    )}
                    
                    {/* Join or Create Toggle */}
                    <PartyLobby onJoin={handleJoin} />
                </div>
            </div>
        );
    }

    const contentTitle = party.movie_title || party.serie_title || 'Contenuto';
    const contentType = party.movie_id ? 'Film' : 'Serie TV';

    return (
        <div className="fixed inset-0 bg-black overflow-hidden">
            {/* Minimalist Header - Auto-hide */}
            <div 
                className={`
                    fixed top-0 left-0 right-0 z-40
                    transition-all duration-500 ease-out
                    ${showHeader ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
                `}
            >
                <div className="bg-gradient-to-b from-black/90 via-black/70 to-transparent backdrop-blur-xl px-6 py-4">
                    <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-xl shadow-orange-600/30">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-white font-bold text-xl tracking-tight">{contentTitle}</h1>
                                <p className="text-gray-400 text-sm">
                                    {contentType}
                                    {party.episode_number && ` • S${party.season_number}E${party.episode_number}`}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Party Code */}
                            <div className="bg-gray-900/80 backdrop-blur-xl px-5 py-2.5 rounded-xl flex items-center space-x-3 border border-orange-900/30 shadow-xl shadow-black/50">
                                <span className="text-gray-400 text-sm font-medium">Codice Party</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 font-mono font-bold text-lg tracking-wider">
                                    {party.party_code}
                                </span>
                                <button
                                    onClick={handleCopyCode}
                                    className="ml-1 text-gray-400 hover:text-white transition-colors"
                                >
                                    {copied ? (
                                        <Check className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Copy className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            {/* Leave/End Party */}
                            {isHost ? (
                                <Button
                                    onClick={handleEndParty}
                                    variant="danger"
                                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-xl shadow-red-600/30 border border-white/10"
                                >
                                    <X className="w-5 h-5 mr-2" />
                                    Termina
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleLeave}
                                    className="bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-xl border border-orange-900/30"
                                >
                                    <LogOut className="w-5 h-5 mr-2" />
                                    Esci
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
                    <div className="bg-red-600/90 backdrop-blur-xl border border-red-500/50 px-6 py-3 rounded-xl shadow-2xl">
                        <p className="text-white font-medium">{error}</p>
                    </div>
                </div>
            )}

            {/* Join Requests (solo per host) */}
            <PartyJoinRequests 
                partyId={party?.party_id} 
                isHost={isHost} 
            />

            {/* Fullscreen Video Player */}
            <div className="absolute inset-0">
                <SyncedPlayerAdvanced
                    party={party}
                    isHost={isHost}
                    canControl={canControl}
                    onTimeUpdate={setCurrentTime}
                />
            </div>

            {/* Floating Participants Pills - Top Right */}
            <PartyParticipantsPills
                participants={participants}
                hostUserId={party.host_user_id}
                bufferingUsers={bufferingUsers}
            />

            {/* Floating Chat - Slides from Right */}
            <PartyFloatingChat
                messages={messages}
                onSendMessage={sendMessage}
                onSendReaction={sendReaction}
                currentTime={currentTime}
            />
        </div>
    );
};

export default Party;
