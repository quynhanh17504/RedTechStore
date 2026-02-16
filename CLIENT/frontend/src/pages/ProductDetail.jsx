import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ShieldCheck, Truck, RefreshCw, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
// Giả lập dữ liệu và reviews
  const reviews = [
    { id: 1, user: "Hoàng Nam", rating: 5, comment: "Máy quá mượt, đóng gói kỹ càng!", date: "12/02/2026" },
    { id: 2, user: "Minh Thư", rating: 4, comment: "Màu Titanium rất sang, giao hàng hơi lâu xíu.", date: "10/02/2026" },
  ];
  useEffect(() => {
    const mockData = [
      { id: 1, name: "iPhone 17 Pro Max", price: 29990000, category: "phone", brand: "Apple", image_url: "/images/products/iphone17promax.jpg" },
      { id: 2, name: "Samsung S25 Ultra", price: 26990000, category: "phone", brand: "Samsung", image_url: "/images/products/samsungs25.jpg" },
      { id: 3, name: "Google Pixel 9 Pro", price: 22500000, category: "phone", brand: "Google", image_url: "/images/products/pixel9.jpg" },
      { id: 4, name: "Xiaomi 15 Ultra", price: 19990000, category: "phone", brand: "Xiaomi", image_url: "/images/products/xiaomi15.jpg" },
      { id: 5, name: "MacBook Pro M3", price: 39990000, category: "laptop", brand: "Apple", image_url: "/images/products/macbook.jpg" },
      { id: 6, name: "Dell XPS 13 2026", price: 35000000, category: "laptop", brand: "Dell", image_url: "/images/products/dellxps.jpg" },
      { id: 7, name: "Asus ROG Zephyrus", price: 45000000, category: "laptop", brand: "Asus", image_url: "/images/products/rog.jpg" },
      { id: 8, name: "HP Spectre x360", price: 32000000, category: "laptop", brand: "HP", image_url: "/images/products/hpspectre.jpg" },
      { id: 9, name: "Tai nghe Sony XM5", price: 6990000, category: "accessory", brand: "Sony", image_url: "/images/products/sony-xm5.jpg" },
      { id: 10, name: "AirPods Pro Gen 3", price: 5500000, category: "accessory", brand: "Apple", image_url: "/images/products/airpods.jpg" },
      { id: 11, name: "Sạc MagSafe 45W", price: 1200000, category: "accessory", brand: "Apple", image_url: "/images/products/magsafe.jpg" },
      { id: 12, name: "Cáp sạc siêu bền", price: 450000, category: "accessory", brand: "Other", image_url: "/images/products/cable.jpg" },
    ];

 const foundProduct = mockData.find(p => p.id === parseInt(id));
    if (foundProduct) setProduct(foundProduct);
  }, [id]);

  if (!product) return <div className="loading">Đang tải...</div>;

  const productImages = [product.image_url, product.image_url, product.image_url, product.image_url];

  const nextImg = () => setCurrentImgIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  const prevImg = () => setCurrentImgIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));

  return (
    <div className="product-detail-page">
      <div className="container">
        <div className="detail-main-section">
          {/* LEFT: SLIDER HÌNH ẢNH (Đã thu nhỏ) */}
          <section className="detail-gallery-v2">
            <div className="slider-container">
              <button className="slider-ctrl prev" onClick={prevImg}><ChevronLeft /></button>
              <div className="main-img-wrapper">
                <img src={productImages[currentImgIndex]} alt={product.name} />
              </div>
              <button className="slider-ctrl next" onClick={nextImg}><ChevronRight /></button>
              <button className={`fav-btn-v2 ${isFavorite ? 'active' : ''}`} onClick={() => setIsFavorite(!isFavorite)}>
                <Heart fill={isFavorite ? "var(--primary-color)" : "none"} />
              </button>
            </div>
            <div className="thumb-strip">
              {productImages.map((img, i) => (
                <div key={i} className={`thumb-v2 ${currentImgIndex === i ? 'active' : ''}`} onClick={() => setCurrentImgIndex(i)}>
                  <img src={img} alt="thumb" />
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT: THÔNG TIN SẢN PHẨM */}
          <section className="detail-info-v2">
            <span className="brand-label">{product.brand}</span>
            <h1 className="p-name">{product.name}</h1>
            <div className="p-price-row">
              <h2 className="p-main-price">{product.price.toLocaleString()}đ</h2>
              <span className="p-old-price">{(product.price * 1.1).toLocaleString()}đ</span>
            </div>

            <div className="p-actions-v2">
              <button className="btn-buy-now-v2">MUA NGAY</button>
              <button className="btn-add-cart-v2"><ShoppingCart size={20} /> THÊM GIỎ HÀNG</button>
            </div>
              
           <div className="detail-right-content">
            {/* ĐẶC QUYỀN - LÀM NỔI BẬT HƠN */}
            <div className="trust-badges-v2">
                <div className="badge-card highlight">
                <div className="badge-icon"><Truck size={24} /></div>
                <div className="badge-text">
                    <span>Giao hàng miễn phí</span>
                    <p>Miễn phí toàn quốc cho đơn từ 500k</p>
                </div>
                </div>
                <div className="badge-card">
                <div className="badge-icon"><ShieldCheck size={24} /></div>
                <div className="badge-text">
                    <span>Bảo hành 12 tháng</span>
                    <p>Lỗi 1 đổi 1 trong 30 ngày đầu</p>
                </div>
                </div>
                <div className="badge-card">
                <div className="badge-icon"><RefreshCw size={24} /></div>
                <div className="badge-text">
                    <span>Đổi trả dễ dàng</span>
                    <p>Thủ tục nhanh chóng trong 7 ngày</p>
                </div>
                </div>
            </div>

            {/* THÔNG SỐ KỸ THUẬT */}
            <div className="specs-container">
                <h3 className="specs-title">Thông số kỹ thuật</h3>
                <ul className="specs-list">
                <li><span>Màn hình:</span> 6.1 inches, OLED, Super Retina XDR</li>
                <li><span>Camera sau:</span> Chính 12MP & Siêu rộng 12MP</li>
                <li><span>Camera trước:</span> 12MP, f/2.2</li>
                <li><span>Chipset:</span> Apple A15 Bionic</li>
                <li><span>RAM / ROM:</span> 4 GB / 256 GB</li>
                <li><span>Hệ điều hành:</span> iOS 15</li>
                <li><span>Độ phân giải:</span> 2532 x 1170 pixels</li>
                <li><span>Tính năng:</span> HDR, True Tone, Haptic Touch, NFC</li>
                </ul>
            </div>
            </div>
          </section>
        </div>

        {/* SECTION ĐÁNH GIÁ SẢN PHẨM */}
        <section className="product-reviews-section">
          <div className="reviews-header">
            <h3>ĐÁNH GIÁ TỪ NGƯỜI DÙNG</h3>
          </div>

          <div className="reviews-container">
            {/* List đánh giá cũ */}
            <div className="reviews-list">
              {reviews.map(rev => (
                <div key={rev.id} className="review-card">
                  <div className="rev-user">
                    <div className="user-avatar">{rev.user.charAt(0)}</div>
                    <div>
                      <strong>{rev.user}</strong>
                      <div className="rev-stars">
                        {[...Array(rev.rating)].map((_, i) => <Star key={i} size={12} fill="#FFB800" stroke="none" />)}
                      </div>
                    </div>
                    <span className="rev-date">{rev.date}</span>
                  </div>
                  <p className="rev-text">{rev.comment}</p>
                </div>
              ))}
            </div>

            {/* Form viết đánh giá mới */}
            <div className="write-review-box">
              <h4>Viết đánh giá của bạn</h4>
              <div className="star-rating-input">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star 
                    key={s} 
                    size={24} 
                    className={userRating >= s ? 'star-active' : ''} 
                    onClick={() => setUserRating(s)}
                    fill={userRating >= s ? "#FFB800" : "none"}
                  />
                ))}
              </div>
              <textarea placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."></textarea>
              <button className="btn-send-review">GỬI ĐÁNH GIÁ <Send size={16} /></button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;