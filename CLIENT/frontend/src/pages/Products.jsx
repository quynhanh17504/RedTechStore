import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Smartphone, Laptop, Headphones, FilterX, 
  LayoutGrid, Search, Watch, Tablet, Speaker, Package,
  ArrowRight, ShoppingBag
} from 'lucide-react';
import ProductCard from '../components/ProductCard'; 
import './Products.css';

const Products = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState(categoryId || 'all');
  const [activeBrand, setActiveBrand] = useState('all');
  const [sortType, setSortType] = useState('default');

  // Hàm xử lý Icon thông minh cho danh mục động
  const getCategoryIcon = (name) => {
    const iconSize = 18;
    const normalize = (str) => 
      str?.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d").trim();

    const cleanName = normalize(name);
    const iconMap = {
      'smartphone': <Smartphone size={iconSize} />,
      'dien thoai': <Smartphone size={iconSize} />,
      'laptop': <Laptop size={iconSize} />,
      'may tinh xach tay': <Laptop size={iconSize} />,
      'accessory': <Headphones size={iconSize} />,
      'phu kien': <Headphones size={iconSize} />,
      'phu kien cong nghe': <Headphones size={iconSize} />,
      'dong ho': <Watch size={iconSize} />,
      'may tinh bang': <Tablet size={iconSize} />,
      'am thanh': <Speaker size={iconSize} />,
      'loa': <Speaker size={iconSize} />,
    };

    return iconMap[cleanName] || <Package size={iconSize} />;
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes, brandRes] = await Promise.all([
          axios.get('http://localhost:3005/client/products', { params: { search: searchQuery } }),
          axios.get('http://localhost:3005/client/categories'),
          axios.get('http://localhost:3005/client/brands')
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
        setBrands(brandRes.data);
      } catch (err) {
        console.error("Lỗi kết nối database:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [searchQuery]);

  useEffect(() => {
    setActiveCategory(categoryId ? String(categoryId) : 'all');
  }, [categoryId]);

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

  const handleCategoryClick = (id) => {
    const path = id === 'all' ? '/products' : `/category/${id}`;
    navigate(path);
  };

  if (loading) return (
    <div className="redtech-loader-full">
      <div className="loader-content">
        <div className="spinner"></div>
        <p>Đang kết nối database RedTech...</p>
      </div>
    </div>
  );

  return (
    <div className="products-page" style={{ fontFamily: 'Cabin, sans-serif' }}>
      <div className="container">
        <div className="products-header">
          <div className="header-info">
            <h1>
              {searchQuery ? (
                <>KẾT QUẢ CHO: <span className="query-text">"{searchQuery}"</span></>
              ) : activeCategory === 'all' ? (
                'TẤT CẢ SẢN PHẨM'
              ) : (
                categories.find(c => String(c.id) === activeCategory)?.name.toUpperCase()
              )}
            </h1>
            <p className="product-count">Khám phá {filteredProducts.length} lựa chọn tốt nhất</p>
          </div>
          <div className="header-actions">
            <div className="sort-wrapper">
              <span>Sắp xếp theo:</span>
              <select className="sort-select-v2" value={sortType} onChange={(e) => setSortType(e.target.value)}>
                <option value="default">Mới nhất</option>
                <option value="low-to-high">Giá tăng dần</option>
                <option value="high-to-low">Giá giảm dần</option>
              </select>
            </div>
          </div>
        </div>

        <div className="products-layout">
          <aside className="product-sidebar">
            <div className="filter-group">
              <h3 className="filter-label">Danh mục</h3>
              <div className="cat-options">
                <button 
                  className={activeCategory === 'all' ? 'active' : ''} 
                  onClick={() => handleCategoryClick('all')}
                >
                  <LayoutGrid size={18} /> Tất cả
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat.id} 
                    className={activeCategory === String(cat.id) ? 'active' : ''} 
                    onClick={() => handleCategoryClick(String(cat.id))}
                  >
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
              <div className="no-products-v2">
                <div className="no-products-content">
                  <div className="empty-icon-wrapper">
                    <ShoppingBag className="bag-icon" size={60} />
                    <Search className="search-overlay" size={24} />
                  </div>
                  <h2>Không tìm thấy sản phẩm phù hợp</h2>
                  <p>Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy thứ bạn cần nhé!</p>
                  
                  <div className="suggestion-chips">
                    <span>Gợi ý:</span>
                    <button onClick={() => navigate('/category/1')}>iPhone</button>
                    <button onClick={() => navigate('/category/2')}>Laptop</button>
                    <button onClick={() => navigate('/products')}>Tất cả</button>
                  </div>

                  <button className="btn-back-home" onClick={() => {navigate('/products'); setActiveBrand('all'); setActiveCategory('all')}}>
                    Quay lại cửa hàng <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;