import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

const PartyJoin = ({ onJoin }) => {
    const [partyCode, setPartyCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const code = partyCode.trim().toUpperCase();
        if (code.length !== 6) return;

        setIsJoining(true);
        try {
            await onJoin(code);
        } catch (error) {
            console.error('Error joining party:', error);
        } finally {
            setIsJoining(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (value.length <= 6) {
            setPartyCode(value);
        }
    };

    return (
        <div className="max-w-md mx-auto bg-gray-900 rounded-xl p-8 shadow-xl">
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
                    <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                    Entra in una Party
                </h2>
                <p className="text-gray-400">
                    Inserisci il codice della party per unirti
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    disabled={partyCode.length !== 6 || isJoining}
                    className="w-full"
                >
                    {isJoining ? 'Ingresso...' : 'Entra nella Party'}
                </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-gray-400 text-sm text-center">
                    Il codice ti è stato fornito dall'host della party
                </p>
            </div>
        </div>
    );
};

export default PartyJoin;
