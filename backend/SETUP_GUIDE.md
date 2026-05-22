# Project Setup & Deployment Guide

Complete guide to setup, run, and deploy the marketplace backend.

## 📦 Project Overview

**Full-Stack Marketplace with:**
- Node.js + Express backend
- MongoDB database
- JWT authentication
- Real-time chat (Socket.IO)
- AI virtual try-on
- Stripe payments
- Cloudinary image storage

## 🚀 Quick Start (Local Development)

### Step 1: Install Node.js & MongoDB

```bash
# Check if you have Node.js installed
node --version

# Download from https://nodejs.org/ if needed

# Install MongoDB Community Edition
# Mac:
#   brew tap mongodb/brew
#   brew install mongodb-community@7.0
# Windows: Download installer from https://www.mongodb.com/try/download/community
# Linux: Follow guide at https://docs.mongodb.com/manual/installation/

# Start MongoDB
brew services start mongodb-community@7.0  # Mac
mongod  # Windows/Linux
```

### Step 2: Clone & Setup Backend

```bash
# From your workspace root folder
cd /Users/rebecaa307/Desktop/thesis/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### Step 3: Configure .env

```env
# Must change these
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017/marketplace
JWT_SECRET=your-super-secret-key-min-32-chars
REFRESH_TOKEN_SECRET=another-secret-key-min-32-chars

EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password

CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key

# Nice to have
OPENAI_API_KEY=sk-your-openai-api-key (optional)
```

### Step 4: Run Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Server running on http://localhost:5000
```

### Step 5: Test Backend

Visit: `http://localhost:5000`

You should see:
```json
{
  "message": "Marketplace Backend API",
  "version": "1.0.0",
  "endpoints": {...}
}
```

## 🔗 Connect Frontend to Backend

### In your `index.html`:

```html
<script>
const API_BASE_URL = 'http://localhost:5000/api';

// Example: Fetch products
fetch(`${API_BASE_URL}/products`)
  .then(res => res.json())
  .then(data => console.log(data));
</script>
```

Or use the API service class from `FRONTEND_INTEGRATION.md`.

## 📊 Database Models Explained

### User Collection
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  avatar: { url: String, publicId: String },
  role: 'buyer' | 'seller' | 'admin',
  followers: [ObjectId],
  following: [ObjectId],
  wishlist: [ObjectId],
  shopName: String,
  shopRating: Number
}
```

### Product Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  price: Number,
  category: String,
  seller: ObjectId (ref User),
  images: [{ url, publicId }],
  stock: Number,
  status: 'active' | 'inactive' | 'sold',
  averageRating: Number,
  reviewCount: Number
}
```

### Order Collection
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  buyer: ObjectId (ref User),
  seller: ObjectId (ref User),
  items: [{
    product: ObjectId,
    quantity: Number,
    price: Number,
    size: String,
    color: String
  }],
  totalAmount: Number,
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered',
  paymentStatus: 'pending' | 'completed' | 'refunded',
  shippingAddress: Address,
  stripePaymentId: String
}
```

## 🔐 Setting Up Email (Gmail)

1. **Enable 2-Factor Authentication** in Gmail settings
2. **Create App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the generated password
3. **Update .env**:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=the-app-password-without-spaces
   ```

## 💳 Stripe Setup

1. **Create Stripe Account**: https://stripe.com
2. **Get Keys**: https://dashboard.stripe.com/apikeys
3. **Update .env**:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLIC_KEY=pk_test_...
   ```
4. **Setup Webhooks** (for production):
   - Endpoint: `https://yourdomain.com/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `charge.refunded`

## 🖼️ Cloudinary Setup

1. **Create Account**: https://cloudinary.com
2. **Get Credentials**: Dashboard > Settings
3. **Update .env**:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

## 🤖 OpenAI Setup (Optional)

1. **Create Account**: https://platform.openai.com
2. **Get API Key**: https://platform.openai.com/api-keys
3. **Update .env**:
   ```
   OPENAI_API_KEY=sk-...
   ```

## 📁 Project Structure

```
thesis/
├── index.html                 (Your frontend)
└── backend/
    ├── config/               (Configuration)
    │   ├── database.js       (MongoDB)
    │   ├── cloudinary.js     (Image storage)
    │   ├── stripe.js         (Payments)
    │   └── email.js          (Email service)
    │
    ├── models/               (Database schemas)
    │   ├── User.js
    │   ├── Product.js
    │   ├── Order.js
    │   ├── Message.js
    │   ├── Conversation.js
    │   ├── Review.js
    │   ├── Notification.js
    │   └── Wishlist.js
    │
    ├── controllers/          (Business logic)
    │   ├── authController.js
    │   ├── userController.js
    │   ├── productController.js
    │   ├── orderController.js
    │   ├── chatController.js
    │   └── aiController.js
    │
    ├── routes/               (API endpoints)
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── productRoutes.js
    │   ├── orderRoutes.js
    │   ├── chatRoutes.js
    │   └── aiRoutes.js
    │
    ├── middleware/           (Request handlers)
    │   ├── auth.js           (JWT verification)
    │   ├── errorHandler.js   (Error handling)
    │   ├── rateLimiter.js    (Rate limiting)
    │   ├── upload.js         (File upload)
    │   └── validation.js     (Input validation)
    │
    ├── services/             (External integrations)
    │   ├── aiService.js      (AI processing)
    │   └── paymentService.js (Stripe)
    │
    ├── utils/                (Utilities)
    │   ├── logger.js         (Logging)
    │   ├── jwt.js            (JWT helpers)
    │   ├── email.js          (Email templates)
    │   └── response.js       (Response formatting)
    │
    ├── sockets/              (Real-time)
    │   └── chatSocket.js     (Chat events)
    │
    ├── uploads/              (Temporary files)
    ├── logs/                 (Application logs)
    ├── server.js             (Main entry point)
    ├── package.json          (Dependencies)
    ├── .env                  (Environment variables)
    ├── .env.example          (Template)
    ├── .gitignore            (Git ignore)
    ├── README.md             (Setup guide)
    ├── API_DOCUMENTATION.md  (API reference)
    ├── FRONTEND_INTEGRATION.md (Frontend guide)
    └── DEPLOYMENT.md         (Deployment guide)
```

