import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingCart, ChevronLeft, ChevronRight, 
  Monitor, Cpu, Battery, HardDrive, Zap, Clock, Camera, Layers, Maximize, Weight, Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import './ProductDetail.css';
import ProductReviews from '../components/ProductReviews'; 

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  const specMap = {
    "1": [
      { label: "Màn hình", name: "screen", icon: <Monitor size={14}/> },
      { label: "Camera sau", name: "back_camera", icon: <Camera size={14}/> },
      { label: "Camera trước", name: "front_camera", icon: <Camera size={14}/> },
      { label: "Chipset", name: "chipset", icon: <Cpu size={14}/> },
      { label: "RAM / ROM", name: "ram_rom", icon: <Layers size={14}/> },
      { label: "Pin", name: "battery", icon: <Battery size={14}/> },
      { label: "Hệ điều hành", name: "os", icon: <Smartphone size={14}/> },
      { label: "Độ phân giải", name: "resolution", icon: <Maximize size={14}/> }
    ],
    "2": [
      { label: "CPU", name: "cpu", icon: <Cpu size={14}/> },
      { label: "Card đồ họa", name: "gpu", icon: <Monitor size={14}/> },
      { label: "RAM", name: "ram", icon: <Layers size={14}/> },
      { label: "SSD", name: "ssd", icon: <HardDrive size={14}/> },
      { label: "Kích thước màn hình", name: "screen_size", icon: <Maximize size={14}/> },
      { label: "Pin", name: "battery", icon: <Battery size={14}/> },
      { label: "Trọng lượng", name: "weight", icon: <Weight size={14}/> }
    ]
  };

  const syncAddToCart = async (quantity = 1) => {
    if (!userId) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      navigate('/login');
      return false;
    }

    try {
      const response = await axios.post('http://localhost:3005/client/cart/add', {
        userId: userId,
        productId: product.id,
        quantity: quantity
      });

      if (response.data.success || response.status === 200) {
        window.dispatchEvent(new Event('cartUpdated'));
        return true;
      }
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error);
      toast.error("Không thể thêm vào giỏ hàng");
      return false;
    }
  };

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      toast.error("Sản phẩm đã hết hàng!");
      return;
    }
    const success = await syncAddToCart();
    if (success) toast.success("Đã thêm vào giỏ hàng!");
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
        if (res.data.flash_sale_id && res.data.sale_end) {
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
    if (!product?.flash_sale_id || !product?.sale_end) return;
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
  const isFlashSaleActive = !!(product.flash_sale_id && timeLeft);

  return (
    <div className="pd-page-wrapper" style={{ fontFamily: 'Cabin, sans-serif' }}>
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

            <div className="pd-action-buttons">
              {/* Chỉ giữ lại nút thêm giỏ hàng */}
              <button 
                className="pd-btn-cart-only" 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingCart size={20} /> THÊM VÀO GIỎ HÀNG
              </button>
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