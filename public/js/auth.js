// Authentication utilities for ReWear
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Get auth token
    getToken() {
        return this.token;
    }

    // Set authentication data
    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Clear authentication data
    clearAuth() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Update user data
    updateUser(userData) {
        this.user = { ...this.user, ...userData };
        localStorage.setItem('user', JSON.stringify(this.user));
    }

    // Check if user is admin
    isAdmin() {
        return this.user && this.user.isAdmin;
    }

    // Get auth headers for API requests
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    // Validate token
    async validateToken() {
        if (!this.token) return false;

        try {
            const response = await fetch('/api/auth/me', {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.updateUser(data.user);
                return true;
            } else {
                this.clearAuth();
                return false;
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            this.clearAuth();
            return false;
        }
    }

    // Redirect if not authenticated
    requireAuth(redirectUrl = '/login') {
        if (!this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Redirect if not admin
    requireAdmin(redirectUrl = '/') {
        if (!this.isAdmin()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Redirect if already authenticated
    redirectIfAuthenticated(redirectUrl = '/dashboard') {
        if (this.isAuthenticated()) {
            window.location.href = redirectUrl;
            return true;
        }
        return false;
    }
}

// Global auth manager instance
window.authManager = new AuthManager();

// Form validation utilities
class FormValidator {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    static validateName(name) {
        return name.trim().length >= 2;
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static validatePasswordStrength(password) {
        let strength = 0;
        const feedback = [];

        if (password.length >= 8) strength += 1;
        else feedback.push('At least 8 characters');

        if (/[a-z]/.test(password)) strength += 1;
        else feedback.push('Lowercase letter');

        if (/[A-Z]/.test(password)) strength += 1;
        else feedback.push('Uppercase letter');

        if (/[0-9]/.test(password)) strength += 1;
        else feedback.push('Number');

        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        else feedback.push('Special character');

        return { strength, feedback };
    }

    static showFieldError(field, message) {
        const inputGroup = field.closest('.input-group');
        if (inputGroup) {
            inputGroup.classList.add('error');
            
            // Remove existing error message
            const existingError = inputGroup.querySelector('.field-error');
            if (existingError) {
                existingError.remove();
            }

            // Add new error message
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = message;
            inputGroup.appendChild(errorElement);
        }
    }

    static clearFieldError(field) {
        const inputGroup = field.closest('.input-group');
        if (inputGroup) {
            inputGroup.classList.remove('error');
            const errorElement = inputGroup.querySelector('.field-error');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }

    static validateForm(form) {
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        fields.forEach(field => {
            if (!this.validateRequired(field.value)) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }

            // Additional validation based on field type
            if (field.type === 'email' && field.value) {
                if (!this.validateEmail(field.value)) {
                    this.showFieldError(field, 'Please enter a valid email address');
                    isValid = false;
                }
            }

            if (field.type === 'password' && field.value) {
                if (!this.validatePassword(field.value)) {
                    this.showFieldError(field, 'Password must be at least 6 characters long');
                    isValid = false;
                }
            }
        });

        return isValid;
    }
}

// API request utilities
class ApiClient {
    constructor() {
        this.baseUrl = '/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(authManager.getToken() && { 'Authorization': `Bearer ${authManager.getToken()}` })
            }
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    async get(endpoint) {
        return this.request(endpoint);
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// Global API client instance
window.apiClient = new ApiClient();

// Toast notification utilities
class ToastManager {
    static show(message, type = 'info', duration = 5000) {
        const toastContainer = this.getOrCreateContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.remove();
        }, duration);

        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        return toast;
    }

    static getOrCreateContainer() {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    static getIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    static success(message, duration) {
        return this.show(message, 'success', duration);
    }

    static error(message, duration) {
        return this.show(message, 'error', duration);
    }

    static warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    static info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Global toast manager
window.toast = ToastManager;

// Loading state utilities
class LoadingManager {
    static show(container, message = 'Loading...') {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-overlay';
        loadingElement.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;

        if (container) {
            container.appendChild(loadingElement);
        } else {
            document.body.appendChild(loadingElement);
        }

        return loadingElement;
    }

    static hide(loadingElement) {
        if (loadingElement && loadingElement.parentNode) {
            loadingElement.parentNode.removeChild(loadingElement);
        }
    }

    static setButtonLoading(button, loading = true) {
        const btnText = button.querySelector('.btn-text');
        const btnLoading = button.querySelector('.btn-loading');

        if (loading) {
            button.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline-block';
        } else {
            button.disabled = false;
            if (btnText) btnText.style.display = 'inline-block';
            if (btnLoading) btnLoading.style.display = 'none';
        }
    }
}

// Global loading manager
window.loading = LoadingManager;

// Utility functions
window.utils = {
    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Format points
    formatPoints(points) {
        return points.toLocaleString();
    },

    // Truncate text
    truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Generate random ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy text: ', err);
            return false;
        }
    },

    // Get URL parameters
    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    // Set URL parameter
    setUrlParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.pushState({}, '', url);
    },

    // Remove URL parameter
    removeUrlParam(key) {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.pushState({}, '', url);
    }
};

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is on auth pages and redirect if already authenticated
    const authPages = ['/login', '/register'];
    const currentPath = window.location.pathname;
    
    if (authPages.includes(currentPath)) {
        authManager.redirectIfAuthenticated();
    }

    // Validate token on page load
    if (authManager.isAuthenticated()) {
        await authManager.validateToken();
    }
});

// Handle authentication state changes
window.addEventListener('storage', (e) => {
    if (e.key === 'token' || e.key === 'user') {
        // Reload page when auth state changes in another tab
        window.location.reload();
    }
}); 