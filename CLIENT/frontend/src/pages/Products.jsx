import React, { useState, useEffect } from 'react';
import { Smartphone, Laptop, Headphones } from 'lucide-react';
import ProductCard from '../components/ProductCard'; 
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('all');
  const [sortType, setSortType] = useState('default');

  useEffect(() => {
    const mockData = [
      { id: 1, name: "iPhone 17 Pro Max", price: 29990000, category: "phone", brand: "Apple", image_url: "/images/products/iphone17promax.jpg" },
      { id: 2, name: "Samsung S25 Ultra", price: 26990000, category: "phone", brand: "Samsung", image_url: "/images/products/samsungs25.jpg" },
      { id: 3, name: "Google Pixel 9 Pro", price: 22500000, category: "phone", brand: "Google", image_url: "/images/products/pixel9.jpg" },
      { id: 4, name: "Xiaomi 15 Ultra", price: 19990000, category: "phone", brand: "Xiaomi", image_url: "/images/products/xiaomi15.jpg" },
      { id: 5, name: "MacBook Pro M3", price: 39990000, category: "laptop", brand: "Apple", image_url: "/images/products/macbook.jpg" },
      { id: 6, name: "Dell XPS 13 2026", price: 35000000, category: "laptop", brand: "Dell", image_url: "/images/products/dellxps.jpg" },
      { id: 7, name: "Asus ROG Zephyrus", price: 45000000, category: "laptop", brand: "Asus", image_url: "/images/products/rog.jpg" },
      { id: 8, name: "HP Spectre x360", price: 32000000, category: "laptop", brand: "HP", image_url: "/images/products/hpspectre.jpg" },
      { id: 9, name: "Tai nghe Sony XM5", price: 6990000, category: "accessory", brand: "Sony", image_url: "/images/products/sony-xm5.jpg" },
      { id: 10, name: "AirPods Pro Gen 3", price: 5500000, category: "accessory", brand: "Apple", image_url: "/images/products/airpods.jpg" },
      { id: 11, name: "Sạc MagSafe 45W", price: 1200000, category: "accessory", brand: "Apple", image_url: "/images/products/magsafe.jpg" },
      { id: 12, name: "Cáp sạc siêu bền", price: 450000, category: "accessory", brand: "Other", image_url: "/images/products/cable.jpg" },
    ];
    setProducts(mockData);
    setFilteredProducts(mockData);
  }, []);

  useEffect(() => {
    let result = [...products];
    if (category !== 'all') result = result.filter(p => p.category === category);
    if (brand !== 'all') result = result.filter(p => p.brand === brand);

    if (sortType === 'low-to-high') result.sort((a, b) => a.price - b.price);
    if (sortType === 'high-to-low') result.sort((a, b) => b.price - a.price);

    setFilteredProducts(result);
  }, [category, brand, sortType, products]);

  const brands = ["all", "Apple", "Samsung", "Sony", "Dell", "Xiaomi"];

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <div className="header-info">
            <h1>TẤT CẢ<span> SẢN PHẨM</span></h1>
            <p>{filteredProducts.length} sản phẩm phù hợp</p>
          </div>
          
          <div className="header-actions">
            <select className="sort-select-v2" onChange={(e) => setSortType(e.target.value)}>
              <option value="default">Sắp xếp: Mới nhất</option>
              <option value="low-to-high">Giá: Thấp đến Cao</option>
              <option value="high-to-low">Giá: Cao đến Thấp</option>
            </select>
          </div>
        </div>

        <div className="products-layout">
          <aside className="product-sidebar">
            <div className="filter-group">
              <h3 className="filter-label">Danh mục</h3>
              <div className="cat-options">
                <button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>Tất cả</button>
                <button className={category === 'phone' ? 'active' : ''} onClick={() => setCategory('phone')}><Smartphone size={16}/> Điện thoại</button>
                <button className={category === 'laptop' ? 'active' : ''} onClick={() => setCategory('laptop')}><Laptop size={16}/> Laptop</button>
                <button className={category === 'accessory' ? 'active' : ''} onClick={() => setCategory('accessory')}><Headphones size={16}/> Phụ kiện</button>
              </div>
            </div>

            <div className="filter-group">
              <h3 className="filter-label">Thương hiệu</h3>
              <div className="brand-list">
                {brands.map(b => (
                  <label key={b} className="brand-checkbox">
                    <input type="radio" name="brand" checked={brand === b} onChange={() => setBrand(b)} />
                    <span className="brand-name">{b.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <main className="product-main">
            <div className="product-grid">
              {/* SỬ DỤNG COMPONENT PRODUCT CARD TẠI ĐÂY */}
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="no-products">
                <p>Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
                <button onClick={() => {setCategory('all'); setBrand('all')}}>Xóa bộ lọc</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;