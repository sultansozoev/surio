import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Smile, X } from 'lucide-react';

const EMOJI_REACTIONS = ['❤️', '😂', '😮', '😢', '👍', '👏', '🔥'];

const PartyFloatingChat = ({ messages, onSendMessage, onSendReaction, currentTime, newMessagesCount = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [localNewMessages, setLocalNewMessages] = useState(0);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Reset counter quando apri la chat
    useEffect(() => {
        if (isOpen) {
            setLocalNewMessages(0);
        }
    }, [isOpen]);

    // Conta nuovi messaggi quando la chat è chiusa
    useEffect(() => {
        if (!isOpen && messages.length > 0) {
            setLocalNewMessages(prev => prev + 1);
        }
    }, [messages.length, isOpen]);

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
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    fixed right-6 bottom-40 z-50
                    w-14 h-14 rounded-full
                    bg-gradient-to-br from-orange-600 to-red-600
                    shadow-2xl shadow-orange-600/50
                    flex items-center justify-center
                    transition-all duration-300 hover:scale-110
                    border-2 border-white/10
                    ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
                `}
            >
                <MessageCircle className="w-6 h-6 text-white" />
                
                {/* Badge per nuovi messaggi */}
                {localNewMessages > 0 && !isOpen && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-black animate-pulse">
                        <span className="text-white text-xs font-bold">
                            {localNewMessages > 9 ? '9+' : localNewMessages}
                        </span>
                    </div>
                )}
            </button>

            {/* Chat Panel Overlay */}
            <div
                className={`
                    fixed top-0 right-0 h-full z-40
                    transition-all duration-500 ease-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
                style={{ width: '450px', maxWidth: '100vw' }}
            >
                {/* Backdrop Blur */}
                <div 
                    className={`
                        absolute inset-0 bg-black/40 backdrop-blur-xl
                        transition-opacity duration-500
                        ${isOpen ? 'opacity-100' : 'opacity-0'}
                    `}
                    onClick={() => setIsOpen(false)}
                />

                {/* Chat Container */}
                <div className="relative h-full flex flex-col bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 border-l border-orange-900/30 shadow-2xl">
                    
                    {/* Header */}
                    <div className="flex-shrink-0 bg-gradient-to-r from-gray-800/80 via-gray-900/80 to-gray-800/80 px-6 py-4 border-b border-orange-900/30 backdrop-blur-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold text-lg flex items-center space-x-2">
                                    <MessageCircle className="w-5 h-5 text-orange-500" />
                                    <span>Chat Party</span>
                                </h3>
                                <p className="text-gray-400 text-sm mt-1">
                                    {messages.length} {messages.length === 1 ? 'messaggio' : 'messaggi'}
                                </p>
                            </div>
                            
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 rounded-full bg-gray-800/50 hover:bg-red-600/20 flex items-center justify-center transition-all group"
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
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-600/20 to-red-600/20 flex items-center justify-center">
                                    <MessageCircle className="w-8 h-8 text-orange-500/50" />
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
                                                className="w-10 h-10 rounded-full ring-2 ring-orange-600/30"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-600/30 ring-2 ring-orange-600/30">
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
                                        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl rounded-tl-none px-4 py-3 border border-orange-900/20">
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
                    <div className="flex-shrink-0 bg-gradient-to-r from-gray-800/80 via-gray-900/80 to-gray-800/80 p-6 border-t border-orange-900/30 backdrop-blur-lg">
                        
                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div className="mb-4 p-3 bg-gray-800/60 rounded-xl backdrop-blur-sm border border-orange-900/30 animate-in slide-in-from-bottom duration-200">
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
                                        : 'bg-gray-800/60 hover:bg-gray-700/60'
                                    }
                                    border border-orange-900/20
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
                                className="flex-1 bg-gray-800/60 text-white placeholder-gray-500 border border-orange-900/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 backdrop-blur-sm transition-all"
                            />

                            <button
                                type="submit"
                                disabled={!message.trim()}
                                className={`
                                    flex-shrink-0 w-11 h-11 flex items-center justify-center 
                                    rounded-xl transition-all
                                    ${message.trim() 
                                        ? 'bg-gradient-to-br from-orange-600 to-red-600 hover:shadow-lg hover:shadow-orange-600/50 hover:scale-105' 
                                        : 'bg-gray-800/30 cursor-not-allowed opacity-50'
                                    }
                                    border border-orange-900/20
                                `}
                            >
                                <Send className="w-5 h-5 text-white" />
                            </button>
                        </form>

                        <div className="flex items-center justify-between mt-3">
                            <p className="text-gray-500 text-xs">
                                {message.length}/500 caratteri
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default PartyFloatingChat;
