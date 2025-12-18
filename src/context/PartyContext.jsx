import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import partyService from '../services/party.service';
import { partyApi } from '../services/api';

const PartyContext = createContext();

export const usePartyContext = () => {
    const context = useContext(PartyContext);
    if (!context) {
        throw new Error('usePartyContext must be used within PartyProvider');
    }
    return context;
};

export const PartyProvider = ({ children }) => {
    const [party, setParty] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    // Connetti Socket.IO quando il component monta
    useEffect(() => {
        console.log('🔌 Connecting to Socket.IO...');
        partyService.connect();
        
        // Ascolta eventi di connessione dal socket
        const unsubConnected = partyService.on('socket-connected', (data) => {
            console.log('✅ Socket connected in context:', data.socketId);
            setIsConnected(true);
            setError(null);
        });

        const unsubDisconnected = partyService.on('socket-disconnected', (data) => {
            console.log('🔌 Socket disconnected in context:', data.reason);
            setIsConnected(false);
        });

        const unsubError = partyService.on('socket-error', (data) => {
            console.error('❌ Socket error in context:', data.error);
            setError('Errore di connessione al server');
        });

        // Fallback: controlla la connessione dopo 2 secondi
        const fallbackCheck = setTimeout(() => {
            const connected = partyService.isConnected();
            console.log('🔍 Fallback connection check:', connected);
            setIsConnected(connected);
            if (!connected) {
                setError('Impossibile connettersi al server');
            }
        }, 2000);

        return () => {
            unsubConnected();
            unsubDisconnected();
            unsubError();
            clearTimeout(fallbackCheck);
            partyService.disconnect();
        };
    }, []);

    // Setup event listeners
    useEffect(() => {
        const unsubscribers = [];

        // Party joined
        unsubscribers.push(
            partyService.on('party-joined', (data) => {
                setParty(data.party);
                setParticipants(data.participants);
                setIsHost(data.isHost);
                setError(null);
            })
        );

        // Party error
        unsubscribers.push(
            partyService.on('party-error', (error) => {
                setError(error.message);
            })
        );

        // User joined
        unsubscribers.push(
            partyService.on('user-joined', (data) => {
                setParticipants(prev => [...prev, data]);
            })
        );

        // User left
        unsubscribers.push(
            partyService.on('user-left', (data) => {
                setParticipants(prev => 
                    prev.filter(p => p.user_id !== data.user_id)
                );
            })
        );

        // Host changed
        unsubscribers.push(
            partyService.on('host-changed', (data) => {
                if (party) {
                    setParty({ ...party, host_user_id: data.new_host_id });
                }
            })
        );

        // New message
        unsubscribers.push(
            partyService.on('new-message', (data) => {
                setMessages(prev => [...prev, data]);
            })
        );

        // Party ended
        unsubscribers.push(
            partyService.on('party-ended', (data) => {
                setError(data.message || 'La party è terminata');
                setTimeout(() => {
                    leaveParty();
                }, 3000);
            })
        );

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [party]);

    const createParty = useCallback(async (contentData) => {
        try {
            const response = await partyApi.createParty(contentData);
            return response;
        } catch (error) {
            console.error('Error creating party:', error);
            setError('Errore nella creazione della party');
            throw error;
        }
    }, []);

    const joinParty = useCallback((partyCode) => {
        setError(null);
        partyService.joinParty(partyCode);
    }, []);

    const leaveParty = useCallback(() => {
        if (party) {
            partyService.leaveParty(party.party_id);
        }
        setParty(null);
        setParticipants([]);
        setMessages([]);
        setIsHost(false);
        setError(null);
    }, [party]);

    const endParty = useCallback(async () => {
        if (!party || !isHost) return;

        try {
            await partyApi.endParty(party.party_id);
            leaveParty();
        } catch (error) {
            console.error('Error ending party:', error);
            setError('Errore nella chiusura della party');
        }
    }, [party, isHost, leaveParty]);

    const sendMessage = useCallback((message) => {
        if (!party) return;
        partyService.sendMessage(party.party_id, message);
    }, [party]);

    const sendReaction = useCallback((emoji, currentTime) => {
        if (!party) return;
        partyService.sendReaction(party.party_id, emoji, currentTime);
    }, [party]);

    const loadMessages = useCallback(async (before) => {
        if (!party) return;

        try {
            const params = before ? { before, limit: 50 } : { limit: 50 };
            const messages = await partyApi.getPartyMessages(party.party_id, params);
            setMessages(prev => before ? [...messages, ...prev] : messages);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }, [party]);

    const value = {
        party,
        participants,
        messages,
        isHost,
        isConnected,
        error,
        createParty,
        joinParty,
        leaveParty,
        endParty,
        sendMessage,
        sendReaction,
        loadMessages,
        partyService, // Esponi il service per controlli player
    };

    return (
        <PartyContext.Provider value={value}>
            {children}
        </PartyContext.Provider>
    );
};
