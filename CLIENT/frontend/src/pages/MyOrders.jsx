import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    ShoppingBag, Package, Calendar, ChevronRight, X, 
    CreditCard, MapPin, Tag, Trash2, Clock 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import './MyOrders.css'; 

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    const userStorage = JSON.parse(localStorage.getItem('user'));
    const userId = userStorage?.id;

    const fetchMyOrders = async () => {
        if (!userId) return;
        try {
            const res = await axios.get(`http://localhost:3005/client/order/my-orders/${userId}`);
            const sortedOrders = res.data.sort((a, b) => b.id - a.id);
            setOrders(sortedOrders);
        } catch (err) {
            console.error("Lỗi tải đơn hàng:", err);
            toast.error("Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    // Hàm lấy chi tiết một đơn hàng cụ thể từ API mới của bạn
    const handleViewDetail = async (orderId) => {
        setModalLoading(true);
        try {
            const res = await axios.get(`http://localhost:3005/client/order/detail/${orderId}`);
            setSelectedOrder(res.data);
        } catch (err) {
            console.error("Lỗi lấy chi tiết đơn hàng:", err);
            toast.error("Không thể lấy thông tin chi tiết đơn hàng");
        } finally {
            setModalLoading(false);
        }
    };

    useEffect(() => {
        fetchMyOrders();
    }, [userId]);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
        try {
            await axios.patch(`http://localhost:3005/client/order/cancel/${orderId}`);
            toast.success("Đã hủy đơn hàng thành công");
            setSelectedOrder(null);
            fetchMyOrders();
        } catch (err) {
            toast.error(err.response?.data?.message || "Không thể hủy đơn hàng");
        }
    };

    const renderStatusBadge = (status) => {
        const statusMap = {
            'pending': { label: 'Đang xử lý', class: 'status-pending', icon: <Clock size={12}/> },
            'shipping': { label: 'Đang giao', class: 'status-shipping', icon: <Package size={12}/> },
            'delivered': { label: 'Thành công', class: 'status-success', icon: <ChevronRight size={12}/> },
            'cancelled': { label: 'Đã hủy', class: 'status-cancelled', icon: <X size={12}/> }
        };
        const config = statusMap[status?.toLowerCase()] || { label: status, class: 'status-default', icon: null };
        return (
            <span className={`order-status-pill ${config.class}`}>
                {config.icon} {config.label}
            </span>
        );
    };

    if (loading) return (
        <div className="orders-loading">
            <div className="spinner"></div>
            <p style={{ fontFamily: 'Cabin, sans-serif' }}>Đang tải lịch sử đơn hàng...</p>
        </div>
    );

    return (
        <div className="my-orders-wrapper" style={{ fontFamily: 'Cabin, sans-serif' }}>
            <div className="content-header-minimal">
                <h2>Lịch sử <span>mua hàng</span></h2>
                <div className="order-count">{orders.length} đơn hàng</div>
            </div>

            {orders.length === 0 ? (
                <div className="empty-orders-container">
                    <div className="empty-icon-circle"><ShoppingBag size={40} /></div>
                    <h3>Chưa có đơn hàng nào</h3>
                    <button className="btn-explore" onClick={() => window.location.href='/products'}>
                        Khám phá sản phẩm ngay
                    </button>
                </div>
            ) : (
                <div className="orders-grid">
                    {orders.map((order) => (
                        <div className="order-card-modern" key={order.id} onClick={() => handleViewDetail(order.id)}>
                            <div className="card-top">
                                <div className="id-group">
                                    <span className="id-label">Mã đơn hàng</span>
                                    <span className="id-value">#ORD-{order.id}</span>
                                </div>
                                {renderStatusBadge(order.status)}
                            </div>
                            <div className="card-middle">
                                <div className="date-info">
                                    <Calendar size={14} />
                                    <span>{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="product-stack">
                                    <Package size={14} />
                                    <span>{order.products?.length || 0} sản phẩm</span>
                                </div>
                            </div>
                            <div className="card-bottom">
                                <div className="price-group">
                                    <span className="total-label">Tổng cộng</span>
                                    <span className="total-value">{Number(order.total_price).toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="quick-actions">
                                    <button className="btn-icon-view"><ChevronRight size={20} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- MODAL CHI TIẾT --- */}
            {selectedOrder && (
                <div className="order-modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="order-modal-card" onClick={e => e.stopPropagation()}>
                        {modalLoading ? (
                            <div className="modal-loader">Đang tải chi tiết...</div>
                        ) : (
                            <>
                                <div className="modal-top">
                                    <div className="modal-title">
                                        <h3>Chi tiết đơn hàng</h3>
                                        <span className="modal-id">#ORD-{selectedOrder.id}</span>
                                    </div>
                                    <button className="close-x" onClick={() => setSelectedOrder(null)}><X /></button>
                                </div>

                                <div className="modal-main">
                                    <div className="delivery-grid">
                                        <div className="info-card">
                                            <div className="info-head"><MapPin size={16} /> Địa chỉ nhận hàng</div>
                                            <div className="info-content">
                                                <p className="name"><b>{selectedOrder.fullname}</b></p>
                                                <p className="phone">{selectedOrder.phone}</p>
                                                <p className="address">{selectedOrder.address}</p>
                                            </div>
                                        </div>
                                        <div className="info-card">
                                            <div className="info-head"><CreditCard size={16} /> Thanh toán</div>
                                            <div className="info-content">
                                                <p className="method">Phương thức: <b>{selectedOrder.payment_method?.toUpperCase()}</b></p>
                                                <div className="status-wrap">{renderStatusBadge(selectedOrder.status)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="product-list-container">
                                        <div className="info-head"><Tag size={16} /> Sản phẩm đã mua</div>
                                        <div className="product-scroll-area">
                                            {selectedOrder.products?.map((item, index) => (
                                                <div className="product-row-item" key={index}>
                                                    <img 
                                                        src={`http://localhost:3005/${item.image}`} 
                                                        alt={item.name} 
                                                        className="p-img" 
                                                        onError={(e) => e.target.src = '/placeholder-product.png'}
                                                    />
                                                    <div className="p-details">
                                                        <p className="p-name">{item.name}</p>
                                                        <p className="p-qty">SL: {item.quantity} x {Number(item.price).toLocaleString('vi-VN')}đ</p>
                                                    </div>
                                                    <div className="p-total">
                                                        {(item.quantity * item.price).toLocaleString('vi-VN')}đ
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bill-summary">
                                        <div className="bill-row">
                                            <span>Tạm tính</span>
                                            <span>{Number(selectedOrder.total_price).toLocaleString('vi-VN')}đ</span>
                                        </div>
                                        <div className="bill-row total">
                                            <span>Tổng thanh toán</span>
                                            <span className="grand-total">{Number(selectedOrder.total_price).toLocaleString('vi-VN')}đ</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedOrder.status === 'pending' && (
                                    <div className="modal-actions-bar">
                                        <button className="btn-abort" onClick={() => handleCancelOrder(selectedOrder.id)}>
                                            <Trash2 size={18} /> Hủy đơn hàng này
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOrders;