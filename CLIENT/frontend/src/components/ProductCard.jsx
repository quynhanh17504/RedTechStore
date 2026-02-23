import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const isOutOfStock = product.stock <= 0;
  
  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  // --- HÀM XỬ LÝ THÊM VÀO GIỎ HÀNG ---
  const handleAddToCart = async (e) => {
    e.stopPropagation(); // Ngăn chuyển trang khi click nút
    
    if (!userId) {
      toast.error("Vui lòng đăng nhập để mua hàng!");
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3005/client/cart/add', {
        userId: userId,
        productId: product.id,
        quantity: 1
      });

      if (response.data.success || response.status === 200) {
        toast.success(`Đã thêm ${product.name} vào giỏ!`);
        
        // KÍCH HOẠT SỰ KIỆN ĐỂ NAVBAR CẬP NHẬT BADGE
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (error) {
      console.error("Lỗi thêm giỏ hàng:", error);
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  const goToDetail = (e) => {
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  // Xử lý ảnh JSON từ database
  let displayImage = "/images/default-product.jpg";
  try {
    if (product.image) {
      const imageArray = typeof product.image === 'string' ? JSON.parse(product.image) : product.image;
      if (Array.isArray(imageArray) && imageArray.length > 0) {
        displayImage = imageArray[0];
      }
    }
  } catch (error) {
    displayImage = product.image;
  }

  return (
    <div className={`product-card ${isOutOfStock ? 'oos-card' : ''}`} style={{ fontFamily: 'Cabin, sans-serif' }}>
      <div className="product-img-box" onClick={goToDetail} style={{ cursor: 'pointer' }}>
        <img src={displayImage} alt={product.name} loading="lazy" />
        
        {isOutOfStock ? (
          <div className="status-label out-of-stock">HẾT HÀNG</div>
        ) : (
          <div className="status-label brand-tag">{product.brand_name}</div>
        )}

        <div className="product-actions">
          <button className="action-btn" title="Yêu thích" onClick={(e) => e.stopPropagation()}>
            <Heart size={18} />
          </button>
          
          <button className="action-btn" title="Xem nhanh" onClick={goToDetail}>
            <Eye size={18} />
          </button>

          {/* Nút thêm nhanh vào giỏ hàng (Icon) */}
          <button 
            className="action-btn btn-cart-quick" 
            disabled={isOutOfStock} 
            title="Thêm nhanh vào giỏ"
            onClick={handleAddToCart}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>

      <div className="product-content">
        <p className="product-category">{product.category_name || "THIẾT BỊ SỐ"}</p>
        
        <h3 className="product-title" onClick={goToDetail} style={{ cursor: 'pointer' }}>
          {product.name}
        </h3>
        
        <div className="price-group">
          <span className="current-price">
            {Number(product.price).toLocaleString('vi-VN')}đ
          </span>
          <span className="stock-count">Kho: <b>{product.stock}</b></span>
        </div>

        {/* Nút MUA NGAY (Full width) */}
        <button 
          className="add-to-cart-full" 
          disabled={isOutOfStock}
          onClick={handleAddToCart}
        >
          {isOutOfStock ? 'LIÊN HỆ ĐẶT HÀNG' : 'MUA NGAY'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;