# Marketplace Backend API

Professional, scalable, and secure e-commerce marketplace backend with virtual try-on AI features.

## 🚀 Features

### Authentication & Security
- JWT-based authentication with refresh tokens
- Email verification
- Password reset functionality
- Rate limiting and DDoS protection
- Input validation and sanitization
- XSS and NoSQL injection protection

### User Management
- User registration and login
- Profile management
- Avatar upload
- Follow/unfollow functionality
- Wishlist management
- Order history
- User roles (buyer, seller, admin)

### Product Management
- Create, read, update, delete products
- Multiple image uploads
- Product categorization
- Stock management
- Search and filtering
- Pagination
- Rating system

### Orders & Payments
- Shopping cart to order creation
- Stripe payment integration
- Order tracking
- Payment confirmation
- Refund processing
- Order history

### Real-Time Chat
- Socket.IO for real-time messaging
- Direct user-to-user conversations
- Message read status
- Typing indicators
- Unread message count

### AI Virtual Try-On
- Image upload and processing
- AI-powered virtual try-on
- Cloudinary integration for image storage
- Try-on history

### Admin Features
- User and product management
- Order management
- Order status updates
- User blocking

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Stripe account
- Cloudinary account
- Gmail account (for email notifications)
- OpenAI account (for AI features, optional)

## 🛠️ Installation

### 1. Clone and Setup

```bash
cd backend
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Update the following in `.env`:

```env
# Server
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/marketplace
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/marketplace

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your-refresh-secret-key

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@marketplace.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLIC_KEY=pk_test_your_stripe_key

# OpenAI (optional)
OPENAI_API_KEY=sk-your-openai-key
```

### 3. Start MongoDB

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (update MONGODB_URI in .env)
```

### 4. Run Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## 📚 API Endpoints

### Authentication

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Users

```
GET    /api/users/profile
PUT    /api/users/profile
POST   /api/users/avatar
GET    /api/users/:userId
POST   /api/users/:userId/follow
DELETE /api/users/:userId/follow
GET    /api/users/orders
POST   /api/users/wishlist/:productId
DELETE /api/users/wishlist/:productId
```

### Products

```
GET    /api/products
GET    /api/products/:productId
POST   /api/products (Seller only)
PUT    /api/products/:productId (Seller only)
DELETE /api/products/:productId (Seller only)
POST   /api/products/:productId/images (Seller only)
GET    /api/products/seller/:sellerId
```

### Orders

```
POST   /api/orders
GET    /api/orders/my-orders
GET    /api/orders/:orderId
POST   /api/orders/:orderId/confirm-payment
PUT    /api/orders/:orderId/status (Seller/Admin)
POST   /api/orders/:orderId/cancel
```

### Chat

```
POST   /api/chat/conversations
GET    /api/chat/conversations
GET    /api/chat/conversations/:conversationId/messages
POST   /api/chat/conversations/:conversationId/messages
GET    /api/chat/unread-count
```

### AI Virtual Try-On

```
POST   /api/ai/try-on (requires userImage and productImage)
GET    /api/ai/try-on-history
```

## 🔗 API Examples

### 1. Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "_id": "user-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "buyer"
    },
    "accessToken": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### 3. Create Product (Seller)

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Vintage Leather Jacket",
    "description": "Beautiful vintage leather jacket in perfect condition",
    "price": 89.99,
    "category": "clothing",
    "stock": 5,
    "size": ["S", "M", "L", "XL"],
    "color": ["black", "brown"]
  }'
```

### 4. Get All Products

```bash
curl "http://localhost:5000/api/products?category=clothing&minPrice=10&maxPrice=100&page=1&limit=12"
```

### 5. Create Order

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "product-id",
        "quantity": 1,
        "size": "M",
        "color": "black"
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "shippingMethod": "standard",
    "paymentMethod": "stripe"
  }'
```

### 6. Virtual Try-On

```bash
curl -X POST http://localhost:5000/api/ai/try-on \
  -H "Authorization: Bearer your-access-token" \
  -F "userImage=@user-photo.jpg" \
  -F "productImage=@product-photo.jpg"
```

### 7. Send Message (Chat)

```bash
curl -X POST http://localhost:5000/api/chat/conversations/conversation-id/messages \
  -H "Authorization: Bearer your-access-token" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hi, is this product available?",
    "receiverId": "other-user-id"
  }'
```

## 🔐 Security

- **Helmet.js**: HTTP security headers
- **bcryptjs**: Password hashing
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation with express-validator
- **Sanitization**: MongoDB injection and XSS protection
- **JWT**: Secure token-based authentication
- **CORS**: Cross-origin resource sharing control

## 🗄️ Database Models

### User
- Authentication credentials
- Profile information
- Avatar
- Address
- Followers/Following
- Wishlist
- Seller shop information

### Product
- Title, description, price
- Images (multiple)
- Stock management
- Categories and tags
- Ratings and reviews
- SEO optimization

### Order
- Items and pricing
- Shipping information
- Payment status
- Order tracking
- Status history

### Message
- Conversation reference
- Sender and receiver
- Message content
- Read status
- Timestamps

### Conversation
- Participants (2 users)
- Last message reference
- Active status

### Review
- Product and order reference
- Rating and content
- Images
- Verification status

## 🔄 Real-Time Features with Socket.IO

### Events

**Client -> Server:**
- `user-join`: User joins chat
- `send-message`: Send a message
- `mark-as-read`: Mark message as read
- `typing`: User is typing
- `stop-typing`: User stopped typing

**Server -> Client:**
- `receive-message`: New message received
- `message-sent`: Message delivery confirmation
- `user-typing`: User is typing
- `user-stop-typing`: User stopped typing
- `message-read-confirmation`: Message read confirmation

### Example Socket Connection (Frontend)

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.emit('user-join', userId);

socket.on('receive-message', (data) => {
  console.log('New message:', data);
});

socket.emit('send-message', {
  conversationId: 'conv-id',
  senderId: 'your-id',
  receiverId: 'other-id',
  content: 'Hello!'
});
```

## 🤖 AI Virtual Try-On Integration

The API supports virtual try-on with image processing:

1. **Upload Images**: User image and product image
2. **Cloudinary Processing**: Images are uploaded and stored
3. **AI Processing**: Images are sent to AI service for processing
4. **Result**: Processed image URL returned

Currently supports:
- Image validation and size limits
- Cloudinary storage
- Placeholder for AI integration

To integrate with actual AI:
- OpenAI Vision API
- Custom ML model
- RemoveBG API
- Other AI providers

See `services/aiService.js` for implementation details.

## 💳 Stripe Integration

The backend handles:
- Payment intent creation
- Payment confirmation
- Refund processing
- Webhook handling (can be extended)

Set up webhooks in Stripe dashboard for production.

## 📧 Email Service

Configured with Nodemailer + Gmail:
- Registration confirmation
- Email verification
- Password reset
- Order notifications
- Shipment updates

## 🚀 Deployment

### Production Checklist

1. **Update Environment Variables**
   - Generate strong JWT secrets
   - Use production database
   - Enable HTTPS
   - Update CORS_ORIGIN

2. **Security**
   - Enable rate limiting
   - Configure Helmet options
   - Set secure session cookies
   - Use HTTPS only

3. **Database**
   - Use MongoDB Atlas or managed service
   - Set up backups
   - Configure indexes
   - Monitor performance

4. **Monitoring**
   - Set up logging service
   - Configure error tracking
   - Monitor API performance
   - Set up alerts

5. **Deployment Platforms**
   - Heroku
   - Railway
   - Render
   - AWS EC2
   - DigitalOcean

## 📝 Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic services
├── sockets/        # Socket.IO handlers
├── utils/          # Utility functions
├── uploads/        # Temporary file storage
├── server.js       # Main server file
├── package.json    # Dependencies
└── .env.example    # Environment template
```

## 🐛 Debugging

Enable debug logs:

```env
NODE_ENV=development
```

Logs are stored in `logs/` directory:
- `app.log`: General application logs
- `error.log`: Error logs

## 📞 Support & Troubleshooting

### Common Issues

**MongoDB Connection Error**
```
Make sure MongoDB is running and MONGODB_URI is correct
mongod --version
```

**Stripe Error**
```
Check STRIPE_SECRET_KEY in .env
Verify Stripe account is active
```

**Email Not Sending**
```
Check EMAIL_USER and EMAIL_PASS
Enable "Less secure app access" for Gmail
Use app-specific password
```

**CORS Error**
```
Update CORS_ORIGIN in .env
Make sure frontend is running on correct port
```

## 📄 License

ISC

## 👨‍💻 Author

Built with ❤️ for e-commerce platforms

---

**Ready for Production** ✅
- Professional code structure
- Complete error handling
- Security best practices
- Scalable architecture
- Well-documented API
