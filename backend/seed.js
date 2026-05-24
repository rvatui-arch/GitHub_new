/**
 * Seed Script
 * Run with: node seed.js
 * Inserts sample products into MongoDB so you can see them in the app.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');

const SELLER_EMAIL = 'seller@secondstyle.com';
const SELLER_PASSWORD = 'password123';

const sampleProducts = [
  {
    title: "Vintage Levi's 501 Jeans",
    description: "Classic straight-fit jeans in great condition. Barely worn, faded blue wash. Perfect for a casual look.",
    price: 45,
    originalPrice: 120,
    category: 'clothing',
    condition: 'like-new',
    brand: "Levi's",
    size: ['M', '32x32'],
    color: ['blue'],
    stock: 1,
    tags: ['jeans', 'vintage', 'denim'],
    images: [],
  },
  {
    title: 'Zara Floral Midi Dress',
    description: 'Beautiful floral print midi dress from Zara, worn only twice. Light and flowy fabric, perfect for summer.',
    price: 28,
    originalPrice: 60,
    category: 'clothing',
    condition: 'good',
    brand: 'Zara',
    size: ['S'],
    color: ['white', 'pink'],
    stock: 1,
    tags: ['dress', 'floral', 'summer', 'zara'],
    images: [],
  },
  {
    title: 'Nike Air Force 1 White',
    description: 'Classic white Nike Air Force 1 sneakers. Size EU 42. Worn a few times, in excellent condition.',
    price: 65,
    originalPrice: 110,
    category: 'shoes',
    condition: 'like-new',
    brand: 'Nike',
    size: ['42'],
    color: ['white'],
    stock: 1,
    tags: ['nike', 'sneakers', 'air force'],
    images: [],
  },
  {
    title: 'H&M Oversized Blazer',
    description: 'Trendy oversized blazer in beige. Perfect for office or casual styling. Worn 3-4 times.',
    price: 22,
    originalPrice: 55,
    category: 'clothing',
    condition: 'good',
    brand: 'H&M',
    size: ['M', 'L'],
    color: ['beige'],
    stock: 1,
    tags: ['blazer', 'oversized', 'office'],
    images: [],
  },
  {
    title: 'Leather Crossbody Bag',
    description: 'Small genuine leather crossbody bag in tan. Multiple compartments, adjustable strap. Minimal signs of use.',
    price: 38,
    originalPrice: 95,
    category: 'accessories',
    condition: 'good',
    brand: 'Massimo Dutti',
    size: [],
    color: ['tan', 'brown'],
    stock: 1,
    tags: ['bag', 'leather', 'crossbody', 'accessories'],
    images: [],
  },
  {
    title: 'Adidas Originals Track Jacket',
    description: 'Retro Adidas track jacket in black with white stripes. Size L, fits true to size.',
    price: 35,
    originalPrice: 80,
    category: 'clothing',
    condition: 'like-new',
    brand: 'Adidas',
    size: ['L'],
    color: ['black', 'white'],
    stock: 1,
    tags: ['adidas', 'jacket', 'sporty', 'retro'],
    images: [],
  },
  {
    title: 'Mango Silk Blouse',
    description: 'Elegant silk-feel blouse in ivory, button-down front, size S. Great for work or evenings out.',
    price: 18,
    originalPrice: 40,
    category: 'clothing',
    condition: 'good',
    brand: 'Mango',
    size: ['S'],
    color: ['ivory'],
    stock: 1,
    tags: ['blouse', 'silk', 'elegant'],
    images: [],
  },
  {
    title: 'Ray-Ban Wayfarer Sunglasses',
    description: 'Classic Ray-Ban Wayfarer in tortoise shell. Comes with original case and cloth. No scratches.',
    price: 55,
    originalPrice: 140,
    category: 'accessories',
    condition: 'like-new',
    brand: 'Ray-Ban',
    size: [],
    color: ['brown', 'black'],
    stock: 1,
    tags: ['sunglasses', 'ray-ban', 'wayfarer'],
    images: [],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB:', process.env.MONGODB_URI);

    // Find or create a seller account
    // Pass plain password — the User model's pre-save hook hashes it automatically
    let seller = await User.findOne({ email: SELLER_EMAIL });
    if (!seller) {
      seller = await User.create({
        firstName: 'Demo',
        lastName: 'Seller',
        email: SELLER_EMAIL,
        password: SELLER_PASSWORD,
      });
      console.log('Created seller account:', SELLER_EMAIL, '/ password:', SELLER_PASSWORD);
    } else {
      // Reset password in case it was previously double-hashed
      seller.password = SELLER_PASSWORD;
      await seller.save();
      console.log('Reset password for existing seller:', SELLER_EMAIL);
    }

    // Remove existing products from this seller to avoid duplicates
    const deleted = await Product.deleteMany({ seller: seller._id });
    if (deleted.deletedCount > 0) console.log(`Removed ${deleted.deletedCount} old seed products.`);

    // Insert new products one by one so pre-save hooks run (slug generation)
    const inserted = [];
    for (const p of sampleProducts) {
      const doc = await Product.create({ ...p, seller: seller._id, status: 'active' });
      inserted.push(doc);
      process.stdout.write(`  + ${doc.title}\n`);
    }
    console.log(`\n✅ Inserted ${inserted.length} products successfully!`);
    console.log('\nYou can now:');
    console.log('  1. Open the app in the browser');
    console.log('  2. Browse tab should show all', inserted.length, 'products');
    console.log('  3. Log in with:', SELLER_EMAIL, '/', SELLER_PASSWORD);

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
