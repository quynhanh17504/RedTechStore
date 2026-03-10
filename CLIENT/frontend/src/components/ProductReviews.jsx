import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Send, User, MessageSquare, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import './ProductReviews.css'; // Import file CSS đã tách

const ProductReviews = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Lấy thông tin user từ LocalStorage
    const userStorage = JSON.parse(localStorage.getItem('user'));
    const userId = userStorage?.id;

    // API: Lấy danh sách đánh giá
    const fetchReviews = async () => {
        try {
            const res = await axios.get(`http://localhost:3005/client/review/${productId}`);
            setReviews(res.data);
        } catch (err) {
            console.error("Lỗi fetch reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) fetchReviews();
    }, [productId]);

    // API: Gửi đánh giá mới
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!userId) {
            toast.error("Bạn cần đăng nhập để gửi đánh giá!");
            return;
        }
        if (rating === 0) {
            toast.error("Vui lòng chọn số sao!");
            return;
        }

        setSubmitting(true);
        try {
            // Khớp với route POST /client/reviews/add bạn đã tạo
            await axios.post('http://localhost:3005/client/review/add', {
                user_id: userId,
                product_id: productId,
                rating: rating,
                comment: comment
            });
            
            toast.success("Đánh giá thành công!");
            setComment("");
            setRating(0);
            fetchReviews(); // Refresh danh sách
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi gửi đánh giá");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="product-reviews-container">
            <div className="reviews-header">
                <h3>Phản hồi từ <span>khách hàng</span></h3>
            </div>

            <div className="reviews-layout">
                {/* --- DANH SÁCH ĐÁNH GIÁ --- */}
                <div className="reviews-list-side">
                    {loading ? (
                        <p>Đang tải...</p>
                    ) : reviews.length === 0 ? (
                        <div className="no-reviews">
                            <AlertCircle size={30} />
                            <p>Sản phẩm này chưa có đánh giá nào.</p>
                        </div>
                    ) : (
                        <div className="scrollable-reviews">
                            {reviews.map((rev) => (
                                <div key={rev.id} className="review-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <div className="rev-user-info">
                                            <div className="user-avatar-circle"><User size={20} /></div>
                                            <div>
                                                <strong style={{ fontSize: '15px' }}>{rev.fullname}</strong>
                                                <span style={{ fontSize: '12px', color: '#999', display: 'block' }}>
                                                    {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', color: '#ffb400' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < rev.rating ? "#ffb400" : "none"} />
                                            ))}
                                        </div>
                                    </div>
                                    <p style={{ marginLeft: '52px', fontSize: '14px', color: '#555' }}>{rev.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- FORM GỬI ĐÁNH GIÁ --- */}
                <div className="review-form-side">
                    <div className="review-form-sticky">
                        <h4>Gửi nhận xét của bạn</h4>
                        <form onSubmit={handleSubmitReview}>
                            <div style={{ margin: '15px 0' }}>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {[...Array(5)].map((_, index) => {
                                        const starVal = index + 1;
                                        return (
                                            <button
                                                type="button"
                                                key={starVal}
                                                className="star-btn"
                                                onClick={() => setRating(starVal)}
                                                onMouseEnter={() => setHover(starVal)}
                                                onMouseLeave={() => setHover(0)}
                                            >
                                                <Star 
                                                    size={28} 
                                                    color={(hover || rating) >= starVal ? "#ffb400" : "#ddd"} 
                                                    fill={(hover || rating) >= starVal ? "#ffb400" : "none"}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <textarea 
                                className="review-textarea"
                                rows="4"
                                placeholder="Bạn thấy sản phẩm này thế nào?"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-submit-review" disabled={submitting}>
                                {submitting ? "Đang gửi..." : <>Gửi ngay <Send size={18} /></>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductReviews;