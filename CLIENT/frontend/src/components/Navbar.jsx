import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, ChevronDown, Laptop, Smartphone, Headphones, LayoutGrid, LogOut, Settings } from 'lucide-react';
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
  
  // State mới cho từ khóa tìm kiếm
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchCartCount(parsedUser.id);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

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

  // Hàm xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      // Chuyển hướng sang trang products kèm query string
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
                <Link to="/products" onClick={() => setIsCategoryOpen(false)}><LayoutGrid size={18} /> Tất cả sản phẩm</Link>
                <Link to="/category/1" onClick={() => setIsCategoryOpen(false)}><Smartphone size={18} /> Điện thoại</Link>
                <Link to="/category/2" onClick={() => setIsCategoryOpen(false)}><Laptop size={18} /> Laptop</Link>
                <Link to="/category/3" onClick={() => setIsCategoryOpen(false)}><Headphones size={18} /> Phụ kiện</Link>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar Cập nhật thành Form */}
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
          {user && (
             <div className="mobile-user-profile">
                <p>Xin chào, <strong>{user.fullname}</strong></p>
             </div>
          )}
          <Link to="/products" onClick={() => setIsMobileMenuOpen(false)}>TẤT CẢ SẢN PHẨM</Link>
          <hr className="sidebar-divider" />
          <Link to="/category/phone" onClick={() => setIsMobileMenuOpen(false)}>Điện thoại</Link>
          <Link to="/category/laptop" onClick={() => setIsMobileMenuOpen(false)}>Laptop</Link>
          <Link to="/category/accessories" onClick={() => setIsMobileMenuOpen(false)}>Phụ kiện</Link>
          <hr className="sidebar-divider" />
          {user ? (
            <>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>Hồ sơ</Link>
              <span className="sidebar-logout" onClick={handleLogout}>Đăng xuất</span>
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