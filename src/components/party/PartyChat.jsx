import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile } from 'lucide-react';
import { Button } from '../common/Button';

const EMOJI_REACTIONS = ['❤️', '😂', '😮', '😢', '👍', '👏', '🔥'];

const PartyChat = ({ messages, onSendMessage, onSendReaction, currentTime }) => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedMessage = message.trim();
        
        if (!trimmedMessage || trimmedMessage.length > 500) return;

        onSendMessage(trimmedMessage);
        setMessage('');
    };

    const handleEmojiClick = (emoji) => {
        onSendReaction(emoji, currentTime);
        setShowEmojiPicker(false);
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl overflow-hidden border border-orange-900/30 shadow-xl shadow-red-900/20">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 px-4 py-3 border-b border-orange-900/30 backdrop-blur-sm">
                <h3 className="text-white font-semibold">Chat Party</h3>
                <p className="text-gray-400 text-sm">{messages.length} messaggi</p>
            </div>

            {/* Messages */}
            <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            >
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p>Nessun messaggio ancora</p>
                        <p className="text-sm mt-2">Inizia la conversazione!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className="flex space-x-3">
                            {/* Avatar */}
                            {msg.image ? (
                                <img
                                    src={msg.image}
                                    alt={msg.username}
                                    className="w-8 h-8 rounded-full flex-shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-600/50">
                                    <span className="text-white text-sm font-semibold">
                                        {msg.username?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}

                            {/* Message */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-white font-medium text-sm">
                                        {msg.username}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                        {formatTime(msg.sent_at)}
                                    </span>
                                </div>
                                <p className="text-gray-300 text-sm mt-1 break-words">
                                    {msg.message}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 p-4 border-t border-orange-900/30 backdrop-blur-sm">
                {/* Emoji Picker */}
                {showEmojiPicker && (
                    <div className="mb-3 flex items-center space-x-2 p-2 bg-gray-700/50 rounded-xl backdrop-blur-sm border border-orange-900/30">
                        <span className="text-gray-400 text-sm">Reazioni veloci:</span>
                        {EMOJI_REACTIONS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => handleEmojiClick(emoji)}
                                className="text-2xl hover:scale-125 transition-transform"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                {/* Message Input */}
                <form onSubmit={handleSubmit} className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-700/50 hover:bg-gradient-to-r hover:from-orange-900/30 hover:to-red-900/30 rounded-xl transition-all border border-orange-900/20"
                    >
                        <Smile className="w-5 h-5 text-gray-400" />
                    </button>

                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Scrivi un messaggio..."
                        maxLength={500}
                        className="flex-1 bg-gray-700/50 text-white border border-orange-900/30 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 backdrop-blur-sm transition-all"
                    />

                    <Button
                        type="submit"
                        disabled={!message.trim()}
                        className="flex-shrink-0 w-10 h-10 !p-0 flex items-center justify-center"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </form>

                <p className="text-gray-500 text-xs mt-2">
                    {message.length}/500 caratteri
                </p>
            </div>
        </div>
    );
};

export default PartyChat;
