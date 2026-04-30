import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, CreditCard, User, CheckCircle, Home, Package, Zap, Award } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    
    // 1. Lấy thông tin User từ LocalStorage
    const userLocal = JSON.parse(localStorage.getItem('user'));
    const userId = userLocal?.id;

    const [cartItems, setCartItems] = useState([]);
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        fullname: userLocal?.fullname || '',
        phone: '',
        address: '',
        paymentMethod: 'COD'
    });

    // 2. Fetch dữ liệu giỏ hàng khi vào trang
    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }

        const fetchCart = async () => {
            try {
                const res = await axios.get(`http://localhost:3005/client/cart/${userId}`);
                setCartItems(res.data);
                
                if (res.data.length === 0 && !isSuccess) {
                    navigate('/cart');
                }
            } catch (err) {
                console.error("Lỗi lấy giỏ hàng checkout:", err);
                toast.error("Không thể tải thông tin thanh toán");
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [userId, navigate, isSuccess]);

    // 3. Logic tính toán tổng tiền
    const { subtotal, discountPercent, memberDiscountAmount, finalTotal, rankName } = useMemo(() => {
        const st = cartItems.reduce((acc, item) => {
            const isSale = item.is_flash_sale === 1 && item.discount_price > 0;
            const price = isSale ? item.discount_price : item.price;
            return acc + (Number(price) * item.quantity);
        }, 0);

        const dPercent = cartItems.length > 0 ? (cartItems[0].discount_percent || 0) : 0;
        const rName = cartItems.length > 0 ? (cartItems[0].rank_name || "Thành viên") : "Thành viên";
        const dAmount = Math.round(st * (dPercent / 100));

        return {
            subtotal: st,
            discountPercent: dPercent,
            memberDiscountAmount: dAmount,
            finalTotal: st - dAmount,
            rankName: rName
        };
    }, [cartItems]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 4. Xử lý đặt hàng
    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        
        if (!formData.phone || !formData.address) {
            toast.error("Vui lòng nhập đầy đủ thông tin giao hàng");
            return;
        }

        const loadingToast = toast.loading("Đang xử lý đơn hàng...");

        try {
            const orderData = {
                userId,
                ...formData,
                totalPrice: finalTotal,
                discountAmount: memberDiscountAmount,
                items: cartItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price_at_purchase: item.is_flash_sale === 1 && item.discount_price > 0 ? item.discount_price : item.price
                }))
            };

            await axios.post('http://localhost:3005/client/order/place', orderData);

            toast.success("Đặt hàng thành công!", { id: loadingToast });
            setIsSuccess(true);
            
            window.dispatchEvent(new Event('cartUpdated'));
            
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Lỗi khi đặt hàng", { id: loadingToast });
        }
    };

    // Hàm điều hướng về tab đơn hàng trong Profile
    const handleViewOrders = () => {
        navigate('/profile', { state: { activeTab: 'orders' } });
    };

    if (loading) return <div className="loading-screen" style={{fontFamily: 'Cabin', textAlign: 'center', padding: '100px'}}>Đang chuẩn bị đơn hàng...</div>;

    if (isSuccess) {
        return (
            <div className="checkout-success-container" style={{ fontFamily: 'Cabin, sans-serif' }}>
                <div className="success-card">
                    <div className="success-icon-wrapper">
                        <CheckCircle size={80} color="#22c55e" />
                    </div>
                    <h2>ĐẶT HÀNG THÀNH CÔNG!</h2>
                    <p>Mã đơn hàng của bạn đã được hệ thống ghi nhận.</p>
                    <p>Cảm ơn <strong>{formData.fullname}</strong> đã tin tưởng <strong>RedTech</strong>.</p>
                    <div className="success-actions">
                        {/* Cập nhật nút Xem đơn hàng sử dụng hàm handleViewOrders */}
                        <button onClick={handleViewOrders} className="btn-success-view">
                            <Package size={20} /> Xem đơn hàng
                        </button>
                        <button onClick={() => navigate('/')} className="btn-success-home">
                            <Home size={20} /> Về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page" style={{ fontFamily: 'Cabin, sans-serif' }}>
            <div className="container section-padding">
                <div className="checkout-header">
                    <Link to="/cart" className="back-to-cart">
                        <ChevronLeft size={20} /> Quay lại giỏ hàng
                    </Link>
                    <h1>THANH TOÁN ĐƠN HÀNG</h1>
                </div>

                <form className="checkout-layout" onSubmit={handlePlaceOrder}>
                    <div className="checkout-form-section">
                        <div className="checkout-card">
                            <h2 className="card-title"><User size={20} /> Thông tin người nhận</h2>
                            <div className="form-grid">
                                <div className="input-group">
                                    <label>Họ và tên *</label>
                                    <input type="text" name="fullname" required value={formData.fullname} onChange={handleChange} placeholder="Nhập họ tên người nhận" />
                                </div>
                                <div className="input-group">
                                    <label>Số điện thoại *</label>
                                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="Ví dụ: 0987xxxxxx" />
                                </div>
                                <div className="input-group full-width">
                                    <label>Địa chỉ giao hàng *</label>
                                    <textarea name="address" required value={formData.address} onChange={handleChange} placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." />
                                </div>
                            </div>
                        </div>

                        <div className="checkout-card">
                            <h2 className="card-title"><CreditCard size={20} /> Phương thức thanh toán</h2>
                            <div className="payment-options">
                                <label className={`payment-item ${formData.paymentMethod === 'COD' ? 'active' : ''}`}>
                                    <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleChange} />
                                    <div className="payment-info">
                                        <strong>Thanh toán khi nhận hàng (COD)</strong>
                                        <span>Bạn sẽ thanh toán bằng tiền mặt khi shipper giao hàng đến.</span>
                                    </div>
                                </label>
                    
                            </div>
                        </div>
                    </div>

                    <aside className="checkout-summary-section">
                        <div className="summary-sticky-card">
                            <h3>TÓM TẮT ĐƠN HÀNG</h3>
                            <div className="checkout-items-list">
                                {cartItems.map(item => {
                                    const isSale = item.is_flash_sale === 1 && item.discount_price > 0;
                                    const currentPrice = isSale ? item.discount_price : item.price;
                                    return (
                                        <div key={item.item_id} className="checkout-item-mini">
                                            <div className="mini-info">
                                                <span className="mini-qty">{item.quantity}×</span>
                                                <div className="mini-name-wrapper">
                                                    <span className="mini-name">{item.name}</span>
                                                    {isSale && <span className="mini-sale-tag"><Zap size={10} fill="currentColor"/> Flash Sale</span>}
                                                </div>
                                            </div>
                                            <span className="mini-price">{(currentPrice * item.quantity).toLocaleString()}đ</span>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="summary-calculations">
                                <div className="summary-row">
                                    <span>Tạm tính</span>
                                    <span>{subtotal.toLocaleString()}đ</span>
                                </div>

                                {discountPercent > 0 && (
                                    <div className="summary-row member-discount-row">
                                        <span className="discount-label">
                                            <Award size={16} /> Ưu đãi {rankName} (-{discountPercent}%)
                                        </span>
                                        <span className="discount-value">-{memberDiscountAmount.toLocaleString()}đ</span>
                                    </div>
                                )}

                                <div className="summary-row">
                                    <span>Phí giao hàng</span>
                                    <span className="free">Miễn phí</span>
                                </div>
                                
                                <div className="summary-row total-row">
                                    <span>TỔNG CỘNG</span>
                                    <span className="final-grand-total">{finalTotal.toLocaleString()}đ</span>
                                </div>
                            </div>

                            <button type="submit" className="btn-place-order">
                                XÁC NHẬN THANH TOÁN
                            </button>
                            
                            <p className="checkout-note">
                                Bằng cách đặt hàng, bạn đồng ý với các điều khoản dịch vụ của RedTech.
                            </p>
                        </div>
                    </aside>
                </form>
            </div>
        </div>
    );
};

export default Checkout;