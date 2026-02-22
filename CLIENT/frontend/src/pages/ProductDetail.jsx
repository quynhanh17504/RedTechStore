import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingCart, Heart, Star, ShieldCheck, Truck, 
  RefreshCw, ChevronLeft, ChevronRight, Send,
  Monitor, Cpu, Battery, HardDrive
} from 'lucide-react';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);

  // Cấu trúc nhãn Spec bạn cung cấp
  const specMap = {
    "1": [ // Điện thoại
      { label: "Màn hình", name: "screen", icon: <Monitor size={14}/> },
      { label: "Camera sau", name: "back_camera" },
      { label: "Camera trước", name: "front_camera" },
      { label: "Chipset", name: "chipset", icon: <Cpu size={14}/> },
      { label: "RAM / ROM", name: "ram_rom" },
      { label: "Pin", name: "battery", icon: <Battery size={14}/> },
      { label: "Hệ điều hành", name: "os" },
      { label: "Độ phân giải", name: "resolution" }
    ],
    "2": [ // Laptop
      { label: "CPU", name: "cpu", icon: <Cpu size={14}/> },
      { label: "Card đồ họa", name: "gpu" },
      { label: "RAM", name: "ram" },
      { label: "SSD", name: "ssd", icon: <HardDrive size={14}/> },
      { label: "Kích thước màn hình", name: "screen_size", icon: <Monitor size={14}/> },
      { label: "Pin", name: "battery", icon: <Battery size={14}/> },
      { label: "Trọng lượng", name: "weight" }
    ]
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3005/client/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Lỗi fetch chi tiết sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="redtech-loader-full">Đang tải...</div>;
  if (!product) return <div className="error">Sản phẩm không tồn tại!</div>;

  // Lấy danh sách ảnh từ DB (Cột image là mảng)
  const productImages = Array.isArray(product.image) ? product.image : [product.image];

  const nextImg = () => setCurrentImgIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  const prevImg = () => setCurrentImgIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));

  return (
    <div className="product-detail-page" style={{ fontFamily: 'Cabin, sans-serif' }}>
      <div className="container">
        <div className="detail-main-section">
          {/* SLIDER HÌNH ẢNH */}
          <section className="detail-gallery-v2">
            <div className="slider-container">
              <button className="slider-ctrl prev" onClick={prevImg}><ChevronLeft /></button>
              <div className="main-img-wrapper">
                <img src={productImages[currentImgIndex]} alt={product.name} />
              </div>
              <button className="slider-ctrl next" onClick={nextImg}><ChevronRight /></button>
            </div>
            <div className="thumb-strip">
              {productImages.map((img, i) => (
                <div key={i} className={`thumb-v2 ${currentImgIndex === i ? 'active' : ''}`} onClick={() => setCurrentImgIndex(i)}>
                  <img src={img} alt="thumb" />
                </div>
              ))}
            </div>
          </section>

          {/* THÔNG TIN SẢN PHẨM */}
          <section className="detail-info-v2">
            <span className="brand-label">{product.brand_name}</span>
            <h1 className="p-name">{product.name}</h1>
            <div className="p-price-row">
              <h2 className="p-main-price">{Number(product.price).toLocaleString()}đ</h2>
              {product.stock > 0 ? <span className="stock-status">Còn hàng</span> : <span className="out-stock">Hết hàng</span>}
            </div>

            <div className="p-description-short">
                <p>{product.description}</p>
            </div>

            <div className="p-actions-v2">
              <button className="btn-buy-now-v2">MUA NGAY</button>
              <button className="btn-add-cart-v2"><ShoppingCart size={20} /> THÊM GIỎ HÀNG</button>
            </div>
              
            <div className="detail-right-content">
              {/* THÔNG SỐ KỸ THUẬT DỰA TRÊN CATEGORY_ID */}
              <div className="specs-container">
                <h3 className="specs-title">Thông số kỹ thuật</h3>
                <ul className="specs-list">
                  {specMap[product.category_id]?.map((item, idx) => (
                    <li key={idx}>
                      <span className="spec-label">
                        {item.icon} {item.label}:
                      </span>
                      <span className="spec-value">
                        {product.specifications?.[item.name] || "Đang cập nhật"}
                      </span>
                    </li>
                  ))}
                  {!specMap[product.category_id] && <li>Chưa có thông số cho danh mục này</li>}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;