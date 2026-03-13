
class Auth {
    constructor() {
        this.user = this.getStoredUser();
        this.token = localStorage.getItem('authToken');
        this.isAuthenticated = !!this.token;
        this.checkRedirection();
    }

    setUser(user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
    }

    getStoredUser() {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error retrieving user:', error);
            return null;
        }
    }

    setToken(token) {
        this.token = token;
        this.isAuthenticated = !!token;
        localStorage.setItem('authToken', token);
    }

    getToken() {
        return localStorage.getItem('authToken');
    }

    async login(email, password) {
        try {
            const response = await authAPI.login(email, password);
            
            if (response.token) {
                this.setToken(response.token);
                // Extract all fields except token to store as user data
                const { token, ...userData } = response;
                this.setUser(userData);
                this.isAuthenticated = true;
                
                // Redirection is handled by checkRedirection or manually after successful call
                return response;
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    async register(name, email, password) {
        try {
            const response = await authAPI.register(name, email, password);
            
            if (response.token) {
                this.setToken(response.token);
                const { token, ...userData } = response;
                this.setUser(userData);
                this.isAuthenticated = true;
                return response;
            }
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    logout() {
        authAPI.logout();
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        
        // Use relative paths for better file:// support
        const currentPath = window.location.pathname;
        if (!currentPath.endsWith('login.html')) {
            window.location.href = 'login.html';
        }
    }

    isLoggedIn() {
        return this.isAuthenticated && !!this.token && !!this.user;
    }

    getCurrentUser() {
        return this.user;
    }

    isPremium() {
        return this.user?.plan === 'premium';
    }

    checkRedirection() {
        const path = window.location.pathname;
        const isAuthPage = path.endsWith('login.html') || path.endsWith('index.html') || path === '/' || path === '';
        
        if (this.isLoggedIn()) {
            if (isAuthPage) {
                window.location.href = 'dashboard.html';
            }
        } else {
            if (!isAuthPage) {
                window.location.href = 'login.html';
            }
        }
    }
}

const auth = new Auth();
