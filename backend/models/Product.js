/**
 * Product Model
 * Stores product information, images, and metadata
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // Basic Info
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Pricing
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Categories & Classification
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'clothing',
        'shoes',
        'accessories',
        'electronics',
        'home',
        'beauty',
        'sports',
        'books',
        'toys',
        'other',
      ],
    },
    subCategory: String,
    brand: String,
    condition: {
      type: String,
      enum: ['new', 'like-new', 'good', 'fair', 'vintage'],
      default: 'new',
    },

    // Product Details
    size: [String], // e.g., ["S", "M", "L", "XL"]
    color: [String],
    material: String,
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },

    // Images
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    thumbnail: {
      url: String,
      publicId: String,
    },

    // Inventory
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    sku: String,

    // Status & Visibility
    status: {
      type: String,
      enum: ['active', 'inactive', 'sold', 'pending'],
      default: 'active',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Ratings & Reviews
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },

    // SEO & Tags
    tags: [String],
    slug: {
      type: String,
      unique: true,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create slug before saving
productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .concat('-' + Date.now());
  }
  next();
});

// Index for search optimization
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ seller: 1 });

module.exports = mongoose.model('Product', productSchema);
