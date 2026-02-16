import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    gender: 'male' // Mặc định
  });

  const handleGoogleLogin = () => {
    // Giả lập Login Google thành công
    setStep(2);
  };

  const renderGenderSelector = () => (
    <div className="gender-selector">
      <p className="label-text">Giới tính:</p>
      <div className="gender-options">
        <label className={`gender-card ${formData.gender === 'male' ? 'active' : ''}`}>
          <input 
            type="radio" name="gender" value="male" 
            checked={formData.gender === 'male'}
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
          />
          <span>Nam</span>
        </label>
        <label className={`gender-card ${formData.gender === 'female' ? 'active' : ''}`}>
          <input 
            type="radio" name="gender" value="female" 
            checked={formData.gender === 'female'}
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
          />
          <span>Nữ</span>
        </label>
        <label className={`gender-card ${formData.gender === 'other' ? 'active' : ''}`}>
          <input 
            type="radio" name="gender" value="other" 
            checked={formData.gender === 'other'}
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
          />
          <span>Khác</span>
        </label>
      </div>
    </div>
  );

  if (step === 2) {
    return (
      <div className="auth-page">
        <div className="container auth-container">
          <div className="auth-card single-form">
            <div className="auth-form-section">
              <div className="auth-header">
                <h2>Sắp hoàn tất rồi!</h2>
                <p>Vui lòng bổ sung thông tin cá nhân để RedTech phục vụ bạn tốt hơn.</p>
              </div>
              <form className="auth-form" onSubmit={(e) => { e.preventDefault(); console.log(formData); }}>
                <div className="input-group">
                  <User size={20} />
                  <input type="text" placeholder="Tên hiển thị của bạn" required autoFocus />
                </div>
                
                {renderGenderSelector()}

                <button className="auth-submit-btn">
                  BẮT ĐẦU TRẢI NGHIỆM <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <div className={`auth-card ${isLogin ? '' : 'register-mode'}`}>
          <div className="auth-form-section">
            <div className="auth-header">
              <h2>{isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}</h2>
              <p>{isLogin ? 'Đăng nhập để tiếp tục cùng RedTech' : 'Đăng ký để nhận nhiều ưu đãi đặc biệt'}</p>
            </div>

            <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
              {!isLogin && (
                <>
                  <div className="input-group">
                    <User size={20} />
                    <input type="text" placeholder="Họ và tên" required />
                  </div>
                  {renderGenderSelector()}
                </>
              )}
              
              <div className="input-group">
                <Mail size={20} />
                <input type="email" placeholder="Email của bạn" required />
              </div>

              <div className="input-group">
                <Lock size={20} />
                <input type="password" placeholder="Mật khẩu" required />
              </div>

              {isLogin && (
                <div className="auth-options">
                  <label className="checkbox-label"><input type="checkbox" /> Ghi nhớ tôi</label>
                  <a href="#forgot" className="forgot-link">Quên mật khẩu?</a>
                </div>
              )}

              <button className="auth-submit-btn">
                {isLogin ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ TÀI KHOẢN'} <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-divider"><span>Hoặc</span></div>

            <div className="social-auth-single">
              <button className="social-btn google-btn" onClick={handleGoogleLogin}>
                <Chrome size={20} /> ĐĂNG NHẬP BẰNG GOOGLE
              </button>
            </div>

            <div className="auth-footer">
              {isLogin ? (
                <p>Chưa có tài khoản? <span onClick={() => setIsLogin(false)}>Đăng ký ngay</span></p>
              ) : (
                <p>Đã có tài khoản? <span onClick={() => setIsLogin(true)}>Đăng nhập ngay</span></p>
              )}
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