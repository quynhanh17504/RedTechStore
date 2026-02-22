import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Plus, Trash2, Edit3, X, Smartphone, Laptop, Headphones, FileSpreadsheet, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './BrandManagement.css';

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandName, setBrandName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // FETCH DATA
  const fetchBrands = async () => {
    try {
      const res = await axios.get('http://localhost:5000/admin/brands');
      setBrands(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách thương hiệu");
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  // SUBMIT (ADD/EDIT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const load = toast.loading("Đang xử lý...");
    try {
      if (editingBrand) {
        await axios.put(`http://localhost:5000/admin/brands/update/${editingBrand.id}`, { name: brandName });
        toast.success("Cập nhật thành công", { id: load });
      } else {
        await axios.post('http://localhost:5000/admin/brands/add', { name: brandName });
        toast.success("Thêm thương hiệu thành công", { id: load });
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (err) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra", { id: load });
    }
  };

  // DELETE
  const handleDelete = async (id, name) => {
    if (window.confirm(`Xác nhận xóa thương hiệu ${name}?`)) {
      try {
        await axios.delete(`http://localhost:5000/admin/brands/delete/${id}`);
        toast.success("Đã xóa thương hiệu");
        fetchBrands();
      } catch (err) {
        toast.error(err.response?.data?.message || "Lỗi khi xóa");
      }
    }
  };

  // EXPORT EXCEL
  const exportToExcel = () => {
    const data = brands.map(b => ({
      "Thương hiệu": b.name,
      "Điện thoại": b.phone,
      "Laptop": b.laptop,
      "Phụ kiện": b.accessory,
      "Tổng": b.phone + b.laptop + b.accessory
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Brands");
    XLSX.writeFile(wb, "RedTech_Brands.xlsx");
  };

  const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="admin-layout" style={{ fontFamily: 'Cabin, sans-serif' }}>
      <Sidebar />
      <main className="admin-main">
        <header className="page-header-v2">
          <div className="header-content">
            <h1>Quản lý thương hiệu</h1>
            <p>Thống kê và quản lý các đối tác sản xuất.</p>
          </div>
          
          <div className="header-actions-group">
            <div className="export-tools">
              <button className="tool-btn excel" onClick={exportToExcel}><FileSpreadsheet size={20} /></button>
            </div>
            <button className="btn-create-account" onClick={() => { setEditingBrand(null); setBrandName(""); setIsModalOpen(true); }}>
              <Plus size={19} /> <span>Thêm thương hiệu</span>
            </button>
          </div>
        </header>

        <div className="table-card">
          <div className="table-filter-area">
            <div className="search-bar-v2">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Tìm tên thương hiệu..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên thương hiệu</th>
                  <th className="text-center">Điện thoại</th>
                  <th className="text-center">Laptop</th>
                  <th className="text-center">Phụ kiện</th>
                  <th className="text-center">Tổng cộng</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrands.map((brand) => (
                  <tr key={brand.id}>
                    <td><strong>{brand.name}</strong></td>
                    <td className="text-center">{brand.phone || 0}</td>
                    <td className="text-center">{brand.laptop || 0}</td>
                    <td className="text-center">{brand.accessory || 0}</td>
                    <td className="text-center">
                      <span className="total-badge">{(brand.phone || 0) + (brand.laptop || 0) + (brand.accessory || 0)}</span>
                    </td>
                    <td className="text-right">
                      <div className="action-btns" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button className="action-edit-btn" onClick={() => { setEditingBrand(brand); setBrandName(brand.name); setIsModalOpen(true); }}><Edit3 size={17} /></button>
                        <button className="action-delete-btn" onClick={() => handleDelete(brand.id, brand.name)}><Trash2 size={17} /></button>
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
                <h3>{editingBrand ? "Cập nhật thương hiệu" : "Thêm thương hiệu"}</h3>
                <button className="close-modal" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              </div>
              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Tên thương hiệu</label>
                  <input type="text" value={brandName} onChange={(e) => setBrandName(e.target.value)} required autoFocus />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
                  <button type="submit" className="btn-submit">Xác nhận</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BrandManagement;