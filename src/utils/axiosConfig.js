import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000';

// Funzioni per gestire i cookie (duplicati da AuthContext per evitare dipendenze circolari)
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

// Crea un'istanza axios con configurazione base
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor: aggiungi automaticamente il token JWT
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getCookie('jwt');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: gestisci errori 401/403 (token scaduto)
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Token scaduto o non valido
            console.error('Token scaduto o non valido. Effettua nuovamente il login.');
            
            // Pulisci i cookie
            deleteCookie('jwt');
            deleteCookie('user');
            deleteCookie('username');
            deleteCookie('isAdmin');
            
            // Reindirizza al login con lo stato della pagina corrente
            if (!window.location.pathname.includes('/login')) {
                const currentPath = window.location.pathname;
                window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
