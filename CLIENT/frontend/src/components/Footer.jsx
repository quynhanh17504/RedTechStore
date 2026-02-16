import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Send, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      {/* Khối tiện ích dịch vụ */}
      <div className="footer-services">
        <div className="container service-wrapper">
          <div className="service-item">
            <Truck size={30} />
            <div>
              <h4>GIAO HÀNG TỐC HÀNH</h4>
              <p>Miễn phí đơn hàng từ 500k</p>
            </div>
          </div>
          <div className="service-item">
            <ShieldCheck size={30} />
            <div>
              <h4>CHÍNH HÃNG 100%</h4>
              <p>Bảo hành lên đến 24 tháng</p>
            </div>
          </div>
          <div className="service-item">
            <RotateCcw size={30} />
            <div>
              <h4>ĐỔI TRẢ 30 NGÀY</h4>
              <p>Thủ tục nhanh gọn, dễ dàng</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="footer-main">
          {/* Thông tin thương hiệu */}
          <div className="footer-column brand-info">
            <Link to="/" className="footer-logo">RED<span>TECH</span></Link>
            <p className="footer-tagline">POWER YOUR DIGITAL LIFE</p>
            <p className="footer-desc">
              Dẫn đầu xu hướng công nghệ với các dòng máy tính, linh kiện và thiết bị thông minh chính hãng.
            </p>
            <div className="social-links">
              <a href="#"><Facebook size={18} /></a>
              <a href="#"><Instagram size={18} /></a>
              <a href="#"><Youtube size={18} /></a>
            </div>
          </div>

          {/* Cột danh mục */}
          <div className="footer-column">
            <h3>KHÁM PHÁ</h3>
            <ul>
              <li><Link to="/phone">Điện thoại</Link></li>
              <li><Link to="/laptop">Laptop & PC</Link></li>
              <li><Link to="/accessories">Phụ kiện Gaming</Link></li>
              <li><Link to="/deals">Ưu đãi Hot</Link></li>
            </ul>
          </div>

          {/* Cột hỗ trợ */}
          <div className="footer-column">
            <h3>HỖ TRỢ</h3>
            <ul>
              <li><Link to="/warranty">Trung tâm bảo hành</Link></li>
              <li><Link to="/shipping">Vận chuyển & Thanh toán</Link></li>
              <li><Link to="/return">Chính sách hoàn tiền</Link></li>
              <li><Link to="/contact">Liên hệ trực tiếp</Link></li>
            </ul>
          </div>

          {/* Cột đăng ký nhận tin */}
          <div className="footer-column newsletter">
            <h3>NEWSLETTER</h3>
            <p>Đăng ký để không bỏ lỡ những thông tin công nghệ mới nhất.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Email của bạn..." required />
              <button type="submit"><Send size={18} /></button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="contact-summary">
            <span><Phone size={14} /> 1900 1234</span>
            <span><Mail size={14} /> support@redtech.vn</span>
            <span><MapPin size={14} /> Quận 1, TP. Hồ Chí Minh</span>
          </div>
          <p className="copyright">© 2026 REDTECH STORE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;