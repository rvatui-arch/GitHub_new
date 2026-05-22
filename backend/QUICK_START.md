# QUICK START - Run Your Backend NOW

## 🚀 Get Started in 3 Steps

### Step 1: Install & Configure (2 minutes)

```bash
# Go to backend folder
cd /Users/rebecaa307/Desktop/thesis/backend

# Install all dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env (change at least these):
# MONGODB_URI=mongodb://localhost:27017/marketplace
# JWT_SECRET=any-random-string-here-min-32-chars
```

### Step 2: Start MongoDB (1 minute)

```bash
# In a new terminal window:
mongod

# You should see: "Waiting for connections on port 27017"
```

### Step 3: Run Backend Server (1 minute)

```bash
# In the backend folder:
npm run dev

# You should see: "Server running on port 5000"
```

✅ **Your backend is running!** Visit: http://localhost:5000

---

## 🧪 Test It Works

### In Browser:
Visit `http://localhost:5000` - you should see JSON with API endpoints

### Test Registration (cURL):
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "test@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'
```

You should get back a response with `"success": true` and tokens.

---

## 🔗 Connect Your Frontend (index.html)

### Option 1: Simple Fetch (Easiest)

Add this to your `index.html`:

```html
<script>
const API_URL = 'http://localhost:5000/api';

// Example: Get all products
async function getProducts() {
  const response = await fetch(`${API_URL}/products`);
  const data = await response.json();
  console.log(data); // Products list
}

// Example: Login
async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    console.log('Logged in!');
  }
}

// Example: Make authenticated request
async function getProfile() {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_URL}/users/profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  console.log(data); // User profile
}

// Test it:
getProducts();
</script>
```

### Option 2: Use API Service Class (Professional)

Create `js/api.js` in your frontend folder:

```javascript
class API {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('accessToken') && {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      })
    };

    const response = await fetch(url, { ...options, headers });
    return response.json();
  }

  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  register(data) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Users
  getProfile() {
    return this.request('/users/profile', { method: 'GET' });
  }

  // Products
  getProducts(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/products?${params}`, { method: 'GET' });
  }

  // Orders
  createOrder(data) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

const api = new API();
```

Then in your HTML:

```html
<script src="js/api.js"></script>

<button onclick="testLogin()">Login</button>

<script>
async function testLogin() {
  const response = await api.login('test@example.com', 'Password123');
  if (response.success) {
    localStorage.setItem('accessToken', response.data.accessToken);
    console.log('Login successful!');
  } else {
    console.log('Login failed:', response.message);
  }
}
</script>
```

---

## 📱 Common Frontend Examples

### Display Products

```html
<div id="products"></div>

<script>
async function displayProducts() {
  const response = await api.getProducts({ page: 1, limit: 12 });
  const html = response.data.map(p => `
    <div>
      <img src="${p.images[0]?.url}" width="200">
      <h3>${p.title}</h3>
      <p>$${p.price}</p>
    </div>
  `).join('');
  document.getElementById('products').innerHTML = html;
}

displayProducts();
</script>
```

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
  const response = await api.login(
    document.getElementById('email').value,
    document.getElementById('password').value
  );
  if (response.success) {
    localStorage.setItem('accessToken', response.data.accessToken);
    alert('Login successful!');
    window.location.href = 'dashboard.html';
  } else {
    alert('Login failed: ' + response.message);
  }
});
</script>
```

### Real-Time Chat (Socket.IO)

```html
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>

<div id="messages"></div>
<input type="text" id="messageInput" placeholder="Message...">
<button onclick="sendMessage()">Send</button>

<script>
const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('accessToken')
  }
});

const userId = JSON.parse(localStorage.getItem('user'))._id;
const conversationId = 'current-conversation-id';

socket.emit('user-join', userId);

socket.on('receive-message', (data) => {
  const msg = document.createElement('div');
  msg.textContent = data.message.content;
  document.getElementById('messages').appendChild(msg);
});

function sendMessage() {
  const content = document.getElementById('messageInput').value;
  socket.emit('send-message', {
    conversationId,
    senderId: userId,
    receiverId: 'other-user-id',
    content
  });
  document.getElementById('messageInput').value = '';
}
</script>
```

---

## 🔑 Important Notes

### Token Management

After login, store tokens:
```javascript
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);
localStorage.setItem('user', JSON.stringify(response.data.user));
```

Every request needs the token in header:
```javascript
'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
```

### CORS Configuration

Backend already configured for `http://localhost:3000` by default.

If your frontend is on different port, update backend `.env`:
```
CORS_ORIGIN=http://localhost:YOUR_PORT
```

### Error Handling

All responses have this format:
```json
{
  "success": true/false,
  "message": "Description",
  "data": {...} // Only if success
}
```

Always check `response.success`:
```javascript
if (response.success) {
  // Handle success
} else {
  console.error(response.message);
}
```

---

## 🚨 Troubleshooting

### Backend Won't Start?

```bash
# Check Node.js installed
node --version

# Check npm installed
npm --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check port 5000 is free
lsof -i :5000
```

### MongoDB Won't Connect?

```bash
# Start MongoDB
mongod

# Or check if already running
brew services list  # Mac
sudo systemctl status mongodb  # Linux
```

### CORS Error in Frontend?

Update backend `.env`:
```
CORS_ORIGIN=http://localhost:YOUR_FRONTEND_PORT
```

Then restart backend: `npm run dev`

### Connection Refused?

Make sure:
- ✅ Backend running (`npm run dev`)
- ✅ MongoDB running (`mongod`)
- ✅ Using correct API URL: `http://localhost:5000`
- ✅ Frontend on different port than backend

---

## 📚 Documentation

Read these in order:

1. **PROJECT_SUMMARY.md** - Overview of what was built
2. **README.md** - Features & setup
3. **SETUP_GUIDE.md** - Detailed setup & deployment
4. **API_DOCUMENTATION.md** - All endpoints with examples
5. **FRONTEND_INTEGRATION.md** - Complete frontend guide

---

## 🎯 Your Next Steps

### Immediate (Today)
- [ ] Start backend (`npm run dev`)
- [ ] Test with cURL
- [ ] Connect frontend (index.html)
- [ ] Test login flow

### Short Term (This Week)
- [ ] Test all endpoints
- [ ] Add more products
- [ ] Test purchases
- [ ] Test chat

### Medium Term (This Month)
- [ ] Setup production database
- [ ] Configure payment testing
- [ ] Deploy to server
- [ ] Setup monitoring

---

## 🎉 Ready!

Your complete marketplace backend is ready to use!

**Backend URL:** `http://localhost:5000`
**API Base:** `http://localhost:5000/api`
**Health Check:** `http://localhost:5000/api/health`

Start building! 🚀

---

Questions? See the documentation files or check the code comments!
