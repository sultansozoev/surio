import React, { useState } from 'react';
import { Crown, Loader, Users, ChevronDown, ChevronUp } from 'lucide-react';

const PartyParticipantsPills = ({ participants, hostUserId, bufferingUsers = [] }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Mostra max 5 avatar quando collassato
    const visibleParticipants = isExpanded ? participants : participants.slice(0, 5);
    const hiddenCount = participants.length - 5;

    return (
        <div className="fixed top-20 right-6 z-30">
            <div className="bg-gradient-to-br from-gray-900/90 via-black/90 to-gray-900/90 backdrop-blur-xl rounded-2xl border border-orange-900/30 shadow-2xl shadow-black/50 overflow-hidden">
                
                {/* Header */}
                <div 
                    className="px-4 py-3 bg-gradient-to-r from-gray-800/60 via-gray-900/60 to-gray-800/60 border-b border-orange-900/30 cursor-pointer hover:bg-gray-800/80 transition-all"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center justify-between space-x-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold text-sm">Partecipanti</h3>
                                <p className="text-gray-400 text-xs">
                                    {participants.length} {participants.length === 1 ? 'persona' : 'persone'}
                                </p>
                            </div>
                        </div>
                        
                        {participants.length > 5 && (
                            <button className="text-gray-400 hover:text-white transition-colors">
                                {isExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Participants List */}
                <div className="p-3 space-y-2 max-h-96 overflow-y-auto" style={{ 
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#f97316 transparent'
                }}>
                    {visibleParticipants.map((participant) => {
                        const isHost = participant.user_id === hostUserId || participant.is_host === 1;
                        const isBuffering = bufferingUsers.includes(participant.user_id);

                        return (
                            <div
                                key={participant.user_id}
                                className="flex items-center space-x-3 p-2 bg-gray-800/40 rounded-xl hover:bg-gradient-to-r hover:from-orange-900/20 hover:to-red-900/20 transition-all border border-transparent hover:border-orange-900/30 group"
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    {participant.image ? (
                                        <img
                                            src={participant.image}
                                            alt={participant.username}
                                            className="w-9 h-9 rounded-full ring-2 ring-orange-600/30 group-hover:ring-orange-600/60 transition-all"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-600/30 ring-2 ring-orange-600/30 group-hover:ring-orange-600/60 transition-all">
                                            <span className="text-white text-xs font-bold">
                                                {participant.username?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}

                                    {/* Online indicator */}
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 shadow-lg shadow-green-500/50" />
                                    
                                    {/* Host Crown Badge */}
                                    {isHost && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border border-yellow-300/50">
                                            <Crown className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-white font-medium text-sm truncate">
                                            {participant.username}
                                        </span>
                                    </div>

                                    {/* Status */}
                                    {isBuffering ? (
                                        <div className="flex items-center space-x-1 text-yellow-500 text-xs mt-0.5">
                                            <Loader className="w-3 h-3 animate-spin" />
                                            <span>Buffering...</span>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-xs mt-0.5">
                                            {isHost ? '👑 Host' : 'Online'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Show "X more" button quando collassato */}
                    {!isExpanded && hiddenCount > 0 && (
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="w-full p-2 bg-gray-800/40 rounded-xl hover:bg-orange-900/20 transition-all border border-orange-900/20 hover:border-orange-900/40 text-center group"
                        >
                            <span className="text-gray-400 text-sm group-hover:text-orange-500 transition-colors">
                                +{hiddenCount} {hiddenCount === 1 ? 'altro' : 'altri'}
                            </span>
                        </button>
                    )}
                </div>

                {participants.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nessun partecipante</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartyParticipantsPills;
