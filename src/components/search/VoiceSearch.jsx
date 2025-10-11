import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';

const VoiceSearch = ({ onResult, onError }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Check if browser supports Speech Recognition
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();

            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'it-IT';

            recognitionRef.current.onstart = () => {
                setIsListening(true);
            };

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setTranscript(finalTranscript || interimTranscript);

                if (finalTranscript) {
                    onResult?.(finalTranscript.trim());
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);

                let errorMessage = 'Errore nel riconoscimento vocale';
                switch (event.error) {
                    case 'no-speech':
                        errorMessage = 'Nessun input vocale rilevato';
                        break;
                    case 'audio-capture':
                        errorMessage = 'Microfono non disponibile';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Permesso microfono negato';
                        break;
                }

                onError?.(errorMessage);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error('Error starting recognition:', error);
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    if (!isSupported) {
        return null; // Don't render if not supported
    }

    return (
        <div className="relative">
            <button
                onClick={toggleListening}
                disabled={!isSupported}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                    isListening
                        ? 'bg-red-600 text-white animate-pulse'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } ${!isSupported ? 'cursor-not-allowed opacity-50' : ''}`}
                aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
            >
                {isListening ? (
                    <MicOff className="h-5 w-5" />
                ) : (
                    <Mic className="h-5 w-5" />
                )}
            </button>

            {/* Transcript Display */}
            {isListening && transcript && (
                <div className="absolute top-full mt-2 right-0 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white shadow-lg">
                    {transcript}
                </div>
            )}

            {/* Listening Indicator */}
            {isListening && (
                <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
                </div>
            )}
        </div>
    );
};

export default VoiceSearch;