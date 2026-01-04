import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../search/SearchBar';

const Navbar = ({ isScrolled, onOpenLogin }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const profileMenuRef = useRef(null);
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log('Navbar mounted, onOpenLogin:', typeof onOpenLogin);
    }, [onOpenLogin]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setShowProfileMenu(false);
        navigate('/');
    };

    const handleLoginClick = () => {
        console.log('=== Login button clicked ===');
        console.log('onOpenLogin function:', onOpenLogin);
        if (onOpenLogin) {
            console.log('Calling onOpenLogin...');
            onOpenLogin();
        } else {
            console.error('onOpenLogin is not defined!');
        }
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/movies', label: 'Film' },
        { path: '/series', label: 'Serie TV' },
        { path: '/golden-globes', label: 'Golden Globes', highlight: true },
        ...(isAuthenticated ? [
            { path: '/my-list', label: 'La Mia Lista' },
            { path: '/party', label: 'Surio Party', highlight: true },
            { path: '/request', label: 'Richiedi' },
            { path: '/requests', label: 'Richieste' }
        ] : [])
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
            isScrolled ? 'bg-black/95 backdrop-blur-sm' : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}>
            <div className="max-w-[1920px] mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-9 h-9 bg-red-600 rounded-md flex items-center justify-center font-bold text-xl shadow-lg">
                            S
                        </div>
                        <span className="text-2xl font-bold text-white hidden sm:block">
                            Surio
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-4xl mx-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`whitespace-nowrap transition-all duration-200 ${
                                    link.highlight 
                                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-5 py-2 rounded-lg shadow-lg shadow-red-600/30'
                                        : isActive(link.path) 
                                            ? 'text-white font-semibold px-4 py-2' 
                                            : 'text-gray-300 hover:text-white px-4 py-2'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Section: Search and User Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Search Bar - nascosta nella pagina di ricerca */}
                        {location.pathname !== '/search' && (
                            <div className="hidden md:block">
                                <SearchBar />
                            </div>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="lg:hidden p-2 text-white hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors"
                            aria-label="Menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="relative" ref={profileMenuRef}>
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800/70 transition-all duration-200"
                                    aria-label="Menu profilo"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-sm font-bold">
                                            {user?.username?.[0]?.toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <svg className={`w-4 h-4 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* Profile Dropdown */}
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-3 w-64 bg-gradient-to-b from-gray-900 to-black rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden backdrop-blur-md">
                                        {/* User Info Section */}
                                        <div className="px-5 py-4 bg-gradient-to-r from-red-900/30 to-transparent border-b border-gray-700/50">
                                            <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">
                                                Connesso come
                                            </p>
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-base font-bold text-white truncate">
                                                    {user?.username}
                                                </p>
                                                {user?.isAdmin && (
                                                    <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-md shadow-lg shadow-red-600/30">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Menu Items */}
                                        <div className="py-2">
                                            <Link
                                                to="/my-list"
                                                className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-transparent hover:text-white transition-all duration-200"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                                <span>La Mia Lista</span>
                                            </Link>
                                            <Link
                                                to="/party"
                                                className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-transparent hover:text-white transition-all duration-200"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span>Surio Party</span>
                                            </Link>
                                            <Link
                                                to="/golden-globes"
                                                className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-transparent hover:text-white transition-all duration-200"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <svg className="w-5 h-5 flex-shrink-0 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>Golden Globes</span>
                                            </Link>
                                            <Link
                                                to="/request"
                                                className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-transparent hover:text-white transition-all duration-200"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                <span>Richiedi Contenuto</span>
                                            </Link>
                                            <Link
                                                to="/requests"
                                                className="flex items-center gap-3 px-5 py-3 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-transparent hover:text-white transition-all duration-200"
                                                onClick={() => setShowProfileMenu(false)}
                                            >
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <span>Richieste</span>
                                            </Link>
                                            
                                            {/* Divider */}
                                            <div className="my-2 border-t border-gray-700/50"></div>
                                            
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm text-gray-300 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-transparent hover:text-red-400 transition-all duration-200"
                                            >
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <span>Esci</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={handleLoginClick}
                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-5 py-2 rounded-lg transition-all duration-200 font-semibold shadow-lg shadow-red-600/30"
                            >
                                Accedi
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="lg:hidden border-t border-gray-700/50">
                        <div className="py-4 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                                        link.highlight
                                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold shadow-lg'
                                            : isActive(link.path) 
                                                ? 'bg-gray-800/70 text-white font-medium' 
                                                : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                    }`}
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Mobile Search - nascosta nella pagina di ricerca */}
                            {location.pathname !== '/search' && (
                                <div className="px-4 pt-4 pb-2">
                                    <SearchBar />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;