## 🧪 Testing Endpoints

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "test@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'

# Get products
curl http://localhost:5000/api/products

# Get profile (with token)
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/api/users/profile
```

### Using Postman

1. Download Postman from https://postman.com
2. Import the API collection
3. Set base URL: `http://localhost:5000/api`
4. Add auth token in "Authorization" tab

## 🚀 Deployment Checklist

### Before Deployment

- [ ] Update all environment variables
- [ ] Generate new JWT secrets
- [ ] Set NODE_ENV=production
- [ ] Configure MongoDB Atlas
- [ ] Setup Stripe webhook
- [ ] Enable HTTPS
- [ ] Test all API endpoints
- [ ] Setup error monitoring
- [ ] Configure logging

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add MongoDB Atlas
heroku addons:create mongolab

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set STRIPE_SECRET_KEY=sk_...

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Deploy
railway up

# View logs
railway logs
```

### Deploy to AWS EC2

```bash
# SSH into server
ssh -i key.pem ec2-user@your-ip

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs

# Clone repo
git clone your-repo-url

# Install PM2 for process management
sudo npm install -g pm2

# Start app
pm2 start server.js --name "marketplace-api"

# Setup Nginx as reverse proxy
sudo yum install -y nginx
```

## 🔍 Monitoring & Maintenance

### View Logs

```bash
# Application logs
tail -f logs/app.log

# Error logs
tail -f logs/error.log

# Real-time MongoDB queries
mongod --logpath /var/log/mongodb/mongod.log
```

### Database Backups

```bash
# Backup MongoDB
mongodump --out ./backup

# Restore MongoDB
mongorestore ./backup
```

### Monitor Performance

- Use MongoDB Atlas monitoring
- Setup Stripe monitoring
- Configure error tracking (Sentry, etc.)
- Monitor server resources

## 🆘 Troubleshooting

### MongoDB Won't Connect

```bash
# Check if MongoDB is running
brew services list  # Mac
sudo service mongodb status  # Linux

# Restart MongoDB
brew services restart mongodb-community  # Mac

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/marketplace
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 PID
```

### CORS Error in Frontend

```
Update .env:
CORS_ORIGIN=http://localhost:3000

For production:
CORS_ORIGIN=https://your-frontend-domain.com
```

### Email Not Sending

1. Check EMAIL_USER and EMAIL_PASS in .env
2. Enable "Less secure app access" in Gmail
3. Use app-specific password instead of Gmail password
4. Check spam folder

### Payment Not Working

1. Verify STRIPE_SECRET_KEY in .env
2. Check Stripe account is active
3. Use test keys (sk_test_...) in development
4. Check webhook configuration for production

## 📈 Performance Optimization

### Database Indexes

Already implemented for:
- Product search (title, description, tags)
- User lookups (email)
- Order queries (buyer, seller)
- Message queries (conversation, sender, receiver)

### Caching

Add Redis for:
- User sessions
- Product cache
- Rate limiting data

```javascript
// Example with Redis
const redis = require('redis');
const client = redis.createClient();

// Cache product
client.setex(`product:${id}`, 3600, JSON.stringify(product));
```

### API Response Optimization

- Pagination implemented
- Select only needed fields
- Compress responses with gzip
- Use CDN for images

## 📞 Getting Help

### Documentation Files

- `README.md` - Setup & overview
- `API_DOCUMENTATION.md` - Complete API reference
- `FRONTEND_INTEGRATION.md` - Frontend connection guide
- `DEPLOYMENT.md` - Deployment instructions

### Community Resources

- Stack Overflow: Tag questions with [node.js] [express] [mongodb]
- MongoDB Docs: https://docs.mongodb.com
- Express Docs: https://expressjs.com
- Stripe Docs: https://stripe.com/docs

### Error Messages

All errors return clear JSON responses with:
- `success`: boolean
- `message`: descriptive message
- `errors`: array of validation errors (if applicable)

## ✅ Verification Checklist

After setup, verify everything works:

```bash
# 1. Server runs
npm run dev
# Check: Server running on port 5000

# 2. Database connected
# Check logs: MongoDB Connected

# 3. Register user
curl -X POST http://localhost:5000/api/auth/register ...

# 4. Login
curl -X POST http://localhost:5000/api/auth/login ...

# 5. Get products
curl http://localhost:5000/api/products

# 6. Create product (as seller)
curl -X POST http://localhost:5000/api/products ...

# 7. Create order
curl -X POST http://localhost:5000/api/orders ...

# 8. Send message (Socket.IO)
# Test in browser console with frontend

# 9. Virtual try-on
curl -X POST http://localhost:5000/api/ai/try-on ...

# All should return success: true
```

---

**Your marketplace backend is now ready for development and deployment!** 🎉

Next steps:
1. ✅ Setup backend (done)
2. → Connect frontend (see FRONTEND_INTEGRATION.md)
3. → Deploy to production (see Deployment Checklist)
4. → Monitor and maintain
