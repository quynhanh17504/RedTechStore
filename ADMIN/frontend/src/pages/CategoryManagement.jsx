import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Plus, Trash2, Edit3, X, Layers, Tag, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './CategoryManagement.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // State mới cho Modal xác nhận xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/admin/categories');
      setCategories(res.data);
    } catch (err) {
      toast.error("Không thể tải danh mục");
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loading = toast.loading("Đang xử lý...");
    try {
      if (editingCategory) {
        await axios.put(`http://localhost:5000/admin/categories/update/${editingCategory.id}`, { name: categoryName });
        toast.success("Đã cập nhật!", { id: loading });
      } else {
        await axios.post('http://localhost:5000/admin/categories/add', { name: categoryName });
        toast.success("Đã thêm mới!", { id: loading });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error("Lỗi thao tác", { id: loading });
    }
  };

  // Mở modal xác nhận thay vì confirm mặc định
  const confirmDelete = (cat) => {
    setCategoryToDelete(cat);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    
    const loading = toast.loading("Đang xóa...");
    try {
      await axios.delete(`http://localhost:5000/admin/categories/delete/${categoryToDelete.id}`);
      toast.success("Đã xóa danh mục thành công", { id: loading });
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể xóa do ràng buộc dữ liệu", { id: loading });
      setIsDeleteModalOpen(false);
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-layout" style={{ fontFamily: 'Cabin, sans-serif' }}>
      <Sidebar />
      <main className="admin-main">
        <header className="page-header-v2">
          <div className="header-content">
            <h1>Quản lý danh mục</h1>
            <p>Phân loại và quản lý liên kết thương hiệu cho hệ thống RedTech.</p>
          </div>
          <button className="btn-create-account" onClick={() => { setEditingCategory(null); setCategoryName(""); setIsModalOpen(true); }}>
            <Plus size={19} /> <span>Thêm danh mục</span>
          </button>
        </header>

        <div className="table-card">
          <div className="table-filter-area">
            <div className="search-bar-v2">
              <Search size={18} />
              <input type="text" placeholder="Tìm tên danh mục..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên danh mục</th>
                  <th>Thương hiệu liên kết</th>
                  <th className="text-center">Số lượng SP</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="user-name-cell"><strong>{cat.name}</strong></td>
                    <td>
                      <div className="brand-tags-container">
                        <span className="brand-count-badge">
                          <Tag size={12} /> {cat.brandCount || 0} thương hiệu
                        </span>
                        <p className="brand-names-list">
                          {cat.brandNames || <span className="text-muted italic">Chưa có liên kết</span>}
                        </p>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="total-badge">{cat.productCount || 0} SP</span>
                    </td>
                    <td className="text-right">
                      <div className="action-btns" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button className="action-edit-btn" onClick={() => { setEditingCategory(cat); setCategoryName(cat.name); setIsModalOpen(true); }}><Edit3 size={17} /></button>
                        <button className="action-delete-btn" onClick={() => confirmDelete(cat)}><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL THÊM / SỬA */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers size={22} color="#E10600" />
                  <h3>{editingCategory ? "Cập nhật danh mục" : "Thêm mới danh mục"}</h3>
                </div>
                <button className="close-modal" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              </div>
              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Tên danh mục</label>
                  <input 
                    type="text" 
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Ví dụ: Laptop Gaming..." 
                    required 
                    autoFocus
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
                  <button type="submit" className="btn-submit">{editingCategory ? "Lưu thay đổi" : "Xác nhận thêm"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* --- MODAL XÁC NHẬN XÓA (PHONG CÁCH REDTECH MỚI) --- */}
        {isDeleteModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container delete-confirm-modal animate-scale-up">
              <div className="delete-icon-wrapper">
                <AlertTriangle size={40} color="#E10600" />
              </div>
              
              <h3 style={{ marginBottom: '10px', fontWeight: '700' }}>Xác nhận xóa danh mục?</h3>
              
              <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '25px' }}>
                Bạn có chắc chắn muốn xóa danh mục 
                <strong> {categoryToDelete?.name}</strong>? 
                Hành động này sẽ xóa vĩnh viễn và có thể ảnh hưởng đến các sản phẩm thuộc danh mục này.
              </p>

              <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px' }}>
                <button 
                  className="btn-cancel" 
                  onClick={() => setIsDeleteModalOpen(false)}
                  style={{ minWidth: '120px' }}
                >
                  Hủy bỏ
                </button>
                <button 
                  className="btn-confirm-delete" 
                  onClick={handleDelete}
                  style={{ minWidth: '120px', backgroundColor: '#E10600' }}
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryManagement;