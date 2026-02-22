import React, { useState } from 'react';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import axios from 'axios'; // Import Axios
import toast from 'react-hot-toast'; // Import Toast
import { useNavigate } from 'react-router-dom'; // Để chuyển trang sau khi login
import './Auth.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // URL API Backend Admin (Port 5000)
  const API_URL = 'http://localhost:5000/admin/auth/login';
const handleLogin = async (e) => {
  e.preventDefault();
  const loadingToast = toast.loading('Đang xác thực quyền quản trị...');

  try {
    const res = await axios.post(API_URL, { email, password });

    // 1. Kiểm tra res.data.user (thay vì res.data.admin)
    if (res.data && res.data.token) {
      const userData = res.data.user; 

      // 2. Kiểm tra thêm một lần nữa ở Client cho chắc chắn là role admin
      if (userData && userData.role === 'admin') {
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminInfo', JSON.stringify(userData));

        toast.success(`Chào mừng ${userData.fullname} quay trở lại!`, { id: loadingToast });

        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        // Trường hợp role là client nhưng cố tình đăng nhập vào trang admin
        toast.error("Bạn không có quyền truy cập khu vực này!", { id: loadingToast });
      }
    }
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    const errorMsg = err.response?.data?.message || 'Lỗi server hoặc tài khoản không đúng';
    toast.error(errorMsg, { id: loadingToast });
  }
};

  return (
    <div className="admin-login-page" style={{ fontFamily: 'Cabin, sans-serif' }}>
      <div className="login-card">
        <div className="login-header">
          <div className="brand-logo">RT</div>
          <h1>Admin<span>Panel</span></h1>
          <p>Vui lòng đăng nhập để quản trị hệ thống</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Email Admin</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                placeholder="admin@redtech.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" /> 
              <span>Ghi nhớ phiên đăng nhập</span>
            </label>
            <a href="#" className="forgot-link">Quên mật khẩu?</a>
          </div>

          <button type="submit" className="btn-admin-login">
            ĐĂNG NHẬP HỆ THỐNG <LogIn size={20} />
          </button>
        </form>
      </div>
      
      <div className="login-footer">
        &copy; 2026 RedTech Admin Dashboard. All rights reserved.
      </div>
    </div>
  );
};

export default AdminLogin;