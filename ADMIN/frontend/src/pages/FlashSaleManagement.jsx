import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Zap, Plus, Trash2, Edit3, Clock, Calendar, 
  CheckCircle2, AlertCircle, X, Power
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './FlashSaleManagement.css';

const FlashSaleManagement = () => {
  const [sales, setSales] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch danh sách chiến dịch
  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/admin/flash-sales');
      setSales(res.data);
    } catch (err) {
      toast.error("Lỗi khi tải danh sách Flash Sale");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSales(); }, []);

 const handleSubmit = async (e) => {
  e.preventDefault();
  const endTime = new Date(e.target.end_time.value);
  const now = new Date();

  // Kiểm tra nếu thời gian kết thúc nhỏ hơn hiện tại
  if (endTime < now && e.target.status.checked) {
    toast.error("Thời gian kết thúc không thể ở trong quá khứ khi đang kích hoạt!");
    return;
  }

  const formData = {
    name: e.target.name.value,
    start_time: e.target.start_time.value,
    end_time: e.target.end_time.value,
    status: e.target.status.checked ? 1 : 0
  };

  const load = toast.loading("Đang xử lý...");
  try {
    if (editingSale) {
      await axios.put(`http://localhost:5000/admin/flash-sales/update/${editingSale.id}`, formData);
      toast.success("Cập nhật thành công", { id: load });
    } else {
      await axios.post('http://localhost:5000/admin/flash-sales/add', formData);
      toast.success("Tạo chiến dịch mới thành công", { id: load });
    }
    setIsModalOpen(false);
    fetchSales(); // Load lại danh sách để cập nhật trạng thái mới nhất
  } catch (err) {
    toast.error("Thao tác thất bại", { id: load });
  }
};

  const deleteSale = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chiến dịch này? Các sản phẩm liên quan sẽ ngừng Flash Sale.")) {
      try {
        await axios.delete(`http://localhost:5000/admin/flash-sales/delete/${id}`);
        toast.success("Đã xóa");
        fetchSales();
      } catch (err) {
        toast.error("Không thể xóa");
      }
    }
  };

  return (
    <div className="admin-layout" style={{ fontFamily: 'Cabin, sans-serif' }}>
      <Sidebar />
      <main className="admin-main">
        <header className="page-header">
          <div className="header-content">
            <h1>Quản lý Flash Sale</h1>
            <p>Thiết lập khung giờ vàng cho toàn hệ thống.</p>
          </div>
          <button className="btn-create-account" onClick={() => { setEditingSale(null); setIsModalOpen(true); }}>
            <Plus size={19} /> <span>Tạo đợt Sale mới</span>
          </button>
        </header>

        <div className="fs-management-grid">
          {sales.length === 0 && !isLoading && (
            <div className="empty-state">Chưa có chiến dịch Flash Sale nào.</div>
          )}

          {sales.map(sale => (
            <div key={sale.id} className={`fs-admin-card ${sale.status ? 'active' : 'inactive'}`}>
              <div className="fs-card-badge">
                {sale.status ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {sale.status ? "Đang chạy" : "Tạm dừng"}
              </div>
              <div className="fs-card-icon">
                <Zap size={30} fill={sale.status ? "#E10600" : "#ccc"} stroke={sale.status ? "#E10600" : "#ccc"} />
              </div>
              <h3>{sale.name}</h3>
              <div className="fs-time-details">
                <div className="time-row">
                  <Calendar size={14} /> <span>Bắt đầu: {new Date(sale.start_time).toLocaleString('vi-VN')}</span>
                </div>
                <div className="time-row">
                  <Clock size={14} /> <span>Kết thúc: {new Date(sale.end_time).toLocaleString('vi-VN')}</span>
                </div>
              </div>
              <div className="fs-card-footer">
                <button className="fs-edit-btn" onClick={() => { setEditingSale(sale); setIsModalOpen(true); }}>
                  <Edit3 size={16} /> Sửa
                </button>
                <button className="fs-delete-btn" onClick={() => deleteSale(sale.id)}>
                  <Trash2 size={16} /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Form */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container flash-sale-modal animate-slide-up">
              <div className="modal-header">
                <h3>{editingSale ? "Cập nhật chiến dịch" : "Thêm Flash Sale mới"}</h3>
                <button className="close-modal" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
              </div>
              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Tên chiến dịch</label>
                  <input name="name" type="text" defaultValue={editingSale?.name} placeholder="VD: Sale Hè Rực Rỡ" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Thời gian bắt đầu</label>
                    <input name="start_time" type="datetime-local" 
                      defaultValue={editingSale?.start_time ? new Date(editingSale.start_time).toISOString().slice(0, 16) : ""} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Thời gian kết thúc</label>
                    <input name="end_time" type="datetime-local" 
                      defaultValue={editingSale?.end_time ? new Date(editingSale.end_time).toISOString().slice(0, 16) : ""} 
                      required 
                    />
                  </div>
                </div>
                <div className="status-toggle-group">
                  <label className="switch-label">Kích hoạt ngay:</label>
                  <label className="switch">
                    <input name="status" type="checkbox" defaultChecked={editingSale ? editingSale.status === 1 : true} />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
                  <button type="submit" className="btn-submit">Lưu chiến dịch</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default FlashSaleManagement;