import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Box, ListTree, ShoppingCart, Award, Star, Users, LogOut } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20}/>, display: 'Tổng quan' },
    { path: '/admin/products', icon: <Box size={20}/>, display: 'Quản lý sản phẩm' },
    { path: '/admin/categories', icon: <ListTree size={20}/>, display: 'Quản lý danh mục' },
    { path: '/admin/orders', icon: <ShoppingCart size={20}/>, display: 'Quản lý đơn hàng' },
    { path: '/admin/brands', icon: <Award size={20}/>, display: 'Quản lý thương hiệu' },
    { path: '/admin/reviews', icon: <Star size={20}/>, display: 'Quản lý đánh giá' },
    { path: '/admin/users', icon: <Users size={20}/>, display: 'Quản lý tài khoản' },
  ];

  const handleLogout = () => {
    if(window.confirm("Bạn có chắc chắn muốn đăng xuất?")) navigate('/admin/login');
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">RT <span>Admin</span></div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <NavLink key={index} to={item.path} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            {item.icon}
            <span>{item.display}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={20} /> <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;