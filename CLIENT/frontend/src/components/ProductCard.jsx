import React from 'react';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const isOutOfStock = product.stock <= 0;

  // Xử lý ảnh: Vì database lưu cột 'image' là mảng JSON string
  let displayImage = "/images/default-product.jpg";
  try {
    if (product.image) {
      const imageArray = JSON.parse(product.image);
      if (Array.isArray(imageArray) && imageArray.length > 0) {
        displayImage = imageArray[0]; // Lấy tấm ảnh đầu tiên trong mảng
      }
    }
  } catch (error) {
    // Nếu không phải JSON (trường hợp lưu string thuần), dùng trực tiếp
    displayImage = product.image;
  }

  return (
    <div className={`product-card ${isOutOfStock ? 'oos-card' : ''}`}>
      {/* Phần hình ảnh & Overlay chức năng */}
      <div className="product-img-box">
        <img src={displayImage} alt={product.name} loading="lazy" />
        
        {/* Nhãn trạng thái */}
        {isOutOfStock ? (
          <div className="status-label out-of-stock">HẾT HÀNG</div>
        ) : (
          <div className="status-label brand-tag">{product.brand_name}</div>
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
        {/* Hiển thị Tên danh mục từ bảng JOIN */}
        <p className="product-category">{product.category_name || "THIẾT BỊ SỐ"}</p>
        
        <h3 className="product-title">{product.name}</h3>
        
        <div className="price-group">
          {/* Chuyển đổi giá sang định dạng tiền tệ Việt Nam */}
          <span className="current-price">
            {Number(product.price).toLocaleString('vi-VN')}đ
          </span>
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