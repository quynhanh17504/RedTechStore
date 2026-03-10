import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Search, Eye, Trash2, CheckCircle, Clock, Truck, 
  XCircle, FileSpreadsheet, Printer, Filter, CreditCard, User, MapPin 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './OrderManagement.css';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null); // Lưu đơn hàng đang xem chi tiết
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

  // 1. Cập nhật trạng thái đơn hàng
  const updateStatus = async (orderId, newStatus) => {
    const loading = toast.loading("Đang cập nhật...");
    try {
      await axios.put(`${API_URL}/update-status/${orderId}`, { status: newStatus });
      toast.success("Trạng thái đã được cập nhật!", { id: loading });
      fetchOrders();
      if(selectedOrder) setIsModalOpen(false);
    } catch (err) {
      toast.error("Lỗi cập nhật", { id: loading });
    }
  };

  // 2. Xuất Excel tất cả đơn hàng
  const exportExcel = () => {
    const data = orders.map(o => ({
      "Mã Đơn": `#${o.id}`,
      "Khách hàng": o.fullname,
      "Email": o.email,
      "Tổng tiền": `${o.total_price.toLocaleString()}đ`,
      "Thanh toán": o.payment_method,
      "Trạng thái": o.status,
      "Ngày đặt": new Date(o.created_at).toLocaleString('vi-VN')
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "Danh_sach_don_hang_RedTech.xlsx");
  };

  // 3. Xuất hóa đơn PDF cho đơn hàng lẻ
  const exportInvoice = (order) => {
    const doc = new jsPDF();
    doc.addFont('https://fonts.gstatic.com/s/cabin/v18/rP2ip2xl1290gkUdV97O.ttf', 'Cabin', 'normal');
    doc.setFont('Cabin');
    
    doc.text(`HOA DON BAN HANG - REDTECH`, 20, 20);
    doc.text(`Ma don: #${order.id}`, 20, 30);
    doc.text(`Khach hang: ${order.fullname}`, 20, 40);
    doc.text(`Ngay: ${new Date(order.created_at).toLocaleDateString()}`, 20, 50);

    const tableData = order.products.map(p => [p.product_name, p.quantity, `${p.price.toLocaleString()}đ`]);
    doc.autoTable({
      startY: 60,
      head: [['San pham', 'SL', 'Don gia']],
      body: tableData,
    });

    doc.text(`Tong thanh toan: ${order.total_price.toLocaleString()}đ`, 20, doc.lastAutoTable.finalY + 10);
    doc.save(`Hoa_don_${order.id}.pdf`);
  };

  const filteredOrders = orders.filter(o => 
    o.fullname.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.id.toString().includes(searchTerm)
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Chờ xử lý': return <span className="badge-warn"><Clock size={12}/> Chờ xử lý</span>;
      case 'Đang giao': return <span className="badge-info"><Truck size={12}/> Đang giao</span>;
      case 'Đã giao': return <span className="badge-success"><CheckCircle size={12}/> Đã giao</span>;
      case 'Đã hủy': return <span className="badge-danger"><XCircle size={12}/> Đã hủy</span>;
      default: return <span>{status}</span>;
    }
  };

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
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>#{order.id}</strong></td>
                    <td>
                      <div className="user-info">
                        <strong>{order.fullname}</strong>
                        <span>{order.email}</span>
                      </div>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                    <td><strong className="price-text">{order.total_price.toLocaleString()}đ</strong></td>
                    <td>{order.payment_method}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td className="text-right">
                      <button className="action-view-btn" onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}>
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal chi tiết đơn hàng */}
        {isModalOpen && selectedOrder && (
          <div className="modal-overlay">
            <div className="modal-container order-modal">
              <div className="modal-header">
                <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
                <button className="close-modal" onClick={() => setIsModalOpen(false)}><XCircle size={20} /></button>
              </div>
              
              <div className="modal-body">
                <div className="order-grid">
                  <div className="info-section">
                    <h4><User size={16}/> Thông tin người nhận</h4>
                    <p><strong>Họ tên:</strong> {selectedOrder.fullname}</p>
                    <p><strong>Số điện thoại:</strong> {selectedOrder.phone}</p>
                    <p><strong>Địa chỉ:</strong> {selectedOrder.address}</p>
                    <p><strong>Thanh toán:</strong> <CreditCard size={14}/> {selectedOrder.payment_method}</p>
                  </div>
                  
                  <div className="status-section">
                    <h4>Trạng thái đơn hàng</h4>
                    <select 
                      value={selectedOrder.status} 
                      onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                    >
                      <option value="Chờ xử lý">Chờ xử lý</option>
                      <option value="Đang giao">Đang giao</option>
                      <option value="Đã giao">Đã giao</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  </div>
                </div>

                <div className="order-products-list">
                  <h4>Sản phẩm đã đặt</h4>
                  <table>
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Giá</th>
                        <th>SL</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.products.map((p, index) => (
                        <tr key={index}>
                          <td>{p.product_name}</td>
                          <td>{p.price.toLocaleString()}đ</td>
                          <td>{p.quantity}</td>
                          <td>{(p.price * p.quantity).toLocaleString()}đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="order-total">
                    <span>Tổng cộng:</span>
                    <strong>{selectedOrder.total_price.toLocaleString()}đ</strong>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-print" onClick={() => exportInvoice(selectedOrder)}>
                  <Printer size={18}/> In hóa đơn PDF
                </button>
                <button className="btn-close" onClick={() => setIsModalOpen(false)}>Đóng</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderManagement;