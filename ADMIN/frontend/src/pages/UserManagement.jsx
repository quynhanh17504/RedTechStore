import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, UserPlus, Trash2, X, ShieldCheck, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State mới cho Modal Xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    gender: 'Nam',
    role: 'client'
  });

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/admin/auth/users');
      setUsers(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách người dùng");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const load = toast.loading("Đang khởi tạo...");
    try {
      await axios.post('http://localhost:5000/admin/auth/users/create', formData);
      toast.success("Tạo tài khoản thành công!", { id: load });
      setIsModalOpen(false);
      setFormData({ fullname: '', email: '', password: '', gender: 'Nam', role: 'client' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi tạo", { id: load });
    }
  };

  // Mở modal xác nhận xóa
  const confirmDelete = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  // Xử lý xóa thực tế
  const handleDelete = async () => {
    if (!userToDelete) return;
    
    const load = toast.loading("Đang xóa...");
    try {
      await axios.delete(`http://localhost:5000/admin/auth/users/${userToDelete.id}`);
      toast.success(`Đã xóa tài khoản ${userToDelete.fullname}`, { id: load });
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi khi xóa", { id: load });
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-layout" style={{ fontFamily: 'Cabin, sans-serif' }}>
      <Sidebar />
      
      <main className="admin-main">
        <header className="page-header-v2">
          <div className="header-content">
            <h1>Quản lý người dùng</h1>
            <p>Hệ thống quản trị tài khoản nội bộ và khách hàng.</p>
          </div>
          
          <div className="header-actions">
             <button className="btn-create-account" onClick={() => setIsModalOpen(true)}>
               <UserPlus size={19} />
               <span>Tạo tài khoản</span>
             </button>
          </div>
        </header>

        <div className="table-card">
          <div className="table-filter-area">
            <div className="search-bar-v2">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm theo tên hoặc email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="quick-stats">
              <div className="stat-card admin">
                <span className="stat-label">Quản trị viên</span>
                <span className="stat-value">{users.filter(u => u.role === 'admin').length}</span>
              </div>
              <div className="stat-card client">
                <span className="stat-label">Khách hàng</span>
                <span className="stat-value">{users.filter(u => u.role === 'client').length}</span>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Họ và Tên</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Giới tính</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="user-name-cell">
                        <strong>{user.fullname}</strong>
                      </td>
                      <td className="user-email-cell">{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                        </span>
                      </td>
                      <td><span className="gender-label">{user.gender}</span></td>
                      <td className="text-right">
                        <button 
                          className="action-delete-btn"
                          onClick={() => confirmDelete(user)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center" style={{padding: '40px'}}>
                      Không tìm thấy dữ liệu người dùng phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL TẠO TÀI KHOẢN */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <div className="header-title" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                   <ShieldCheck size={24} color="#E10600" />
                   <h3>Tạo tài khoản mới</h3>
                </div>
                <button className="close-modal" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Họ và Tên</label>
                  <input type="text" required value={formData.fullname} onChange={(e) => setFormData({...formData, fullname: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Email đăng nhập</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Mật khẩu</label>
                    <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Quyền hạn</label>
                    <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                      <option value="client">Khách hàng</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Giới tính</label>
                  <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
                  <button type="submit" className="btn-submit">Xác nhận tạo</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL XÓA (MỚI & ĐẸP) --- */}
        {isDeleteModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container delete-confirm-modal animate-scale-up">
              <div className="delete-icon-wrapper">
                <AlertTriangle size={40} color="#E10600" />
              </div>
              <h3>Xác nhận xóa?</h3>
              <p>
                Bạn có chắc chắn muốn xóa tài khoản của khách hàng
                <strong> {userToDelete?.fullname}</strong>?
              </p>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Hủy bỏ</button>
                <button className="btn-confirm-delete" onClick={handleDelete}>Xác nhận xóa</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserManagement;