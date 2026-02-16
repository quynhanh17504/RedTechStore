import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, ChevronDown, Laptop, Smartphone, Headphones, LayoutGrid } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
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
          {/* Mục Tất cả sản phẩm mới thêm */}
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
          <Link to="/login" className="action-item hide-mobile">
            <User size={22} />
            <span>Tài khoản</span>
          </Link>

          <Link to="/cart" className="action-item cart-btn">
            <div className="icon-badge">
              <ShoppingCart size={22} />
              <span className="badge">0</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="sidebar-content">
          <Link to="/products" className="sidebar-main-link" onClick={() => setIsMobileMenuOpen(false)}>TẤT CẢ SẢN PHẨM</Link>
          <hr className="sidebar-divider" />
          <Link to="/phone" onClick={() => setIsMobileMenuOpen(false)}>Điện thoại</Link>
          <Link to="/laptop" onClick={() => setIsMobileMenuOpen(false)}>Laptop</Link>
          <Link to="/accessories" onClick={() => setIsMobileMenuOpen(false)}>Phụ kiện</Link>
          <hr className="sidebar-divider" />
          <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Đăng nhập / Đăng ký</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;