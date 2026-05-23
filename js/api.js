/**
 * API Service for SecondStyle Backend
 * Handles all communication between frontend and backend API
 */

class APIService {
  constructor(baseURL = 'http://localhost:8000/api') {
    this.baseURL = baseURL;
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  /**
   * Get authentication headers with token
   */
  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Generic request method
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add auth header if token exists and not already in headers
    if (!headers['Authorization'] && localStorage.getItem('accessToken')) {
      headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle token expiration
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/';
        }
        throw new Error(data.message || `API Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ============ AUTH ENDPOINTS ============

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response.success && response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async verifyEmail(token) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await this.request('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });

    if (response.accessToken) {
      localStorage.setItem('accessToken', response.accessToken);
    }

    return response;
  }

  // ============ USER ENDPOINTS ============

  async getProfile() {
    return this.request('/users/profile', {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);

    const options = {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      body: formData
    };

    const url = `${this.baseURL}/users/avatar`;
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  }

  async addToWishlist(productId) {
    return this.request(`/users/wishlist/${productId}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
  }

  async removeFromWishlist(productId) {
    return this.request(`/users/wishlist/${productId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
  }

  async getWishlist() {
    return this.request('/users/wishlist', {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  // ============ PRODUCT ENDPOINTS ============

  async getProducts(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const endpoint = `/products${params ? '?' + params : ''}`;
    
    return this.request(endpoint, {
      method: 'GET'
    });
  }

  async getProductById(productId) {
    return this.request(`/products/${productId}`, {
      method: 'GET'
    });
  }

  async createProduct(productData) {
    return this.request('/products', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(productId, productData) {
    return this.request(`/products/${productId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(productData)
    });
  }

  async uploadProductImages(productId, files) {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    const options = {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      body: formData
    };

    const url = `${this.baseURL}/products/${productId}/images`;
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    return data;
  }

  async deleteProduct(productId) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
  }

  async addReview(productId, reviewData) {
    return this.request(`/products/${productId}/reviews`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(reviewData)
    });
  }

  // ============ ORDER ENDPOINTS ============

  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
  }

  async confirmPayment(orderId, paymentIntentId) {
    return this.request(`/orders/${orderId}/confirm-payment`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ paymentIntentId })
    });
  }

  async getMyOrders(page = 1, limit = 10) {
    return this.request(`/orders/my-orders?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  async getOrderById(orderId) {
    return this.request(`/orders/${orderId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
  }

  // ============ CHAT ENDPOINTS ============

  async getOrCreateConversation(otherUserId) {
    return this.request('/chat/conversations', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ otherUserId })
    });
  }

  async getMyConversations(page = 1, limit = 20) {
    return this.request(`/chat/conversations?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
  }

  async getMessages(conversationId, page = 1, limit = 50) {
    return this.request(
      `/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: this.getAuthHeaders()
      }
    );
  }

  async sendMessage(conversationId, receiverId, content) {
    return this.request(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ receiverId, content })
    });
  }

  // ============ AI ENDPOINTS ============

  async processVirtualTryOn(userImage, productImage) {
    const formData = new FormData();
    formData.append('images', userImage);
    formData.append('images', productImage);

    const options = {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      body: formData
    };

    const url = `${this.baseURL}/ai/try-on`;
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Virtual try-on failed');
    }

    return data;
  }

  // ============ UTILITY METHODS ============

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Clear all authentication data
   */
  clearAuth() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

// Export singleton instance
const api = new APIService('http://localhost:5000/api');
