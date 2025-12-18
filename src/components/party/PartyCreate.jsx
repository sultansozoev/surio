import React, { useState } from 'react';
import { Users, Settings, X } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

const PartyCreate = ({ isOpen, onClose, content, onCreated }) => {
    const [maxParticipants, setMaxParticipants] = useState(10);
    const [allowGuestsControl, setAllowGuestsControl] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!content) return;

        setIsCreating(true);
        try {
            const partyData = {
                max_participants: maxParticipants,
                allow_guests_control: allowGuestsControl,
            };

            if (content.type === 'movie') {
                partyData.movie_id = content.movie_id;
            } else {
                partyData.serie_tv_id = content.serie_tv_id;
                if (content.episode_id) {
                    partyData.episode_id = content.episode_id;
                }
            }

            await onCreated(partyData);
            onClose();
        } catch (error) {
            console.error('Error creating party:', error);
        } finally {
            setIsCreating(false);
        }
    };

    if (!isOpen || !content) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crea Surio Party">
            <div className="space-y-6">
                {/* Content Info */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                        {content.poster && (
                            <img
                                src={`https://image.tmdb.org/t/p/w92${content.poster}`}
                                alt={content.title}
                                className="w-16 h-24 object-cover rounded"
                            />
                        )}
                        <div>
                            <h3 className="text-white font-semibold">{content.title}</h3>
                            <p className="text-gray-400 text-sm">
                                {content.type === 'movie' ? 'Film' : 'Serie TV'}
                                {content.episode_number && ` - S${content.season_number}E${content.episode_number}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                    <div>
                        <label className="flex items-center text-white mb-2">
                            <Users className="w-5 h-5 mr-2" />
                            Numero massimo partecipanti
                        </label>
                        <select
                            value={maxParticipants}
                            onChange={(e) => setMaxParticipants(Number(e.target.value))}
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                        >
                            {[2, 5, 10, 15, 20].map(num => (
                                <option key={num} value={num}>{num} persone</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center text-white">
                            <input
                                type="checkbox"
                                checked={allowGuestsControl}
                                onChange={(e) => setAllowGuestsControl(e.target.checked)}
                                className="mr-3 w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-600"
                            />
                            <Settings className="w-5 h-5 mr-2" />
                            Permetti a tutti di controllare il player
                        </label>
                        <p className="text-gray-400 text-sm mt-1 ml-9">
                            Se disabilitato, solo l'host può controllare play/pausa/seek
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                    <Button
                        onClick={handleCreate}
                        disabled={isCreating}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                        {isCreating ? 'Creazione...' : 'Crea Party'}
                    </Button>
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        className="px-6"
                    >
                        Annulla
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PartyCreate;
