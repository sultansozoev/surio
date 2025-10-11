// src/components/layout/Navbar.jsx
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

    // Chiudi menu quando clicchi fuori
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

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/movies', label: 'Film' },
        { path: '/series', label: 'Serie TV' },
        ...(isAuthenticated ? [{ path: '/my-list', label: 'La Mia Lista' }] : [])
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
            isScrolled ? 'bg-black/95 backdrop-blur-sm' : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}>
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-xl">
                            S
                        </div>
                        <span className="text-2xl font-bold text-white hidden sm:block">
              StreamFlix
            </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`transition-colors duration-200 hover:text-gray-300 ${
                                    isActive(link.path) ? 'text-white font-medium' : 'text-gray-400'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Search and User Actions */}
                    <div className="flex items-center space-x-4">
                        {/* Search Bar */}
                        <div className="hidden md:block">
                            <SearchBar />
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="lg:hidden p-2 text-white hover:text-gray-300"
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
                                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                                    </div>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* Profile Dropdown */}
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-700 py-1">
                                        <div className="px-4 py-2 border-b border-gray-700">
                                            <p className="text-sm text-gray-300">Connesso come</p>
                                            <p className="font-medium">{user?.username}</p>
                                            {user?.isAdmin && (
                                                <span className="inline-block mt-1 px-2 py-1 bg-red-600 text-xs rounded">
                          Admin
                        </span>
                                            )}
                                        </div>
                                        <Link
                                            to="/my-list"
                                            className="block px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            La Mia Lista
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
                                        >
                                            Esci
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={onOpenLogin}
                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors font-medium"
                            >
                                Accedi
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="lg:hidden mt-4 pb-4 border-t border-gray-700">
                        <div className="space-y-2 mt-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`block px-4 py-2 rounded-lg transition-colors ${
                                        isActive(link.path) ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                                    }`}
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}

                            {/* Mobile Search */}
                            <div className="px-4 py-2">
                                <SearchBar />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
