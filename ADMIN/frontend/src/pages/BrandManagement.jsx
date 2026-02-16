import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Plus, Trash2, Edit3, X, Smartphone, Laptop, Headphones, FileSpreadsheet, FileText } from 'lucide-react';
import * as XLSX from 'xlsx'; // Import thư viện Excel
import jsPDF from 'jspdf'; // Import thư viện PDF
import 'jspdf-autotable'; // Plugin hỗ trợ vẽ bảng cho PDF
import './BrandManagement.css';

const BrandManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandName, setBrandName] = useState("");
  
  const [brands, setBrands] = useState([
    { id: 1, name: "Apple", phone: 25, laptop: 12, accessory: 45 },
    { id: 2, name: "Samsung", phone: 30, laptop: 8, accessory: 50 },
    { id: 3, name: "Asus", phone: 0, laptop: 20, accessory: 15 },
  ]);

  // --- LOGIC XUẤT EXCEL ---
  const exportToExcel = () => {
    const dataToExport = brands.map(brand => ({
      "Tên thương hiệu": brand.name,
      "Điện thoại": brand.phone,
      "Laptop": brand.laptop,
      "Phụ kiện": brand.accessory,
      "Tổng sản phẩm": brand.phone + brand.laptop + brand.accessory
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách thương hiệu");
    XLSX.writeFile(workbook, "Danh_sach_thuong_hieu_RedTech.xlsx");
  };

  // --- LOGIC XUẤT PDF ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("DANH SÁCH THƯƠNG HIỆU - REDTECH", 14, 15);
    
    const tableColumn = ["STT", "Ten Thuong Hieu", "Dien thoai", "Laptop", "Phu kien", "Tong"];
    const tableRows = brands.map((brand, index) => [
      index + 1,
      brand.name,
      brand.phone,
      brand.laptop,
      brand.accessory,
      brand.phone + brand.laptop + brand.accessory
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { font: 'Helvetica' } // PDF mặc định chưa hỗ trợ tốt tiếng Việt có dấu, cần font Unicode nếu muốn hiển thị chuẩn
    });
    
    doc.save("Danh_sach_thuong_hieu_RedTech.pdf");
  };

  const handleAddClick = () => {
    setEditingBrand(null);
    setBrandName("");
    setIsModalOpen(true);
  };

  const handleEditClick = (brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBrand) {
      setBrands(brands.map(b => b.id === editingBrand.id ? { ...b, name: brandName } : b));
    } else {
      const newBrand = {
        id: Date.now(),
        name: brandName,
        phone: 0, laptop: 0, accessory: 0
      };
      setBrands([...brands, newBrand]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <header className="page-header-v2">
          <div className="header-content">
            <h1>Quản lý thương hiệu</h1>
            <div className="header-divider"></div>
            <p>Hệ thống quản trị và xuất dữ liệu thương hiệu.</p>
          </div>
          
          <div className="header-actions-group">
            <div className="export-tools">
              <button className="tool-btn excel" onClick={exportToExcel} title="Tải Excel">
                <FileSpreadsheet size={20} />
              </button>
              <button className="tool-btn pdf" onClick={exportToPDF} title="Tải PDF">
                <FileText size={20} />
              </button>
            </div>
            <button className="btn-create-account" onClick={handleAddClick}>
              <Plus size={19} />
              <span>Thêm thương hiệu</span>
            </button>
          </div>
        </header>

        <div className="table-card">
          <div className="table-filter-area">
            <div className="search-bar-v2">
              <Search size={18} />
              <input type="text" placeholder="Tìm tên thương hiệu..." />
            </div>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên thương hiệu</th>
                  <th className="text-center"><Smartphone size={16} /> Điện thoại</th>
                  <th className="text-center"><Laptop size={16} /> Laptop</th>
                  <th className="text-center"><Headphones size={16} /> Phụ kiện</th>
                  <th className="text-center">Tổng cộng</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id}>
                    <td className="brand-name-cell"><strong>{brand.name}</strong></td>
                    <td className="text-center">{brand.phone}</td>
                    <td className="text-center">{brand.laptop}</td>
                    <td className="text-center">{brand.accessory}</td>
                    <td className="text-center">
                      <span className="total-badge">{brand.phone + brand.laptop + brand.accessory}</span>
                    </td>
                    <td className="text-right">
                      <div className="action-btns">
                        <button className="action-edit-btn" onClick={() => handleEditClick(brand)}><Edit3 size={17} /></button>
                        <button className="action-delete-btn"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal remains the same */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container brand-modal">
              <div className="modal-header">
                <h3>{editingBrand ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu mới"}</h3>
                <button className="close-modal" onClick={() => setIsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Tên thương hiệu</label>
                  <input 
                    type="text" 
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Ví dụ: Apple, Sony..." 
                    required 
                    autoFocus 
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
                  <button type="submit" className="btn-submit">
                    {editingBrand ? "Cập nhật" : "Lưu"}
                  </button>
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