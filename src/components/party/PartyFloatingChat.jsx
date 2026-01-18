import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Smile, X } from 'lucide-react';

const EMOJI_REACTIONS = ['❤️', '😂', '😮', '😢', '👍', '👏', '🔥'];

const PartyFloatingChat = ({ messages, onSendMessage, onSendReaction, currentTime, isOpen, onToggle }) => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

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
        <>
            {/* Chat Panel Overlay */}
            <div
                className={`
                    fixed top-0 right-0 h-full z-50
                    transition-all duration-500 ease-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
                style={{ width: '420px', maxWidth: '100vw' }}
            >
                {/* Backdrop Blur */}
                <div
                    className={`
                        absolute inset-0 bg-black/20 backdrop-blur-sm
                        transition-opacity duration-500
                        ${isOpen ? 'opacity-100' : 'opacity-0'}
                    `}
                    onClick={() => onToggle(false)}
                />

                {/* Chat Container */}
                <div className="relative h-full flex flex-col bg-black/90 backdrop-blur-sm border-l border-white/10 shadow-2xl">

                    {/* Header */}
                    <div className="flex-shrink-0 bg-gradient-to-b from-black via-black/60 to-transparent backdrop-blur-sm px-6 py-4 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black flex items-center gap-2">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-600">
                                        CHAT
                                    </span>
                                    <span className="px-2 py-0.5 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold rounded-md">
                                        PARTY
                                    </span>
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">
                                    {messages.length} {messages.length === 1 ? 'messaggio' : 'messaggi'}
                                </p>
                            </div>

                            <button
                                onClick={() => onToggle(false)}
                                className="w-10 h-10 rounded-full bg-black/50 hover:bg-red-600/20 flex items-center justify-center transition-all group"
                            >
                                <X className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto p-6 space-y-4"
                        style={{
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#f97316 transparent'
                        }}
                    >
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-3">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-600/10 to-red-600/10 flex items-center justify-center ring-1 ring-white/5">
                                    <MessageCircle className="w-10 h-10 text-orange-500/40" />
                                </div>
                                <p className="text-lg font-medium">Nessun messaggio</p>
                                <p className="text-sm text-center">Inizia la conversazione con gli altri partecipanti!</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className="flex space-x-3 animate-in slide-in-from-bottom duration-300"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        {msg.image ? (
                                            <img
                                                src={msg.image}
                                                alt={msg.username}
                                                className="w-10 h-10 rounded-full ring-2 ring-white/10"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-600/30 ring-2 ring-white/10">
                                                <span className="text-white text-sm font-bold">
                                                    {msg.username?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline space-x-2 mb-1">
                                            <span className="text-white font-semibold text-sm">
                                                {msg.username}
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                                {formatTime(msg.sent_at)}
                                            </span>
                                        </div>
                                        <div className="bg-black/50 backdrop-blur-sm rounded-2xl rounded-tl-none px-4 py-3 border border-white/10">
                                            <p className="text-gray-200 text-sm leading-relaxed break-words">
                                                {msg.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="flex-shrink-0 bg-black/80 backdrop-blur-sm p-6 border-t border-white/10">

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div className="mb-4 p-3 bg-black/50 rounded-xl backdrop-blur-sm border border-white/10 animate-in slide-in-from-bottom duration-200">
                                <span className="text-gray-400 text-xs font-medium mb-2 block">Reazioni veloci</span>
                                <div className="flex items-center justify-around">
                                    {EMOJI_REACTIONS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => handleEmojiClick(emoji)}
                                            className="text-2xl hover:scale-125 transition-transform active:scale-95"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message Input */}
                        <form onSubmit={handleSubmit} className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={`
                                    flex-shrink-0 w-11 h-11 flex items-center justify-center
                                    rounded-xl transition-all
                                    ${showEmojiPicker
                                    ? 'bg-gradient-to-br from-orange-600 to-red-600 shadow-lg shadow-orange-600/30'
                                    : 'bg-black/50 hover:bg-black/70'
                                }
                                    border border-white/10
                                `}
                            >
                                <Smile className={`w-5 h-5 ${showEmojiPicker ? 'text-white' : 'text-gray-400'}`} />
                            </button>

                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Scrivi un messaggio..."
                                maxLength={500}
                                className="flex-1 bg-black/50 text-white placeholder-gray-500 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 backdrop-blur-sm transition-all"
                            />

                            <button
                                type="submit"
                                disabled={!message.trim()}
                                className={`
                                    flex-shrink-0 w-11 h-11 flex items-center justify-center
                                    rounded-xl transition-all
                                    ${message.trim()
                                    ? 'bg-gradient-to-br from-orange-600 to-red-600 hover:scale-110 hover:shadow-lg hover:shadow-orange-600/40'
                                    : 'bg-gray-800/30 cursor-not-allowed opacity-30'
                                }
                                    border border-white/10
                                `}
                            >
                                <Send className="w-5 h-5 text-white" />
                            </button>
                        </form>

                        {message.length > 0 && (
                            <div className="flex items-center justify-between mt-3">
                                <p className="text-gray-500 text-xs animate-in fade-in duration-200">
                                    {message.length}/500
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
};

export default PartyFloatingChat;
