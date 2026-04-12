import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, User, Search, Menu, X, ChevronDown, 
  Laptop, Smartphone, Headphones, LayoutGrid, LogOut, 
  Settings, Package, Watch, Tablet, Speaker 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  
  // State mới để lưu danh sách danh mục từ Database
  const [categories, setCategories] = useState([]);

  // Hàm mapping Icon dựa trên tên danh mục (không phân biệt hoa thường)
  const getCategoryIcon = (name) => {
    const iconMap = {
      'dien thoai': <Smartphone size={18} />,
      'laptop': <Laptop size={18} />,
      'phu kien cong nghe': <Headphones size={18} />,
      'dong ho': <Watch size={18} />,
      'may tinh bang': <Tablet size={18} />,
      'loa': <Speaker size={18} />,
    };

    // Chuyển tên về dạng không dấu, viết thường để so khớp
    const key = name.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");

    // Trả về icon tương ứng hoặc icon mặc định (Package) nếu là danh mục mới
    return iconMap[key] || <Package size={18} />;
  };

  useEffect(() => {
    // Lấy thông tin User
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchCartCount(parsedUser.id);
    }

    // Lấy danh sách danh mục từ API
    const fetchCategories = async () => {
      try {
        const res = await axios.get('http://localhost:3005/client/categories');
        setCategories(res.data);
      } catch (err) {
        console.error("Lỗi lấy danh mục:", err);
      }
    };

    fetchCategories();

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const updateCount = () => {
        const currentUser = localStorage.getItem('user');
        if (currentUser) fetchCartCount(JSON.parse(currentUser).id);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('cartUpdated', updateCount);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cartUpdated', updateCount);
    };
  }, []);

  const fetchCartCount = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:3005/client/cart/${userId}`);
      const total = res.data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    } catch (err) {
      console.error("Lỗi lấy count giỏ hàng:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchInput.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCartCount(0);
    toast.success('Đã đăng xuất tài khoản');
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} style={{ fontFamily: 'Cabin, sans-serif' }}>
      <div className="container nav-container">
        
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        <Link to="/" className="nav-logo" onClick={() => setIsMobileMenuOpen(false)}>
          RED<span>TECH</span>
        </Link>

        <div className="nav-main-links">
          <Link to="/products" className="nav-link-item">Sản phẩm</Link>
          
          <div className="nav-categories-desktop">
            <button className="cat-btn" onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
              Danh mục <ChevronDown size={16} className={isCategoryOpen ? 'rotate' : ''} />
            </button>
            
            {isCategoryOpen && (
              <div className="dropdown-menu">
                <Link to="/products" onClick={() => setIsCategoryOpen(false)}>
                  <LayoutGrid size={18} /> Tất cả sản phẩm
                </Link>
                {/* Render danh mục động từ database */}
                {categories.map((cat) => (
                  <Link key={cat.id} to={`/category/${cat.id}`} onClick={() => setIsCategoryOpen(false)}>
                    {getCategoryIcon(cat.name)} {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <form className="nav-search-wrapper" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Tìm sản phẩm..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="search-btn"><Search size={18} /></button>
        </form>

        <div className="nav-actions">
          {user ? (
            <div className="nav-user-dropdown">
              <button className="action-item user-active-btn" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <User size={22} />
                <span className="user-name">{user.fullname?.split(' ').pop()}</span>
                <ChevronDown size={14} />
              </button>
              {isUserMenuOpen && (
                <div className="user-dropdown-menu">
                  <div className="user-info-header">
                    <p className="info-name">{user.fullname}</p>
                    <p className="info-email">{user.email}</p>
                  </div>
                  <hr />
                  <Link to="/profile" onClick={() => setIsUserMenuOpen(false)}><Settings size={16} /> Hồ sơ</Link>
                  <button onClick={handleLogout} className="logout-btn"><LogOut size={16} /> Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="action-item hide-mobile">
              <User size={22} />
              <span>Tài khoản</span>
            </Link>
          )}

          <Link to="/cart" className="action-item cart-btn">
            <div className="icon-badge">
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="sidebar-content">
          <form className="mobile-search" onSubmit={handleSearch} style={{padding: '10px'}}>
             <div className="nav-search-wrapper" style={{width: '100%', margin: '0'}}>
                <input 
                    type="text" 
                    placeholder="Tìm kiếm..." 
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />
                <button type="submit" className="search-btn"><Search size={18} /></button>
             </div>
          </form>

          <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>TẤT CẢ SẢN PHẨM</Link>
          <hr className="sidebar-divider" />
          
          {/* Render danh mục động cho Mobile */}
          <p className="mobile-section-title" style={{padding: '10px 20px', fontSize: '12px', color: '#888'}}>DANH MỤC</p>
          {categories.map((cat) => (
            <Link key={cat.id} to={`/category/${cat.id}`} onClick={() => setIsMobileMenuOpen(false)}>
              {cat.name}
            </Link>
          ))}
          
          <hr className="sidebar-divider" />
          {user ? (
            <>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>Hồ sơ</Link>
              <span className="sidebar-logout" onClick={handleLogout} style={{padding: '15px 20px', display: 'block', color: '#ef4444'}}>Đăng xuất</span>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Đăng nhập / Đăng ký</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;