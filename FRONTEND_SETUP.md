# Frontend Setup & Deployment Guide

Complete guide to set up, run, and deploy the SecondStyle marketplace frontend.

## 📦 Project Overview

**SecondStyle Frontend:**
- Single-page application (SPA) with `index.html`
- Vanilla JavaScript (no build tools required)
- Responsive design with CSS Grid & Flexbox
- Real-time chat with Socket.IO
- Payment integration with Stripe
- Image processing with Cloudinary
- Local storage for authentication

## 🚀 Quick Start (Local Development)

### Step 1: Check Backend is Running

Make sure your backend server is running on `http://localhost:5000`:

```bash
# In your backend folder
npm run dev

# You should see: "Server running on port 5000"
```

### Step 2: Configure Frontend API

Update the API base URL in `index.html`:

```javascript
// Find this line in index.html
const API_BASE_URL = 'http://localhost:5000/api';

// For production, change to:
const API_BASE_URL = 'https://your-deployed-backend.com/api';
```

### Step 3: Open Frontend Locally

**Option A: Using Python (built-in on Mac/Linux)**
```bash
# Navigate to project root
cd /Users/rebecaa307/Desktop/thesis

# Start local server on port 8000
python3 -m http.server 8000

# Open browser: http://localhost:8000
```

**Option B: Using Node.js http-server**
```bash
# Install globally (once)
npm install -g http-server

# Run from thesis folder
cd /Users/rebecaa307/Desktop/thesis
http-server -p 8000

# Open browser: http://localhost:8000
```

**Option C: Using Live Server (VS Code)**
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"
4. Browser opens automatically at `http://localhost:5500`

### Step 4: Test Authentication Flow

1. **Register** at `/register`
   - Email: `test@example.com`
   - Password: `Password123`

2. **Login** at `/login`
   - Tokens are saved to `localStorage`

3. **Verify tokens stored**
   - Open Developer Tools (F12)
   - Go to Application → Local Storage
   - Check: `accessToken`, `refreshToken`, `user`

## 🔧 Configuration

### Environment-Specific Setup

Create a `config.js` file if needed:

```javascript
// config.js
const ENV = {
  development: {
    API_BASE_URL: 'http://localhost:5000/api',
    WS_URL: 'http://localhost:5000',
    STRIPE_PUBLIC_KEY: 'pk_test_...',
  },
  production: {
    API_BASE_URL: 'https://api.secondstyle.com',
    WS_URL: 'https://secondstyle.com',
    STRIPE_PUBLIC_KEY: 'pk_live_...',
  }
};

const config = ENV[process.env.NODE_ENV || 'development'];
export default config;
```

### Update API Base URL for Your Environment

In `index.html`, find and update:

```html
<script>
// Development
const API_BASE_URL = 'http://localhost:5000/api';
const WS_URL = 'http://localhost:5000';

// Uncomment for production:
// const API_BASE_URL = 'https://your-api.com/api';
// const WS_URL = 'https://your-api.com';
</script>
```

## 🔗 Connecting to Backend

### 1. Authentication Setup

Make sure you store tokens after login:

```javascript
// Login example
async function handleLogin(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.success) {
    // Save tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Redirect to home
    window.location.href = '/';
  }
}
```

### 2. Making API Calls

Always include auth headers:

```javascript
function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  };
}

// Example: Fetch products
async function getProducts() {
  const response = await fetch(`${API_BASE_URL}/products`, {
    headers: getAuthHeaders()
  });
  return response.json();
}
```

### 3. Use the API Service Class

The recommended way is to create an API service (see [FRONTEND_INTEGRATION.md](./backend/FRONTEND_INTEGRATION.md)):

```javascript
// In your main script file
const api = new APIService(API_BASE_URL);

// Register
await api.register({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'Password123',
  confirmPassword: 'Password123'
});

// Login
const loginData = await api.login('john@example.com', 'Password123');

// Get profile
const profile = await api.getProfile();

// Get products
const products = await api.getProducts({ category: 'dresses' });
```

## 💳 Payment Integration (Stripe)

### 1. Get Stripe Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Publishable Key** (starts with `pk_`)

