import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import ActivePartiesList from './ActivePartiesList';

const PartyLobby = ({ onJoin }) => {
    const [mode, setMode] = useState('active'); // 'active' or 'code'
    const [partyCode, setPartyCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleJoinSubmit = async (e) => {
        e.preventDefault();
        const code = partyCode.trim().toUpperCase();

        if (code.length !== 6) {
            return;
        }

        setIsLoading(true);
        try {
            await onJoin(code);
        } catch (error) {
            console.error('❌ Error joining party:', error);
            alert('Errore nell\'entrare nella party. Verifica il codice.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (value.length <= 6) {
            setPartyCode(value);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4">
            {/* Header con descrizione */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-600 to-red-600 rounded-full mb-4 shadow-2xl shadow-red-600/50">
                    <Users className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                    Surio Party
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    Guarda film e serie TV insieme ai tuoi amici, sincronizzati in tempo reale
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-3 mb-8 bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 p-2 rounded-2xl backdrop-blur-sm border border-orange-900/30 shadow-xl shadow-red-900/20 max-w-2xl mx-auto">
                <button
                    onClick={() => setMode('active')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                        mode === 'active'
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-red-600/50 border border-white/10 scale-105'
                            : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-orange-900/20 hover:to-red-900/20'
                    }`}
                >
                    <Users className="w-5 h-5" />
                    <span className="hidden sm:inline">Party Attive</span>
                    <span className="sm:hidden">Attive</span>
                </button>
                <button
                    onClick={() => setMode('code')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
                        mode === 'code'
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-red-600/50 border border-white/10 scale-105'
                            : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-orange-900/20 hover:to-red-900/20'
                    }`}
                >
                    <Search className="w-5 h-5" />
                    <span className="hidden sm:inline">Inserisci Codice</span>
                    <span className="sm:hidden">Codice</span>
                </button>
            </div>

            {/* Active Parties Mode */}
            {mode === 'active' && (
                <div className="animate-fade-in">
                    <div className="bg-gradient-to-br from-gray-900/50 via-black/50 to-gray-900/50 rounded-2xl p-6 md:p-8 shadow-2xl border border-orange-900/30 backdrop-blur-sm">
                        <ActivePartiesList />
                    </div>

                    {/* Info Card */}
                    <div className="mt-6 bg-gradient-to-r from-orange-900/20 to-red-900/20 rounded-xl p-4 border border-orange-900/30">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">💡</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-semibold mb-1">
                                    Come creare una party
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Vai su un film o serie TV che vuoi guardare, clicca su "Crea Party"
                                    nei controlli del player e la tua party apparirà qui automaticamente!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Join with Code Mode */}
            {mode === 'code' && (
                <div className="animate-fade-in max-w-2xl mx-auto">
                    <div className="bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 rounded-2xl p-8 md:p-10 shadow-2xl border border-orange-900/30 backdrop-blur-sm">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full mb-4 shadow-lg shadow-red-600/50">
                                <Search className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Entra con Codice
                            </h2>
                            <p className="text-gray-400">
                                Hai ricevuto un codice party? Inseriscilo qui per unirti
                            </p>
                        </div>

                        <form onSubmit={handleJoinSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="party-code" className="block text-white font-medium mb-2 text-center">
                                    Codice Party
                                </label>
                                <Input
                                    id="party-code"
                                    type="text"
                                    value={partyCode}
                                    onChange={handleInputChange}
                                    placeholder="ABC123"
                                    className="text-center text-3xl font-mono tracking-[0.5em] font-bold bg-gray-800/50 border-2 border-orange-900/30 focus:border-orange-600 focus:ring-2 focus:ring-orange-600/50 transition-all"
                                    maxLength={6}
                                    autoFocus
                                    disabled={isLoading}
                                />
                                <div className="flex items-center justify-center gap-2 mt-3">
                                    <div className={`w-2 h-2 rounded-full transition-all ${
                                        partyCode.length >= 2 ? 'bg-orange-600' : 'bg-gray-700'
                                    }`} />
                                    <div className={`w-2 h-2 rounded-full transition-all ${
                                        partyCode.length >= 4 ? 'bg-orange-600' : 'bg-gray-700'
                                    }`} />
                                    <div className={`w-2 h-2 rounded-full transition-all ${
                                        partyCode.length === 6 ? 'bg-orange-600' : 'bg-gray-700'
                                    }`} />
                                </div>
                                <p className="text-gray-500 text-sm mt-2 text-center">
                                    Inserisci il codice a 6 caratteri
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={partyCode.length !== 6 || isLoading}
                                variant="primary"
                                className={`w-full py-4 text-lg font-semibold transition-all ${
                                    partyCode.length === 6 && !isLoading
                                        ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg shadow-red-600/50 scale-105'
                                        : ''
                                }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Connessione in corso...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Unisciti alla Party
                                    </span>
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                            <span className="text-gray-500 text-sm font-medium">oppure</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                        </div>

                        {/* Alternative action */}
                        <button
                            onClick={() => setMode('active')}
                            className="w-full py-3 px-4 bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 hover:text-white rounded-xl transition-all border border-gray-700/50 hover:border-orange-900/30 font-medium"
                        >
                            Visualizza tutte le party attive
                        </button>
                    </div>

                    {/* Help Section */}
                    <div className="mt-6 space-y-3">
                        <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-xl p-4 border border-blue-900/30">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">ℹ️</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-semibold mb-1 text-sm">
                                        Come funziona?
                                    </h3>
                                    <p className="text-gray-400 text-xs leading-relaxed">
                                        Quando qualcuno crea una party, riceverà un codice univoco a 6 caratteri.
                                        Condividi questo codice con i tuoi amici per farli unire alla party!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global info footer */}
            <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                    <span>🎬</span>
                    <span>Guarda insieme</span>
                    <span>•</span>
                    <span>💬</span>
                    <span>Chatta in tempo reale</span>
                    <span>•</span>
                    <span>🎮</span>
                    <span>Sincronizzato</span>
                </div>
            </div>

            {/* Inline Styles for animations */}
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default PartyLobby;