import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Search, Eye, CheckCircle, Clock, Truck, 
  XCircle, FileSpreadsheet, Printer, CreditCard, User, MapPin, Package 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './OrderManagement.css';

// 1. Đồng bộ mapping 5 trạng thái khớp 100% với MySQL enum
const STATUS_MAP = {
  pending: { label: "Chờ xử lý", class: "pending", icon: <Clock size={12}/> },
  processing: { label: "Đang chuẩn bị", class: "processing", icon: <Package size={12}/> },
  shipped: { label: "Đang giao", class: "shipping", icon: <Truck size={12}/> },
  delivered: { label: "Thành công", class: "success", icon: <CheckCircle size={12}/> },
  cancelled: { label: "Đã hủy", class: "cancelled", icon: <XCircle size={12}/> }
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

const API_URL = 'http://localhost:5000/admin/orders';

  const fetchOrders = async () => {
    try {
      const res = await axios.get(API_URL);
      setOrders(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách đơn hàng");
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // 2. CẬP NHẬT TRẠNG THÁI (Gửi key Tiếng Anh chuẩn xuống DB)
  const updateStatus = async (orderId, newStatusKey) => {
    const loading = toast.loading("Đang cập nhật...");
    try {
      // Gọi API đúng route /update-status/:id
      await axios.put(`${API_URL}/update-status/${orderId}`, { status: newStatusKey });
      
      toast.success("Trạng thái đã được cập nhật!", { id: loading });
      
      // Cập nhật State cục bộ
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatusKey } : o));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatusKey }));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi cập nhật", { id: loading });
    }
  };

  // 3. HIỂN THỊ BADGE (Xử lý thông minh cho cả dữ liệu cũ/mới)
  const getStatusBadge = (status) => {
    if (!status) return <span className="status-pill default">N/A</span>;
    
    const s = status.toLowerCase();
    
    // Map ngược từ Tiếng Việt (nếu có dữ liệu cũ) về Key Tiếng Anh
    let key = s;
    if (s === 'đang xử lý') key = 'pending';
    if (s === 'đang chuẩn bị') key = 'processing';
    if (s === 'đang giao' || s === 'đã giao cho vận chuyển') key = 'shipped';
    if (s === 'thành công' || s === 'đã giao hàng thành công') key = 'delivered';
    if (s === 'đã hủy') key = 'cancelled';

    const config = STATUS_MAP[key];

    if (config) {
      return (
        <span className={`status-pill ${config.class}`}>
          {config.icon} {config.label}
        </span>
      );
    }

    return <span className="status-pill default">{status}</span>;
  };

  const exportExcel = () => {
    const data = orders.map(o => {
      const s = o.status?.toLowerCase();
      let statusText = o.status;
      // Chuyển sang Tiếng Việt khi xuất file cho đẹp
      if (STATUS_MAP[s]) statusText = STATUS_MAP[s].label;

      return {
        "Mã Đơn": `#${o.id}`,
        "Khách hàng": o.fullname,
        "Tổng tiền": `${parseInt(o.total_price).toLocaleString('vi-VN')}đ`,
        "Thanh toán": o.payment_method,
        "Trạng thái": statusText,
        "Ngày đặt": new Date(o.created_at).toLocaleString('vi-VN')
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `RedTech_Orders_${new Date().toLocaleDateString()}.xlsx`);
  };

  const exportInvoice = (order) => {
    const doc = new jsPDF();
    doc.text(`HOA DON BAN HANG - REDTECH`, 20, 20);
    doc.text(`Ma don: #${order.id}`, 20, 30);
    doc.text(`Khach hang: ${order.fullname}`, 20, 40);

    const tableData = order.products.map(p => [
      p.product_name || "Sản phẩm", 
      p.quantity, 
      `${parseInt(p.price).toLocaleString('vi-VN')}đ`, 
      `${(parseInt(p.price) * p.quantity).toLocaleString('vi-VN')}đ`
    ]);

    doc.autoTable({
      startY: 50,
      head: [['San pham', 'SL', 'Don gia', 'Thanh tien']],
      body: tableData,
    });

    doc.text(`Tong cong: ${parseInt(order.total_price).toLocaleString('vi-VN')}đ`, 20, doc.lastAutoTable.finalY + 10);
    doc.save(`Invoice_RedTech_${order.id}.pdf`);
  };

  const filteredOrders = orders.filter(o => 
    o.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.id.toString().includes(searchTerm)
  );

  return (
    <div className="admin-layout" style={{ fontFamily: 'Cabin, sans-serif' }}>
      <Sidebar />
      <main className="admin-main">
        <header className="page-header-v2">
          <div className="header-content">
            <h1>Quản lý đơn hàng</h1>
            <p>Theo dõi và cập nhật tiến độ giao hàng cho khách.</p>
          </div>
          <button className="btn-export-excel" onClick={exportExcel}>
            <FileSpreadsheet size={19} /> <span>Xuất Excel</span>
          </button>
        </header>

        <div className="table-card">
          <div className="table-filter-area">
            <div className="search-bar-v2">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Tìm mã đơn hoặc khách hàng..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="order-row">
                    <td><span className="order-tag">#{order.id}</span></td>
                    <td><strong>{order.fullname}</strong></td>
                    <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                    <td><strong className="price-primary">{parseInt(order.total_price).toLocaleString('vi-VN')}đ</strong></td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td className="text-right">
                      <button className="btn-view-circle" onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}>
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Chi tiết đơn hàng */}
        {isModalOpen && selectedOrder && (
          <div className="modal-overlay">
            <div className="modal-container order-detail-modal">
              <div className="modal-header">
                <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
                <button className="btn-close-x" onClick={() => setIsModalOpen(false)}>
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-card customer-card">
                    <div className="card-label"><User size={14}/> Thông tin người nhận</div>
                    <p><strong>Họ tên:</strong> {selectedOrder.fullname}</p>
                    <p><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
                    <p className="address"><strong>Địa chỉ:</strong> <MapPin size={12} style={{display: 'inline', verticalAlign: 'middle'}}/> {selectedOrder.address}</p>
                    <p><strong>Thanh toán:</strong> <CreditCard size={12} style={{display: 'inline', verticalAlign: 'middle'}}/> {selectedOrder.payment_method} ({selectedOrder.payment_status})</p>
                  </div>
                  
                  <div className="detail-card status-card">
                    <div className="card-label">Cập nhật trạng thái</div>
                    <select 
                      className="status-dropdown"
                      value={selectedOrder.status} 
                      onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                    >
                      <option value="pending">⏳ Chờ xử lý (Pending)</option>
                      <option value="processing">📦 Đang chuẩn bị (Processing)</option>
                      <option value="shipped">🚚 Đang giao hàng (Shipped)</option>
                      <option value="delivered">✅ Thành công (Delivered)</option>
                      <option value="cancelled">❌ Đã hủy đơn (Cancelled)</option>
                    </select>
                  </div>
                </div>

                <div className="product-list-section">
                  <h4 style={{marginBottom: '15px'}}>Sản phẩm đã đặt</h4>
                  <div className="item-container">
                    {selectedOrder.products && selectedOrder.products.map((p, idx) => {
                      let displayImg = 'https://via.placeholder.com/60';
                      try {
                        const imgs = p.image ? JSON.parse(p.image) : [];
                        displayImg = Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : p.image;
                      } catch(e) { displayImg = p.image; }

                      return (
                        <div className="product-item-row" key={idx}>
                          <img src={displayImg || 'https://via.placeholder.com/60'} alt={p.product_name} />
                          <div className="p-info">
                            <h5>{p.product_name}</h5>
                            <small>Giá: {parseInt(p.price).toLocaleString('vi-VN')}đ</small>
                          </div>
                          <div className="p-qty">x{p.quantity}</div>
                          <div className="p-subtotal">{(parseInt(p.price) * p.quantity).toLocaleString('vi-VN')}đ</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="order-total-bar">
                    <span>Tổng cộng:</span>
                    <strong className="total-val">{parseInt(selectedOrder.total_price).toLocaleString('vi-VN')}đ</strong>
                  </div>
                </div>
              </div>

              <div className="modal-footer-btns">
                <button className="btn-print-invoice" onClick={() => exportInvoice(selectedOrder)}>
                  <Printer size={18}/> In hóa đơn PDF
                </button>
                <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>Đóng</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderManagement;