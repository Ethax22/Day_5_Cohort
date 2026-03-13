/* ============================================
   API WRAPPER - Handle all backend requests
   ============================================ */

const API_BASE_URL = 'http://localhost:3000/api';

class APIClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }

    /**
     * Helper method for making fetch requests
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Add JWT token to Authorization header if it exists
        const token = localStorage.getItem('authToken');
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Handle non-JSON responses
            const contentType = response.headers.get('content-type');
            const data = contentType?.includes('application/json')
                ? await response.json()
                : await response.text();

            if (!response.ok) {
                throw new Error(data.message || `HTTP Error: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * GET request
     */
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     */
    post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * PUT request
     */
    put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    /**
     * DELETE request
     */
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * PATCH request
     */
    patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
}

// Create singleton instance
const api = new APIClient();

/* ============================================
   AUTH ENDPOINTS
   ============================================ */

const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (name, email, password) => api.post('/auth/register', { name, email, password }),
    getCurrentUser: () => api.get('/auth/me'),
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },
};

/* ============================================
   PROJECT ENDPOINTS
   ============================================ */

const projectAPI = {
    getAll: () => api.get('/projects'),
    getById: (id) => api.get(`/projects/${id}`),
    create: (name, description) => api.post('/projects', { name, description }),
    update: (id, data) => api.put(`/projects/${id}`, data),
    delete: (id) => api.delete(`/projects/${id}`),
    getCollaborators: (id) => api.get(`/projects/${id}/collaborators`),
    addCollaborator: (id, userId) => api.post(`/projects/${id}/collaborators`, { userId }),
    removeCollaborator: (id, userId) => api.delete(`/projects/${id}/collaborators/${userId}`),
};

/* ============================================
   TASK ENDPOINTS
   ============================================ */

const taskAPI = {
    getAll: (projectId) => api.get(`/projects/${projectId}/tasks`),
    getById: (projectId, id) => api.get(`/projects/${projectId}/tasks/${id}`),
    create: (projectId, title, description, assigneeId) =>
        api.post(`/projects/${projectId}/tasks`, { title, description, assigneeId }),
    update: (projectId, id, data) => api.put(`/projects/${projectId}/tasks/${id}`, data),
    updateStatus: (projectId, id, status) =>
        api.patch(`/projects/${projectId}/tasks/${id}`, { status }),
    delete: (projectId, id) => api.delete(`/projects/${projectId}/tasks/${id}`),
};

/* ============================================
   MESSAGE ENDPOINTS
   ============================================ */

const messageAPI = {
    getAll: (projectId) => api.get(`/projects/${projectId}/messages`),
    create: (projectId, content) =>
        api.post(`/projects/${projectId}/messages`, { content }),
};

/* ============================================
   PAYMENT ENDPOINTS
   ============================================ */

const paymentAPI = {
    createOrder: (planType) => api.post('/payments/create-order', { planType }),
    verifyPayment: (orderId, paymentId, signature) =>
        api.post('/payments/verify', { orderId, paymentId, signature }),
};
