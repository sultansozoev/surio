// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Spinner from '../components/common/Spinner';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect authenticated users
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            const redirectTo = location.state?.from || '/';
            navigate(redirectTo, { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!formData.username.trim() || !formData.password.trim()) {
            setError('Username e password sono richiesti');
            setIsLoading(false);
            return;
        }

        const result = await login(formData.username, formData.password);

        if (result.success) {
            const redirectTo = location.state?.from || '/';
            navigate(redirectTo, { replace: true });
        } else {
            setError(result.error || 'Credenziali non valide');
        }

        setIsLoading(false);
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if (error) setError('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    // Show loading spinner while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Spinner size="large" />
            </div>
        );
    }

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-gray-900/20"></div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center font-bold text-2xl">
                            S
                        </div>
                        <span className="text-4xl font-bold text-white">StreamFlix</span>
                    </div>
                    <p className="text-gray-400">Accedi al tuo account per continuare</p>
                </div>

                {/* Login Form */}
                <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-8 shadow-2xl border border-gray-800">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-600/20 border border-red-600/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <Input
                                id="username"
                                type="text"
                                name="username"
                                placeholder="Inserisci il tuo username"
                                value={formData.username}
                                onChange={handleChange}
                                onKeyPress={handleKeyPress}
                                required
                                autoComplete="username"
                                className="w-full bg-gray-800 border-gray-700 focus:border-red-500 focus:ring-red-500"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Inserisci la tua password"
                                value={formData.password}
                                onChange={handleChange}
                                onKeyPress={handleKeyPress}
                                required
                                autoComplete="current-password"
                                className="w-full bg-gray-800 border-gray-700 focus:border-red-500 focus:ring-red-500"
                                disabled={isLoading}
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isLoading}
                            className="w-full py-3 text-lg font-medium"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner size="small" className="mr-2" />
                                    Accesso in corso...
                                </>
                            ) : (
                                'Accedi'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Non hai un account?{' '}
                            <button
                                className="text-red-400 hover:text-red-300 transition-colors font-medium"
                                onClick={() => {/* Implementa registrazione se necessario */}}
                            >
                                Registrati qui
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-500 text-sm">
                    <p>© 2025 StreamFlix. Tutti i diritti riservati.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
