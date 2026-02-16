import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import './Cart.css';

const Cart = () => {
  // Giả lập dữ liệu giỏ hàng
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "iPhone 17 Pro Max 256GB", price: 29990000, quantity: 1, image_url: "/images/products/iphone17promax.jpg" },
    { id: 3, name: "Tai nghe Sony WH-1000XM5", price: 6990000, quantity: 2, image_url: "/images/products/sony-xm5.jpg" },
  ]);

  // Hàm thay đổi số lượng
  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  // Hàm xóa sản phẩm
  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 0; // Miễn phí vận chuyển
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="container empty-cart">
        <ShoppingBag size={80} />
        <h2>Giỏ hàng của bạn đang trống</h2>
        <p>Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <Link to="/" className="btn-main">QUAY LẠI CỬA HÀNG</Link>
      </div>
    );
  }

  return (
    <div className="container cart-page section-padding">
      <div className="cart-header">
        <h1>GIỎ HÀNG <span>({cartItems.length} sản phẩm)</span></h1>
        <Link to="/" className="back-link"><ArrowLeft size={18} /> Tiếp tục mua sắm</Link>
      </div>

      <div className="cart-layout">
        {/* Danh sách sản phẩm */}
        <div className="cart-items-container">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-img">
                <img src={item.image_url} alt={item.name} />
              </div>
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="item-unit-price">{item.price.toLocaleString()}đ</p>
              </div>
              <div className="item-qty-controls">
                <button onClick={() => updateQuantity(item.id, -1)}><Minus size={16} /></button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)}><Plus size={16} /></button>
              </div>
              <div className="item-total-price">
                {(item.price * item.quantity).toLocaleString()}đ
              </div>
              <button className="item-remove" onClick={() => removeItem(item.id)}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Tóm tắt đơn hàng */}
        <aside className="cart-summary">
          <h3>TÓM TẮT ĐƠN HÀNG</h3>
          <div className="summary-row">
            <span>Tạm tính</span>
            <span>{subtotal.toLocaleString()}đ</span>
          </div>
          <div className="summary-row">
            <span>Vận chuyển</span>
            <span className="free-shipping">Miễn phí</span>
          </div>
          <hr />
          <div className="summary-row total-row">
            <span>TỔNG CỘNG</span>
            <span className="grand-total">{total.toLocaleString()}đ</span>
          </div>
          <button className="btn-checkout">TIẾN HÀNH ĐẶT HÀNG</button>
          
          <div className="secure-checkout">
            <p>Thanh toán an toàn với REDTECH</p>
            <div className="payment-icons">
               {/* Có thể thêm icon Visa, MoMo... */}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;