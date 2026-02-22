import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Plus, Trash2, Edit3, X, FileSpreadsheet, FileText, Layers, Tag } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './CategoryManagement.css';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleDelete = async (id, name) => {
    if (window.confirm(`Xóa danh mục ${name}?`)) {
      try {
        await axios.delete(`http://localhost:5000/admin/categories/delete/${id}`);
        toast.success("Đã xóa");
        fetchCategories();
      } catch (err) {
        toast.error(err.response?.data?.message || "Lỗi khi xóa");
      }
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
            <p>Phân loại và quản lý liên kết thương hiệu.</p>
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
                          {cat.brandNames || <span className="text-muted">Chưa có liên kết</span>}
                        </p>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className="total-badge">{cat.productCount || 0} SP</span>
                    </td>
                    <td className="text-right">
                      <div className="action-btns" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button className="action-edit-btn" onClick={() => { setEditingCategory(cat); setCategoryName(cat.name); setIsModalOpen(true); }}><Edit3 size={17} /></button>
                        <button className="action-delete-btn" onClick={() => handleDelete(cat.id, cat.name)}><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
                    placeholder="Ví dụ: Thiết bị thông minh..." 
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
      </main>
    </div>
  );
};

export default CategoryManagement;