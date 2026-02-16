import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Search, Plus, Trash2, Edit3, X, Upload, FileSpreadsheet, FileText, Package, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './ProductManagement.css';

const ProductManagement = () => {
  const mockData = [
    { id: 1, name: "iPhone 17 Pro Max", price: 29990000, category: "phone", brand: "Apple", stock: 15, image_url: "/images/products/iphone17promax.jpg" },
    { id: 2, name: "Samsung S25 Ultra", price: 26990000, category: "phone", brand: "Samsung", stock: 8, image_url: "/images/products/samsungs25.jpg" },
    { id: 3, name: "Google Pixel 9 Pro", price: 22500000, category: "phone", brand: "Google", stock: 12, image_url: "/images/products/pixel9.jpg" },
    { id: 4, name: "Xiaomi 15 Ultra", price: 19990000, category: "phone", brand: "Xiaomi", stock: 20, image_url: "/images/products/xiaomi15.jpg" },
    { id: 5, name: "MacBook Pro M3", price: 39990000, category: "laptop", brand: "Apple", stock: 5, image_url: "/images/products/macbook.jpg" },
    { id: 6, name: "Dell XPS 13 2026", price: 35000000, category: "laptop", brand: "Dell", stock: 3, image_url: "/images/products/dellxps.jpg" },
    { id: 7, name: "Asus ROG Zephyrus", price: 45000000, category: "laptop", brand: "Asus", stock: 7, image_url: "/images/products/rog.jpg" },
    { id: 8, name: "HP Spectre x360", price: 32000000, category: "laptop", brand: "HP", stock: 10, image_url: "/images/products/hpspectre.jpg" },
    { id: 9, name: "Tai nghe Sony XM5", price: 6990000, category: "accessory", brand: "Sony", stock: 30, image_url: "/images/products/sony-xm5.jpg" },
    { id: 10, name: "AirPods Pro Gen 3", price: 5500000, category: "accessory", brand: "Apple", stock: 45, image_url: "/images/products/airpods.jpg" },
    { id: 11, name: "Sạc MagSafe 45W", price: 1200000, category: "accessory", brand: "Apple", stock: 100, image_url: "/images/products/magsafe.jpg" },
    { id: 12, name: "Cáp sạc siêu bền", price: 450000, category: "accessory", brand: "Other", stock: 150, image_url: "/images/products/cable.jpg" },
  ];

  const [products, setProducts] = useState(mockData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  
  // Form states
  const [priceValue, setPriceValue] = useState("");
  const [stockValue, setStockValue] = useState("");
  
  // Filter states
  const [filterCate, setFilterCate] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortStock, setSortStock] = useState("default");

  const formatVND = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "đ";

  // Logic lọc và sắp xếp
  const filteredProducts = products.filter(p => {
    const matchesCate = filterCate === "all" || p.category === filterCate;
    const matchesBrand = filterBrand === "all" || p.brand === filterBrand;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCate && matchesBrand && matchesSearch;
  }).sort((a, b) => {
    if (sortStock === "low-to-high") return a.stock - b.stock;
    if (sortStock === "high-to-low") return b.stock - a.stock;
    return 0;
  });

  // Mở modal thêm/sửa
  const openModal = (product = null) => {
    setEditingProduct(product);
    setPriceValue(product ? product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "");
    setStockValue(product ? product.stock.toString() : "");
    setIsModalOpen(true);
  };

  // Logic xóa sản phẩm
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    setProducts(products.filter(p => p.id !== productToDelete.id));
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <header className="page-header-v2">
          <div className="header-content">
            <h1>Kho sản phẩm</h1>
            <p>Đang quản lý {filteredProducts.length} sản phẩm.</p>
          </div>
          <div className="header-actions-group">
            <button className="btn-create-account" onClick={() => openModal()}>
              <Plus size={19} /> <span>Tạo sản phẩm mới</span>
            </button>
          </div>
        </header>

        {/* Filter Bar */}
        <section className="filter-bar">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Tìm tên sản phẩm..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="filter-group">
            <select onChange={(e) => setFilterCate(e.target.value)}>
              <option value="all">Tất cả danh mục</option>
              <option value="phone">Điện thoại</option>
              <option value="laptop">Laptop</option>
              <option value="accessory">Phụ kiện</option>
            </select>
            <select onChange={(e) => setSortStock(e.target.value)}>
              <option value="default">Sắp xếp tồn kho</option>
              <option value="low-to-high">Thấp đến Cao</option>
              <option value="high-to-low">Cao đến Thấp</option>
            </select>
          </div>
        </section>

        {/* Grid Card */}
        <div className="product-grid">
          {filteredProducts.map(product => (
            <div className="product-card" key={product.id}>
              <div className="product-img">
                <img src={product.image_url} alt={product.name} />
                <span className={`cate-badge ${product.category}`}>{product.category}</span>
                <div className={`stock-tag ${product.stock < 10 ? 'low-stock' : ''}`}>
                  <Package size={14} /> {product.stock}
                </div>
              </div>
              <div className="product-info">
                <span className="brand-name">{product.brand}</span>
                <h4>{product.name}</h4>
                <div className="price-area">
                  <span className="current-price">{formatVND(product.price)}</span>
                </div>
              </div>
              <div className="card-actions">
                <button className="edit-btn" onClick={() => openModal(product)}><Edit3 size={17}/> Sửa</button>
                <button className="delete-btn" onClick={() => confirmDelete(product)}><Trash2 size={17}/> Xóa</button>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL THÊM / SỬA CHUYÊN NGHIỆP */}
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container product-modal">
              <div className="modal-header">
                <h3>{editingProduct ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}</h3>
                <button className="close-modal" onClick={() => setIsModalOpen(false)}><X size={20}/></button>
              </div>
              
              <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
                {/* 1. Upload ảnh (Tối đa 4) */}
                <div className="upload-section">
                  <label>Hình ảnh sản phẩm (Tối đa 4)</label>
                  <div className="upload-grid">
                    <button type="button" className="upload-placeholder">
                      <Upload size={20} />
                      <span>Tải ảnh</span>
                    </button>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="upload-placeholder empty"></div>
                    ))}
                  </div>
                </div>

                {/* 2. Tên sản phẩm */}
                <div className="form-group">
                  <label>Tên sản phẩm</label>
                  <input type="text" placeholder="Ví dụ: iPhone 17 Pro Max..." defaultValue={editingProduct?.name} required />
                </div>

                {/* 3. Danh mục & Thương hiệu */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Danh mục</label>
                    <select defaultValue={editingProduct?.category || "phone"}>
                      <option value="phone">Điện thoại</option>
                      <option value="laptop">Laptop</option>
                      <option value="accessory">Phụ kiện</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Thương hiệu</label>
                    <select defaultValue={editingProduct?.brand || "Apple"}>
                      <option>Apple</option>
                      <option>Samsung</option>
                      <option>Sony</option>
                      <option>Xiaomi</option>
                      <option>Dell</option>
                      <option>Asus</option>
                    </select>
                  </div>
                </div>

                {/* 4. Giá & Tồn kho */}
                <div className="form-row">
                  {editingProduct && (
                    <div className="form-group">
                      <label>Giá hiện tại</label>
                      <input type="text" value={formatVND(editingProduct.price)} disabled className="disabled-input" />
                    </div>
                  )}
                  <div className="form-group">
                    <label>{editingProduct ? "Giá mới (VND)" : "Giá bán (VND)"}</label>
                    <div className="price-input-wrapper">
                      <input 
                        type="text" 
                        value={priceValue} 
                        onChange={(e) => setPriceValue(e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))}
                        placeholder="0"
                      />
                      <span className="currency-suffix">VND</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Số lượng tồn kho</label>
                  <div className="price-input-wrapper">
                    <input type="number" value={stockValue} onChange={(e) => setStockValue(e.target.value)} placeholder="Nhập số lượng..." required />
                    <span className="currency-suffix">Cái</span>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                  <button type="submit" className="btn-submit">Hoàn tất lưu</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL XÁC NHẬN XÓA (Confirm Delete) */}
        {isDeleteModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container delete-confirm-modal">
              <div className="confirm-icon"><AlertTriangle size={40} color="#E10600" /></div>
              <h3>Xác nhận xóa?</h3>
              <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>{productToDelete?.name}</strong>? Hành động này không thể hoàn tác.</p>
              <div className="confirm-actions">
                <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Quay lại</button>
                <button className="btn-confirm-delete" onClick={handleDelete}>Đúng, Xóa nó</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductManagement;