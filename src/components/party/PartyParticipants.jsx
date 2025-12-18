import React from 'react';
import { Crown, Loader } from 'lucide-react';

const PartyParticipants = ({ participants, hostUserId, bufferingUsers = [] }) => {
    return (
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl overflow-hidden border border-orange-900/30 shadow-xl shadow-red-900/20">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 px-4 py-3 border-b border-orange-900/30 backdrop-blur-sm">
                <h3 className="text-white font-semibold">Partecipanti</h3>
                <p className="text-gray-400 text-sm">{participants.length} {participants.length === 1 ? 'persona' : 'persone'}</p>
            </div>

            {/* Participants List */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {participants.map((participant) => {
                    const isHost = participant.user_id === hostUserId || participant.is_host === 1;
                    const isBuffering = bufferingUsers.includes(participant.user_id);

                    return (
                        <div
                            key={participant.user_id}
                            className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-xl hover:bg-gradient-to-r hover:from-orange-900/20 hover:to-red-900/20 transition-all border border-transparent hover:border-orange-900/30"
                        >
                            {/* Avatar */}
                            <div className="relative">
                                {participant.image ? (
                                    <img
                                        src={participant.image}
                                        alt={participant.username}
                                        className="w-10 h-10 rounded-full"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-red-600/50">
                                        <span className="text-white font-semibold">
                                            {participant.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}

                                {/* Online indicator */}
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                    <span className="text-white font-medium truncate">
                                        {participant.username}
                                    </span>
                                    
                                    {isHost && (
                                        <div className="p-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-md">
                                            <Crown className="w-3 h-3 text-white" title="Host" />
                                        </div>
                                    )}
                                </div>

                                {/* Status */}
                                {isBuffering ? (
                                    <div className="flex items-center space-x-1 text-yellow-500 text-xs mt-1">
                                        <Loader className="w-3 h-3 animate-spin" />
                                        <span>Buffering...</span>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-xs mt-1">
                                        {isHost ? 'Host della party' : 'Partecipante'}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}

                {participants.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        <p>Nessun partecipante ancora</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartyParticipants;
