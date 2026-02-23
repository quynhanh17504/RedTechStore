import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    // Sử dụng useCallback để tránh tạo lại hàm khi render
    const fetchCart = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        try {
            // Đảm bảo URL này khớp hoàn toàn với Backend Router
            const res = await axios.get(`http://localhost:3005/client/cart/${userId}`);
            setCartItems(res.data);
        } catch (err) {
            console.error("Lỗi lấy giỏ hàng:", err);
            // Không toast lỗi nếu là lỗi 404 lần đầu (giỏ hàng trống hoàn toàn)
            if(err.response?.status !== 404) toast.error("Không thể tải giỏ hàng");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Cập nhật số lượng có kiểm tra TỒN KHO
    const updateQuantity = async (productId, delta, currentQty, stock) => {
        // 1. Kiểm tra nếu giảm xuống dưới 1
        if (delta === -1 && currentQty <= 1) return;

        // 2. Kiểm tra nếu tăng quá số lượng kho
        if (delta === 1 && currentQty >= stock) {
            toast.error(`Rất tiếc, sản phẩm này chỉ còn ${stock} sản phẩm trong kho`);
            return;
        }

        try {
            await axios.put(`http://localhost:3005/client/cart/update`, { 
                userId, 
                productId, 
                delta 
            });
            
            // Cập nhật UI local trước để mượt mà (Optional) hoặc fetch lại
            fetchCart();
            // Phát sự kiện để Navbar cập nhật Badge
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            toast.error("Lỗi cập nhật số lượng");
        }
    };

    const removeItem = async (productId) => {
        try {
            await axios.delete(`http://localhost:3005/client/cart/remove/${userId}/${productId}`);
            toast.success("Đã xóa khỏi giỏ hàng");
            fetchCart();
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (err) {
            toast.error("Xóa thất bại");
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = subtotal;

    if (loading) return <div className="loading" style={{fontFamily: 'Cabin'}}>Đang tải...</div>;

    if (!userId) {
        return (
            <div className="container empty-cart" style={{ fontFamily: 'Cabin, sans-serif' }}>
                <ShoppingBag size={80} strokeWidth={1} />
                <h2>Bạn chưa đăng nhập</h2>
                <Link to="/login" className="btn-main">ĐĂNG NHẬP NGAY</Link>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container empty-cart" style={{ fontFamily: 'Cabin, sans-serif' }}>
                <ShoppingBag size={80} strokeWidth={1} />
                <h2>Giỏ hàng của bạn đang trống</h2>
                <Link to="/" className="btn-main">QUAY LẠI CỬA HÀNG</Link>
            </div>
        );
    }

    return (
        <div className="container cart-page section-padding" style={{ fontFamily: 'Cabin, sans-serif' }}>
            <div className="cart-header">
                <h1>GIỎ HÀNG <span>({cartItems.length} mặt hàng)</span></h1>
                <Link to="/" className="back-link"><ArrowLeft size={18} /> Tiếp tục mua sắm</Link>
            </div>

            <div className="cart-layout">
                <div className="cart-items-container">
                    {cartItems.map(item => {
                        let displayImg = "";
                        try {
                            const imgs = JSON.parse(item.image);
                            displayImg = Array.isArray(imgs) ? imgs[0] : item.image;
                        } catch (e) { displayImg = item.image; }

                        return (
                            <div key={item.item_id} className="cart-item">
                                <div className="item-img">
                                    <img src={displayImg} alt={item.name} />
                                </div>
                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p className="item-unit-price">{parseInt(item.price).toLocaleString()}đ</p>
                                    <p className="item-stock-info">Kho: {item.stock}</p>
                                </div>
                                <div className="item-qty-controls">
                                    <button 
                                        onClick={() => updateQuantity(item.product_id, -1, item.quantity, item.stock)}
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.product_id, 1, item.quantity, item.stock)}
                                        disabled={item.quantity >= item.stock}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="item-total-price">
                                    {(item.price * item.quantity).toLocaleString()}đ
                                </div>
                                <button className="item-remove" onClick={() => removeItem(item.product_id)}>
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        );
                    })}
                </div>

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
                    
                    <Link to="/checkout" className="btn-checkout-link">
                        <button className="btn-checkout">TIẾN HÀNH ĐẶT HÀNG</button>
                    </Link>
                </aside>
            </div>
        </div>
    );
};

export default Cart;