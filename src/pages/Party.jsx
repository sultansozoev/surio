import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Copy, Check, LogOut, Users, X } from 'lucide-react';
import { useParty } from '../hooks/useParty';
import PartyLobby from '../components/party/PartyLobby';
import PartyChat from '../components/party/PartyChat';
import PartyParticipants from '../components/party/PartyParticipants';
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
    const [showSidebar, setShowSidebar] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [bufferingUsers, setBufferingUsers] = useState([]);

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
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-orange-900/30 px-4 py-3 backdrop-blur-sm shadow-lg shadow-red-900/20">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg shadow-red-600/50">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg">{contentTitle}</h1>
                            <p className="text-gray-400 text-sm">
                                {contentType}
                                {party.episode_number && ` - S${party.season_number}E${party.episode_number}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Party Code */}
                        <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 px-4 py-2 rounded-xl flex items-center space-x-2 border border-orange-900/30 shadow-lg shadow-red-900/20 backdrop-blur-sm">
                            <span className="text-gray-400 text-sm">Codice:</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 font-mono font-bold text-lg">
                                {party.party_code}
                            </span>
                            <button
                                onClick={handleCopyCode}
                                className="ml-2 text-gray-400 hover:text-white transition-colors"
                            >
                                {copied ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                    <Copy className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {/* Toggle Sidebar */}
                        <Button
                            onClick={() => setShowSidebar(!showSidebar)}
                            variant="secondary"
                            className="hidden md:flex"
                        >
                            {showSidebar ? 'Nascondi Chat' : 'Mostra Chat'}
                        </Button>

                        {/* Leave/End Party */}
                        {isHost ? (
                            <Button
                                onClick={handleEndParty}
                                variant="danger"
                                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg shadow-red-600/50 border border-white/10"
                            >
                                <X className="w-5 h-5 mr-2" />
                                Termina Party
                            </Button>
                        ) : (
                            <Button
                                onClick={handleLeave}
                                variant="secondary"
                            >
                                <LogOut className="w-5 h-5 mr-2" />
                                Esci
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/20 border-b border-red-500 px-4 py-3">
                    <p className="text-white text-center">{error}</p>
                </div>
            )}

            {/* Join Requests (solo per host) */}
            <PartyJoinRequests 
                partyId={party?.party_id} 
                isHost={isHost} 
            />

            {/* Main Content */}
            <div className="max-w-screen-2xl mx-auto p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Player */}
                    <div className={`flex-1 ${showSidebar ? 'md:w-2/3' : 'w-full'}`}>
                        <SyncedPlayerAdvanced
                            party={party}
                            isHost={isHost}
                            canControl={canControl}
                            onTimeUpdate={setCurrentTime}
                        />
                    </div>

                    {/* Sidebar */}
                    {showSidebar && (
                        <div className="w-full md:w-1/3 space-y-4">
                            {/* Participants */}
                            <PartyParticipants
                                participants={participants}
                                hostUserId={party.host_user_id}
                                bufferingUsers={bufferingUsers}
                            />

                            {/* Chat */}
                            <div className="h-96 md:h-[500px]">
                                <PartyChat
                                    messages={messages}
                                    onSendMessage={sendMessage}
                                    onSendReaction={sendReaction}
                                    currentTime={currentTime}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Party;