### 2. Add Stripe to Frontend

```html
<!-- In index.html head -->
<script src="https://js.stripe.com/v3/"></script>
```

### 3. Initialize Stripe

```javascript
const stripe = Stripe('pk_test_your_publishable_key_here');
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');
```

### 4. Create Payment Intent

```javascript
async function handlePayment(amount) {
  // 1. Create payment intent on backend
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      items: cart,
      totalAmount: amount
    })
  });

  const { clientSecret, orderId } = await response.json();

  // 2. Confirm payment with Stripe
  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: { name: 'John Doe' }
    }
  });

  if (result.error) {
    console.error('Payment failed:', result.error.message);
  } else {
    console.log('Payment succeeded!');
    // Notify backend
    await api.confirmPayment(orderId, result.paymentIntent.id);
  }
}
```

## 💬 Real-Time Chat (Socket.IO)

### 1. Include Socket.IO Client

```html
<!-- In index.html head -->
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
```

### 2. Initialize Socket Connection

```javascript
const socket = io(WS_URL, {
  auth: {
    token: localStorage.getItem('accessToken')
  }
});

socket.on('connect', () => {
  console.log('Connected to chat server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from chat server');
});
```

### 3. Send Messages

```javascript
function sendMessage(conversationId, receiverId, content) {
  socket.emit('sendMessage', {
    conversationId,
    receiverId,
    content,
    timestamp: new Date()
  });
}

socket.on('messageReceived', (message) => {
  console.log('New message:', message);
  displayMessage(message);
});
```

## 🖼️ Image Upload (Cloudinary)

### 1. Include Cloudinary Widget

```html
<!-- In index.html head -->
<script src="https://widget.cloudinary.com/v2.0/cld-wgt.min.js"></script>
```

### 2. Upload Images

```javascript
const cw = cloudinary.createUploadWidget(
  {
    cloudName: 'your-cloud-name',
    uploadPreset: 'your-preset',
    multiple: true
  },
  (error, result) => {
    if (!error && result && result.event === 'success') {
      console.log('Image uploaded:', result.info.secure_url);
    }
  }
);

// Trigger upload
document.getElementById('upload-btn').addEventListener('click', () => {
  cw.open();
});
```

Or use the backend upload endpoint:

```javascript
async function uploadImages(files) {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));

  const response = await fetch(`${API_BASE_URL}/products/images`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
    body: formData
  });

  return response.json();
}
```

## 📁 Frontend Structure

```
thesis/
├── index.html              (Main page)
├── styles/
│   ├── main.css           (Main stylesheet)
│   ├── responsive.css     (Mobile styles)
│   └── themes.css         (Dark mode)
├── js/
│   ├── api.js             (API service class)
│   ├── auth.js            (Authentication)
│   ├── products.js        (Product listing)
│   ├── chat.js            (Chat functionality)
│   ├── checkout.js        (Payment flow)
│   └── utils.js           (Helper functions)
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
└── config.js              (Configuration)
```

## 🧪 Testing the Frontend

### 1. Test Home Page

- [ ] Header displays correctly
- [ ] Search bar works
- [ ] Theme toggle (dark/light mode) works
- [ ] Navigation is responsive

### 2. Test Authentication

- [ ] Can register new account
- [ ] Can login with email/password
- [ ] Tokens saved to localStorage
- [ ] Can logout
- [ ] Protected pages redirect to login

### 3. Test Products Page

- [ ] Products load from backend
- [ ] Filters work (category, price, etc.)
- [ ] Search functionality works
- [ ] Product detail page opens
- [ ] Add to cart works
- [ ] Add to wishlist works

### 4. Test Shopping

- [ ] Add items to cart
- [ ] Update quantities
- [ ] Remove items
- [ ] Checkout page displays
- [ ] Payment with Stripe works
- [ ] Order confirmation shows

### 5. Test Chat

- [ ] Can start conversation with seller
- [ ] Messages send in real-time
- [ ] Messages persist after reload
- [ ] Chat notifications work

## 🚀 Deployment Options

### Option 1: Deploy to Netlify

