import React from 'react';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <div className={`product-card ${isOutOfStock ? 'oos-card' : ''}`}>
      {/* Phần hình ảnh & Overlay chức năng */}
      <div className="product-img-box">
        <img src={product.image_url} alt={product.name} loading="lazy" />
        
        {/* Nhãn trạng thái */}
        {isOutOfStock ? (
          <div className="status-label out-of-stock">HẾT HÀNG</div>
        ) : (
          <div className="status-label new-arrival">MỚI</div>
        )}

        {/* Nút thao tác nhanh khi hover */}
        <div className="product-actions">
          <button className="action-btn" title="Yêu thích"><Heart size={18} /></button>
          <button className="action-btn" title="Xem nhanh"><Eye size={18} /></button>
          <button className="action-btn btn-cart-quick" disabled={isOutOfStock} title="Thêm vào giỏ">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="product-content">
        <p className="product-category">THIẾT BỊ SỐ</p>
        <h3 className="product-title">{product.name}</h3>
        
        <div className="price-group">
          <span className="current-price">{product.price.toLocaleString()}đ</span>
          <span className="stock-count">Kho: <b>{product.stock}</b></span>
        </div>

        <button 
          className="add-to-cart-full" 
          disabled={isOutOfStock}
        >
          {isOutOfStock ? 'LIÊN HỆ ĐẶT HÀNG' : 'MUA NGAY'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;