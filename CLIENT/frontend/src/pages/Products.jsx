import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Thêm useLocation
import axios from 'axios';
import { Smartphone, Laptop, Headphones, FilterX, LayoutGrid, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard'; 
import './Products.css';

const Products = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  
  // 1. Lấy từ khóa tìm kiếm từ URL (?search=...)
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

  const getCategoryIcon = (name) => {
    const iconSize = 18;
    switch (name?.toLowerCase()) {
      case 'smartphone':
      case 'điện thoại': return <Smartphone size={iconSize} />;
      case 'laptop':
      case 'máy tính xách tay': return <Laptop size={iconSize} />;
      case 'accessory':
      case 'phụ kiện':
      case 'phụ kiện công nghệ': return <Headphones size={iconSize} />;
      default: return <LayoutGrid size={iconSize} />;
    }
  };

  // 2. Fetch dữ liệu có hỗ trợ search query từ Backend
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes, brandRes] = await Promise.all([
          // Gửi kèm tham số search lên API
          axios.get('http://localhost:3005/client/products', {
            params: { search: searchQuery }
          }),
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
  }, [searchQuery]); // Chạy lại khi từ khóa tìm kiếm thay đổi

  useEffect(() => {
    setActiveCategory(categoryId ? String(categoryId) : 'all');
  }, [categoryId]);

  // 3. Logic Lọc Local (Kết hợp giữa Search + Category + Brand)
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
    // Khi đổi category, nếu đang có search query thì ta nên xóa nó đi hoặc giữ lại tùy UX
    const path = id === 'all' ? '/products' : `/category/${id}`;
    navigate(path);
  };

  if (loading) return <div className="redtech-loader-full">Đang kết nối database...</div>;

  return (
    <div className="products-page" style={{ fontFamily: 'Cabin, sans-serif' }}>
      <div className="container">
        <div className="products-header">
          <div className="header-info">
            <h1>
              {/* Hiển thị trạng thái tìm kiếm hoặc danh mục */}
              {searchQuery ? (
                <>KẾT QUẢ CHO: <span className="query-text">"{searchQuery}"</span></>
              ) : activeCategory === 'all' ? (
                'TẤT CẢ '
              ) : (
                categories.find(c => String(c.id) === activeCategory)?.name.toUpperCase() + ' '
              )}
              <span>SẢN PHẨM</span>
            </h1>
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
              <div className="no-products">
                {searchQuery ? <Search size={48} opacity={0.5} /> : <FilterX size={48} />}
                <p>Rất tiếc, không tìm thấy sản phẩm phù hợp.</p>
                <button onClick={() => {navigate('/products'); setActiveBrand('all'); setActiveCategory('all')}}>
                  Quay lại cửa hàng
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;