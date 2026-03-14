import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import axios from 'axios';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    gender: 'Nam', 
  });

  const API_URL = 'http://localhost:3005/client/auth';

  // Xử lý thay đổi Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Logic Đăng nhập Google thực tế
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const loadingToast = toast.loading('Đang xác thực với Google...');
      try {
        // Lấy profile từ Google
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        // Gửi về Backend RedTech
        const res = await axios.post(`${API_URL}/google-login`, {
          email: userInfo.data.email,
          fullname: userInfo.data.name,
          googleId: userInfo.data.sub
        });

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        toast.success(`Chào mừng ${userInfo.data.name} quay lại!`, { id: loadingToast, icon: '🚀' });
        setTimeout(() => window.location.href = '/', 1500);
      } catch (err) {
        toast.error('Đăng nhập Google thất bại!', { id: loadingToast });
      }
    },
    onError: () => toast.error('Kết nối Google thất bại!')
  });

  // 2. Logic Đăng ký / Đăng nhập thủ công
  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Đang xử lý...');
    
    try {
      if (isLogin) {
        // Gọi API Login
        const res = await axios.post(`${API_URL}/login`, {
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        toast.success('Đăng nhập thành công!', { id: loadingToast });
        setTimeout(() => window.location.href = '/', 1500);
      } else {
        // Gọi API Register
        await axios.post(`${API_URL}/register`, formData);
        toast.success('Đăng ký thành công! Hãy đăng nhập.', { id: loadingToast });
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!', { id: loadingToast });
    }
  };

  const renderGenderSelector = () => (
    <div className="gender-selector">
      <p className="label-text">Giới tính:</p>
      <div className="gender-options">
        {['Nam', 'Nữ', 'Khác'].map((g) => (
          <label key={g} className={`gender-card ${formData.gender === g ? 'active' : ''}`}>
            <input 
              type="radio" name="gender" value={g} 
              checked={formData.gender === g}
              onChange={handleChange}
            />
            <span>{g}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <div className={`auth-card ${isLogin ? '' : 'register-mode'}`}>
          <div className="auth-form-section">
            <div className="auth-header">
              <h2>{isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}</h2>
              <p>{isLogin ? 'Đăng nhập để tiếp tục cùng RedTech' : 'Đăng ký để nhận ưu đãi từ hệ sinh thái 2026'}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="input-group-auth">
                  <User size={20} />
                  <input 
                    name="fullname" type="text" placeholder="Họ và tên" 
                    value={formData.fullname} onChange={handleChange} required 
                  />
                </div>
              )}
              
              <div className="input-group-auth">
                <Mail size={20} />
                <input 
                  name="email" type="email" placeholder="Email của bạn" 
                  value={formData.email} onChange={handleChange} required 
                />
              </div>

              <div className="input-group-auth">
                <Lock size={20} />
                <input 
                  name="password" type="password" placeholder="Mật khẩu" 
                  value={formData.password} onChange={handleChange} required 
                />
              </div>

              {!isLogin && renderGenderSelector()}

              <button type="submit" className="auth-submit-btn">
                {isLogin ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ TÀI KHOẢN'} <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-divider"><span>Hoặc</span></div>

            <div className="social-auth-single">
              <button className="social-btn google-btn" onClick={() => loginWithGoogle()}>
                <Chrome size={20} /> ĐĂNG NHẬP BẰNG GOOGLE
              </button>
            </div>

            <div className="auth-footer">
              <p>
                {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                <span onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? "Đăng ký ngay" : "Đăng nhập ngay"}
                </span>
              </p>
            </div>
          </div>

          <div className="auth-info-section">
             <div className="info-content">
                <h3>RED<span>TECH</span></h3>
                <p>Hệ sinh thái công nghệ hàng đầu 2026</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;