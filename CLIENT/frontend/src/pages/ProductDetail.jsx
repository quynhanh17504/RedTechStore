import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingCart, ChevronLeft, ChevronRight, 
  Monitor, Cpu, Battery, HardDrive, Zap, Clock 
} from 'lucide-react';
import './ProductDetail.css';
import ProductReviews from '../components/ProductReviews'; 

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);

  const specMap = {
    "1": [
      { label: "Màn hình", name: "screen", icon: <Monitor size={14}/> },
      { label: "Camera sau", name: "back_camera" },
      { label: "Camera trước", name: "front_camera" },
      { label: "Chipset", name: "chipset", icon: <Cpu size={14}/> },
      { label: "RAM / ROM", name: "ram_rom" },
      { label: "Pin", name: "battery", icon: <Battery size={14}/> },
      { label: "Hệ điều hành", name: "os" },
      { label: "Độ phân giải", name: "resolution" }
    ],
    "2": [
      { label: "CPU", name: "cpu", icon: <Cpu size={14}/> },
      { label: "Card đồ họa", name: "gpu" },
      { label: "RAM", name: "ram" },
      { label: "SSD", name: "ssd", icon: <HardDrive size={14}/> },
      { label: "Kích thước màn hình", name: "screen_size", icon: <Monitor size={14}/> },
      { label: "Pin", name: "battery", icon: <Battery size={14}/> },
      { label: "Trọng lượng", name: "weight" }
    ]
  };

  const calculateTimeLeft = (endTime) => {
    const difference = +new Date(endTime) - +new Date();
    if (difference > 0) {
      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return null;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3005/client/products/${id}`);
        setProduct(res.data);
        // Chỉ set timer nếu thực sự là flash sale và còn thời gian
        if (res.data.is_flash_sale && res.data.sale_end) {
          const initialTime = calculateTimeLeft(res.data.sale_end);
          setTimeLeft(initialTime);
        }
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!product?.is_flash_sale || !product?.sale_end) return;
    const timer = setInterval(() => {
      const updatedTime = calculateTimeLeft(product.sale_end);
      setTimeLeft(updatedTime);
      if (!updatedTime) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [product]);

  if (loading) return <div className="redtech-loader-full">Đang tải...</div>;
  if (!product) return <div className="pd-error">Sản phẩm không tồn tại!</div>;

  const productImages = Array.isArray(product.image) ? product.image : [product.image];
  const hasDiscount = product.discount_price && product.discount_price > 0;
  // Quan trọng: Kiểm tra timeLeft phải tồn tại và khác null
  const isFlashSaleActive = !!(product.is_flash_sale && timeLeft);
  const soldPercentage = isFlashSaleActive ? 65 : 0; 

  return (
    <div className="pd-page-wrapper">
      <div className="pd-container">
        
        {isFlashSaleActive && (
          <div className="pd-flash-bar">
            <div className="pd-flash-title">
              <Zap size={20} fill="#fff" />
              <span>SĂN DEAL CHỚP NHOÁNG</span>
            </div>
            <div className="pd-flash-countdown">
              <Clock size={18} />
              <span>Kết thúc sau:</span>
              <div className="pd-timer-display">
                <span className="pd-time-box">{String(timeLeft.hours).padStart(2, '0')}</span>:
                <span className="pd-time-box">{String(timeLeft.minutes).padStart(2, '0')}</span>:
                <span className="pd-time-box">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          </div>
        )}

        <div className="pd-main-section">
          <section className="pd-gallery-area">
            <div className="pd-slider-container">
              <button className="pd-slider-ctrl prev" onClick={() => setCurrentImgIndex(i => i === 0 ? productImages.length - 1 : i - 1)}><ChevronLeft /></button>
              <div className="pd-main-img-wrapper">
                <img src={productImages[currentImgIndex]} alt={product.name} />
              </div>
              <button className="pd-slider-ctrl next" onClick={() => setCurrentImgIndex(i => i === productImages.length - 1 ? 0 : i + 1)}><ChevronRight /></button>
            </div>
            <div className="pd-thumb-strip">
              {productImages.map((img, i) => (
                <div key={i} className={`pd-thumb-item ${currentImgIndex === i ? 'active' : ''}`} onClick={() => setCurrentImgIndex(i)}>
                  <img src={img} alt="thumb" />
                </div>
              ))}
            </div>
          </section>

          <section className="pd-info-area">
            <div className="pd-header-meta">
              <span className="pd-brand-label">{product.brand_name}</span>
              {hasDiscount && (
                <span className="pd-discount-tag">-{Math.round((1 - product.discount_price / product.price) * 100)}%</span>
              )}
            </div>

            <h1 className="pd-product-name">{product.name}</h1>
            
            <div className="pd-price-row">
              {hasDiscount ? (
                <div className="pd-price-group">
                  <h2 className={`pd-current-price ${isFlashSaleActive ? 'pd-sale-text' : ''}`}>
                    {Number(product.discount_price).toLocaleString()}đ
                  </h2>
                  <span className="pd-old-price">{Number(product.price).toLocaleString()}đ</span>
                </div>
              ) : (
                <h2 className="pd-current-price">{Number(product.price).toLocaleString()}đ</h2>
              )}
              {product.stock > 0 ? (
                 <span className="pd-stock-label">Còn {product.stock} sản phẩm</span>
              ) : (
                 <span className="pd-out-stock">Hết hàng</span>
              )}
            </div>

            {/* Đã xóa dòng "0" thừa ở đây */}

            {isFlashSaleActive && (
              <div className="pd-flash-progress-box">
                <div className="pd-progress-info">
                  <span>🔥 Đã bán {soldPercentage}%</span>
                  <span>Sắp cháy hàng</span>
                </div>
                <div className="pd-progress-bg">
                  <div className="pd-progress-fill" style={{ width: `${soldPercentage}%` }}></div>
                </div>
              </div>
            )}

            <div className="pd-short-desc">
              <p>{product.description}</p>
            </div>

            <div className="pd-action-buttons">
              <button className="pd-btn-buy">MUA NGAY</button>
              <button className="pd-btn-cart"><ShoppingCart size={20} /> GIỎ HÀNG</button>
            </div>
              
            <div className="pd-specs-card">
              <h3 className="pd-specs-title">Thông số kỹ thuật</h3>
              <ul className="pd-specs-list">
                {specMap[product.category_id]?.map((item, idx) => (
                  <li key={idx}>
                    <span className="pd-spec-label">{item.icon} {item.label}</span>
                    <span className="pd-spec-value">{product.specifications?.[item.name] || "..."}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <div className="pd-reviews-wrapper">
            <ProductReviews productId={id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;