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

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000';

class AuthService {
    async login(username, password) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();

            if (data.message === 'Successfully logged-in!') {
                setCookie('jwt', data.token, 30);
                setCookie('user', data.user_id, 30);
                return { success: true, data };
            } else {
                return { success: false, message: data.message || 'Login failed' };
            }
        } else {
            const errorData = await response.json();
            return { success: false, message: errorData.message || 'Login failed' };
        }
    }

    async register(username, password) {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
        });

        return response.json();
    }

    async checkAdminStatus(userId) {
        const token = this.getToken();
        const response = await fetch(`${API_BASE_URL}/isAdmin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ user_id: userId }),
            credentials: 'include',
        });

        return response.json();
    }

    logout() {
        deleteCookie('jwt');
        deleteCookie('user');
    }

    getToken() {
        return getCookie('jwt');
    }

    getUserId() {
        return getCookie('user');
    }

    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch {
            return false;
        }
    }

    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}

export default new AuthService();
