const API_BASE_URL = 'http://127.0.0.1:5000/api';

class APIClient {
    constructor(baseURL = API_BASE_URL) {
        this.baseURL = baseURL;
    }


    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };


        const token = localStorage.getItem('authToken');
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });


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


    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
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


    patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
}


const api = new APIClient();



const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (name, email, password) => api.post('/auth/register', { name, email, password }),
    logout: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    },
};



const projectAPI = {
    getAll: () => api.get('/projects'),
    getById: (id) => api.get(`/projects/${id}`),
    create: (name, description) => api.post('/projects', { name, description }),
    delete: (id) => api.delete(`/projects/${id}`),
};



const taskAPI = {
    getAll: (projectId) => api.get(`/projects/${projectId}/tasks`),
    create: (projectId, title, description, priority, assigneeId) =>
        api.post(`/projects/${projectId}/tasks`, { title, description, priority, assigneeId }),
    updateStatus: (projectId, id, status) =>
        api.put(`/projects/${projectId}/tasks/${id}/status`, { status }),
};



const messageAPI = {
    getAll: (projectId) => api.get(`/projects/${projectId}/messages`),
    create: (projectId, content, type = 'text', language = null) =>
        api.post(`/projects/${projectId}/messages`, { content, type, language }),
};







const paymentAPI = {
    createOrder: (planType) => api.post('/payments/create-order', { planType }),
    verifyPayment: (paymentDetails) => api.post('/payments/verify-payment', paymentDetails),
};
