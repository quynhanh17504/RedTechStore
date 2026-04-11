import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Search, Trash2, MessageSquare, Star, 
  Calendar, User, Package, RotateCcw, AlertTriangle 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ReviewManagement.css'; 

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States cho Modal Xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/admin/reviews');
      setReviews(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Mở modal và lưu lại review cần xóa
  const openDeleteModal = (review) => {
    setReviewToDelete(review);
    setIsDeleteModalOpen(true);
  };

  // Thực hiện xóa thực sự
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    
    const load = toast.loading("Đang xóa đánh giá...");
    setIsDeleteModalOpen(false); // Đóng modal ngay

    try {
      await axios.delete(`http://localhost:5000/admin/reviews/delete/${reviewToDelete.id}`);
      toast.success("Đã xóa thành công!", { id: load });
      fetchData();
    } catch (err) {
      toast.error("Lỗi khi xóa: " + err.message, { id: load });
    } finally {
      setReviewToDelete(null);
    }
  };

  const filteredReviews = reviews
    .filter(r => {
      const matchSearch = r.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.comment?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRating = filterRating === "" || r.rating.toString() === filterRating;
      return matchSearch && matchRating;
    })
    .sort((a, b) => {
      if (sortBy === "latest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "rating-high") return b.rating - a.rating;
      if (sortBy === "rating-low") return a.rating - b.rating;
      return 0;
    });

  return (
    <div className="rev-admin-layout" style={{ fontFamily: 'Cabin, sans-serif' }}>
      <Sidebar />
      <main className="rev-admin-main">
        <header className="rev-page-header">
          <div className="rev-header-content">
            <h1>Quản lý đánh giá</h1>
            <p>Phản hồi từ khách hàng cho các sản phẩm <strong>RedTech</strong>.</p>
          </div>
        </header>

        <section className="rev-filter-section">
          <div className="rev-filter-container">
            <div className="rev-search-wrapper">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Tìm nội dung hoặc sản phẩm..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <div className="rev-filter-group">
              <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                <option value="">Tất cả số sao</option>
                {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} sao</option>)}
              </select>
            </div>
            <div className="rev-filter-group">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">Mới nhất</option>
                <option value="rating-high">Đánh giá cao</option>
                <option value="rating-low">Đánh giá thấp</option>
              </select>
            </div>
            <button className="rev-btn-reset" onClick={() => {setSearchQuery(""); setFilterRating(""); setSortBy("latest");}}>
              <RotateCcw size={16} />
            </button>
          </div>
        </section>

        <div className="rev-content-wrapper">
          {loading ? (
            <p className="rev-loading">Đang tải dữ liệu...</p>
          ) : filteredReviews.length > 0 ? (
            <div className="rev-table-responsive">
              <table className="rev-admin-table">
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Đánh giá</th>
                    <th>Nội dung</th>
                    <th>Ngày đăng</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review) => (
                    <tr key={review.id} className="rev-table-row">
                      <td>
                        <div className="rev-user-cell">
                          <User size={14} /> <span>{review.user_name || `User #${review.user_id}`}</span>
                        </div>
                      </td>
                      <td style={{ maxWidth: '180px' }}>
                        <div className="rev-product-cell">
                          <Package size={14} /> <strong className="rev-product-name">{review.product_name}</strong>
                        </div>
                      </td>
                      <td>
                        <div className="rev-rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              fill={i < review.rating ? "#FFB800" : "none"} 
                              color={i < review.rating ? "#FFB800" : "#ccc"} 
                            />
                          ))}
                        </div>
                      </td>
                      <td className="rev-comment-cell">
                        <p>{review.comment || <em className="rev-empty-text">Không có nội dung</em>}</p>
                      </td>
                      <td>
                        <div className="rev-date-cell">
                          <Calendar size={12} /> {new Date(review.created_at).toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td>
                        <button className="rev-btn-delete" onClick={() => openDeleteModal(review)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rev-empty-state">
              <MessageSquare size={48} color="#ccc" />
              <p>Không tìm thấy đánh giá nào.</p>
            </div>
          )}
        </div>

        {/* --- MODAL XÓA --- */}
        {isDeleteModalOpen && (
          <div className="modal-overlay">
            <div className="modal-container delete-confirm-modal animate-scale-up">
              <div className="delete-icon-wrapper">
                <AlertTriangle size={40} color="#E10600" />
              </div>
              <h3>Xác nhận xóa?</h3>
              <p>
                Bạn có chắc chắn muốn xóa đánh giá của khách hàng 
                <strong> {reviewToDelete?.user_name}</strong> cho sản phẩm 
                <strong> {reviewToDelete?.product_name}</strong>?
              </p>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Hủy bỏ</button>
                <button className="btn-confirm-delete" onClick={handleDeleteReview}>Xác nhận xóa</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReviewManagement;