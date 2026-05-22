# Complete API Documentation

Complete reference for all backend API endpoints with examples.

## Table of Contents
1. [Authentication](#authentication)
2. [Users](#users)
3. [Products](#products)
4. [Orders](#orders)
5. [Chat](#chat)
6. [AI Virtual Try-On](#ai-virtual-try-on)

---

## Authentication

### Register User

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "buyer",
      "isEmailVerified": false,
      "createdAt": "2024-01-01T10:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "buyer",
      "avatar": {
        "url": "https://cloudinary.com/image.jpg",
        "publicId": "avatars/user-id"
      },
      "bio": "Fashion enthusiast",
      "lastLogin": "2024-01-01T10:30:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Verify Email

**Endpoint:** `POST /api/auth/verify-email`

**Request:**
```json
{
  "token": "email-verification-token-from-email"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Request:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

### Refresh Token

**Endpoint:** `POST /api/auth/refresh-token`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Users

### Get User Profile

**Endpoint:** `GET /api/users/profile`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "Profile fetched",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "avatar": {
      "url": "https://cloudinary.com/image.jpg",
      "publicId": "avatars/user-id"
    },
    "bio": "Fashion enthusiast",
    "role": "buyer",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "followers": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "firstName": "Jane",
        "lastName": "Doe",
        "avatar": { "url": "..." }
      }
    ],
    "following": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "firstName": "Bob",
        "lastName": "Smith",
        "avatar": { "url": "..." }
      }
    ],
    "wishlist": ["product-id-1", "product-id-2"],
    "followers_count": 42,
    "following_count": 15,
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

### Update User Profile

**Endpoint:** `PUT /api/users/profile`

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "bio": "Updated bio",
  "address": {
    "street": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "USA"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "bio": "Updated bio",
    "address": {
      "street": "456 Oak Ave",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001",
      "country": "USA"
    },
    "updatedAt": "2024-01-01T10:30:00Z"
  }
}
```

### Upload Avatar

**Endpoint:** `POST /api/users/avatar`

**Headers:** 
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Body:**
```
Form Data:
- avatar: [image file]
```

**Response (200):**
```json
{
  "success": true,
  "message": "Avatar uploaded",
  "data": {
    "avatar": {
      "url": "https://cloudinary.com/avatar.jpg",
      "publicId": "avatars/507f1f77bcf86cd799439011"
    }
  }
}
```

### Follow User

**Endpoint:** `POST /api/users/{userId}/follow`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "User followed"
}
```

### Unfollow User

**Endpoint:** `DELETE /api/users/{userId}/follow`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "User unfollowed"
}
```

### Get Public User Profile

**Endpoint:** `GET /api/users/{userId}`

**Response (200):**
```json
{
  "success": true,
  "message": "User fetched",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": { "url": "..." },
    "bio": "Fashion enthusiast",
    "followers": [...],
    "following": [...],
    "shopName": "John's Vintage Shop",
    "shopRating": 4.8,
    "shopReviews": 157,
    "totalSales": 2340
  }
}
```

### Add to Wishlist

**Endpoint:** `POST /api/users/wishlist/{productId}`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "Added to wishlist"
}
```

### Remove from Wishlist

**Endpoint:** `DELETE /api/users/wishlist/{productId}`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "Removed from wishlist"
}
```

### Get My Orders

**Endpoint:** `GET /api/users/orders?page=1&limit=10`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "Orders fetched",
  "data": [
    {
      "_id": "order-id",
      "orderNumber": "ORD-1704114000000-1",
      "items": [
        {
          "product": {
            "_id": "product-id",
            "title": "Vintage Jacket",
            "images": [{ "url": "..." }],
            "price": 89.99
          },
          "quantity": 1
        }
      ],
      "totalAmount": 99.99,
      "status": "delivered",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "pages": 1,
    "currentPage": 1,
    "perPage": 10
  }
}
```

---

## Products

### Get All Products

**Endpoint:** `GET /api/products?category=clothing&minPrice=10&maxPrice=100&search=jacket&page=1&limit=12`

**Query Parameters:**
- `category`: optional - clothing, shoes, accessories, etc.
- `minPrice`: optional - minimum price
- `maxPrice`: optional - maximum price
- `search`: optional - search by title/description
- `page`: optional - pagination page (default: 1)
- `limit`: optional - items per page (default: 12)

**Response (200):**
```json
{
  "success": true,
  "message": "Products fetched",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Vintage Leather Jacket",
      "description": "Beautiful vintage leather jacket in perfect condition",
      "price": 89.99,
      "originalPrice": 120,
      "discount": 25,
      "category": "clothing",
      "brand": "Leather Co",
      "condition": "like-new",
      "size": ["S", "M", "L", "XL"],
      "color": ["black", "brown"],
      "images": [
        { "url": "https://cloudinary.com/image1.jpg" },
        { "url": "https://cloudinary.com/image2.jpg" }
      ],
      "thumbnail": { "url": "https://cloudinary.com/image1.jpg" },
      "stock": 5,
      "averageRating": 4.8,
      "reviewCount": 23,
      "totalSales": 50,
      "seller": {
        "_id": "seller-id",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": { "url": "..." },
        "shopRating": 4.8
      },
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "pages": 13,
    "currentPage": 1,
    "perPage": 12
  }
}
```

### Get Product by ID

**Endpoint:** `GET /api/products/{productId}`

**Response (200):**
```json
{
  "success": true,
  "message": "Product fetched",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Vintage Leather Jacket",
    "description": "...",
    "price": 89.99,
    "seller": {
      "_id": "seller-id",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": { "url": "..." },
      "shopRating": 4.8,
      "shopName": "John's Vintage Shop"
    }
  }
}
```

### Create Product (Seller Only)

**Endpoint:** `POST /api/products`

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "title": "Vintage Leather Jacket",
  "description": "Beautiful vintage leather jacket in perfect condition",
  "price": 89.99,
  "originalPrice": 120,
  "category": "clothing",
  "subCategory": "jackets",
  "brand": "Leather Co",
  "condition": "like-new",
  "stock": 5,
  "size": ["S", "M", "L", "XL"],
  "color": ["black", "brown"],
  "material": "genuine leather",
  "tags": ["vintage", "leather", "jacket"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Vintage Leather Jacket",
    "seller": "seller-id",
    "status": "pending",
    "slug": "vintage-leather-jacket-1704114000000"
  }
}
```

### Update Product (Seller Only)

**Endpoint:** `PUT /api/products/{productId}`

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "title": "Updated Title",
  "price": 99.99,
  "stock": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated",
  "data": { "..." }
}
```

### Upload Product Images (Seller Only)

**Endpoint:** `POST /api/products/{productId}/images`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Body:**
```
Form Data:
- images: [file1, file2, file3] (max 5 files)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Images uploaded",
  "data": {
    "images": [
      {
        "url": "https://cloudinary.com/product-image-1.jpg",
        "publicId": "products/507f1f77bcf86cd799439011"
      }
    ]
  }
}
```

### Delete Product (Seller Only)

**Endpoint:** `DELETE /api/products/{productId}`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted"
}
```

### Get Seller Products

**Endpoint:** `GET /api/products/seller/{sellerId}?page=1&limit=12`

**Response (200):**
```json
{
  "success": true,
  "message": "Products fetched",
  "data": [...],
  "pagination": { "..." }
}
```

---

## Orders

### Create Order (Checkout)

**Endpoint:** `POST /api/orders`

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
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
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439011",
      "orderNumber": "ORD-1704114000000-1",
      "buyer": "buyer-id",
      "seller": "seller-id",
      "items": [
        {
          "product": "product-id",
          "quantity": 1,
          "price": 89.99,
          "size": "M",
          "color": "black"
        }
      ],
      "subtotal": 89.99,
      "tax": 9.00,
      "shippingCost": 10.00,
      "totalAmount": 108.99,
      "shippingAddress": { "..." },
      "shippingMethod": "standard",
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "2024-01-01T10:00:00Z"
    },
    "clientSecret": "pi_1234567890_secret_abcdefghijk"
  }
}
```

### Confirm Payment

**Endpoint:** `POST /api/orders/{orderId}/confirm-payment`

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "paymentIntentId": "pi_1234567890"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment confirmed",
  "data": {
    "_id": "order-id",
    "orderNumber": "ORD-1704114000000-1",
    "status": "confirmed",
    "paymentStatus": "completed"
  }
}
```

### Get My Orders

**Endpoint:** `GET /api/orders/my-orders?page=1&limit=10`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "Orders fetched",
  "data": [
    {
      "_id": "order-id",
      "orderNumber": "ORD-1704114000000-1",
      "items": [...],
      "totalAmount": 108.99,
      "status": "delivered",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": { "..." }
}
```

### Get Order by ID

**Endpoint:** `GET /api/orders/{orderId}`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "Order fetched",
  "data": {
    "_id": "order-id",
    "orderNumber": "ORD-1704114000000-1",
    "buyer": {
      "_id": "buyer-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "seller": {
      "_id": "seller-id",
      "firstName": "Jane",
      "lastName": "Smith",
      "shopName": "Jane's Shop"
    },
    "items": [
      {
        "product": {
          "_id": "product-id",
          "title": "Vintage Jacket",
          "images": [{ "url": "..." }],
          "price": 89.99
        },
        "quantity": 1
      }
    ],
    "totalAmount": 108.99,
    "status": "shipped",
    "statusHistory": [
      { "status": "confirmed", "updatedAt": "2024-01-01T10:05:00Z" },
      { "status": "shipped", "updatedAt": "2024-01-02T10:00:00Z" }
    ],
    "trackingNumber": "TRACK123456"
  }
}
```

### Update Order Status (Seller Only)

**Endpoint:** `PUT /api/orders/{orderId}/status`

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "status": "shipped",
  "note": "Order has been shipped via FedEx"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order status updated",
  "data": { "..." }
}
```

### Cancel Order

**Endpoint:** `POST /api/orders/{orderId}/cancel`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled",
  "data": {
    "status": "cancelled",
    "paymentStatus": "refunded"
  }
}
```

---

## Chat

### Get or Create Conversation

**Endpoint:** `POST /api/chat/conversations`

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "otherUserId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Conversation retrieved",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "participants": [
      {
        "_id": "user-id-1",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": { "url": "..." }
      },
      {
        "_id": "user-id-2",
        "firstName": "Jane",
        "lastName": "Smith",
        "avatar": { "url": "..." }
      }
    ],
    "isActive": true,
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

### Get My Conversations

**Endpoint:** `GET /api/chat/conversations?page=1&limit=20`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "Conversations fetched",
  "data": [
    {
      "_id": "conversation-id",
      "participants": [...],
      "lastMessage": {
        "_id": "message-id",
        "content": "Thanks for the product!",
        "createdAt": "2024-01-01T12:00:00Z"
      },
      "lastMessageTime": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": { "..." }
}
```

### Get Messages

**Endpoint:** `GET /api/chat/conversations/{conversationId}/messages?page=1&limit=50`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "Messages fetched",
  "data": [
    {
      "_id": "message-id",
      "conversation": "conversation-id",
      "sender": {
        "_id": "user-id",
        "firstName": "John",
        "lastName": "Doe",
        "avatar": { "url": "..." }
      },
      "receiver": "other-user-id",
      "content": "Hi! Is this product still available?",
      "isRead": true,
      "readAt": "2024-01-01T11:30:00Z",
      "createdAt": "2024-01-01T11:00:00Z"
    }
  ],
  "pagination": { "..." }
}
```

### Send Message

**Endpoint:** `POST /api/chat/conversations/{conversationId}/messages`

**Headers:** `Authorization: Bearer {accessToken}`

**Request:**
```json
{
  "receiverId": "507f1f77bcf86cd799439012",
  "content": "Hi! Is this product still available?"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "_id": "message-id",
    "conversation": "conversation-id",
    "sender": {
      "_id": "user-id",
      "firstName": "John",
      "avatar": { "url": "..." }
    },
    "receiver": "other-user-id",
    "content": "Hi! Is this product still available?",
    "isRead": false,
    "createdAt": "2024-01-01T11:00:00Z"
  }
}
```

### Get Unread Count

**Endpoint:** `GET /api/chat/unread-count`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "Unread count fetched",
  "data": {
    "unreadCount": 5
  }
}
```

---

## AI Virtual Try-On

### Process Virtual Try-On

**Endpoint:** `POST /api/ai/try-on`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Body:**
```
Form Data:
- images: [userImage, productImage] (2 files, max 5MB each)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Virtual try-on processed",
  "data": {
    "userImageUrl": "https://cloudinary.com/user-image.jpg",
    "productImageUrl": "https://cloudinary.com/product-image.jpg",
    "processedImageUrl": "https://cloudinary.com/result-image.jpg",
    "confidence": 0.95
  }
}
```

### Get Try-On History

**Endpoint:** `GET /api/ai/try-on-history`

**Headers:** `Authorization: Bearer {accessToken}`

**Response (200):**
```json
{
  "success": true,
  "message": "Try-on history fetched",
  "data": {
    "note": "Implement database storage for try-on results"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "msg": "Email is required",
      "param": "email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token is required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limits

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Upload: 20 requests per hour
- Payment: 10 requests per hour

---

End of API Documentation
