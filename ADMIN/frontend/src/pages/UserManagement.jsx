import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, UserPlus, FileSpreadsheet, FileText, Trash2, Eye, EyeOff, X } from 'lucide-react';
import './UserManagement.css';

const UserManagement = () => {
  const [showPasswordId, setShowPasswordId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Trạng thái đóng mở Popup
  const [users, setUsers] = useState([
    { id: 1, name: "Nguyễn Văn A", email: "vana@gmail.com", pass: "redtech@123", gender: "Nam" },
    { id: 2, name: "Trần Thị B", email: "thib@yahoo.com", pass: "secret456", gender: "Nữ" },
    { id: 3, name: "Lê Văn C", email: "levanc@outlook.com", pass: "password789", gender: "Khác" },
  ]);

  const togglePassword = (id) => setShowPasswordId(showPasswordId === id ? null : id);

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <header className="page-header-v2">
          <div className="header-content">
            <h1>Quản lý tài khoản</h1>
            <div className="header-divider"></div>
            <p>Hệ thống lưu trữ và quản trị thông tin người dùng nội bộ.</p>
          </div>
          
          <div className="header-actions-group">
            <div className="export-tools">
              <button className="tool-btn excel" title="Xuất Excel"><FileSpreadsheet size={20} /></button>
              <button className="tool-btn pdf" title="Xuất PDF"><FileText size={20} /></button>
            </div>
            {/* Sự kiện Click mở Modal */}
            <button className="btn-create-account" onClick={() => setIsModalOpen(true)}>
              <UserPlus size={19} />
              <span>Tạo tài khoản mới</span>
            </button>
          </div>
        </header>

        <div className="table-card">
          <div className="table-filter-area">
            <div className="search-bar-v2">
              <Search size={18} />
              <input type="text" placeholder="Tìm kiếm người dùng..." />
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Họ và Tên</th>
                  <th>Email</th>
                  <th style={{ width: '200px' }}>Mật khẩu</th>
                  <th>Giới tính</th>
                  <th className="text-right">Tác vụ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="user-name-cell">{user.name}</td>
                    <td className="user-email-cell">{user.email}</td>
                    <td>
                      <div className="password-display-box">
                        <input 
                          type={showPasswordId === user.id ? "text" : "password"} 
                          value={user.pass} 
                          readOnly 
                        />
                        <button onClick={() => togglePassword(user.id)} className="eye-btn">
                          {showPasswordId === user.id ? <EyeOff size={15}/> : <Eye size={15}/>}
                        </button>
                      </div>
                    </td>
                    <td><span className="gender-label">{user.gender}</span></td>
                    <td className="text-right">
                      <button className="action-delete-btn" title="Xóa tài khoản">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- MODAL TẠO TÀI KHOẢN --- */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h3>Tạo tài khoản mới</h3>
                <button className="close-modal" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label>Họ và Tên</label>
                  <input type="text" placeholder="Nhập họ tên đầy đủ" required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="example@redtech.vn" required />
                </div>
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <input type="password" placeholder="••••••••" required />
                </div>
                <div className="form-group">
                  <label>Giới tính</label>
                  <select required>
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                  <button type="submit" className="btn-submit">Xác nhận tạo</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserManagement;