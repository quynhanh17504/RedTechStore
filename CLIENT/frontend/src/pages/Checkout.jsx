import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, CreditCard, User, CheckCircle, Home, Package, Zap } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './Checkout.css';

const Checkout = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;

    const [cartItems, setCartItems] = useState([]);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        fullname: user?.fullname || '',
        phone: '',
        address: '',
        paymentMethod: 'COD'
    });

    useEffect(() => {
        if (!userId) {
            navigate('/login');
            return;
        }
        const fetchCart = async () => {
            try {
                // Sử dụng API đã được JOIN với bảng products để có discount_price
                const res = await axios.get(`http://localhost:3005/client/cart/${userId}`);
                setCartItems(res.data);
                if (res.data.length === 0 && !isSuccess) navigate('/cart');
            } catch (err) {
                console.error(err);
            }
        };
        fetchCart();
    }, [userId, navigate, isSuccess]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // LOGIC TÍNH TỔNG MỚI: Ưu tiên giá Flash Sale
    const calculateSubtotal = () => {
        return cartItems.reduce((acc, item) => {
            const isSale = item.is_flash_sale === 1 && item.discount_price > 0;
            const finalPrice = isSale ? item.discount_price : item.price;
            return acc + (finalPrice * item.quantity);
        }, 0);
    };

    const subtotal = calculateSubtotal();

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        const loading = toast.loading("Đang xử lý đơn hàng...");

        try {
            // Chuẩn bị dữ liệu items với giá đã chốt (đã tính sale) để lưu vào chi tiết hóa đơn
            const finalizedItems = cartItems.map(item => {
                const isSale = item.is_flash_sale === 1 && item.discount_price > 0;
                return {
                    ...item,
                    finalPrice: isSale ? item.discount_price : item.price
                };
            });

            const orderData = {
                userId,
                ...formData,
                totalPrice: subtotal,
                items: finalizedItems 
            };

            await axios.post('http://localhost:3005/client/order/place', orderData);

            toast.success("Đặt hàng thành công!", { id: loading });
            setIsSuccess(true);
            window.dispatchEvent(new Event('cartUpdated'));
            
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi đặt hàng", { id: loading });
        }
    };

    if (isSuccess) {
        return (
            <div className="checkout-success-container" style={{ fontFamily: 'Cabin, sans-serif' }}>
                <div className="success-card">
                    <CheckCircle size={80} color="#22c55e" className="success-icon" />
                    <h2>Đặt hàng thành công!</h2>
                    <p>Cảm ơn bạn đã tin tưởng <strong>RedTech</strong>. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.</p>
                    <div className="success-actions">
                        <button onClick={() => navigate('/my-orders')} className="btn-success-view">
                            <Package size={20} /> Xem đơn hàng của tôi
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
            <div className="container">
                <div className="checkout-header">
                    <Link to="/cart" className="back-to-cart">
                        <ChevronLeft size={20} /> Quay lại giỏ hàng
                    </Link>
                    <h1>THANH TOÁN</h1>
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
                                        <span>Giao hàng tận nơi, nhận hàng rồi mới trả tiền.</span>
                                    </div>
                                </label>
                                <label className={`payment-item ${formData.paymentMethod === 'Transfer' ? 'active' : ''}`}>
                                    <input type="radio" name="paymentMethod" value="Transfer" checked={formData.paymentMethod === 'Transfer'} onChange={handleChange} />
                                    <div className="payment-info">
                                        <strong>Chuyển khoản ngân hàng</strong>
                                        <span>Quét mã QR qua App ngân hàng.</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <aside className="checkout-summary-section">
                        <div className="summary-sticky-card">
                            <h3>ĐƠN HÀNG CỦA BẠN</h3>
                            <div className="checkout-items-list">
                                {cartItems.map(item => {
                                    const isSale = item.is_flash_sale === 1 && item.discount_price > 0;
                                    const currentPrice = isSale ? item.discount_price : item.price;
                                    
                                    return (
                                        <div key={item.item_id} className="checkout-item-mini">
                                            <div className="mini-info">
                                                <span className="mini-qty">{item.quantity}x</span>
                                                <div className="mini-name-wrapper">
                                                    <span className="mini-name">{item.name}</span>
                                                    {isSale && <span className="mini-sale-tag"><Zap size={10} fill="currentColor"/> Sale</span>}
                                                </div>
                                            </div>
                                            <span className="mini-price">{(currentPrice * item.quantity).toLocaleString()}đ</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <hr />
                            <div className="summary-row"><span>Tạm tính</span><span>{subtotal.toLocaleString()}đ</span></div>
                            <div className="summary-row"><span>Phí vận chuyển</span><span className="free">Miễn phí</span></div>
                            <div className="summary-row total-row"><span>TỔNG CỘNG</span><span className="final-price">{subtotal.toLocaleString()}đ</span></div>
                            <button type="submit" className="btn-place-order">XÁC NHẬN ĐẶT HÀNG</button>
                        </div>
                    </aside>
                </form>
            </div>
        </div>
    );
};

export default Checkout;