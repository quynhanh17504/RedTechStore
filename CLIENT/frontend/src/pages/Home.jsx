import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Zap, ShieldCheck, Headphones, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';

// Import CSS đồng bộ
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Banners trang chủ
  const banners = [
    { id: 1, img: "/images/banners/banner1.jpg" },
    { id: 2, img: "/images/banners/banner2.jpg" },
    { id: 3, img: "/images/banners/banner3.jpg" },
  ];

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Gọi đồng thời cả 2 API để tối ưu tốc độ load
        const [prodRes, catRes] = await Promise.all([
          axios.get('http://localhost:3005/client/products'),
          axios.get('http://localhost:3005/client/categories')
        ]);

        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error("Lỗi kết nối API RedTech:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // Màn hình loading RedTech Style
  if (loading) return (
    <div className="loading-screen">
      <div className="redtech-loader"></div>
      <p>Đang tải không gian công nghệ...</p>
    </div>
  );

  return (
    <div className="home-page">
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
        {/* 2. FEATURES BAR (Glassmorphism) */}
        <section className="features-glass-bar">
          <div className="container features-inner">
            <div className="f-item">
              <ShieldCheck size={24} />
              <div className="f-text">
                <strong>Bảo hành 24 tháng</strong>
              </div>
            </div>
            <div className="f-item">
              <Zap size={24} />
              <div className="f-text">
                <strong>Giao nhanh toàn quốc</strong>
              </div>
            </div>
            <div className="f-item">
              <Headphones size={24} />
              <div className="f-text">
                <strong>Hỗ trợ kỹ thuật 24/7</strong>
              </div>
            </div>
          </div>
        </section>

        {/* 3. DYNAMIC CATEGORY BLOCKS (Render dựa trên Database) */}
        {categories.map((cat) => {
          // Lọc ra tối đa 4 sản phẩm thuộc category_id hiện tại
          const catProducts = products
            .filter(p => p.category_id === cat.id)
            .slice(0, 4);

          // Nếu danh mục này chưa có sản phẩm nào thì không hiển thị Section
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
                  <ProductCard key={product.id} product={product} />
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