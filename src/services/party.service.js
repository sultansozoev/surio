import { io } from 'socket.io-client';
import authService from './auth.services';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000';

class PartyService {
    constructor() {
        this.socket = null;
        this.partyCallbacks = new Map();
    }

    connect() {
        if (this.socket?.connected) {
            console.log('🔌 Socket already connected');
            return;
        }

        const token = authService.getToken();
        if (!token) {
            console.error('❌ No auth token found');
            return;
        }

        console.log('🔌 Connecting to Socket.IO server...');

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket.id);
            // Trigger evento per notificare il context
            this.trigger('socket-connected', { socketId: this.socket.id });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            this.trigger('socket-disconnected', { reason });
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            this.trigger('socket-error', { error });
        });

        // Party events
        this.socket.on('party-joined', (data) => {
            console.log('🎉 Party joined:', data);
            this.trigger('party-joined', data);
        });

        this.socket.on('party-error', (error) => {
            console.error('❌ Party error:', error);
            this.trigger('party-error', error);
        });

        this.socket.on('user-joined', (data) => {
            console.log('👤 User joined:', data);
            this.trigger('user-joined', data);
        });

        this.socket.on('user-left', (data) => {
            console.log('👋 User left:', data);
            this.trigger('user-left', data);
        });

        this.socket.on('host-changed', (data) => {
            console.log('👑 Host changed:', data);
            this.trigger('host-changed', data);
        });

        // Player sync events
        this.socket.on('player-play', (data) => {
            console.log('▶️ Player play:', data);
            this.trigger('player-play', data);
        });

        this.socket.on('player-pause', (data) => {
            console.log('⏸️ Player pause:', data);
            this.trigger('player-pause', data);
        });

        this.socket.on('player-seek', (data) => {
            console.log('⏩ Player seek:', data);
            this.trigger('player-seek', data);
        });

        this.socket.on('player-speed-changed', (data) => {
            console.log('🏃 Speed changed:', data);
            this.trigger('player-speed-changed', data);
        });

        this.socket.on('user-buffering', (data) => {
            console.log('⏳ User buffering:', data);
            this.trigger('user-buffering', data);
        });

        // Chat events
        this.socket.on('new-message', (data) => {
            console.log('💬 New message:', data);
            this.trigger('new-message', data);
        });

        this.socket.on('new-reaction', (data) => {
            console.log('😀 New reaction:', data);
            this.trigger('new-reaction', data);
        });

        // Party end
        this.socket.on('party-ended', (data) => {
            console.log('🛑 Party ended:', data);
            this.trigger('party-ended', data);
        });
    }

    // Event system
    on(event, callback) {
        if (!this.partyCallbacks.has(event)) {
            this.partyCallbacks.set(event, []);
        }
        this.partyCallbacks.get(event).push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.partyCallbacks.get(event);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    off(event, callback) {
        const callbacks = this.partyCallbacks.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    trigger(event, data) {
        const callbacks = this.partyCallbacks.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    // Party actions
    joinParty(partyCode) {
        if (!this.socket?.connected) {
            console.error('❌ Socket not connected');
            return;
        }
        console.log('🎮 Joining party:', partyCode);
        this.socket.emit('join-party', partyCode);
    }

    leaveParty(partyId) {
        if (!this.socket?.connected) return;
        console.log('👋 Leaving party:', partyId);
        this.socket.emit('leave-party', partyId);
    }

    // Player control
    play(partyId, currentTime) {
        if (!this.socket?.connected) return;
        this.socket.emit('player-play', { partyId, currentTime });
    }

    pause(partyId, currentTime) {
        if (!this.socket?.connected) return;
        this.socket.emit('player-pause', { partyId, currentTime });
    }

    seek(partyId, currentTime) {
        if (!this.socket?.connected) return;
        this.socket.emit('player-seek', { partyId, currentTime });
    }

    changeSpeed(partyId, speed, currentTime) {
        if (!this.socket?.connected) return;
        this.socket.emit('player-speed', { partyId, speed, currentTime });
    }

    buffer(partyId, currentTime) {
        if (!this.socket?.connected) return;
        this.socket.emit('player-buffer', { partyId, currentTime });
    }

    // Chat
    sendMessage(partyId, message) {
        if (!this.socket?.connected) return;
        this.socket.emit('send-message', { partyId, message });
    }

    sendReaction(partyId, emoji, currentTime) {
        if (!this.socket?.connected) return;
        this.socket.emit('send-reaction', { partyId, emoji, currentTime });
    }

    // Disconnect
    disconnect() {
        if (this.socket) {
            console.log('🔌 Disconnecting socket...');
            this.socket.disconnect();
            this.socket = null;
        }
        this.partyCallbacks.clear();
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export const partyService = new PartyService();
export default partyService;
