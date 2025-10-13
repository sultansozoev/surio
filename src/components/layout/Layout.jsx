// src/components/layout/Layout.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import LoginModal from '../auth/LoginModal';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    // Gestione scroll per effetti navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Chiudi modal quando utente si autentica
    useEffect(() => {
        if (isAuthenticated) {
            setShowLoginModal(false);
            setShowRegisterModal(false);
        }
    }, [isAuthenticated]);

    // Determina se mostrare il footer
    const isWatchPage = location.pathname.startsWith('/watch/');
    const isFullscreenPage = isWatchPage;

    // Gestione apertura login modal
    const handleOpenLogin = () => {
        console.log('=== handleOpenLogin called ===');
        console.log('Current showLoginModal:', showLoginModal);
        setShowRegisterModal(false);
        setShowLoginModal(true);
        console.log('showLoginModal set to true');
    };

    const handleCloseLogin = () => {
        setShowLoginModal(false);
    };

    // Gestione switch a registrazione
    const handleSwitchToRegister = () => {
        setShowLoginModal(false);
        setShowRegisterModal(true);
        // TODO: Implementare RegisterModal component
        console.log('TODO: Implementare modal di registrazione');
    };

    // Gestione switch a login da registrazione
    const handleSwitchToLogin = () => {
        setShowRegisterModal(false);
        setShowLoginModal(true);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navbar - nascosta nelle pagine fullscreen */}
            {!isFullscreenPage && (
                <Navbar
                    isScrolled={isScrolled}
                    onOpenLogin={handleOpenLogin}
                />
            )}

            {/* Main Content */}
            <main className={`${!isFullscreenPage ? 'pt-16' : ''}`}>
                <div className="relative">
                    {children}
                </div>
            </main>

            {/* Footer - nascosto nelle pagine fullscreen */}
            {!isFullscreenPage && <Footer />}

            {/* Login Modal */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={handleCloseLogin}
                onSwitchToRegister={handleSwitchToRegister}
            />

            {/* Register Modal - TODO: Creare questo componente */}
            {showRegisterModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="relative w-full max-w-md mx-4">
                        <button
                            onClick={() => setShowRegisterModal(false)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="bg-gray-900 rounded-lg shadow-xl p-8 border border-gray-700">
                            <h2 className="text-3xl font-bold text-white mb-6">Registrazione</h2>
                            <p className="text-gray-400 mb-4">Funzionalità in arrivo...</p>
                            <button
                                onClick={handleSwitchToLogin}
                                className="text-red-600 hover:text-red-500 text-sm"
                            >
                                Hai già un account? Accedi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading overlay globale se necessario */}
            <div id="loading-overlay" className="hidden fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>

            {/* Toast notifications container */}
            <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2">
                {/* I toast vengono inseriti qui dinamicamente */}
            </div>
        </div>
    );
};

export default Layout;