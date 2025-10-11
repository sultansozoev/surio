import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

// Hook per controllare se l'utente è admin
export const useIsAdmin = () => {
    const { user } = useAuth();
    return user?.admin || false;
};

// Hook per ottenere il token per le richieste API
export const useAuthToken = () => {
    const { token } = useAuth();
    return token;
};
