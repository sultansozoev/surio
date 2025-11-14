import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {Button} from '../components/common/Button';

const NotFound = () => {
    const [countdown, setCountdown] = useState(10);
    const navigate = useNavigate();

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
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center px-4 relative overflow-hidden">
            {/* Sfondo decorativo animato */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/30 to-black" />
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/8 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-orange-500/8 rounded-full blur-3xl animate-pulse"
                     style={{ animationDelay: '1.5s' }} />
                <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-rose-500/8 rounded-full blur-3xl animate-pulse"
                     style={{ animationDelay: '3s' }} />
                <div className="absolute inset-0 opacity-[0.015]"
                     style={{
                         backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                         backgroundSize: '40px 40px'
                     }}
                />
                {/* Particelle animate */}
                <div className="absolute top-20 left-10 w-4 h-4 bg-red-500/20 rounded-full animate-pulse"></div>
                <div className="absolute top-40 right-20 w-2 h-2 bg-red-400/20 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-40 left-20 w-3 h-3 bg-red-300/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-20 right-10 w-5 h-5 bg-red-600/20 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <div className="relative z-10 text-center max-w-2xl">
                {/* 404 Animation */}
                <div className="mb-8">
                    <div className="inline-flex items-center space-x-2 mb-4">
                        <div className="text-8xl md:text-9xl font-bold bg-gradient-to-br from-red-500 to-red-700 bg-clip-text text-transparent animate-bounce drop-shadow-2xl">
                            4
                        </div>
                        <div className="relative">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-xl shadow-red-600/50">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-950 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 md:w-8 md:h-8 text-red-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
                        </div>
                        <div className="text-8xl md:text-9xl font-bold bg-gradient-to-br from-red-500 to-red-700 bg-clip-text text-transparent animate-bounce drop-shadow-2xl" style={{ animationDelay: '0.1s' }}>
                            4
                        </div>
                    </div>

                    {/* Logo */}
                    <div className="flex items-center justify-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded flex items-center justify-center font-bold text-xl shadow-lg shadow-red-600/50">
                            S
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                            StreamFlix
                        </span>
                    </div>
                </div>

                {/* Error Message */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                        Oops! Pagina non trovata
                    </h1>
                    <p className="text-lg text-gray-300 mb-2">
                        La pagina che stai cercando sembra essere in pausa...
                    </p>
                    <p className="text-gray-400">
                        Forse è andata a prendere i popcorn? 🍿
                    </p>
                </div>

                {/* Countdown */}
                <div className="mb-8">
                    <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-6 inline-block border border-gray-800/50 shadow-xl">
                        <p className="text-gray-300 text-sm mb-3">Reindirizzamento automatico tra:</p>
                        <div className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                            {countdown}s
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                    <Button
                        onClick={handleGoHome}
                        variant="primary"
                        className="px-8 py-3 text-lg font-medium shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Torna alla Home
                    </Button>

                    <Button
                        onClick={handleGoBack}
                        variant="secondary"
                        className="px-8 py-3 text-lg font-medium bg-gray-800/50 backdrop-blur-sm border-gray-700/50 hover:bg-gray-700/50 transition-all"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Indietro
                    </Button>
                </div>

                {/* Quick Links */}
                <div className="border-t border-gray-800/50 pt-8">
                    <p className="text-gray-400 mb-4">O esplora queste sezioni:</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <Link to="/movies" className="text-red-400 hover:text-red-300 transition-colors font-medium">
                            Film
                        </Link>
                        <span className="text-gray-600">•</span>
                        <Link to="/series" className="text-red-400 hover:text-red-300 transition-colors font-medium">
                            Serie TV
                        </Link>
                        <span className="text-gray-600">•</span>
                        <Link to="/trending" className="text-red-400 hover:text-red-300 transition-colors font-medium">
                            Tendenze
                        </Link>
                    </div>
                </div>

                {/* Fun Fact */}
                <div className="mt-8 text-xs text-gray-500 bg-gray-900/40 backdrop-blur-sm rounded-lg p-4 border border-gray-800/30">
                    <p>💡 Curiosità: Il codice 404 significa "Non trovato" ed è uno dei codici di errore HTTP più famosi!</p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;