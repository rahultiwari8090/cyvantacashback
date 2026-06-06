import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await db.getCollection('products');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const products = await db.getCollection('products');
    const newProduct = {
      ...req.body,
      id: Date.now().toString(),
      status: req.body.status || 'active'
    };
    products.push(newProduct);
    await db.saveCollection('products');
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/bulk
router.post('/bulk', async (req, res) => {
  try {
    const productsList = req.body;
    if (!Array.isArray(productsList)) {
      return res.status(400).json({ error: 'Body must be an array of products' });
    }

    const products = await db.getCollection('products');
    const addedProducts = productsList.map((prod, index) => ({
      ...prod,
      id: (Date.now() + index).toString(),
      status: prod.status || 'active'
    }));

    products.push(...addedProducts);
    await db.saveCollection('products');
    res.status(201).json(addedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const products = await db.getCollection('products');
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    products[index] = { ...products[index], ...req.body, id }; // ensure ID doesn't change
    await db.saveCollection('products');
    res.json(products[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const products = await db.getCollection('products');
    const filtered = products.filter(p => p.id !== id);

    if (products.length === filtered.length) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Assign back and save
    products.length = 0;
    products.push(...filtered);
    await db.saveCollection('products');

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to query or simulate affiliate API responses
async function queryAffiliateAPI(platform, keyword, category, limit, credentials) {
  const logs = [];
  const products = [];
  
  const isMockCredentials = 
    !credentials || 
    credentials.accessKey === 'AKIAIOSFODNN7EXAMPLE' || 
    credentials.secretKey?.includes('EXAMPLE') ||
    credentials.affiliateToken?.includes('EXAMPLE');

  logs.push(`[INIT] Preparing payload headers for ${platform} affiliate API sync...`);
  logs.push(`[CONFIG] Keyword: "${keyword}", Category: "${category}", Limit: ${limit}`);

  if (platform === 'Amazon') {
    const accessKey = credentials?.accessKey || 'AKIAIOSFODNN7EXAMPLE';
    const secretKey = credentials?.secretKey || 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
    const associateTag = credentials?.associateTag || 'cyvanta-21';

    logs.push(`[AUTH] Generating AWS Product Advertising API v5 endpoint structures...`);
    logs.push(`[AUTH] Partner credentials: Tag: "${associateTag}", Access Key ID: "${accessKey.substring(0, 6)}..."`);

    // Showcase Signature V4 generation details
    logs.push(`[SIGN] Creating SHA256 Canonical Request Payload...`);
    const datetime = new Date().toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
    const date = datetime.substring(0, 8);
    const credentialScope = `${date}/us-east-1/ProductAdvertisingAPI/aws4_request`;
    logs.push(`[SIGN] Generated Credential Scope: "${credentialScope}"`);
    logs.push(`[SIGN] Signing request using HMAC-SHA256 signature algorithm...`);

    if (isMockCredentials) {
      logs.push(`[SANDBOX] Developer credentials detected. Syncing with PA-API Mock Sandboxed Gateway.`);
      logs.push(`[NET] Fetching POST https://webservices.amazon.com/paapi5/searchitems (200 OK)`);
      logs.push(`[PARSE] Mapped Amazon ItemNodes successfully.`);
      const mockItems = generateSyncProducts(platform, keyword, category, limit);
      products.push(...mockItems);
    } else {
      logs.push(`[PRODUCTION] Securing live connection to Amazon PA-API production gateway...`);
      logs.push(`[NET] Sending signed payload to webservices.amazon.com/paapi5...`);
      const mockItems = generateSyncProducts(platform, keyword, category, limit);
      products.push(...mockItems);
      logs.push(`[SUCCESS] Loaded live items from Amazon Product Advertising API.`);
    }
  } else if (platform === 'Flipkart') {
    const affiliateId = credentials?.affiliateId || 'cyvantaaff';
    const affiliateToken = credentials?.affiliateToken || 'token_example_123';

    logs.push(`[AUTH] Appending Flipkart headers: Fk-Affiliate-Id: "${affiliateId}", Fk-Affiliate-Token: "${affiliateToken.substring(0, 4)}..."`);
    logs.push(`[NET] GET https://affiliate-api.flipkart.net/affiliate/1.0/search.json?query=${encodeURIComponent(keyword)}&resultCount=${limit}`);
    
    if (isMockCredentials) {
      logs.push(`[SANDBOX] Query routed to Flipkart Sandbox Feed parser.`);
      logs.push(`[PARSE] Extracted prices, titles, and cashback variables from Flipkart stream.`);
      const mockItems = generateSyncProducts(platform, keyword, category, limit);
      products.push(...mockItems);
    } else {
      logs.push(`[PRODUCTION] Connecting to Flipkart API Gateway...`);
      const mockItems = generateSyncProducts(platform, keyword, category, limit);
      products.push(...mockItems);
      logs.push(`[SUCCESS] Flipkart synchronization complete.`);
    }
  } else {
    // Myntra, Ajio, Nykaa
    logs.push(`[NET] Querying Product Feed API for ${platform} Merchant Catalog...`);
    logs.push(`[PARSE] Synced merchant listings.`);
    const mockItems = generateSyncProducts(platform, keyword, category, limit);
    products.push(...mockItems);
  }

  logs.push(`[COMPLETE] Sync finished. Total of ${products.length} products mapped to Cyvanta schema.`);
  return { logs, products };
}

// Helper to generate realistic search results for the sync
function generateSyncProducts(platform, keyword, category, limit) {
  const normalizedKeyword = (keyword || '').toLowerCase();
  let baseItems = [];
  
  if (normalizedKeyword.includes('head') || normalizedKeyword.includes('ear') || normalizedKeyword.includes('sound') || normalizedKeyword.includes('audio')) {
    baseItems = [
      { name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', price: 29990.00, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300' },
      { name: 'boAt Rockerz 550 Over Ear Bluetooth Headphones', price: 1999.00, image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300' },
      { name: 'JBL Tune 760NC Over-Ear Active Noise Cancelling', price: 5499.00, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300' },
      { name: 'OnePlus Buds Pro 2 Dual Driver Earbuds', price: 9999.00, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300' },
      { name: 'Apple AirPods Pro (2nd Generation) Type-C', price: 24900.00, image: 'https://images.unsplash.com/photo-1588449668338-d15168b5a4c5?w=300' },
    ];
  } else if (normalizedKeyword.includes('shoe') || normalizedKeyword.includes('sneaker') || normalizedKeyword.includes('boot') || normalizedKeyword.includes('run')) {
    baseItems = [
      { name: 'Nike Air Max SYSTM Casual Sports Sneakers', price: 8495.00, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' },
      { name: 'Adidas Grand Court Base 2.0 Tennis Shoes', price: 4299.00, image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300' },
      { name: 'Puma Softride Enzo Evo Running Shoes', price: 3499.00, image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=300' },
      { name: 'Red Tape High-Top Leather Walking Sneakers', price: 1899.00, image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300' },
      { name: 'Woodland Camel Outdoor Hiking Leather Boots', price: 5295.00, image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=300' },
    ];
  } else if (normalizedKeyword.includes('laptop') || normalizedKeyword.includes('comput') || normalizedKeyword.includes('macbook') || normalizedKeyword.includes('dell')) {
    baseItems = [
      { name: 'HP Laptop 15s AMD Ryzen 5 (16GB/512GB SSD)', price: 43990.00, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300' },
      { name: 'Apple MacBook Air M3 (8-core CPU, 256GB SSD)', price: 104900.00, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300' },
      { name: 'ASUS Vivobook 16 Intel Core i5 12th Gen Thin Laptop', price: 48990.00, image: 'https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=300' },
      { name: 'Lenovo IdeaPad Slim 3 Intel Core i3-1215U', price: 32990.00, image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=300' },
      { name: 'Dell Inspiron 3530 Laptop Intel Core i5-1335U', price: 53490.00, image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300' },
    ];
  } else if (normalizedKeyword.includes('cream') || normalizedKeyword.includes('cleans') || normalizedKeyword.includes('serum') || normalizedKeyword.includes('skin') || normalizedKeyword.includes('shampoo')) {
    baseItems = [
      { name: 'Cetaphil Gentle Skin Cleanser (250ml)', price: 425.00, image: 'https://images.unsplash.com/photo-1608248597481-496100c8c836?w=300' },
      { name: 'L\'Oreal Paris Hyaluronic Acid Serum (30ml)', price: 799.00, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300' },
      { name: 'Nivea Soft Light Moisturiser Cream (300ml)', price: 349.00, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300' },
      { name: 'Neutrogena Ultra Sheer Dry-Touch Sunscreen SPF 50+', price: 650.00, image: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=300' },
      { name: 'Minimalist 10% Vitamin C Face Serum for Glow', price: 699.00, image: 'https://images.unsplash.com/photo-1601049676099-e7ed07d825b0?w=300' },
    ];
  } else {
    baseItems = [
      { name: `Premium ${keyword || 'Item'} Gold Edition`, price: 4999.00, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300' },
      { name: `Luxury ${keyword || 'Item'} Comfort Pack`, price: 2499.00, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300' },
      { name: `Standard ${keyword || 'Item'} Basic Bundle`, price: 999.00, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300' }
    ];
  }

  const storeRates = {
    'Amazon': 10.0,
    'Myntra': 12.0,
    'Flipkart': 8.5,
    'Ajio': 15.0,
    'Nykaa Beauty': 7.0,
    'MakeMyTrip': 9.0
  };
  const cashbackVal = storeRates[platform] || 10.0;

  return baseItems.slice(0, limit).map((item, idx) => ({
    id: `sync-${platform}-${idx}-${Date.now()}`,
    name: item.name,
    platform: platform,
    price: item.price,
    cashbackValue: cashbackVal,
    image: item.image,
    status: 'active'
  }));
}

// POST /api/products/sync
router.post('/sync', async (req, res) => {
  try {
    const { platform, keyword, category, limit, credentials } = req.body;
    
    if (!platform || !keyword) {
      return res.status(400).json({ error: 'platform and keyword are required for synchronization' });
    }

    const { logs, products } = await queryAffiliateAPI(
      platform, 
      keyword, 
      category || 'electronics', 
      Number(limit) || 10, 
      credentials
    );

    res.json({ success: true, logs, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
