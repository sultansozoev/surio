import React, { useState, useEffect } from 'react';
import { Users, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { api } from '../../services/api';

const PartyLobby = ({ onJoin }) => {
    const [mode, setMode] = useState('join'); // 'join' or 'create'
    const [partyCode, setPartyCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Stato per creazione party
    const [contentType, setContentType] = useState('movie');
    const [contentId, setContentId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedContent, setSelectedContent] = useState(null);
    const [maxParticipants, setMaxParticipants] = useState(10);
    const [allowGuestsControl, setAllowGuestsControl] = useState(false);

    const handleJoinSubmit = async (e) => {
        e.preventDefault();
        const code = partyCode.trim().toUpperCase();
        if (code.length !== 6) return;

        setIsLoading(true);
        try {
            await onJoin(code);
        } catch (error) {
            console.error('Error joining party:', error);
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

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        try {
            const endpoint = contentType === 'movie' ? '/search' : '/searchSerie';
            const response = await api.get(endpoint, { title: searchQuery });
            setSearchResults(response.films || []);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectContent = (content) => {
        setSelectedContent(content);
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleCreateParty = async () => {
        if (!selectedContent) return;

        setIsLoading(true);
        try {
            const partyData = {
                max_participants: maxParticipants,
                allow_guests_control: allowGuestsControl,
            };

            if (contentType === 'movie') {
                partyData.movie_id = selectedContent.movie_id;
            } else {
                partyData.serie_tv_id = selectedContent.serie_tv_id;
            }

            const response = await api.post('/party/create', partyData);
            
            if (response.party_code) {
                // Naviga alla party creata
                navigate(`/party/${response.party_code}`);
            }
        } catch (error) {
            console.error('Error creating party:', error);
            alert('Errore nella creazione della party');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Toggle Buttons */}
            <div className="flex gap-4 mb-8 bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 p-2 rounded-2xl backdrop-blur-sm border border-orange-900/30 shadow-xl shadow-red-900/20">
                <button
                    onClick={() => setMode('join')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold transition-all ${
                        mode === 'join'
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-red-600/50 border border-white/10'
                            : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-orange-900/20 hover:to-red-900/20'
                    }`}
                >
                    <Search className="w-5 h-5" />
                    Entra in una Party
                </button>
                <button
                    onClick={() => setMode('create')}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold transition-all ${
                        mode === 'create'
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-red-600/50 border border-white/10'
                            : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-orange-900/20 hover:to-red-900/20'
                    }`}
                >
                    <Plus className="w-5 h-5" />
                    Crea una Party
                </button>
            </div>

            {/* Join Mode */}
            {mode === 'join' && (
                <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-8 shadow-2xl border border-orange-900/30 backdrop-blur-sm">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full mb-4 shadow-lg shadow-red-600/50">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Entra in una Party
                        </h2>
                        <p className="text-gray-400">
                            Inserisci il codice della party per unirti
                        </p>
                    </div>

                    <form onSubmit={handleJoinSubmit} className="space-y-4">
                        <div>
                            <Input
                                type="text"
                                value={partyCode}
                                onChange={handleInputChange}
                                placeholder="ABC123"
                                className="text-center text-2xl font-mono tracking-widest"
                                maxLength={6}
                                autoFocus
                            />
                            <p className="text-gray-500 text-sm mt-2 text-center">
                                Codice a 6 caratteri
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={partyCode.length !== 6 || isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Ingresso...' : 'Entra nella Party'}
                        </Button>
                    </form>
                </div>
            )}

            {/* Create Mode */}
            {mode === 'create' && (
                <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-8 shadow-2xl border border-orange-900/30 backdrop-blur-sm">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-full mb-4 shadow-lg shadow-red-600/50">
                            <Plus className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            Crea una Party
                        </h2>
                        <p className="text-gray-400">
                            Scegli un film o una serie TV da guardare insieme
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Content Type Selection */}
                        <div>
                            <label className="text-white font-medium mb-2 block">
                                Tipo di contenuto
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setContentType('movie')}
                                    className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                                        contentType === 'movie'
                                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-red-600/50'
                                            : 'bg-gray-800/50 text-gray-400 hover:bg-gradient-to-r hover:from-orange-900/20 hover:to-red-900/20 hover:text-white border border-orange-900/20'
                                    }`}
                                >
                                    🎬 Film
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setContentType('tv')}
                                    className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
                                        contentType === 'tv'
                                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-red-600/50'
                                            : 'bg-gray-800/50 text-gray-400 hover:bg-gradient-to-r hover:from-orange-900/20 hover:to-red-900/20 hover:text-white border border-orange-900/20'
                                    }`}
                                >
                                    📺 Serie TV
                                </button>
                            </div>
                        </div>

                        {/* Search Content */}
                        {!selectedContent && (
                            <div>
                                <label className="text-white font-medium mb-2 block">
                                    Cerca {contentType === 'movie' ? 'Film' : 'Serie TV'}
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Es: Breaking Bad, Inception..."
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleSearch}
                                        disabled={isLoading || !searchQuery.trim()}
                                    >
                                        <Search className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Search Results */}
                                {searchResults.length > 0 && (
                                    <div className="mt-4 max-h-64 overflow-y-auto space-y-2">
                                        {searchResults.slice(0, 5).map((content) => (
                                            <button
                                                key={content.movie_id || content.serie_tv_id}
                                                onClick={() => handleSelectContent(content)}
                                                className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gradient-to-r hover:from-orange-900/20 hover:to-red-900/20 rounded-xl transition-all text-left border border-transparent hover:border-orange-900/30"
                                            >
                                                {content.poster && (
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w92${content.poster}`}
                                                        alt={content.title}
                                                        className="w-12 h-16 object-cover rounded"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-white font-medium">{content.title}</p>
                                                    <p className="text-gray-400 text-sm">
                                                        {content.release_date?.split('-')[0]}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Selected Content */}
                        {selectedContent && (
                            <div className="bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-gray-800/50 rounded-xl p-4 relative border border-orange-900/30 shadow-lg">
                                <button
                                    onClick={() => setSelectedContent(null)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                                <div className="flex items-center gap-4">
                                    {selectedContent.poster && (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w92${selectedContent.poster}`}
                                            alt={selectedContent.title}
                                            className="w-16 h-24 object-cover rounded"
                                        />
                                    )}
                                    <div>
                                        <h3 className="text-white font-semibold text-lg">
                                            {selectedContent.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            {contentType === 'movie' ? 'Film' : 'Serie TV'} •{' '}
                                            {selectedContent.release_date?.split('-')[0]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Party Settings */}
                        {selectedContent && (
                            <>
                                <div>
                                    <label className="text-white font-medium mb-2 block">
                                        Numero massimo partecipanti
                                    </label>
                                    <select
                                        value={maxParticipants}
                                        onChange={(e) => setMaxParticipants(Number(e.target.value))}
                                        className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                                    >
                                        {[2, 5, 10, 15, 20].map((num) => (
                                            <option key={num} value={num}>
                                                {num} persone
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center text-white cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={allowGuestsControl}
                                            onChange={(e) => setAllowGuestsControl(e.target.checked)}
                                            className="mr-3 w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-600"
                                        />
                                        Permetti a tutti di controllare il player
                                    </label>
                                    <p className="text-gray-400 text-sm mt-1 ml-7">
                                        Se disabilitato, solo tu potrai controllare play/pausa/seek
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleCreateParty}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    {isLoading ? 'Creazione...' : '🎉 Crea Party'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartyLobby;