```bash
# 1. Create Netlify account
# Go to https://netlify.com

# 2. Connect your GitHub repo
# Or drag-and-drop your thesis folder

# 3. Build settings
# Build command: (leave empty for static)
# Publish directory: /

# 4. Set environment variables
# VITE_API_BASE_URL=https://your-api.com/api
```

### Option 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts and connect to your project
```

### Option 3: Deploy to AWS S3 + CloudFront

```bash
# 1. Create S3 bucket
aws s3 mb s3://secondstyle-frontend

# 2. Upload files
aws s3 sync . s3://secondstyle-frontend/

# 3. Set bucket as static website
# (Use AWS Console)

# 4. Create CloudFront distribution
# (Use AWS Console)
```

### Option 4: Deploy to GitHub Pages

```bash
# Create repository on GitHub
# Push code

# In repository settings:
# Source: Deploy from a branch
# Branch: main
# Folder: / (root)

# Update API_BASE_URL to your backend URL
# Commit and push

# Site available at: https://yourusername.github.io/thesis
```

## 🔐 Environment Variables for Deployment

For production deployment, update these in your deployment platform:

```env
# Production API
API_BASE_URL=https://your-api.secondstyle.com/api
WS_URL=https://your-api.secondstyle.com

# Stripe (production keys)
STRIPE_PUBLIC_KEY=pk_live_your_production_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-preset-name
```

## 📊 Performance Optimization

### 1. Lazy Load Images

```javascript
// Use native lazy loading
<img src="product.jpg" loading="lazy" alt="Product">

// Or use Intersection Observer
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src;
      imageObserver.unobserve(entry.target);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});
```

### 2. Implement Service Worker

```javascript
// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### 3. Minify CSS & JavaScript

Before production:
- Minify CSS files
- Minify JavaScript files
- Compress images
- Use gzip compression

## 🆘 Troubleshooting

### CORS Error

```
Error: Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
- Verify backend has CORS enabled
- Check CORS_ORIGIN in backend `.env` matches your frontend URL
- For local: `CORS_ORIGIN=http://localhost:8000`
- For production: `CORS_ORIGIN=https://yourdomain.com`

### Tokens Not Saving

```javascript
// Check localStorage is available
if (typeof(Storage) !== "undefined") {
  localStorage.setItem('accessToken', token);
} else {
  console.error('localStorage not supported');
}
```

### Chat Not Connecting

```javascript
// Check WebSocket URL
console.log('Connecting to:', WS_URL);

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});
```

### Images Not Loading

- Verify Cloudinary credentials
- Check image URLs are public
- Verify HTTPS for production

### Payment Not Working

- Check Stripe public key
- Use test keys in development
- Verify test card: `4242 4242 4242 4242`, exp: `12/25`, CVC: `123`

## 📞 Getting Help

### Frontend Documentation

- `SETUP_GUIDE.md` - Backend setup (for API)
- `backend/FRONTEND_INTEGRATION.md` - API integration details
- `backend/API_DOCUMENTATION.md` - Complete API reference

### External Resources

- **MDN Web Docs**: https://developer.mozilla.org
- **JavaScript Fetch API**: https://fetch.spec.whatwg.org
- **Socket.IO Docs**: https://socket.io/docs
- **Stripe Docs**: https://stripe.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# 1. Frontend loads
# Open: http://localhost:8000
# Check: Page loads, no console errors

# 2. Backend connects
# Check: Network tab shows API calls to localhost:5000

# 3. Register user
# Fill form and submit
# Check: User created in MongoDB

# 4. Login
# Enter credentials
# Check: Tokens in localStorage

# 5. View products
# Check: Products load from API

# 6. Add to cart
# Click "Add to Cart"
# Check: Cart updates

# 7. Checkout
# Fill shipping info
# Click "Pay"
# Use test card: 4242 4242 4242 4242

# 8. All should work without errors
```

---

**Your marketplace frontend is now ready for development and deployment!** 🎉

Next steps:
1. ✅ Setup frontend (done)
2. ✅ Setup backend (see [backend/SETUP_GUIDE.md](./backend/SETUP_GUIDE.md))
3. → Test full integration
4. → Deploy to production
5. → Monitor and maintain
