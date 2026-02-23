import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, ChevronDown, Laptop, Smartphone, Headphones, LayoutGrid, LogOut, Settings } from 'lucide-react';
import axios from 'axios'; // Thêm axios
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0); // State lưu số lượng giỏ hàng

  // 1. Lấy thông tin user và số lượng giỏ hàng ban đầu
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

    // Lắng nghe sự kiện storage hoặc custom event để cập nhật badge ngay lập tức
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('cartUpdated', () => {
       if (storedUser) fetchCartCount(JSON.parse(storedUser).id);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cartUpdated', () => {});
    };
  }, []);

  // 2. Hàm gọi API lấy tổng số lượng sản phẩm trong giỏ
  const fetchCartCount = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:3005/client/cart/${userId}`);
      // Tính tổng quantity của tất cả item trong giỏ
      const total = res.data.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    } catch (err) {
      console.error("Lỗi lấy count giỏ hàng:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCartCount(0); // Reset count về 0
    toast.success('Đã đăng xuất tài khoản');
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} style={{ fontFamily: 'Cabin, sans-serif' }}>
      <div className="container nav-container">
        
        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={() => setIsMobileMenuOpen(false)}>
          RED<span>TECH</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-main-links">
          <Link to="/products" className="nav-link-item">Sản phẩm</Link>

          <div className="nav-categories-desktop">
            <button className="cat-btn" onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
              Danh mục <ChevronDown size={16} className={isCategoryOpen ? 'rotate' : ''} />
            </button>
            
            {isCategoryOpen && (
              <div className="dropdown-menu">
                <Link to="/products" onClick={() => setIsCategoryOpen(false)}><LayoutGrid size={18} /> Tất cả sản phẩm</Link>
                <Link to="/phone" onClick={() => setIsCategoryOpen(false)}><Smartphone size={18} /> Điện thoại</Link>
                <Link to="/laptop" onClick={() => setIsCategoryOpen(false)}><Laptop size={18} /> Laptop</Link>
                <Link to="/accessories" onClick={() => setIsCategoryOpen(false)}><Headphones size={18} /> Phụ kiện</Link>
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="nav-search-wrapper">
          <input type="text" placeholder="Tìm sản phẩm..." />
          <button className="search-btn"><Search size={18} /></button>
        </div>

        {/* Actions */}
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
                  <Link to="/profile" onClick={() => setIsUserMenuOpen(false)}>
                    <Settings size={16} /> Hồ sơ của tôi
                  </Link>
                  <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="action-item hide-mobile">
              <User size={22} />
              <span>Tài khoản</span>
            </Link>
          )}

          {/* CẬP NHẬT BADGE GIỎ HÀNG */}
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
          {user && (
             <div className="mobile-user-profile">
                <p>Xin chào, <strong>{user.fullname}</strong></p>
             </div>
          )}
          <Link to="/products" className="sidebar-main-link" onClick={() => setIsMobileMenuOpen(false)}>TẤT CẢ SẢN PHẨM</Link>
          <hr className="sidebar-divider" />
          <Link to="/phone" onClick={() => setIsMobileMenuOpen(false)}>Điện thoại</Link>
          <Link to="/laptop" onClick={() => setIsMobileMenuOpen(false)}>Laptop</Link>
          <Link to="/accessories" onClick={() => setIsMobileMenuOpen(false)}>Phụ kiện</Link>
          <hr className="sidebar-divider" />
          {user ? (
            <>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>Hồ sơ của tôi</Link>
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