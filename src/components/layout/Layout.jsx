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
        console.log('Opening login modal');
        setShowRegisterModal(false);
        setShowLoginModal(true);
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
            {/*
            <RegisterModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSwitchToLogin={handleSwitchToLogin}
            />
            */}

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