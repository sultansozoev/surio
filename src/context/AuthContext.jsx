import React, { createContext, useState, useEffect, useContext } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) === 0) {
            return cookie.substring(nameEQ.length, cookie.length);
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

const AuthContext = createContext(null);

export { AuthContext };

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
        // Carica utente dai cookie al mount
        const token = getCookie('jwt');
        const userId = getCookie('user');

        if (token && userId) {
            const userData = {
                user_id: userId,
                token: token,
            };
            setUser(userData);
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            setError(null);
            setLoading(true);

            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000';

            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            // Stesso controllo del codice vanilla JS
            if (data.message === 'Successfully logged-in!') {
                // Imposta i cookie esattamente come nel codice originale
                setCookie("jwt", data.token, 30);
                setCookie("user", data.user_id, 30);

                const userData = {
                    user_id: data.user_id,
                    username: username,
                    token: data.token,
                };

                setUser(userData);
                return { success: true,  userData };
            } else {
                throw new Error('Username o Password errati!');
            }
        } catch (err) {
            const errorMessage = err.message || 'Username o Password errati!';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setError(null);
        // Rimuovi i cookie invece di localStorage
        deleteCookie('jwt');
        deleteCookie('user');
    };

    const checkAdmin = async () => {
        if (!user) return false;

        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000';
            const response = await fetch(`${API_BASE_URL}/isAdmin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify({ user_id: user.user_id }),
            });

            const data = await response.json();
            return data?.[0]?.admin === 1;
        } catch (err) {
            console.error('Error checking admin status:', err);
            return false;
        }
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);

        // Aggiorna i cookie se necessario
        if (updates.token) {
            setCookie("jwt", updates.token, 30);
        }
        if (updates.user_id) {
            setCookie("user", updates.user_id, 30);
        }
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
