import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useParty } from '../../hooks/useParty';
import PartyCreate from './PartyCreate';

const PartyButton = ({ content }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { createParty } = useParty();
    const navigate = useNavigate();

    const handleCreateParty = async (partyData) => {
        try {
            const response = await createParty(partyData);
            if (response.party_code) {
                // Naviga alla party creata
                navigate(`/party/${response.party_code}`);
            }
        } catch (error) {
            console.error('Error creating party:', error);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                title="Crea Surio Party"
            >
                <Users className="w-5 h-5" />
                <span className="hidden sm:inline">Crea Party</span>
            </button>

            <PartyCreate
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                content={content}
                onCreated={handleCreateParty}
            />
        </>
    );
};

export default PartyButton;
