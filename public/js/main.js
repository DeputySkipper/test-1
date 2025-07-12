// Main JavaScript for ReWear
class ReWearApp {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('token');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.loadFeaturedItems();
        this.setupSearch();
    }

    setupEventListeners() {
        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');

        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => this.handleSearch());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch();
                }
            });
        }

        // User menu functionality
        const userMenuBtn = document.getElementById('userMenuBtn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', () => this.toggleUserMenu());
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                this.closeUserMenu();
            }
        });
    }

    async checkAuthStatus() {
        if (this.token) {
            try {
                const response = await fetch('/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    this.currentUser = data.user;
                    this.updateUIForAuthenticatedUser();
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                this.logout();
            }
        } else {
            this.updateUIForGuestUser();
        }
    }

    updateUIForAuthenticatedUser() {
        const userMenu = document.getElementById('userMenu');
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');

        if (userMenu && userMenuBtn && userDropdown) {
            // Update user menu button
            userMenuBtn.innerHTML = `
                <img src="${this.currentUser.profilePicture || '/images/default-avatar.png'}" 
                     alt="${this.currentUser.name}" 
                     class="user-avatar" 
                     style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
            `;

            // Update dropdown menu
            userDropdown.innerHTML = `
                <div class="dropdown-header">
                    <strong>${this.currentUser.name}</strong>
                    <small>${this.currentUser.points} points</small>
                </div>
                <a href="/dashboard" class="dropdown-item">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </a>
                <a href="/profile" class="dropdown-item">
                    <i class="fas fa-user"></i> Profile
                </a>
                <a href="/add-item" class="dropdown-item">
                    <i class="fas fa-plus"></i> Add Item
                </a>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" onclick="app.logout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            `;
        }

        // Update navigation
        this.updateNavigation();
    }

    updateUIForGuestUser() {
        const userMenu = document.getElementById('userMenu');
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');

        if (userMenu && userMenuBtn && userDropdown) {
            userMenuBtn.innerHTML = '<i class="fas fa-user"></i>';
            userDropdown.innerHTML = `
                <a href="/login" class="dropdown-item">Login</a>
                <a href="/register" class="dropdown-item">Register</a>
            `;
        }
    }

    updateNavigation() {
        const navLinks = document.querySelectorAll('.nav-list a');
        navLinks.forEach(link => {
            if (this.currentUser) {
                // Show additional nav items for authenticated users
                if (link.textContent === 'Browse') {
                    link.href = '/browse';
                }
            }
        });
    }

    async loadFeaturedItems() {
        const featuredItemsContainer = document.getElementById('featuredItems');
        if (!featuredItemsContainer) return;

        try {
            const response = await fetch('/api/items?limit=8&sortBy=views&sortOrder=desc');
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                featuredItemsContainer.innerHTML = data.items.map(item => this.createItemCard(item)).join('');
            } else {
                featuredItemsContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-tshirt"></i>
                        <h3>No items available</h3>
                        <p>Be the first to list an item!</p>
                        <a href="/add-item" class="btn btn-primary">Add Your First Item</a>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Failed to load featured items:', error);
            featuredItemsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Failed to load items</h3>
                    <p>Please try again later.</p>
                </div>
            `;
        }
    }

    createItemCard(item) {
        return `
            <div class="item-card card-hover">
                <div class="item-image">
                    <img src="${item.images[0] || '/images/placeholder.jpg'}" alt="${item.title}">
                    <div class="item-badge">${item.category}</div>
                </div>
                <div class="item-content">
                    <h3 class="item-title">${item.title}</h3>
                    <p class="item-description">${item.description.substring(0, 100)}${item.description.length > 100 ? '...' : ''}</p>
                    <div class="item-meta">
                        <span class="item-points">${item.pointsValue} points</span>
                        <div class="item-user">
                            <img src="${item.uploaderId.profilePicture || '/images/default-avatar.png'}" 
                                 alt="${item.uploaderId.name}" 
                                 class="user-avatar">
                            <span>${item.uploaderId.name}</span>
                        </div>
                    </div>
                    <div class="item-actions">
                        <a href="/item/${item._id}" class="btn btn-primary btn-sm">View Details</a>
                        ${this.currentUser ? `
                            <button class="btn btn-outline btn-sm" onclick="app.toggleLike('${item._id}')">
                                <i class="fas fa-heart"></i> ${item.likeCount || 0}
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            // Debounce search input
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });
        }
    }

    handleSearch() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value.trim()) {
            window.location.href = `/browse?search=${encodeURIComponent(searchInput.value.trim())}`;
        }
    }

    async performSearch(query) {
        if (!query.trim()) return;

        // This could be used for live search suggestions
        try {
            const response = await fetch(`/api/items?search=${encodeURIComponent(query)}&limit=5`);
            const data = await response.json();
            
            // Show search suggestions if needed
            this.showSearchSuggestions(data.items, query);
        } catch (error) {
            console.error('Search failed:', error);
        }
    }

    showSearchSuggestions(items, query) {
        // Implementation for search suggestions dropdown
        // This could be expanded to show a dropdown with search results
    }

    async toggleLike(itemId) {
        if (!this.currentUser) {
            this.showToast('Please login to like items', 'warning');
            return;
        }

        try {
            const response = await fetch(`/api/items/${itemId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.showToast('Item liked!', 'success');
                
                // Update like count in UI
                const likeBtn = document.querySelector(`[onclick="app.toggleLike('${itemId}')"]`);
                if (likeBtn) {
                    likeBtn.innerHTML = `<i class="fas fa-heart"></i> ${data.likeCount}`;
                }
            } else {
                this.showToast('Failed to like item', 'error');
            }
        } catch (error) {
            console.error('Toggle like failed:', error);
            this.showToast('Network error', 'error');
        }
    }

    toggleUserMenu() {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
        }
    }

    closeUserMenu() {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.style.display = 'none';
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUser = null;
        this.token = null;
        
        this.updateUIForGuestUser();
        this.showToast('Logged out successfully', 'success');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            // Create toast container if it doesn't exist
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);

        // Manual close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
    }

    getToastIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatPoints(points) {
        return points.toLocaleString();
    }

    truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // API helper methods
    async apiRequest(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            }
        };

        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ReWearApp();
});

// Global utility functions
window.showToast = (message, type) => {
    if (window.app) {
        window.app.showToast(message, type);
    }
};

window.logout = () => {
    if (window.app) {
        window.app.logout();
    }
};

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.app) {
        // Refresh auth status when page becomes visible
        window.app.checkAuthStatus();
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    window.app?.showToast('You are back online!', 'success');
});

window.addEventListener('offline', () => {
    window.app?.showToast('You are offline. Some features may not work.', 'warning');
}); 