import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Zap, Award } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Lấy userId từ localStorage
    const userLocal = JSON.parse(localStorage.getItem('user'));
    const userId = userLocal?.id;

    const fetchCart = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }
        try {
            const res = await axios.get(`http://localhost:3005/client/cart/${userId}`);
            setCartItems(res.data);
        } catch (err) {
            console.error("Lỗi lấy giỏ hàng:", err);
            if (err.response?.status !== 404) toast.error("Không thể tải giỏ hàng");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const updateQuantity = async (productId, delta, currentQty, stock) => {
        if (delta === -1 && currentQty <= 1) return;
        if (delta === 1 && currentQty >= stock) {
            toast.error(`Rất tiếc, sản phẩm này chỉ còn ${stock} sản phẩm trong kho`);
            return;
        }

        try {
            await axios.put(`http://localhost:3005/client/cart/update`, { 
                userId, productId, delta 
            });
            fetchCart();
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

    // --- LOGIC TÍNH TOÁN: Ưu tiên discount từ API trả về ---
    const { subtotal, memberDiscountAmount, total, discountPercent, rankName } = useMemo(() => {
        const st = cartItems.reduce((acc, item) => {
            const isSale = item.is_flash_sale === 1 && item.discount_price > 0;
            const finalPrice = isSale ? item.discount_price : item.price;
            return acc + (Number(finalPrice) * item.quantity);
        }, 0);

        // Lấy thông tin rank từ sản phẩm đầu tiên (vì API trả về rank cho từng dòng)
        // Nếu API chưa kịp trả về, dùng tạm ở localStorage làm dự phòng
        const dPercent = cartItems.length > 0 ? (cartItems[0].discount_percent || 0) : (userLocal?.discount_percent || 0);
        const rName = cartItems.length > 0 ? (cartItems[0].rank_name || "Thành viên") : (userLocal?.member_rank || "Thành viên");

        const dAmount = Math.round(st * (dPercent / 100));
        
        return {
            subtotal: st,
            memberDiscountAmount: dAmount,
            total: st - dAmount,
            discountPercent: dPercent,
            rankName: rName
        };
    }, [cartItems, userLocal]);

    if (loading) return <div className="loading" style={{fontFamily: 'Cabin', textAlign: 'center', padding: '100px'}}>Đang tải giỏ hàng...</div>;

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

                        const isSale = item.is_flash_sale === 1 && item.discount_price > 0;
                        const currentPrice = isSale ? item.discount_price : item.price;

                        return (
                            <div key={item.item_id} className="cart-item">
                                <div className="item-img">
                                    <img src={displayImg} alt={item.name} />
                                    {isSale && (
                                        <div className="cart-sale-badge">
                                            <Zap size={10} fill="currentColor" /> Flash Sale
                                        </div>
                                    )}
                                </div>
                                
                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <div className="item-price-wrapper">
                                        <span className={`item-unit-price ${isSale ? 'sale-active' : ''}`}>
                                            {Number(currentPrice).toLocaleString()}đ
                                        </span>
                                        {isSale && (
                                            <span className="item-old-price">
                                                {Number(item.price).toLocaleString()}đ
                                            </span>
                                        )}
                                    </div>
                                    <p className="item-stock-info">Kho: {item.stock}</p>
                                </div>

                                <div className="item-qty-controls">
                                    <button onClick={() => updateQuantity(item.product_id, -1, item.quantity, item.stock)}>
                                        <Minus size={16} />
                                    </button>
                                    <span className="qty-value">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.product_id, 1, item.quantity, item.stock)}>
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div className="item-total-price">
                                    {(currentPrice * item.quantity).toLocaleString()}đ
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
                    <div className="cart-summary-row">
                        <span>Tạm tính</span>
                        <span>{subtotal.toLocaleString()}đ</span>
                    </div>

                    {/* Hiển thị chiết khấu thành viên lấy từ database */}
                    {discountPercent > 0 && (
                        <div className="cart-summary-row member-discount-row">
                            <span className="discount-label">
                                <Award size={14} /> Giảm giá {rankName} ({discountPercent}%)
                            </span>
                            <span className="discount-value">-{memberDiscountAmount.toLocaleString()}đ</span>
                        </div>
                    )}

                    <div className="cart-summary-row">
                        <span>Vận chuyển</span>
                        <span className="free-shipping">Miễn phí</span>
                    </div>
                    <hr />
                    <div className="cart-summary-row total-row">
                        <span>TỔNG CỘNG</span>
                        <span className="cart-grand-total">{total.toLocaleString()}đ</span>
                    </div>
                    
                    <Link to="/checkout" className="btn-checkout-link">
                        <button className="btn-checkout">TIẾN HÀNH ĐẶT HÀNG</button>
                    </Link>
                    <p className="secure-checkout">Thanh toán an toàn với RedTech Security</p>
                </aside>
            </div>
        </div>
    );
};

export default Cart;