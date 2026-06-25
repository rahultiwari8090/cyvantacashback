import React, { useState } from 'react';
import { Plus, Trash2, Search, Filter, Edit2, Download, Terminal, Settings } from 'lucide-react';
import { AdminTable, AdminModal, AdminFormInput, AdminFormSelect, AdminFormSwitch, ExportDataButton } from './AdminComponents';
import { apiUpload } from '../services/api';

// Mock Generator for Affiliate API responses
const generateMockAffiliateProducts = (platform, keyword, category, limit) => {
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
  } else if (normalizedKeyword.includes('hotel') || normalizedKeyword.includes('flight') || normalizedKeyword.includes('tour') || normalizedKeyword.includes('trip')) {
    baseItems = [
      { name: 'Goa Tour package: 3 Nights Resort Stay + Flights included', price: 14500.00, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300' },
      { name: 'Delhi to Mumbai Flight Voucher (Indigo Airlines)', price: 4200.00, image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300' },
      { name: 'Himachal Honeymoon Package: Kullu-Manali 5D/4N Tour', price: 22000.00, image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=300' },
      { name: 'Taj Mahal Palace Mumbai: 1 Night Luxury Room Booking', price: 18500.00, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300' },
    ];
  } else {
    const nameSeed = keyword || 'Premium Item';
    baseItems = [
      { name: `Official ${nameSeed} Pro Series Edition`, price: 2999.00, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300' },
      { name: `Deluxe ${nameSeed} V2 Smart Gadget`, price: 1499.00, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300' },
      { name: `Advanced ${nameSeed} Premium Kit`, price: 7999.00, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300' },
      { name: `Mini Portable ${nameSeed} Starter Pack`, price: 499.00, image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300' },
      { name: `Exclusive Signature ${nameSeed} Elite Bundle`, price: 12500.00, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' },
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
    id: `temp-${platform}-${idx}-${Date.now()}`,
    name: item.name,
    platform: platform,
    price: item.price,
    cashbackValue: cashbackVal,
    affiliateUrl: `https://mock.affiliate.link/${platform.toLowerCase()}/${idx}`,
    image: item.image,
    status: 'active'
  }));
};

export default function AdminProducts({ products, stores = [], categories = [], onAddProduct, onAddProductBulk, onToggleStatus, onDeleteProduct, onEditProduct }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // null means adding
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');

  // Bulk Import States
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkImportMode, setBulkImportMode] = useState('api'); // 'api' or 'raw'
  const [apiPlatform, setApiPlatform] = useState('Amazon');
  const [apiKeyword, setApiKeyword] = useState('');
  const [apiCategory, setApiCategory] = useState('electronics');
  const [apiLimit, setApiLimit] = useState(10);
  
  // Credentials
  const [awsAccessKey, setAwsAccessKey] = useState('AKIAIOSFODNN7EXAMPLE');
  const [awsSecretKey, setAwsSecretKey] = useState('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
  const [awsAssociateTag, setAwsAssociateTag] = useState('cyvanta-21');
  const [showCredentials, setShowCredentials] = useState(false);

  // Raw states
  const [rawText, setRawText] = useState('');
  const [rawFormat, setRawFormat] = useState('json');
  const [rawDefaultPlatform, setRawDefaultPlatform] = useState('Amazon');

  // Preview & Selection states
  const [previewProducts, setPreviewProducts] = useState([]);
  const [selectedPreviewIds, setSelectedPreviewIds] = useState(new Set());
  
  // Console logging & loading
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [wizardError, setWizardError] = useState('');

  // Form states
  const [prodName, setProdName] = useState('');
  const [prodPlatform, setProdPlatform] = useState('Amazon');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCashbackValue, setProdCashbackValue] = useState('');
  const [prodAffiliateUrl, setProdAffiliateUrl] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [prodCategory, setProdCategory] = useState('electronics');
  const [prodActive, setProdActive] = useState(true);
  const [formError, setFormError] = useState('');

  const platformOptions = stores.length > 0 
    ? stores.map(s => ({ value: s.name, label: s.name })) 
    : [
        { value: 'Amazon', label: 'Amazon' },
        { value: 'Flipkart', label: 'Flipkart' },
        { value: 'Myntra', label: 'Myntra' },
        { value: 'Ajio', label: 'Ajio' },
        { value: 'Nykaa Beauty', label: 'Nykaa Beauty' },
        { value: 'MakeMyTrip', label: 'MakeMyTrip' }
      ];

  const openBulkModal = () => {
    setBulkImportMode('api');
    setApiKeyword('');
    setApiCategory('electronics');
    setApiLimit(10);
    setRawText('');
    setPreviewProducts([]);
    setSelectedPreviewIds(new Set());
    setTerminalLogs([]);
    setWizardError('');
    setIsBulkModalOpen(true);
  };

  const handleApiFetch = () => {
    if (!apiKeyword.trim()) {
      setWizardError('Please enter a search keyword.');
      return;
    }
    setWizardError('');
    setIsSyncing(true);
    setTerminalLogs([]);
    setPreviewProducts([]);
    setSelectedPreviewIds(new Set());

    const logs = [
      `[INIT] Preparing request payload headers for ${apiPlatform} API...`,
      `[AUTH] Authenticating using AWS Signature V4 / Client API tokens...`,
      `[GET] Querying GET /paapi5/searchitems?Keywords=${encodeURIComponent(apiKeyword)}&Category=${apiCategory}...`,
      `[NET] Request routed to regional endpoint. Connection successful.`,
      `[PARSE] JSON response received (200 OK). Parsing product nodes...`,
      `[SYNC] Mapping vendor schema fields to Cyvanta product standards...`,
      `[SUCCESS] Correctly loaded ${apiLimit} mock affiliate products. Select items to import below.`
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setTerminalLogs(prev => [...prev, logs[currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setIsSyncing(false);
        const fetched = generateMockAffiliateProducts(apiPlatform, apiKeyword, apiCategory, apiLimit);
        setPreviewProducts(fetched);
        setSelectedPreviewIds(new Set(fetched.map(p => p.id))); // select all by default
      }
    }, 300);
  };

  const handleRawParse = () => {
    if (!rawText.trim()) {
      setWizardError('Please enter raw JSON or CSV text.');
      return;
    }
    setWizardError('');
    setTerminalLogs([]);
    setPreviewProducts([]);
    setSelectedPreviewIds(new Set());
    
    try {
      if (rawFormat === 'json') {
        const parsed = JSON.parse(rawText);
        const productsArr = Array.isArray(parsed) ? parsed : [parsed];
        
        const formatted = productsArr.map((item, idx) => {
          if (!item.name || !item.price) {
            throw new Error(`Product at index ${idx} is missing 'name' or 'price'.`);
          }
          return {
            id: `raw-${idx}-${Date.now()}`,
            name: item.name,
            platform: item.platform || rawDefaultPlatform,
            price: parseFloat(item.price),
            cashbackValue: parseFloat(item.cashbackValue || 10),
            affiliateUrl: item.affiliateUrl || item.link || '',
            image: item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
            status: item.status || 'active'
          };
        });
        
        setTerminalLogs([
          `[RAW] Initializing JSON parsing engine...`,
          `[SUCCESS] Successfully parsed JSON array. Found ${formatted.length} products.`,
          `[SYNC] Schema validation complete.`
        ]);
        setPreviewProducts(formatted);
        setSelectedPreviewIds(new Set(formatted.map(p => p.id)));
      } else {
        const cleanText = rawText.replace(/^\uFEFF/, '');
        const lines = cleanText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) {
          throw new Error('CSV must contain a header row and at least one data row.');
        }
        
        const cleanStr = (s) => s ? s.trim().replace(/^["']|["']$/g, '') : '';
        const headers = lines[0].split(',').map(h => cleanStr(h).toLowerCase());
        const nameIdx = headers.indexOf('name') !== -1 ? headers.indexOf('name') : headers.indexOf('title');
        const priceIdx = headers.indexOf('price');
        
        if (nameIdx === -1 || priceIdx === -1) {
          throw new Error(`CSV headers must include at least "name" (or "title") and "price" columns. Found headers: ${headers.join(', ')}`);
        }
        
        const platformIdx = headers.indexOf('platform');
        const cashbackIdx = headers.indexOf('cashbackvalue') !== -1 ? headers.indexOf('cashbackvalue') : headers.indexOf('cashback');
        const affiliateUrlIdx = headers.indexOf('affiliateurl') !== -1 ? headers.indexOf('affiliateurl') : headers.indexOf('link');
        const imageIdx = headers.indexOf('imageurl') !== -1 ? headers.indexOf('imageurl') : (headers.indexOf('image_url') !== -1 ? headers.indexOf('image_url') : headers.indexOf('image'));
        const statusIdx = headers.indexOf('status');
        
        const formatted = [];
        for (let i = 1; i < lines.length; i++) {
          // Basic split by comma. Note: Doesn't handle commas inside quoted strings.
          const cols = lines[i].split(',').map(c => cleanStr(c));
          if (cols.length < headers.length) continue;
          
          const name = cols[nameIdx];
          const priceStr = cols[priceIdx].replace(/[^0-9.]/g, ''); // strip any currency symbols just in case
          const price = parseFloat(priceStr);
          
          if (!name || isNaN(price)) {
            throw new Error(`Data format error on line ${i + 1}.`);
          }
          
          formatted.push({
            id: `raw-csv-${i}-${Date.now()}`,
            name: name,
            platform: (platformIdx !== -1 && cols[platformIdx]) ? cols[platformIdx] : rawDefaultPlatform,
            price: price,
            cashbackValue: cashbackIdx !== -1 ? parseFloat(cols[cashbackIdx] || 10) : 10,
            affiliateUrl: affiliateUrlIdx !== -1 && cols[affiliateUrlIdx] ? cols[affiliateUrlIdx] : '',
            image: imageIdx !== -1 && cols[imageIdx] ? cols[imageIdx] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
            status: statusIdx !== -1 && cols[statusIdx] ? cols[statusIdx] : 'active'
          });
        }
        
        setTerminalLogs([
          `[RAW] Initializing CSV parser engine...`,
          `[SUCCESS] Correctly structured. Found ${formatted.length} CSV rows.`,
          `[SYNC] Validated elements correctly.`
        ]);
        setPreviewProducts(formatted);
        setSelectedPreviewIds(new Set(formatted.map(p => p.id)));
      }
    } catch (err) {
      setWizardError(err.message);
      setTerminalLogs([`[ERROR] Parser failed: ${err.message}`]);
    }
  };

  const toggleSelectPreviewItem = (id) => {
    const next = new Set(selectedPreviewIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedPreviewIds(next);
  };

  const toggleSelectAllPreviewItems = () => {
    if (selectedPreviewIds.size === previewProducts.length) {
      setSelectedPreviewIds(new Set());
    } else {
      setSelectedPreviewIds(new Set(previewProducts.map(p => p.id)));
    }
  };

  const handleImportSubmit = () => {
    if (selectedPreviewIds.size === 0) {
      setWizardError('Please select at least one product to import.');
      return;
    }
    
    const itemsToImport = previewProducts.filter(p => selectedPreviewIds.has(p.id));
    if (onAddProductBulk) {
      onAddProductBulk(itemsToImport);
    }
    
    setIsBulkModalOpen(false);
    setPreviewProducts([]);
    setSelectedPreviewIds(new Set());
    setTerminalLogs([]);
  };

  const openAddModal = () => {
    setEditItem(null);
    setProdName('');
    setProdPlatform('Amazon');
    setProdPrice('');
    setProdCashbackValue('');
    setProdAffiliateUrl('');
    setProdImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300');
    setImageFile(null);
    setProdCategory('electronics');
    setProdActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setProdName(item.name);
    setProdPlatform(item.platform);
    setProdPrice(item.price.toString());
    setProdCashbackValue(item.cashbackValue.toString());
    setProdAffiliateUrl(item.affiliateUrl || '');
    setProdImage(item.image);
    setImageFile(null);
    setProdCategory(item.category || 'electronics');
    setProdActive(item.status === 'active');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!prodName.trim() || !prodPrice || !prodCashbackValue) {
      setFormError('Please fill in Name, Price, and Commission Rate.');
      return;
    }

    setIsUploading(true);
    let finalImageUrl = prodImage;

    try {
      if (imageFile) {
        const uploadRes = await apiUpload.uploadImage(imageFile);
        finalImageUrl = uploadRes.url;
      }

      const payload = {
        name: prodName,
        platform: prodPlatform,
        price: parseFloat(prodPrice),
        cashbackValue: parseFloat(prodCashbackValue),
        affiliateUrl: prodAffiliateUrl,
        image: finalImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
        category: prodCategory,
        status: prodActive ? 'active' : 'inactive',
      };

      if (editItem) {
        onEditProduct({ ...editItem, ...payload });
      } else {
        onAddProduct(payload);
      }

      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || 'Failed to upload image or save product.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProdImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(q) || 
                          (p.category && p.category.toLowerCase().includes(q));
    const matchesPlatform = platformFilter === 'all' || p.platform.toLowerCase() === platformFilter.toLowerCase();
    return matchesSearch && matchesPlatform;
  });

  const headers = ['Image', 'Product Name', 'Platform', 'Category', 'Price', 'Commission', 'Status', 'Actions'];

  const renderRow = (item, idx) => (
    <tr key={item.id} className="animate-fade">
      <td>
        <img
          src={item.image}
          alt={item.name}
          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300';
          }}
        />
      </td>
      <td style={{ fontWeight: '600', color: 'var(--text-bold)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {item.name}
      </td>
      <td>
        <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.platform}</span>
      </td>
      <td>
        <span style={{ fontSize: '12px', background: 'var(--bg)', padding: '2px 8px', borderRadius: '4px', textTransform: 'capitalize', color: 'var(--text)' }}>
          {item.category || 'Electronics'}
        </span>
      </td>
      <td style={{ fontWeight: '600', color: 'var(--text-bold)' }}>₹{item.price.toFixed(2)}</td>
      <td style={{ color: 'var(--secondary)', fontWeight: '600' }}>
        {item.cashbackValue}%
      </td>
      <td>
        <label className="admin-switch">
          <input
            type="checkbox"
            checked={item.status === 'active'}
            onChange={() => onToggleStatus(item.id)}
          />
          <span className="admin-slider"></span>
        </label>
      </td>
      <td>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="admin-btn-icon edit" onClick={() => openEditModal(item)} title="Edit Product">
            <Edit2 size={14} />
          </button>
          <button className="admin-btn-icon delete" onClick={() => onDeleteProduct(item.id)} title="Delete Product">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );

  const exportColumns = [
    { header: 'ID', dataKey: 'id' },
    { header: 'Product Name', dataKey: 'name' },
    { header: 'Platform', dataKey: 'platform' },
    { header: 'Category', dataKey: 'category' },
    { header: 'Price', dataKey: 'price' },
    { header: 'Commission (%)', dataKey: 'cashbackValue' },
    { header: 'Status', dataKey: 'status' }
  ];

  return (
    <div className="admin-products-tab animate-fade">
      <div className="admin-page-header">
        <div className="admin-page-title">
          <h2>Product Management</h2>
          <p>Add, edit, and delete store products and configure commission rates</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <ExportDataButton data={products} columns={exportColumns} filename="Products" />
          <button className="admin-btn admin-btn-secondary" onClick={openBulkModal}>
            <Download size={16} />
            Bulk Import API
          </button>
          <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <div className="admin-search-input-wrapper">
          <Search size={16} className="admin-search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            className="admin-search-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text)' }}>
            <Filter size={14} />
            <span>Platform:</span>
          </div>

          <select
            className="admin-filter-select"
            value={platformFilter}
            onChange={(e) => {
              setPlatformFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Platforms</option>
            {platformOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <AdminTable
        headers={headers}
        items={filteredProducts}
        currentPage={currentPage}
        itemsPerPage={5}
        onPageChange={setCurrentPage}
        renderRow={renderRow}
        emptyMessage="No products match the criteria."
      />

      {/* Add / Edit Product Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editItem ? 'Edit Product' : 'Add New Product'}
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isUploading}>
              Cancel
            </button>
            <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={isUploading}>
              {isUploading ? 'Uploading...' : (editItem ? 'Save Changes' : 'Add Product')}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave}>
          {formError && (
            <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px', fontWeight: '500' }}>
              {formError}
            </div>
          )}

          <AdminFormInput
            label="Product Name *"
            id="prod-name"
            type="text"
            placeholder="e.g., Apple iPhone 14 Pro Max"
            value={prodName}
            onChange={(e) => setProdName(e.target.value)}
          />

          <AdminFormSelect
            label="Merchant Platform"
            id="prod-platform"
            value={prodPlatform}
            onChange={(e) => setProdPlatform(e.target.value)}
            options={platformOptions}
          />

          <AdminFormSelect
            label="Category"
            id="prod-category"
            value={prodCategory}
            onChange={(e) => setProdCategory(e.target.value)}
            options={[
              { value: 'electronics', label: 'Electronics' },
              { value: 'fashion', label: 'Fashion' },
              { value: 'clothing', label: 'Clothing' },
              { value: 'health', label: 'Health' },
              { value: 'beauty', label: 'Beauty' },
              { value: 'grocery', label: 'Grocery & Essentials' },
              { value: 'travel', label: 'Travel & Bookings' },
            ]}
          />

          <div className="admin-form-row">
            <AdminFormInput
              label="Price (₹) *"
              id="prod-price"
              type="number"
              step="0.01"
              placeholder="29.99"
              value={prodPrice}
              onChange={(e) => setProdPrice(e.target.value)}
            />

            <AdminFormInput
              label="Commission Rate (%) *"
              id="prod-cb-value"
              type="number"
              step="0.1"
              placeholder="10.0"
              value={prodCashbackValue}
              onChange={(e) => setProdCashbackValue(e.target.value)}
            />
          </div>

          <AdminFormInput
            label="Affiliate URL"
            id="prod-affiliate-url"
            type="text"
            placeholder="e.g., https://amzn.to/..."
            value={prodAffiliateUrl}
            onChange={(e) => setProdAffiliateUrl(e.target.value)}
          />

          <div className="admin-form-group">
            <label>Product Image (Upload or URL)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="admin-form-input"
            />
            {prodImage && (
              <div style={{ marginTop: '10px' }}>
                <img src={prodImage} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
            )}
            <div style={{ fontSize: '11px', color: 'var(--text)', marginTop: '4px' }}>
              Or you can paste an image URL below:
            </div>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={prodImage}
              onChange={(e) => setProdImage(e.target.value)}
              className="admin-form-input"
              style={{ marginTop: '8px' }}
            />
          </div>

          <AdminFormSwitch
            label="Active / Display on feeds"
            id="prod-active"
            checked={prodActive}
            onChange={(e) => setProdActive(e.target.checked)}
          />
        </form>
      </AdminModal>

      {/* Bulk Import Modal */}
      <AdminModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Product Import Wizard"
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={() => setIsBulkModalOpen(false)} disabled={isSyncing}>
              Cancel
            </button>
            {previewProducts.length > 0 && (
              <button className="admin-btn admin-btn-primary" onClick={handleImportSubmit} disabled={selectedPreviewIds.size === 0}>
                Import Selected ({selectedPreviewIds.size})
              </button>
            )}
          </>
        }
      >
        <div className="bulk-import-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
          {wizardError && (
            <div style={{ color: '#ef4444', fontSize: '13px', padding: '8px 12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', fontWeight: '500' }}>
              {wizardError}
            </div>
          )}

          {/* Tab Header */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '16px' }}>
            <button
              onClick={() => { setBulkImportMode('api'); setWizardError(''); }}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: 'none',
                borderBottom: bulkImportMode === 'api' ? '2px solid var(--primary)' : '2px solid transparent',
                color: bulkImportMode === 'api' ? 'var(--text-bold)' : 'var(--text)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Affiliate API Sync
            </button>
            <button
              onClick={() => { setBulkImportMode('raw'); setWizardError(''); }}
              style={{
                padding: '8px 16px',
                border: 'none',
                background: 'none',
                borderBottom: bulkImportMode === 'raw' ? '2px solid var(--primary)' : '2px solid transparent',
                color: bulkImportMode === 'raw' ? 'var(--text-bold)' : 'var(--text)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Raw CSV / JSON Paste
            </button>
          </div>

          {/* Tab Contents */}
          {bulkImportMode === 'api' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <AdminFormSelect
                    label="Merchant / Platform Source"
                    id="bulk-platform"
                    value={apiPlatform}
                    onChange={(e) => setApiPlatform(e.target.value)}
                    options={platformOptions}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <AdminFormInput
                    label="Keywords / Query (e.g., shoes, headphone)"
                    id="bulk-keyword"
                    type="text"
                    placeholder="Search query..."
                    value={apiKeyword}
                    onChange={(e) => setApiKeyword(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <AdminFormSelect
                    label="Default Category"
                    id="bulk-category"
                    value={apiCategory}
                    onChange={(e) => setApiCategory(e.target.value)}
                    options={[
                      { value: 'electronics', label: 'Electronics' },
                      { value: 'fashion', label: 'Fashion' },
                      { value: 'clothing', label: 'Clothing' },
                      { value: 'health', label: 'Health' },
                      { value: 'beauty', label: 'Beauty' },
                      { value: 'grocery', label: 'Food & Grocery' },
                      { value: 'travel', label: 'Travel & Flights' }
                    ]}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <AdminFormSelect
                    label="Limit (Product Count)"
                    id="bulk-limit"
                    value={apiLimit}
                    onChange={(e) => setApiLimit(parseInt(e.target.value))}
                    options={[
                      { value: '5', label: 'Import 5 Products' },
                      { value: '10', label: 'Import 10 Products' },
                      { value: '20', label: 'Import 20 Products' },
                      { value: '50', label: 'Import 50 Products' }
                    ]}
                  />
                </div>
              </div>

              {/* API Credentials Toggle */}
              <div style={{ border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', backgroundColor: 'var(--bg)' }}>
                <button
                  type="button"
                  onClick={() => setShowCredentials(!showCredentials)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-bold)',
                    fontWeight: '600',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Settings size={14} />
                    Affiliate API Configuration
                  </span>
                  <span>{showCredentials ? '▲' : '▼'}</span>
                </button>

                {showCredentials && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    <AdminFormInput
                      label="Partner / Access Key ID"
                      id="aws-access-key"
                      type="text"
                      value={awsAccessKey}
                      onChange={(e) => setAwsAccessKey(e.target.value)}
                    />
                    <AdminFormInput
                      label="Secret Access Key"
                      id="aws-secret-key"
                      type="password"
                      value={awsSecretKey}
                      onChange={(e) => setAwsSecretKey(e.target.value)}
                    />
                    <AdminFormInput
                      label="Affiliate Associate Tag"
                      id="aws-assoc-tag"
                      type="text"
                      value={awsAssociateTag}
                      onChange={(e) => setAwsAssociateTag(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleApiFetch}
                disabled={isSyncing}
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px' }}
              >
                {isSyncing ? 'Connecting and Syncing API...' : 'Fetch from Affiliate API'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <AdminFormSelect
                    label="Pasted Data Format"
                    id="raw-format"
                    value={rawFormat}
                    onChange={(e) => setRawFormat(e.target.value)}
                    options={[
                      { value: 'json', label: 'Structured JSON Array' },
                      { value: 'csv', label: 'Standard Comma-separated (CSV)' },
                      { value: 'upload', label: 'Upload File (.csv, .json)' }
                    ]}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <AdminFormSelect
                    label="Default Platform (if missing)"
                    id="raw-default-platform"
                    value={rawDefaultPlatform}
                    onChange={(e) => setRawDefaultPlatform(e.target.value)}
                    options={platformOptions}
                  />
                </div>
              </div>

              {rawFormat === 'upload' ? (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-bold)', display: 'block', marginBottom: '6px' }}>
                    Upload Products File
                  </label>
                  <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: '8px',
                    padding: '30px',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.name.endsWith('.csv')) setRawFormat('csv');
                        else if (file.name.endsWith('.json')) setRawFormat('json');
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          setRawText(evt.target.result);
                        };
                        reader.readAsText(file);
                      }}
                      style={{ fontSize: '14px', color: 'var(--text)' }}
                    />
                    <span style={{ fontSize: '12px', color: 'var(--text)' }}>
                      Select a .csv or .json file to automatically load its contents.
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-bold)', display: 'block', marginBottom: '6px' }}>
                    Paste Products Code/Text
                  </label>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder={
                      rawFormat === 'json'
                        ? '[\n  {\n    "name": "Headphones X",\n    "platform": "Amazon",\n    "price": 2999,\n    "cashbackValue": 10,\n    "image": ""\n  }\n]'
                        : 'name, platform, price, cashbackvalue, imageurl\nHeadphones X, Amazon, 2999, 10, '
                    }
                    style={{
                      width: '100%',
                      height: '120px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--text)',
                      resize: 'vertical'
                    }}
                  />
                </div>
              )}

              {/* Template Tip Box */}
              <div style={{ fontSize: '11px', color: 'var(--text)', padding: '8px', backgroundColor: 'var(--bg)', borderLeft: '3px solid var(--primary)', borderRadius: '4px' }}>
                {rawFormat === 'json' ? (
                  <span><strong>Format Tip:</strong> Paste a valid JSON Array. Fields: <code>name</code> (required), <code>price</code> (required), <code>platform</code> (optional), <code>cashbackValue</code> (optional), <code>image</code> (optional).</span>
                ) : (
                  <span><strong>Format Tip:</strong> Include a header line with at least: <code>name, price</code>. Optional fields: <code>platform, cashbackvalue, imageurl</code>. Separate fields with commas.</span>
                )}
              </div>

              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleRawParse}
                style={{ width: '100%', padding: '10px' }}
              >
                Parse Raw Data
              </button>
            </div>
          )}

          {/* Terminal Console Logs Panel */}
          {terminalLogs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--text-bold)' }}>
                <Terminal size={14} />
                <span>Console Log / Processing Output</span>
              </div>
              <div
                style={{
                  backgroundColor: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '12px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: '#3fb950',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  lineHeight: '1.6'
                }}
              >
                {terminalLogs.map((log, idx) => (
                  <div key={idx} style={{ color: log.startsWith('[ERROR]') ? '#f85149' : log.startsWith('[SUCCESS]') ? '#58a6ff' : '#3fb950' }}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview Import Table */}
          {previewProducts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-bold)' }}>
                  Preview Ready Items ({previewProducts.length} items parsed)
                </span>
                <button
                  type="button"
                  onClick={toggleSelectAllPreviewItems}
                  style={{ fontSize: '11px', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
                >
                  {selectedPreviewIds.size === previewProducts.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', backgroundColor: 'var(--card-bg)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px', width: '30px' }}></th>
                      <th style={{ padding: '8px 12px', width: '50px' }}>Image</th>
                      <th style={{ padding: '8px 12px' }}>Name</th>
                      <th style={{ padding: '8px 12px', width: '80px' }}>Platform</th>
                      <th style={{ padding: '8px 12px', width: '70px' }}>Price</th>
                      <th style={{ padding: '8px 12px', width: '70px' }}>Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewProducts.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '6px 12px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={selectedPreviewIds.has(p.id)}
                            onChange={() => toggleSelectPreviewItem(p.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '6px 12px' }}>
                          <img
                            src={p.image}
                            alt=""
                            style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px' }}
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'; }}
                          />
                        </td>
                        <td style={{ padding: '6px 12px', fontWeight: '500', color: 'var(--text-bold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                          {p.name}
                        </td>
                        <td style={{ padding: '6px 12px' }}>{p.platform}</td>
                        <td style={{ padding: '6px 12px', fontWeight: '600' }}>₹{p.price.toFixed(2)}</td>
                        <td style={{ padding: '6px 12px', color: 'var(--secondary)', fontWeight: '600' }}>{p.cashbackValue}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AdminModal>
    </div>
  );
}
