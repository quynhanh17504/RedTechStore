import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Smartphone, Laptop, Headphones, FilterX, LayoutGrid } from 'lucide-react';
import ProductCard from '../components/ProductCard'; 
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeBrand, setActiveBrand] = useState('all');
  const [sortType, setSortType] = useState('default');

  // Hàm helper để render icon dựa trên tên danh mục trong DB
  const getCategoryIcon = (name) => {
    const iconSize = 18;
    switch (name?.toLowerCase()) {
      case 'smartphone':
      case 'điện thoại':
        return <Smartphone size={iconSize} />;
      case 'laptop':
      case 'máy tính xách tay':
        return <Laptop size={iconSize} />;
      case 'accessory':
      case 'phụ kiện công nghệ':
        return <Headphones size={iconSize} />;
      default:
        return <LayoutGrid size={iconSize} />;
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const urls = [
          'http://localhost:3005/client/products',
          'http://localhost:3005/client/categories',
          'http://localhost:3005/client/brands'
        ];

        const responses = await Promise.all(
          urls.map(url => axios.get(url).catch(err => {
            console.error(`Lỗi tại ${url}:`, err.message);
            return { data: [] };
          }))
        );

        setProducts(responses[0].data);
        setFilteredProducts(responses[0].data);
        setCategories(responses[1].data);
        setBrands(responses[2].data);
      } catch (err) {
        console.error("Lỗi hệ thống:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    let result = [...products];
    if (activeCategory !== 'all') {
      result = result.filter(p => String(p.category_id) === String(activeCategory));
    }
    if (activeBrand !== 'all') {
      result = result.filter(p => String(p.brand_id) === String(activeBrand));
    }
    if (sortType === 'low-to-high') result.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortType === 'high-to-low') result.sort((a, b) => Number(b.price) - Number(a.price));

    setFilteredProducts(result);
  }, [activeCategory, activeBrand, sortType, products]);

  if (loading) return <div className="redtech-loader-full">Đang kết nối database...</div>;

  return (
    <div className="products-page" style={{ fontFamily: 'Cabin, sans-serif' }}>
      <div className="container">
        <div className="products-header">
          <div className="header-info">
            <h1>TẤT CẢ <span>SẢN PHẨM</span></h1>
            <p>Tìm thấy {filteredProducts.length} sản phẩm</p>
          </div>
          <div className="header-actions">
            <select className="sort-select-v2" value={sortType} onChange={(e) => setSortType(e.target.value)}>
              <option value="default">Mới nhất</option>
              <option value="low-to-high">Giá tăng dần</option>
              <option value="high-to-low">Giá giảm dần</option>
            </select>
          </div>
        </div>

        <div className="products-layout">
          <aside className="product-sidebar">
            <div className="filter-group">
              <h3 className="filter-label">Danh mục</h3>
              <div className="cat-options">
                <button 
                  className={activeCategory === 'all' ? 'active' : ''} 
                  onClick={() => setActiveCategory('all')}
                >
                  <LayoutGrid size={18} /> Tất cả
                </button>
                
                {categories.map(cat => (
                  <button 
                    key={cat.id} 
                    className={activeCategory === String(cat.id) ? 'active' : ''} 
                    onClick={() => setActiveCategory(String(cat.id))}
                  >
                    {/* Render Icon động dựa trên tên */}
                    {getCategoryIcon(cat.name)} 
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h3 className="filter-label">Thương hiệu</h3>
              <div className="brand-list">
                <label className="brand-checkbox">
                  <input type="radio" name="brand" checked={activeBrand === 'all'} onChange={() => setActiveBrand('all')} />
                  <span className="brand-name">TẤT CẢ</span>
                </label>
                {brands.map(b => (
                  <label key={b.id} className="brand-checkbox">
                    <input type="radio" name="brand" checked={activeBrand === String(b.id)} onChange={() => setActiveBrand(String(b.id))} />
                    <span className="brand-name">{b.name.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <main className="product-main">
            {filteredProducts.length > 0 ? (
              <div className="product-grid">
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="no-products">
                <FilterX size={48} />
                <p>Không có sản phẩm nào phù hợp.</p>
                <button onClick={() => {setActiveCategory('all'); setActiveBrand('all')}}>Xóa lọc</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;