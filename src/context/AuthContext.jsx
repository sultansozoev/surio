import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Carica utente da localStorage al mount
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error('Error parsing stored user:', err);
                localStorage.removeItem(STORAGE_KEYS.USER);
            }
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            setError(null);
            setLoading(true);

            const response = await authAPI.login(username, password);
            const data = response.data;

            if (data.token) {
                const userData = {
                    user_id: data.user_id,
                    username: username,
                    token: data.token,
                };

                setUser(userData);
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
                return { success: true, data: userData };
            } else {
                throw new Error('Invalid credentials');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setError(null);
        localStorage.removeItem(STORAGE_KEYS.USER);
    };

    const checkAdmin = async () => {
        if (!user) return false;

        try {
            const response = await authAPI.isAdmin(user.user_id);
            return response.data?.[0]?.admin === 1;
        } catch (err) {
            console.error('Error checking admin status:', err);
            return false;
        }
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        checkAdmin,
        updateUser,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;