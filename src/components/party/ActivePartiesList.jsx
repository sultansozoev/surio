import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Tv, Users, Play, Pause, Clock, Shield } from 'lucide-react';
import { partyApi } from '../../services/api';

const ActivePartiesList = () => {
    const navigate = useNavigate();
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch active parties
    const fetchActiveParties = async () => {
        try {
            setLoading(true);
            const data = await partyApi.getActiveParties();

            if (Array.isArray(data)) {
                setParties(data);
                setError(null);
            } else if (data && Array.isArray(data.parties)) {
                setParties(data.parties);
                setError(null);
            } else {
                setParties([]);
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching active parties:', err);
            if (err.message && err.message.includes('404')) {
                setParties([]);
                setError(null);
            } else if (err.message && (err.message.includes('401') || err.message.includes('403') || err.message.includes('Authentication error'))) {
                // Non mostrare errore, probabilmente il token è scaduto
                // L'utente verrà gestito dal ProtectedRoute
                console.warn('⚠️ Token potrebbe essere scaduto, ma non forziamo logout');
                setParties([]);
                setError(null); // Non mostrare errore all'utente
            } else {
                setError('Impossibile caricare le party attive');
                setParties([]);
            }
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchActiveParties();
    }, []);

    // Auto-refresh every 10 seconds
    useEffect(() => {
        const interval = setInterval(fetchActiveParties, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleJoinParty = (partyCode) => {
        navigate(`/party/${partyCode}`);
    };

    const formatTime = (seconds) => {
        if (!seconds || seconds < 0) return '0:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-400">Caricamento party attive...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={fetchActiveParties}
                        className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg transition-all"
                    >
                        Riprova
                    </button>
                </div>
            </div>
        );
    }

    if (parties.length === 0) {
        console.log('📭 Empty state: no parties found');
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <Users className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">Nessuna party attiva al momento</p>
                    <p className="text-gray-500 text-sm">
                        Crea una party mentre guardi un film o una serie TV!
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {/* Header con contatore */}
            <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg">
                    {parties.length} {parties.length === 1 ? 'Party Attiva' : 'Party Attive'}
                </h3>
                <button
                    onClick={fetchActiveParties}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                    🔄 Aggiorna
                </button>
            </div>

            {/* Grid party */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parties.map((party) => {
                    const isMovie = !!party.movie_id;
                    const contentTitle = party.content_title || 'Contenuto';
                    const episodeInfo = party.episode_title 
                        ? `${party.episode_title}` 
                        : null;

                    return (
                        <div
                            key={party.party_id}
                            className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-orange-900/30 hover:border-orange-600/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-900/30"
                        >
                            {/* Card Header */}
                            <div className="p-4 border-b border-white/10 bg-black/30">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        {/* Tipo Contenuto */}
                                        <div className="flex items-center gap-2 mb-2">
                                            {isMovie ? (
                                                <>
                                                    <Film className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                                    <span className="text-xs font-semibold text-blue-400">FILM</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Tv className="w-4 h-4 text-red-400 flex-shrink-0" />
                                                    <span className="text-xs font-semibold text-red-400">SERIE TV</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Titolo */}
                                        <h4 className="text-white font-bold text-base mb-1 line-clamp-2 group-hover:text-red-500 transition-colors">
                                            {contentTitle}
                                        </h4>

                                        {/* Episodio (se serie TV) */}
                                        {episodeInfo && (
                                            <p className="text-gray-400 text-sm line-clamp-1">
                                                {episodeInfo}
                                            </p>
                                        )}
                                    </div>

                                    {/* Badge Controllo Ospiti */}
                                    {party.allow_guests_control === 1 && (
                                        <div 
                                            className="flex-shrink-0 bg-green-500/20 border border-green-500/50 rounded-lg px-2 py-1 flex items-center gap-1"
                                            title="Controllo libero per gli ospiti"
                                        >
                                            <Shield className="w-3 h-3 text-green-400" />
                                            <span className="text-xs text-green-400 font-semibold">LIBERO</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 space-y-3">
                                {/* Host Info */}
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold text-sm">
                                            {party.host_username?.[0]?.toUpperCase() || 'H'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">
                                            {party.host_username || 'Host'}
                                        </p>
                                        <p className="text-gray-400 text-xs">Host della party</p>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Partecipanti */}
                                    <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Users className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                            <span className="text-xs text-gray-400">Partecipanti</span>
                                        </div>
                                        <p className="text-white font-bold text-sm">
                                            {party.participant_count || 1} / {party.max_participants || 10}
                                        </p>
                                    </div>

                                    {/* Posizione Player */}
                                    <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                            <span className="text-xs text-gray-400">Posizione</span>
                                        </div>
                                        <p className="text-white font-bold text-sm">
                                            {formatTime(party.player_time || 0)}
                                        </p>
                                    </div>
                                </div>

                                {/* Stato Riproduzione */}
                                <div className="flex items-center gap-2">
                                    {party.status === 'playing' ? (
                                        <>
                                            <Play className="w-4 h-4 text-green-400 fill-green-400" />
                                            <span className="text-green-400 text-sm font-semibold">In riproduzione</span>
                                        </>
                                    ) : (
                                        <>
                                            <Pause className="w-4 h-4 text-yellow-400" />
                                            <span className="text-yellow-400 text-sm font-semibold">In pausa</span>
                                        </>
                                    )}
                                </div>

                                {/* Pulsante Unisciti */}
                                <button
                                    onClick={() => handleJoinParty(party.party_code)}
                                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-xl text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-600/50 flex items-center justify-center gap-2 group/btn"
                                >
                                    <Users className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                    Unisciti alla Party
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ActivePartiesList;