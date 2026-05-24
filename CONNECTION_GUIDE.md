# Backend-Frontend Connection Guide

## ✅ Connection Setup Complete

The backend and frontend are now connected and ready for testing.

## 📋 What Was Done

### 1. Backend Configuration
- **File**: `backend/.env`
- **CORS_ORIGIN**: Set to `http://localhost:8000` (supports local development servers)
- Includes all necessary API keys for Stripe, Cloudinary, OpenAI, etc.

### 2. Frontend API Service
- **File**: `js/api.js`
- Complete `APIService` class with methods for:
  - Authentication (login, register, logout, token refresh)
  - Products (get, create, update, delete)
  - Orders (create, confirm payment, get orders)
  - Chat (conversations, messages)
  - Users (profile, wishlist, avatar)
  - AI features (virtual try-on)

### 3. Frontend Integration
- **File**: `index.html`
- Added API service script import
- Added Socket.IO for real-time chat
- Added Stripe for payments
- Updated login/register to use backend API (with fallback to local data)
- Updated logout to call backend API
- Added product loading from backend API
- Auto-initializes Socket.IO on user login

## 🚀 Quick Start

### 1. Start the Backend

```bash
cd /Users/rebecaa307/Desktop/thesis/backend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev

# You should see: "Server running on port 5000"
```

### 2. Start the Frontend

**Option A: Python HTTP Server**
```bash
cd /Users/rebecaa307/Desktop/thesis
python3 -m http.server 8000
# Open browser: http://localhost:8000
```

**Option B: Node.js HTTP Server**
```bash
cd /Users/rebecaa307/Desktop/thesis
npx http-server -p 8000
# Open browser: http://localhost:8000
```

**Option C: VS Code Live Server**
1. Right-click `index.html`
2. Select "Open with Live Server"
3. Browser opens automatically (usually port 5500)

### 3. Test the Connection

#### Check in Browser Console

```javascript
// Should be able to use the API service
console.log(api.isAuthenticated()); // false (not logged in yet)

// Test a public endpoint (get products)
api.getProducts()
  .then(response => console.log('Products loaded:', response))
  .catch(error => console.error('Error:', error));
```

#### Test Registration

1. Click "Sign In" in the header
2. Go to "Create Account" tab
3. Fill in:
   - Username: `testuser`
   - Email: `testuser@secondstyle.local`
   - Password: `Test123456`
   - Confirm Password: `Test123456`
4. Click "Create Account"

**Expected**: "Account created successfully!" message

#### Test Login

1. Use credentials from registration:
   - Username: `testuser`
   - Password: `Test123456`

**Expected**: 
- User is logged in
- "Browse" tab shown
- "Seller Hub" and "Sell" buttons appear in header

#### Test Real-Time Chat

Once logged in:
```javascript
// Send a test message
socket.emit('sendMessage', {
  conversationId: 'test-conv-id',
  receiverId: 'some-user-id',
  content: 'Hello from frontend!',
  timestamp: new Date()
});
```

#### Test Product Loading

```javascript
// Load products from backend
api.getProducts()
  .then(resp => {
    console.log('Total products:', resp.data.length);
    console.log('First product:', resp.data[0]);
  });
```

## 🔧 Configuration

### Update API URL for Different Environments

**Development (Local)**
```javascript
// In index.html, line ~865
const API_BASE_URL = 'http://localhost:5000/api';
const WS_BASE_URL = 'http://localhost:5000';
```

**Staging/Production**
```javascript
const API_BASE_URL = 'https://api-staging.secondstyle.com/api';
const WS_BASE_URL = 'https://api-staging.secondstyle.com';
```

### Update Backend CORS

Update `backend/.env` for different frontend origins:

**Local Development**
```
CORS_ORIGIN=http://localhost:8000
```

**Multiple Origins (if needed)**
```bash
# Edit backend/server.js to support multiple origins
const allowedOrigins = [
  'http://localhost:8000',
  'http://localhost:5500',
  'https://secondstyle.com'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
```

## 🐛 Troubleshooting

### CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**:
1. Check backend is running on port 5000
2. Verify `CORS_ORIGIN` in `backend/.env` matches your frontend URL
3. Restart backend server: `npm run dev`

### Login Not Working

**Check Console** (F12 → Console):
```javascript
console.log(api.isAuthenticated());
console.log(localStorage.getItem('accessToken'));
```

**Solution**:
- Clear browser cache: `Cmd+Shift+Delete`
- Try local login (with demo accounts)
- Check network tab for API errors

### Products Not Loading

**Check Console**:
```javascript
api.getProducts().catch(e => console.error(e));
```

**Common Issues**:
- Backend not running
- MongoDB not connected
- No products in database

**Solution**:
- Start backend: `npm run dev`
- Check backend logs for MongoDB connection error
- Frontend will use demo data automatically if API fails

### Socket.IO Connection Error

```
WebSocket connection to 'ws://localhost:5000/socket.io/' failed
```

**Solution**:
1. Backend must be running
2. Check Socket.IO is initialized in backend
3. Verify chat routes are loaded

### Tokens Expiring

If login token expires:
```javascript
// This happens automatically
api.refreshToken()
  .then(newToken => console.log('Token refreshed'))
  .catch(() => window.location.href = '/'); // Redirect to login
```

## 📝 API Endpoints Available

### Public Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email

### Protected Endpoints (require auth token)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar
- `POST /api/users/wishlist/:id` - Add to wishlist
- `DELETE /api/users/wishlist/:id` - Remove from wishlist
- `GET /api/products` (create) - Create new product
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/chat/conversations` - Get conversations
- `POST /api/chat/conversations/:id/messages` - Send message

## ✨ Features Working

✅ User Authentication (Register/Login/Logout)
✅ Product Listing (from backend)
✅ Real-time Chat (Socket.IO)
✅ Wishlist Management
✅ Order Management
✅ User Profiles
✅ Token Management & Refresh
✅ Auto-fallback to Local Data

## 🔐 Security Notes

- Tokens are stored in `localStorage`
- Auth headers are automatically added to API calls
- Expired tokens trigger automatic redirect to login
- CORS is configured for secure requests
- All sensitive data goes through API only

## 📱 Next Steps

1. **Test payment flow** - Configure Stripe keys in `.env`
2. **Test image uploads** - Configure Cloudinary keys in `.env`
3. **Test AI features** - Configure OpenAI keys in `.env`
4. **Setup email** - Configure Gmail app password
5. **Deploy to production** - Update API URLs and CORS_ORIGIN

---

**Happy coding!** 🎉

For more details, see:
- Frontend setup: `FRONTEND_SETUP.md`
- Backend setup: `backend/SETUP_GUIDE.md`
- API docs: `backend/API_DOCUMENTATION.md`
- Integration guide: `backend/FRONTEND_INTEGRATION.md`
