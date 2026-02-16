import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Zap, ShieldCheck, Headphones, ChevronRight, Sparkles } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const banners = [
    { id: 1, title: "IPHONE 17 PRO", highlight: "TITANIUM", img: "/images/banners/banner1.jpg" },
    { id: 2, title: "MACBOOK M3", highlight: "ULTRA POWER", img: "/images/banners/banner2.jpg" },
    { id: 3, title: "PHỤ KIỆN", highlight: "PREMIUM", img: "/images/banners/banner3.jpg" },
  ];

  useEffect(() => {
    // Giả lập data từ public/images/products/
    const mockData = [
      { id: 1, name: "iPhone 17 Pro Max", price: 29990000, category: "phone", image_url: "/images/products/iphone17promax.jpg" },
      { id: 2, name: "Samsung S25 Ultra", price: 26990000, category: "phone", image_url: "/images/products/samsungs25.jpg" },
      { id: 3, name: "Google Pixel 9 Pro", price: 22500000, category: "phone", image_url: "/images/products/pixel9.jpg" },
      { id: 4, name: "Xiaomi 15 Ultra", price: 19990000, category: "phone", image_url: "/images/products/xiaomi15.jpg" },
      
      { id: 5, name: "MacBook Pro M3", price: 39990000, category: "laptop", image_url: "/images/products/macbook.jpg" },
      { id: 6, name: "Dell XPS 13 2026", price: 35000000, category: "laptop", image_url: "/images/products/dellxps.jpg" },
      { id: 7, name: "Asus ROG Zephyrus", price: 45000000, category: "laptop", image_url: "/images/products/rog.jpg" },
      { id: 8, name: "HP Spectre x360", price: 32000000, category: "laptop", image_url: "/images/products/hpspectre.jpg" },
      
      { id: 9, name: "Tai nghe Sony XM5", price: 6990000, category: "accessory", image_url: "/images/products/sony-xm5.jpg" },
      { id: 10, name: "AirPods Pro Gen 3", price: 5500000, category: "accessory", image_url: "/images/products/airpods.jpg" },
      { id: 11, name: "Sạc MagSafe 45W", price: 1200000, category: "accessory", image_url: "/images/products/magsafe.jpg" },
      { id: 12, name: "Cáp sạc siêu bền", price: 450000, category: "accessory", image_url: "/images/products/cable.jpg" },
    ];
    setProducts(mockData);
  }, []);

  const renderCategoryBlock = (title, categoryKey, path) => {
    const filteredProducts = products.filter(p => p.category === categoryKey).slice(0, 4);

    return (
      <section className="container category-section">
        <div className="section-header">
          <div className="title-group">
            <h2 className="section-title">{title}</h2>
            <div className="title-underline"></div>
          </div>
          <button className="view-all-glass" onClick={() => navigate(path)}>
            Xem tất cả <ChevronRight size={18} />
          </button>
        </div>
        <div className="product-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    );
  };

return (
    <div className="home-page">
      {/* Slider chỉ hiển thị Banner thuần túy */}
      <section className="hero-slider">
        <Swiper
          effect={'fade'}
          speed={1000}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          modules={[Autoplay, Pagination, EffectFade]}
          className="mainSwiper"
        >
          {banners.map(b => (
            <SwiperSlide key={b.id}>
              <div 
                className="slide-item" 
                style={{ backgroundImage: `url(${b.img})` }}
                onClick={() => navigate('/products')} 
              >
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <div className="home-content-wrapper">
        <section className="features-glass-bar">
          <div className="container features-inner">
            <div className="f-item"><ShieldCheck /> <span>Bảo hành 24 tháng</span></div>
            <div className="f-item"><Zap /> <span>Giao nhanh toàn quốc</span></div>
            <div className="f-item"><Headphones /> <span>Hỗ trợ kỹ thuật 24/7</span></div>
          </div>
        </section>

        {renderCategoryBlock("ĐIỆN THOẠI THÔNG MINH", "phone", "/phone")}
        {renderCategoryBlock("LAPTOP", "laptop", "/laptop")}
        {renderCategoryBlock("PHỤ KIỆN CÔNG NGHỆ", "accessory", "/accessories")}
      </div>
    </div>
  );
};

export default Home;