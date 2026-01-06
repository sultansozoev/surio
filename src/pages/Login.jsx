import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {Button} from '../components/common/Button';
import {Input} from '../components/common/Input';
import {Spinner} from '../components/common/Spinner';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            // Controlla prima il query parameter, poi location.state, infine default '/'
            const searchParams = new URLSearchParams(location.search);
            const fromQuery = searchParams.get('from');
            const redirectTo = fromQuery || location.state?.from || '/';
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
            // Controlla prima il query parameter, poi location.state, infine default '/'
            const searchParams = new URLSearchParams(location.search);
            const fromQuery = searchParams.get('from');
            const redirectTo = fromQuery || location.state?.from || '/';
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

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
                <Spinner size="large" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background decorativo animato */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-transparent to-transparent" />
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"
                     style={{ animationDelay: '1.5s' }} />
                <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl animate-pulse"
                     style={{ animationDelay: '3s' }} />
                <div className="absolute inset-0 opacity-[0.015]"
                     style={{
                         backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                         backgroundSize: '40px 40px'
                     }}
                />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg shadow-red-600/50">
                            S
                        </div>
                        <span className="text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                            Surio
                        </span>
                    </div>
                    <p className="text-gray-400">Accedi al tuo account per continuare</p>
                </div>

                {/* Login Form */}
                <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-800/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-600/10 border border-red-600/30 text-red-400 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
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
                                className="w-full bg-gray-800/50 backdrop-blur-sm border-gray-700/50 focus:border-red-500 focus:ring-red-500"
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
                                className="w-full bg-gray-800/50 backdrop-blur-sm border-gray-700/50 focus:border-red-500 focus:ring-red-500"
                                disabled={isLoading}
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={isLoading}
                            className="w-full py-3 text-lg font-medium shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all"
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
                </div>
            </div>
        </div>
    );
};

export default Login;