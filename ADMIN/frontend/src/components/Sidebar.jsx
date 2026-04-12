import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Box, ListTree, ShoppingCart, 
  Award, Star, Users, LogOut, AlertCircle, X, Zap // Thêm Zap icon ở đây
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20}/>, display: 'Tổng quan' },
    { path: '/admin/products', icon: <Box size={20}/>, display: 'Quản lý sản phẩm' },
    { path: '/admin/flash-sale', icon: <Zap size={20}/>, display: 'Quản lý Flash Sale' }, // <--- Mục mới thêm vào
    { path: '/admin/categories', icon: <ListTree size={20}/>, display: 'Quản lý danh mục' },
    { path: '/admin/orders', icon: <ShoppingCart size={20}/>, display: 'Quản lý đơn hàng' },
    { path: '/admin/brands', icon: <Award size={20}/>, display: 'Quản lý thương hiệu' },
    { path: '/admin/reviews', icon: <Star size={20}/>, display: 'Quản lý đánh giá' },
    { path: '/admin/users', icon: <Users size={20}/>, display: 'Quản lý tài khoản' },
  ];

  const confirmLogout = () => {
    localStorage.removeItem('adminToken'); 
    toast.success("Đăng xuất thành công!");
    setShowLogoutModal(false);
    navigate('/admin/login');
  };

  return (
    <>
      <aside className="admin-sidebar">
        <div className="sidebar-brand">RT <span>Admin</span></div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <NavLink 
              key={index} 
              to={item.path} 
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              {item.icon}
              <span>{item.display}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => setShowLogoutModal(true)}>
            <LogOut size={20} /> <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay-admin" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-close-btn" onClick={() => setShowLogoutModal(false)}>
              <X size={20} />
            </div>
            
            <div className="modal-body-content">
              <div className="alert-icon-wrapper">
                <AlertCircle size={48} color="#ef4444" />
              </div>
              <h3>Xác nhận đăng xuất</h3>
              <p>Phiên làm việc của bạn sẽ kết thúc. Bạn có chắc chắn muốn thoát khỏi hệ thống quản trị?</p>
            </div>

            <div className="modal-footer-actions">
              <button className="btn-cancel-logout" onClick={() => setShowLogoutModal(false)}>
                Hủy bỏ
              </button>
              <button className="btn-confirm-logout" onClick={confirmLogout}>
                Đồng ý, Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;