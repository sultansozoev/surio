import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X } from 'lucide-react';
import {api} from '../../services/api';

const PartyJoinRequests = ({ partyId, isHost }) => {
    const [requests, setRequests] = useState([]);
    const [responding, setResponding] = useState(null);
    const [visible, setVisible] = useState(false);

    // Fetch pending requests
    const fetchRequests = async () => {
        if (!partyId || !isHost) return;

        try {
            const data = await api.getPendingRequests(partyId);
            setRequests(data || []);
            
            // Mostra il componente solo se ci sono richieste
            setVisible((data || []).length > 0);
        } catch (error) {
            console.error('Error fetching join requests:', error);
            // Non mostrare errori se è un problema di autenticazione
            if (error.message && (error.message.includes('401') || error.message.includes('403') || error.message.includes('Authentication error'))) {
                console.warn('⚠️ Token potrebbe essere scaduto durante il fetch delle richieste');
                setRequests([]);
                setVisible(false);
            }
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchRequests();
    }, [partyId, isHost]);

    // Auto-refresh every 5 seconds
    useEffect(() => {
        if (!isHost) return;

        const interval = setInterval(fetchRequests, 5000);
        return () => clearInterval(interval);
    }, [partyId, isHost]);

    const handleRespond = async (requestId, accept) => {
        setResponding(requestId);
        
        try {
            await api.respondToJoinRequest(requestId, accept);
            
            // Rimuovi la richiesta dalla lista
            setRequests(prev => prev.filter(r => r.request_id !== requestId));
            
            // Nascondi il componente se non ci sono più richieste
            if (requests.length <= 1) {
                setVisible(false);
            }
        } catch (error) {
            console.error('Error responding to join request:', error);
            alert(`Errore nel ${accept ? 'accettare' : 'rifiutare'} la richiesta. Riprova.`);
        } finally {
            setResponding(null);
        }
    };

    // Non mostrare il componente se:
    // - Non è l'host
    // - Non ci sono richieste
    // - Non è visibile
    if (!isHost || requests.length === 0 || !visible) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50 w-80 animate-slide-in">
            <div className="bg-gradient-to-br from-orange-900/95 via-red-900/95 to-orange-900/95 backdrop-blur-xl rounded-2xl border border-orange-600/50 shadow-2xl shadow-red-900/50 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 bg-black/30 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-orange-400" />
                        <h3 className="text-white font-bold text-sm">Richieste di Accesso</h3>
                    </div>
                    <div className="bg-orange-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {requests.length}
                    </div>
                </div>

                {/* Requests List */}
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {requests.map((request) => (
                        <div
                            key={request.request_id}
                            className="px-4 py-3 border-b border-white/10 last:border-b-0 bg-black/20 hover:bg-black/30 transition-colors"
                        >
                            <div className="flex items-center justify-between gap-3">
                                {/* User Info */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <span className="text-white font-bold text-sm">
                                            {request.username?.[0]?.toUpperCase() || 'U'}
                                        </span>
                                    </div>

                                    {/* Username */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold text-sm truncate">
                                            {request.username || 'Utente'}
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                            Vuole unirsi alla party
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {/* Accept Button */}
                                    <button
                                        onClick={() => handleRespond(request.request_id, true)}
                                        disabled={responding === request.request_id}
                                        className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/50 hover:scale-110"
                                        title="Accetta"
                                    >
                                        <Check className="w-4 h-4 text-white" />
                                    </button>

                                    {/* Reject Button */}
                                    <button
                                        onClick={() => handleRespond(request.request_id, false)}
                                        disabled={responding === request.request_id}
                                        className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/50 hover:scale-110"
                                        title="Rifiuta"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Loading Indicator */}
                            {responding === request.request_id && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-gray-400 text-xs">Elaborazione...</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="px-4 py-2 bg-black/30 border-t border-white/10">
                    <p className="text-gray-400 text-xs text-center">
                        Le richieste si aggiornano automaticamente ogni 5 secondi
                    </p>
                </div>
            </div>

            {/* Custom CSS for scrollbar and animation */}
            <style>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.2);
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(249, 115, 22, 0.5);
                    border-radius: 3px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(249, 115, 22, 0.8);
                }
            `}</style>
        </div>
    );
};

export default PartyJoinRequests;