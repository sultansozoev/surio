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
            console.log('📡 Making fetch request to:', url);
            const response = await fetch(url, config);
            console.log('📨 Response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            if (response.status === 401) {
                console.warn('🔒 Unauthorized - redirecting to login');
                authService.logout();
                window.location.href = '/login';
                return;
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error:', {
                    url,
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('⚠️ Non-JSON response:', text);
                throw new Error('Response is not JSON');
            }

            const data = await response.json();
            console.log('✅ API Response:', data);
            return data;
        } catch (error) {
            console.error('💥 API request failed:', {
                endpoint,
                error: error.message,
                stack: error.stack
            });
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

// Party API methods
class PartyApiService extends ApiService {
    createParty(data) {
        return this.post('/party/create', data);
    }

    getPartyInfo(code) {
        return this.get(`/party/${code}`);
    }

    endParty(partyId) {
        return this.post(`/party/${partyId}/end`, {});
    }

    getPartyMessages(partyId, params = {}) {
        return this.get(`/party/${partyId}/messages`, params);
    }

    getActiveParties() {
        return this.get('/party/active');
    }

    getUserActiveParties() {
        return this.get('/party/user/active');
    }

    sendJoinRequest(partyCode) {
        return this.post('/party/join-request', { party_code: partyCode });
    }

    respondToJoinRequest(requestId, accept) {
        return this.post('/party/join-request/respond', { 
            request_id: requestId, 
            accept 
        });
    }

    getPendingRequests(partyId) {
        return this.get(`/party/${partyId}/requests`);
    }
}

export const api = new ApiService();
export const partyApi = new PartyApiService();
