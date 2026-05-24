# Frontend Integration Guide

Guide to connect your `index.html` frontend to the backend API.

## 🔗 API Base URL

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

For production, update to your deployed server URL.

## 🔑 Authentication

### Storing Tokens

```javascript
// After login/register
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);
localStorage.setItem('user', JSON.stringify(response.data.user));
```

### Making Authenticated Requests

```javascript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'application/json'
};

fetch(`${API_BASE_URL}/users/profile`, {
  method: 'GET',
  headers: headers
})
```

## 📡 API Service Class

Create a `services/api.js` file:

```javascript
class APIService {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json'
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = options.headers || {};
    
    // Add auth headers if not already present
    if (!headers['Authorization'] && localStorage.getItem('accessToken')) {
      headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...headers }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API Error');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
  }

  async verifyEmail(token) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.request('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    });
  }

  // User endpoints
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
    return response.json();
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

  // Product endpoints
  async getProducts(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/products?${params}`, {
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
    return response.json();
  }

  async deleteProduct(productId) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
  }

  // Order endpoints
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

  // Chat endpoints
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

  // AI Try-On endpoints
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
    return response.json();
  }
}

// Export singleton instance
const api = new APIService();
```

## 📝 HTML Integration Examples

### Login Form

```html
<form id="loginForm">
  <input type="email" id="email" placeholder="Email" required>
  <input type="password" id="password" placeholder="Password" required>
  <button type="submit">Login</button>
</form>

<script>
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    const response = await api.login(
      document.getElementById('email').value,
      document.getElementById('password').value
    );
    
    // Store tokens
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Redirect to dashboard
    window.location.href = '/dashboard.html';
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
});
</script>
```

### Products Display

```html
<div id="productsContainer"></div>

<script>
async function displayProducts() {
  try {
    const response = await api.getProducts({
      category: 'clothing',
      page: 1,
      limit: 12
    });
    
    const container = document.getElementById('productsContainer');
    response.data.forEach(product => {
      const html = `
        <div class="product-card">
          <img src="${product.images[0]?.url}" alt="${product.title}">
          <h3>${product.title}</h3>
          <p>$${product.price}</p>
          <button onclick="addToCart('${product._id}')">Add to Cart</button>
        </div>
      `;
      container.innerHTML += html;
    });
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

displayProducts();
</script>
```

### Checkout / Create Order

```html
<form id="checkoutForm">
  <h3>Shipping Address</h3>
  <input type="text" name="street" placeholder="Street" required>
  <input type="text" name="city" placeholder="City" required>
  <input type="text" name="state" placeholder="State" required>
  <input type="text" name="zipCode" placeholder="Zip Code" required>
  <input type="text" name="country" placeholder="Country" required>
  
  <h3>Shipping Method</h3>
  <select name="shippingMethod" required>
    <option value="standard">Standard (5-7 days) - $10</option>
    <option value="express">Express (2-3 days) - $20</option>
    <option value="overnight">Overnight - $50</option>
  </select>
  
  <button type="submit">Create Order</button>
</form>

<script>
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const shippingAddress = {
    street: formData.get('street'),
    city: formData.get('city'),
    state: formData.get('state'),
    zipCode: formData.get('zipCode'),
    country: formData.get('country')
  };
  
  try {
    const response = await api.createOrder({
      items: cart, // Your cart items
      shippingAddress,
      shippingMethod: formData.get('shippingMethod'),
      paymentMethod: 'stripe'
    });
    
    // Use Stripe to process payment
    const clientSecret = response.data.clientSecret;
    // Initialize Stripe payment...
  } catch (error) {
    alert('Failed to create order: ' + error.message);
  }
});
</script>
```

### Virtual Try-On

```html
<div id="tryOnContainer">
  <input type="file" id="userImage" accept="image/*" placeholder="Your photo">
  <input type="file" id="productImage" accept="image/*" placeholder="Product photo">
  <button onclick="processTryOn()">Try On</button>
  <div id="tryOnResult"></div>
</div>

<script>
async function processTryOn() {
  const userImage = document.getElementById('userImage').files[0];
  const productImage = document.getElementById('productImage').files[0];
  
  if (!userImage || !productImage) {
    alert('Please select both images');
    return;
  }
  
  try {
    const response = await api.processVirtualTryOn(userImage, productImage);
    
    const resultDiv = document.getElementById('tryOnResult');
    resultDiv.innerHTML = `
      <h3>Result:</h3>
      <img src="${response.data.processedImageUrl}" alt="Try-on result">
      <p>Confidence: ${(response.data.confidence * 100).toFixed(2)}%</p>
    `;
  } catch (error) {
    alert('Try-on failed: ' + error.message);
  }
}
</script>
```

### Real-Time Chat with Socket.IO

```html
<div id="chatContainer">
  <div id="messages"></div>
  <input type="text" id="messageInput" placeholder="Type a message...">
  <button onclick="sendMessage()">Send</button>
</div>

<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
<script>
const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('accessToken')
  }
});

const currentUser = JSON.parse(localStorage.getItem('user'));
const conversationId = 'current-conversation-id';
const otherUserId = 'other-user-id';

socket.emit('user-join', currentUser._id);

socket.on('receive-message', (data) => {
  const messagesDiv = document.getElementById('messages');
  const messageElement = document.createElement('div');
  messageElement.className = 'message received';
  messageElement.innerHTML = `
    <strong>${data.message.sender.firstName}:</strong>
    ${data.message.content}
  `;
  messagesDiv.appendChild(messageElement);
});

function sendMessage() {
  const content = document.getElementById('messageInput').value;
  if (!content.trim()) return;
  
  socket.emit('send-message', {
    conversationId,
    senderId: currentUser._id,
    receiverId: otherUserId,
    content
  });
  
  document.getElementById('messageInput').value = '';
}

document.getElementById('messageInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});
</script>
```

## 💳 Stripe Payment Integration

```html
<script src="https://js.stripe.com/v3/"></script>

<div id="card-element"></div>
<button id="submit-payment">Pay Now</button>

<script>
const stripe = Stripe('pk_test_your_stripe_key');
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

document.getElementById('submit-payment').addEventListener('click', async () => {
  const { paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: 'Customer Name'
      }
    }
  });
  
  if (paymentIntent.status === 'succeeded') {
    // Confirm payment in backend
    await api.confirmPayment(orderId, paymentIntent.id);
    alert('Payment successful!');
  }
});
</script>
```

## 🔄 Token Refresh

```javascript
// Automatically refresh token when expired
setInterval(async () => {
  try {
    const response = await api.refreshToken();
    localStorage.setItem('accessToken', response.data.accessToken);
  } catch (error) {
    // Redirect to login
    window.location.href = '/login.html';
  }
}, 6 * 60 * 60 * 1000); // Every 6 hours
```

## 📋 CORS Configuration

Update CORS in backend if frontend is on different domain:

**In `.env`:**
```
CORS_ORIGIN=http://localhost:3000
```

Or for production:
```
CORS_ORIGIN=https://yourdomain.com
```

## 🚀 Deployment Notes

- Update `API_BASE_URL` to production server URL
- Use HTTPS in production
- Set secure cookies for tokens
- Enable rate limiting in production
- Configure Stripe webhook URLs
- Test all API endpoints before deployment

---

**Happy coding!** 🎉
