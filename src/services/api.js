import authService from './auth.services';

const API_URL = process.env.REACT_APP_API_URL || 'https://surio.ddns.net:4000';

class ApiService {
    constructor() {
        this.baseURL = API_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        console.log('🌐 API Request:', {
            url,
            method: options.method || 'GET',
            headers: options.headers
        });

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...authService.getAuthHeader(),
                ...options.headers,
            },
            credentials: 'include',
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                authService.logout();
                window.location.href = '/login';
                return;
            }

            if (!response.ok) {
                console.error('❌ API Error:', {
                    url,
                    status: response.status,
                    statusText: response.statusText
                });
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ API Response:', data);
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    get(endpoint, params) {
        let url = endpoint;

        if (params) {
            const queryString = new URLSearchParams(params).toString();
            url += `?${queryString}`;
        }

        return this.request(url, { method: 'GET' });
    }

    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiService();
