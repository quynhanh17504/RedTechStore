import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Zap, ShieldCheck, Headphones, ChevronRight, TrendingUp } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';

// Import CSS
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [flashSales, setFlashSales] = useState([]); 
  const [bestSellers, setBestSellers] = useState([]); 
  const [timeLeft, setTimeLeft] = useState(""); // State cho đồng hồ đếm ngược
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const banners = [
    { id: 1, img: "/images/banners/banner1.jpg" },
    { id: 2, img: "/images/banners/banner2.jpg" },
    { id: 3, img: "/images/banners/banner3.jpg" },
  ];

  // Hàm tính toán thời gian còn lại
  const calculateTimeLeft = (endTime) => {
    if (!endTime) return null;
    const difference = +new Date(endTime) - +new Date();
    if (difference <= 0) return "00 : 00 : 00";

    const hours = Math.floor((difference / (1000 * 60 * 60)));
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return `${hours < 10 ? '0' + hours : hours} : ${minutes < 10 ? '0' + minutes : minutes} : ${seconds < 10 ? '0' + seconds : seconds}`;
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [prodRes, catRes, flashRes, bestRes] = await Promise.all([
          axios.get('http://localhost:3005/client/products'),
          axios.get('http://localhost:3005/client/categories'),
          axios.get('http://localhost:3005/client/products/flash-sale'),
          axios.get('http://localhost:3005/client/products/best-sellers')
        ]);
        
        setProducts(prodRes.data);
        setCategories(catRes.data);
        setBestSellers(bestRes.data);

        // Cập nhật Flash Sale theo cấu trúc Object mới { products, end_time }
        const fsData = flashRes.data;
        if (fsData && fsData.products) {
          setFlashSales(fsData.products);
          
          // Chạy đồng hồ nếu có end_time
          if (fsData.end_time) {
            const timer = setInterval(() => {
              const timerString = calculateTimeLeft(fsData.end_time);
              setTimeLeft(timerString);
              if (timerString === "00 : 00 : 00") clearInterval(timer);
            }, 1000);
            return () => clearInterval(timer);
          }
        }
      } catch (err) {
        console.error("Lỗi kết nối API RedTech:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  if (loading) return (
    <div className="loading-screen" style={{fontFamily: 'Cabin'}}>
      <div className="redtech-loader"></div>
      <p>Đang tải không gian công nghệ...</p>
    </div>
  );

  return (
    <div className="home-page" style={{ fontFamily: 'Cabin, sans-serif' }}>
      {/* 1. HERO SLIDER SECTION */}
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
              ></div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <div className="home-content-wrapper">
        {/* 2. FEATURES BAR */}
        <section className="features-glass-bar">
          <div className="container features-inner">
            <div className="f-item">
              <ShieldCheck size={24} color="#E10600" /> 
              <div className="f-text"><strong>Bảo hành 24 tháng</strong></div>
            </div>
            <div className="f-item">
              <Zap size={24} color="#E10600" /> 
              <div className="f-text"><strong>Giao nhanh toàn quốc</strong></div>
            </div>
            <div className="f-item">
              <Headphones size={24} color="#E10600" /> 
              <div className="f-text"><strong>Hỗ trợ kỹ thuật 24/7</strong></div>
            </div>
          </div>
        </section>

        {/* 3. FLASH SALE SECTION */}
        {flashSales.length > 0 && (
          <section className="container fs-section">
            <div className="fs-header">
              <div className="fs-title-box">
                <Zap size={28} className="zap-icon" fill="#E10600" color="#E10600" />
                <h2>FLASH SALE</h2>
              </div>
              <div className="fs-timer">
                <span>Kết thúc sau:</span>
                <div className="timer-box">{timeLeft || "ĐANG DIỄN RA"}</div>
              </div>
            </div>
            <div className="product-grid">
              {flashSales.map(product => (
                <div key={`fs-${product.id}`} className="fs-card-item">
                  <ProductCard product={product} />
                  {product.discount_price > 0 && (
                    <div className="fs-badge">
                      -{Math.round((1 - product.discount_price / product.price) * 100)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. BEST SELLERS SECTION */}
        {bestSellers.length > 0 && (
          <section className="container bs-section">
            <div className="section-header-v2">
              <div className="title-group-v2">
                <h2 className="section-title-v2">SẢN PHẨM BÁN CHẠY</h2>
                <div className="title-underline-v2"></div>
              </div>
              <TrendingUp size={24} color="#E10600" />
            </div>
            <div className="product-grid">
              {bestSellers.map(product => (
                <ProductCard key={`bs-${product.id}`} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* 5. DYNAMIC CATEGORY BLOCKS */}
        {categories.map((cat) => {
          const catProducts = products
            .filter(p => p.category_id === cat.id)
            .slice(0, 4);

          if (catProducts.length === 0) return null;

          return (
            <section key={cat.id} className="container category-section">
              <div className="section-header-v2">
                <div className="title-group-v2">
                  <h2 className="section-title-v2">{cat.name}</h2>
                  <div className="title-underline-v2"></div>
                </div>
                <button 
                  className="view-all-glass" 
                  onClick={() => navigate(`/category/${cat.id}`)}
                >
                  Xem tất cả <ChevronRight size={18} />
                </button>
              </div>
              <div className="product-grid">
                {catProducts.map(product => (
                  <ProductCard key={`cat-${product.id}`} product={product} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Home;