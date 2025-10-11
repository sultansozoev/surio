// src/pages/NotFound.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound = () => {
    const [countdown, setCountdown] = useState(10);
    const navigate = useNavigate();

    // Countdown timer for auto redirect
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute top-40 right-20 w-2 h-2 bg-red-400 rounded-full animate-pulse delay-100"></div>
                <div className="absolute bottom-40 left-20 w-3 h-3 bg-red-300 rounded-full animate-pulse delay-200"></div>
                <div className="absolute bottom-20 right-10 w-5 h-5 bg-red-600 rounded-full animate-pulse delay-300"></div>
            </div>

            <div className="relative z-10 text-center max-w-2xl">
                {/* 404 Animation */}
                <div className="mb-8">
                    <div className="inline-flex items-center space-x-2 mb-4">
                        <div className="text-8xl md:text-9xl font-bold text-red-600 animate-bounce">4</div>
                        <div className="relative">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-red-600 rounded-full flex items-center justify-center">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-black rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 md:w-8 md:h-8 text-red-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
                        </div>
                        <div className="text-8xl md:text-9xl font-bold text-red-600 animate-bounce delay-100">4</div>
                    </div>

                    {/* StreamFlix Logo */}
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-xl">
                            S
                        </div>
                        <span className="text-2xl font-bold text-white">StreamFlix</span>
                    </div>
                </div>

                {/* Error Message */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Oops! Pagina non trovata
                    </h1>
                    <p className="text-lg text-gray-400 mb-2">
                        La pagina che stai cercando sembra essere in pausa...
                    </p>
                    <p className="text-gray-500">
                        Forse è andata a prendere i popcorn? 🍿
                    </p>
                </div>

                {/* Countdown */}
                <div className="mb-8">
                    <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-4 inline-block border border-gray-800">
                        <p className="text-gray-300 text-sm mb-2">Reindirizzamento automatico tra:</p>
                        <div className="text-3xl font-bold text-red-500">
                            {countdown}s
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                    <Button
                        onClick={handleGoHome}
                        variant="primary"
                        className="px-8 py-3 text-lg font-medium"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Torna alla Home
                    </Button>

                    <Button
                        onClick={handleGoBack}
                        variant="secondary"
                        className="px-8 py-3 text-lg font-medium"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Indietro
                    </Button>
                </div>

                {/* Quick Links */}
                <div className="border-t border-gray-800 pt-8">
                    <p className="text-gray-400 mb-4">O esplora queste sezioni:</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <Link to="/movies" className="text-red-400 hover:text-red-300 transition-colors">
                            Film
                        </Link>
                        <span className="text-gray-600">•</span>
                        <Link to="/series" className="text-red-400 hover:text-red-300 transition-colors">
                            Serie TV
                        </Link>
                        <span className="text-gray-600">•</span>
                        <Link to="/trending" className="text-red-400 hover:text-red-300 transition-colors">
                            Tendenze
                        </Link>
                    </div>
                </div>

                {/* Fun Fact */}
                <div className="mt-8 text-xs text-gray-600">
                    <p>💡 Curiosità: Il codice 404 significa "Non trovato" ed è uno dei codici di errore HTTP più famosi!</p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
