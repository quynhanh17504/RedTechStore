import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Thêm useParams và useNavigate
import axios from 'axios';
import { Smartphone, Laptop, Headphones, FilterX, LayoutGrid } from 'lucide-react';
import ProductCard from '../components/ProductCard'; 
import './Products.css';

const Products = () => {
  const { categoryId } = useParams(); // Lấy ID từ URL (ví dụ: /category/1)
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Khởi tạo state từ categoryId của URL nếu có
  const [activeCategory, setActiveCategory] = useState(categoryId || 'all');
  const [activeBrand, setActiveBrand] = useState('all');
  const [sortType, setSortType] = useState('default');

  // Hàm helper render icon
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

  // 1. Fetch dữ liệu ban đầu
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [prodRes, catRes, brandRes] = await Promise.all([
          axios.get('http://localhost:3005/client/products'),
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
  }, []);

  // 2. Cập nhật activeCategory khi URL thay đổi (VD: đang ở trang này mà nhấn Menu khác)
  useEffect(() => {
    if (categoryId) {
      setActiveCategory(String(categoryId));
    } else {
      setActiveCategory('all');
    }
  }, [categoryId]);

  // 3. Logic Lọc và Sắp xếp
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

  // Hàm xử lý khi click vào nút danh mục ở Sidebar
  const handleCategoryClick = (id) => {
    if (id === 'all') {
      navigate('/products');
    } else {
      navigate(`/category/${id}`);
    }
  };

  if (loading) return <div className="redtech-loader-full">Đang kết nối database...</div>;

  return (
    <div className="products-page" style={{ fontFamily: 'Cabin, sans-serif' }}>
      <div className="container">
        <div className="products-header">
          <div className="header-info">
            {/* Tiêu đề động dựa trên danh mục đang chọn */}
            <h1>
              {activeCategory === 'all' 
                ? 'TẤT CẢ ' 
                : categories.find(c => String(c.id) === activeCategory)?.name.toUpperCase() + ' ' 
              }
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
                <FilterX size={48} />
                <p>Không có sản phẩm nào phù hợp.</p>
                <button onClick={() => {navigate('/products'); setActiveBrand('all')}}>Xóa lọc</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;