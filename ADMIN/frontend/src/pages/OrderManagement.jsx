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
import autoTable from 'jspdf-autotable'; 
import './OrderManagement.css';

// 1. Hàm bổ trợ chuyển đổi Tiếng Việt không dấu để tránh lỗi font PDF
const removeAccents = (str) => {
  if (!str) return "";
  return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D');
};

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

  const updateStatus = async (orderId, newStatusKey) => {
    const loading = toast.loading("Đang cập nhật...");
    try {
      await axios.put(`${API_URL}/update-status/${orderId}`, { status: newStatusKey });
      toast.success("Trạng thái đã được cập nhật!", { id: loading });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatusKey } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatusKey }));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi cập nhật", { id: loading });
    }
  };

  const getStatusBadge = (status) => {
    if (!status) return <span className="status-pill default">N/A</span>;
    const s = status.toLowerCase();
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

  // --- HÀM IN HÓA ĐƠN NÂNG CẤP ---
  const exportInvoice = (order) => {
    const doc = new jsPDF();
    const redColor = [239, 68, 68];

    // Header: Logo & Tên Brand
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(redColor[0], redColor[1], redColor[2]);
    doc.text("REDTECH", 105, 20, { align: 'center' });
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("CONG NGHE DAN DAU - RT ADMIN PANEL", 105, 27, { align: 'center' });
    doc.line(20, 32, 190, 32); 

    // Tiêu đề hóa đơn
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text("HOA DON BAN HANG", 20, 45);
    
    doc.setFontSize(10);
    doc.text(`Ma don hang: #${order.id}`, 20, 53);
    doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 20, 59);

    // Box Thông tin khách hàng
    doc.setFillColor(248, 250, 252);
    doc.rect(120, 40, 70, 28, 'F');
    doc.setFont("Helvetica", "bold");
    doc.text("NGUOI NHAN:", 125, 47);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.text(removeAccents(order.fullname).toUpperCase(), 125, 53);
    doc.text(`SDT: ${order.phone}`, 125, 59);
    doc.text(`PTTT: ${removeAccents(order.payment_method)}`, 125, 65);

    // Bảng sản phẩm
    const tableData = order.products.map(p => [
      removeAccents(p.product_name), 
      p.quantity, 
      `${parseInt(p.price).toLocaleString('vi-VN')}d`, 
      `${(parseInt(p.price) * p.quantity).toLocaleString('vi-VN')}d`
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['San pham', 'SL', 'Don gia', 'Thanh tien']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: redColor, halign: 'center' },
      styles: { font: "Helvetica", fontSize: 9 },
      columnStyles: { 0: { cellWidth: 85 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
    });

    // Tổng tiền & Footer
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");
    doc.text("TONG CONG:", 120, finalY + 15);
    doc.setTextColor(redColor[0], redColor[1], redColor[2]);
    doc.text(`${parseInt(order.total_price).toLocaleString('vi-VN')}d`, 190, finalY + 15, { align: 'right' });

    doc.setFont("Helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("Cam on quy khach da tin tuong RedTech!", 105, finalY + 30, { align: 'center' });

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

        {isModalOpen && selectedOrder && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-container order-detail-modal" onClick={e => e.stopPropagation()}>
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
                    <p className="address"><strong>Địa chỉ:</strong> <MapPin size={12}/> {selectedOrder.address}</p>
                    <p><strong>Thanh toán:</strong> <CreditCard size={12}/> {selectedOrder.payment_method}</p>
                  </div>
                  
                  <div className="detail-card status-card">
                    <div className="card-label">Cập nhật trạng thái</div>
                    <select 
                      className="status-dropdown"
                      value={selectedOrder.status} 
                      onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                    >
                      <option value="pending">⏳ Chờ xử lý</option>
                      <option value="processing">📦 Đang chuẩn bị</option>
                      <option value="shipped">🚚 Đang giao hàng</option>
                      <option value="delivered">✅ Thành công</option>
                      <option value="cancelled">❌ Đã hủy đơn</option>
                    </select>
                  </div>
                </div>

                <div className="product-list-section">
                  <h4 style={{marginBottom: '15px'}}>Sản phẩm đã đặt</h4>
                  <div className="item-container">
                    {selectedOrder.products?.map((p, idx) => {
                      let displayImg = 'https://via.placeholder.com/60';
                      try {
                        const imgs = p.image ? JSON.parse(p.image) : [];
                        displayImg = Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : p.image;
                      } catch(e) { displayImg = p.image; }

                      return (
                        <div className="product-item-row" key={idx}>
                          <img src={displayImg} alt={p.product_name} />
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