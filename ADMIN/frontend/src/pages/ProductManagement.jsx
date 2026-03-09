import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import {
  Search, Plus, Trash2, Edit3, X, Upload, Package, AlertTriangle,
  Layers, Tag, Cpu, Monitor, Battery, HardDrive, RotateCcw, Smartphone, Tablet, Camera
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ProductManagement.css';

// Map icon để render chuẩn dựa trên string lưu trong attributes_json của danh mục
const ICON_MAP = {
  monitor: <Monitor size={14} />,
  cpu: <Cpu size={14} />,
  battery: <Battery size={14} />,
  harddrive: <HardDrive size={14} />,
  smartphone: <Smartphone size={14} />,
  tablet: <Tablet size={14} />,
  camera: <Camera size={14} />
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 20;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Form State
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [specs, setSpecs] = useState({}); // Lưu giá trị thông số của sản phẩm: {ram: "8GB", cpu: "i5"}
  const [currentCategorySpecs, setCurrentCategorySpecs] = useState([]); // Lưu cấu hình các trường specs của danh mục được chọn

  const [priceValue, setPriceValue] = useState("");
  const [stockValue, setStockValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Image State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Filters
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const [pRes, cRes, bRes] = await Promise.all([
        axios.get('http://localhost:5000/admin/products'),
        axios.get('http://localhost:5000/admin/categories'),
        axios.get('http://localhost:5000/admin/brands')
      ]);
      setProducts(pRes.data);
      setCategories(cRes.data);
      setBrands(bRes.data);
    } catch (err) {
      toast.error("Không thể kết nối đến máy chủ");
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Tự động load cấu hình thông số (Specs) khi đổi danh mục
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(c => c.id.toString() === selectedCategory.toString());
      if (category && category.attributes_json) {
        try {
          setCurrentCategorySpecs(JSON.parse(category.attributes_json));
        } catch (e) {
          setCurrentCategorySpecs([]);
        }
      } else {
        setCurrentCategorySpecs([]);
      }
    } else {
      setCurrentCategorySpecs([]);
    }
  }, [selectedCategory, categories]);

  // --- LOGIC XỬ LÝ ẢNH ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const availableSlots = 4 - previews.length;
    if (files.length > availableSlots) {
      toast.error(`Bạn chỉ có thể thêm tối đa ${availableSlots} ảnh nữa`);
      return;
    }
    const newFilePreviews = files.map(file => URL.createObjectURL(file));
    setSelectedFiles(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...newFilePreviews]);
  };

  const removeFile = (index) => {
    const urlToRemove = previews[index];
    if (urlToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRemove);
      const blobIndex = previews.slice(0, index).filter(p => p.startsWith('blob:')).length;
      setSelectedFiles(prev => prev.filter((_, i) => i !== blobIndex));
    }
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= previews.length) return;
    const updatedPreviews = [...previews];
    [updatedPreviews[index], updatedPreviews[newIndex]] = [updatedPreviews[newIndex], updatedPreviews[index]];
    setPreviews(updatedPreviews);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    const load = toast.loading("Đang xóa sản phẩm...");
    try {
      await axios.delete(`http://localhost:5000/admin/products/delete/${productToDelete.id}`);
      toast.success("Đã xóa sản phẩm thành công", { id: load });
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi xóa", { id: load });
    }
  };

  const filteredProducts = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCate = filterCategory === "" || p.category_id.toString() === filterCategory;
      const matchBrand = filterBrand === "" || p.brand_id.toString() === filterBrand;
      return matchSearch && matchCate && matchBrand;
    })
    .sort((a, b) => {
      if (sortBy === "latest") return b.id - a.id;
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "stock-low") return a.stock - b.stock;
      return 0;
    });

  const currentProducts = filteredProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const openEditModal = (product) => {
    setEditingProduct(product);
    setSelectedCategory(product.category_id.toString());
    try {
      setSpecs(product.specifications ? JSON.parse(product.specifications) : {});
      const imgs = product.image ? JSON.parse(product.image) : [];
      setPreviews(Array.isArray(imgs) ? imgs : [product.image]);
    } catch (e) {
      setSpecs({});
      setPreviews([product.image]);
    }
    setPriceValue(parseInt(product.price).toLocaleString('en-US'));
    setStockValue(product.stock);
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', e.target.name.value);
    formData.append('price', priceValue.replace(/,/g, ""));
    formData.append('category_id', selectedCategory);
    formData.append('brand_id', e.target.brand_id.value);
    formData.append('stock', stockValue);
    formData.append('description', e.target.description.value);
    formData.append('specifications', JSON.stringify(specs));

    const existingImages = previews.filter(p => !p.startsWith('blob:'));
    formData.append('existingImages', JSON.stringify(existingImages));
    selectedFiles.forEach(file => formData.append('images', file));

    const load = toast.loading(editingProduct ? "Đang cập nhật..." : "Đang tạo...");
    try {
      if (editingProduct) {
        await axios.put(`http://localhost:5000/admin/products/update/${editingProduct.id}`, formData);
      } else {
        await axios.post('http://localhost:5000/admin/products/add', formData);
      }
      toast.success("Thành công!", { id: load });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Thao tác thất bại", { id: load });
    }
  };

  return (
    <div className="admin-layout" style={{ fontFamily: 'Cabin, sans-serif' }}>
      <Sidebar />
      <main className="admin-main">
        <header className="page-header">
          <div className="header-content">
            <h1>Kho sản phẩm</h1>
            <p>Đang quản lý <strong>{products.length}</strong> sản phẩm.</p>
          </div>
          <button className="btn-create-account" onClick={() => {
            setEditingProduct(null); setSelectedCategory(""); setSpecs({}); setPriceValue(""); setStockValue(""); setSelectedFiles([]); setPreviews([]); setIsModalOpen(true);
          }}>
            <Plus size={19} /> <span>Tạo sản phẩm mới</span>
          </button>
        </header>

        <section className="filter-section">
          <div className="filter-container">
            <div className="search-wrapper">
              <Search size={18} />
              <input type="text" placeholder="Tìm kiếm..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
            </div>
            <div className="filter-group">
              <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}>
                <option value="">Tất cả danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <select value={filterBrand} onChange={(e) => { setFilterBrand(e.target.value); setCurrentPage(1); }}>
                <option value="">Tất cả thương hiệu</option>
                {brands.map(b => <option key={b.id} value={b.id.toString()}>{b.name}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">Mới cập nhật</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="stock-low">Tồn kho ít nhất</option>
              </select>
            </div>
            <button className="btn-reset-filter" onClick={() => {
              setSearchQuery(""); setFilterCategory(""); setFilterBrand(""); setSortBy("latest");
            }} title="Làm mới bộ lọc">
              <RotateCcw size={16} />
            </button>
          </div>
        </section>

        <div className="product-grid">
          {currentProducts.map(product => {
            let displayImg = 'https://via.placeholder.com/200';
            try {
              const imgs = product.image ? JSON.parse(product.image) : [];
              displayImg = Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : product.image;
            } catch (e) { displayImg = product.image; }

            return (
              <div className="product-card" key={product.id}>
                <div className="card-image">
                  <img src={displayImg || 'https://via.placeholder.com/200'} alt={product.name} />
                  <div className="category-tag">{product.category_name}</div>
                  <div className={`stock-tag ${product.stock < 10 ? 'low-stock' : ''}`}>
                    <Package size={12} /> <span>{product.stock}</span>
                  </div>
                </div>
                <div className="card-body">
                  <span className="brand-label">{product.brand_name}</span>
                  <h4 title={product.name}>{product.name}</h4>
                  <div className="card-price">{parseInt(product.price).toLocaleString('vi-VN')}đ</div>
                </div>
                <div className="card-footer">
                  <button className="edit-btn" onClick={() => openEditModal(product)}><Edit3 size={15} /> Sửa</button>
                  <button className="delete-btn" onClick={() => { setProductToDelete(product); setIsDeleteModalOpen(true); }}><Trash2 size={15} /> Xóa</button>
                </div>
              </div>
            )
          })}
        </div>

        {totalPages > 1 && (
          <div className="pagination-container">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Trước</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} className={currentPage === i + 1 ? 'active' : ''} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Tiếp</button>
          </div>
        )}

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container product-modal animate-slide-up">
              <div className="modal-header">
                <div className="header-title-group">
                  <div className="header-icon-box"><Package color="#E10600" /></div>
                  <h3>{editingProduct ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}</h3>
                </div>
                <button className="close-modal" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              </div>
              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="form-main-content">
                  <div className="form-column-left">
                    <div className="upload-section">
                      <label>Hình ảnh (Tối đa 4)</label>
                      <div className="upload-grid">
                        <input type="file" id="p-images" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        {previews.length < 4 && (
                          <label htmlFor="p-images" className="upload-placeholder main">
                            <Upload size={20} />
                            <span>Thêm ảnh</span>
                          </label>
                        )}
                        {previews.map((src, idx) => (
                          <div key={idx} className={`preview-item animate-scale-up ${idx === 0 ? 'main-image-item' : ''}`}>
                            <img src={src} alt="preview" />
                            {idx === 0 && <div className="main-badge">Ảnh chính</div>}
                            <div className="image-controls">
                              {idx > 0 && (
                                <button type="button" onClick={() => moveFile(idx, -1)} className="control-btn"><RotateCcw size={12} style={{ transform: 'rotate(90deg)' }} /></button>
                              )}
                              <button type="button" className="control-btn delete" onClick={() => removeFile(idx)}><X size={12} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="form-group mt-3">
                      <label>Mô tả sản phẩm</label>
                      <textarea name="description" defaultValue={editingProduct?.description || ""} rows="10" placeholder="Mô tả chi tiết..." style={{ minHeight: '220px' }} />
                    </div>
                  </div>
                  <div className="form-column-right">
                    <div className="form-group">
                      <label>Tên sản phẩm</label>
                      <input name="name" type="text" defaultValue={editingProduct?.name || ""} required />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label><Layers size={14} /> Danh mục</label>
                        <select name="category_id" value={selectedCategory} required onChange={(e) => { setSelectedCategory(e.target.value); setSpecs({}); }}>
                          <option value="">Chọn danh mục</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label><Tag size={14} /> Thương hiệu</label>
                        <select name="brand_id" defaultValue={editingProduct?.brand_id || ""}>
                          <option value="">Chọn thương hiệu</option>
                          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Giá bán (VND)</label>
                        <input type="text" value={priceValue} onChange={(e) => setPriceValue(e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ","))} />
                      </div>
                      <div className="form-group">
                        <label>Số lượng kho</label>
                        <input type="number" value={stockValue} onChange={(e) => setStockValue(e.target.value)} required />
                      </div>
                    </div>

                    {/* DYNAMIC SPECS: Render dựa trên cấu hình của danh mục được chọn */}
                    {currentCategorySpecs.length > 0 && (
                      <div className="specs-section-container">
                        <div className="specs-title-badge"><AlertTriangle size={14} /> Thông số kỹ thuật</div>
                        <div className="specs-input-grid">
                          {currentCategorySpecs.map((field) => (
                            <div className="form-group" key={field.key}>
                              <label>
                                {/* Nếu field.icon trống, sẽ không hiện gì cả thay vì hiện Cpu mặc định */}
                                {field.icon && ICON_MAP[field.icon] ? ICON_MAP[field.icon] : null}
                                {field.label}
                              </label>
                              <input
                                type="text"
                                value={specs[field.key] || ""}
                                onChange={(e) => setSpecs({ ...specs, [field.key]: e.target.value })}
                                placeholder={`Nhập ${field.label.toLowerCase()}...`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy bỏ</button>
                  <button type="submit" className="btn-submit">Lưu sản phẩm</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductManagement;