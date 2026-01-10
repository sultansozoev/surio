import React, { createContext, useState, useEffect, useContext } from 'react';

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

    // Funzione helper per controllare se il token è scaduto
    const isTokenExpired = (token) => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp * 1000; // Converti in millisecondi
            return Date.now() >= exp;
        } catch (error) {
            console.error('Error parsing token:', error);
            return true; // Se non riusciamo a parsare, consideriamolo scaduto
        }
    };

    useEffect(() => {
        const loadUserData = async () => {
            const token = getCookie('jwt');
            const userId = getCookie('user');
            const savedUsername = getCookie('username');
            const savedIsAdmin = getCookie('isAdmin');

            if (token && userId) {
                // Verifica se il token è scaduto
                if (isTokenExpired(token)) {
                    console.warn('🔒 Token scaduto, effettuo logout');
                    logout();
                    setLoading(false);
                    return;
                }

                // Carica immediatamente da cookie se disponibili
                if (savedUsername) {
                    const userData = {
                        user_id: userId,
                        username: savedUsername,
                        isAdmin: savedIsAdmin === '1',
                        token: token,
                    };
                    setUser(userData);
                    setLoading(false);
                    return;
                }

                // Fallback a dati base se non ci sono cookie username
                const userData = {
                    user_id: userId,
                    username: 'Utente',
                    isAdmin: false,
                    token: token,
                };
                setUser(userData);
            }
            setLoading(false);
        };

        loadUserData();
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

            if (data.message === 'Successfully logged-in!') {
                setCookie("jwt", data.token, 30);
                setCookie("user", data.user_id, 30);
                setCookie("username", username, 30);

                const userData = {
                    user_id: data.user_id,
                    username: username,
                    token: data.token,
                };

                // Verifica se l'utente è admin
                try {
                    const adminResponse = await fetch(`${API_BASE_URL}/isAdmin`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${data.token}`,
                        },
                        body: JSON.stringify({ user_id: data.user_id }),
                    });

                    if (adminResponse.ok) {
                        const adminData = await adminResponse.json();
                        const isAdmin = adminData?.[0]?.admin === 1;
                        userData.isAdmin = isAdmin;
                        setCookie("isAdmin", isAdmin ? '1' : '0', 30);
                    }
                } catch (error) {
                    console.error('Error checking admin status:', error);
                    userData.isAdmin = false;
                }

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
        deleteCookie('jwt');
        deleteCookie('user');
        deleteCookie('username');
        deleteCookie('isAdmin');
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
