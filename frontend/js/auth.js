/* ============================================
   AUTHENTICATION - Token & User Management
   ============================================ */

class Auth {
    constructor() {
        this.user = this.getStoredUser();
        this.token = localStorage.getItem('authToken');
        this.isAuthenticated = !!this.token;
    }

    /**
     * Store user data in localStorage
     */
    setUser(user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
    }

    /**
     * Get stored user from localStorage
     */
    getStoredUser() {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error retrieving user:', error);
            return null;
        }
    }

    /**
     * Store authentication token
     */
    setToken(token) {
        this.token = token;
        this.isAuthenticated = !!token;
        localStorage.setItem('authToken', token);
    }

    /**
     * Get authentication token
     */
    getToken() {
        return localStorage.getItem('authToken');
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            const response = await authAPI.login(email, password);
            
            if (response.token) {
                this.setToken(response.token);
                this.setUser(response.user);
                this.isAuthenticated = true;
                return response;
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    /**
     * Register new user
     */
    async register(name, email, password) {
        try {
            const response = await authAPI.register(name, email, password);
            
            if (response.token) {
                this.setToken(response.token);
                this.setUser(response.user);
                this.isAuthenticated = true;
                return response;
            }
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    /**
     * Verify current session and fetch user data
     */
    async verifySession() {
        try {
            if (!this.isAuthenticated) {
                return false;
            }

            const response = await authAPI.getCurrentUser();
            if (response.user) {
                this.setUser(response.user);
                return true;
            }
        } catch (error) {
            console.error('Session verification failed:', error);
            this.logout();
            return false;
        }
    }

    /**
     * Logout user and clear stored data
     */
    logout() {
        authAPI.logout();
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        window.location.href = '/login.html';
    }

    /**
     * Check if user is authenticated
     */
    isLoggedIn() {
        return this.isAuthenticated && !!this.token;
    }

    /**
     * Get current user data
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Check if user is premium
     */
    isPremium() {
        return this.user?.plan === 'premium';
    }

    /**
     * Refresh user data
     */
    async refreshUser() {
        try {
            const response = await authAPI.getCurrentUser();
            if (response.user) {
                this.setUser(response.user);
            }
            return response.user;
        } catch (error) {
            console.error('Failed to refresh user:', error);
            throw error;
        }
    }
}

// Create singleton instance
const auth = new Auth();

/* ============================================
   Initialize auth on page load
   ============================================ */

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is authenticated
    if (!auth.isLoggedIn()) {
        // Redirect to login if not authenticated
        if (!window.location.pathname.includes('login') && !window.location.pathname.includes('index')) {
            window.location.href = '/login.html';
        }
    } else {
        // Verify session is still valid
        const isValid = await auth.verifySession();
        if (!isValid) {
            window.location.href = '/login.html';
        }
    }
});
