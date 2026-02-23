import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, CircleUserRound } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import './EditProfile.css';

const EditProfile = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Lấy thông tin user và token từ localStorage
    const userStorage = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const userId = userStorage?.id;

    // 1. Lấy dữ liệu user từ database khi vào trang
    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) {
                toast.error("Vui lòng đăng nhập để xem thông tin!");
                return;
            }

            try {
                // Gọi đúng endpoint /profile/:id để tránh lỗi 404
                const res = await axios.get(`http://localhost:3005/client/auth/profile/${userId}`);
                setFormData(prev => ({
                    ...prev,
                    fullName: res.data.fullname,
                    email: res.data.email
                }));
            } catch (err) {
                console.error("Fetch error:", err);
                toast.error("Không thể tải thông tin cá nhân");
            }
        };
        fetchUserData();
    }, [userId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 2. Xử lý cập nhật thông tin
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra mật khẩu mới
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            return toast.error("Mật khẩu xác nhận không khớp!");
        }

        try {
            // Gửi userId trong body theo yêu cầu của Backend (vì không dùng middleware)
            const res = await axios.put('http://localhost:3005/client/auth/update-profile', {
                userId: userId,
                fullName: formData.fullName,
                email: formData.email,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            toast.success(res.data.message);

            // Cập nhật lại localStorage để Navbar/Header hiển thị tên mới ngay lập tức
            const updatedUser = { ...userStorage, fullname: formData.fullName, email: formData.email };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Reset các ô nhập mật khẩu
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            
            // Có thể dùng window.dispatchEvent(new Event('storage')) để các component khác cập nhật theo
            window.dispatchEvent(new Event('storage'));

        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi cập nhật dữ liệu");
        }
    };

    return (
        <div className="profile-edit-page" style={{ fontFamily: 'Cabin, sans-serif' }}>
            <div className="container profile-container">
                {/* SIDEBAR TỐI GIẢN */}
                <aside className="profile-sidebar">
                    <div className="user-avatar-section">
                        <div className="avatar-wrapper">
                            <CircleUserRound size={80} strokeWidth={1.2} color="var(--primary-color)" />
                        </div>
                        <h3>{formData.fullName || "Người dùng"}</h3>
                        <p className="user-role">Thành viên RedTech</p>
                    </div>
                    <nav className="profile-nav">
                        <button className="active">Thông tin cá nhân</button>
                        <button onClick={() => toast('Tính năng đang phát triển!')}>Đơn hàng của tôi</button>
                    </nav>
                </aside>

                {/* FORM CHỈNH SỬA */}
                <main className="profile-content">
                    <div className="content-header">
                        <h2>Thiết lập <span>tài khoản</span></h2>
                        <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                    </div>

                    <form onSubmit={handleSubmit} className="edit-form">
                        {/* Phần 1: Thông tin cơ bản */}
                        <div className="form-section">
                            <h4 className="section-title"><User size={18} /> Thông tin cơ bản</h4>
                            <div className="form-group">
                                <label>Họ và tên</label>
                                <div className="input-icon-wrapper">
                                    <User className="input-icon" size={20} />
                                    <input 
                                        type="text" 
                                        name="fullName" 
                                        value={formData.fullName} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Địa chỉ Email</label>
                                <div className="input-icon-wrapper">
                                    <Mail className="input-icon" size={20} />
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="example@gmail.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Phần 2: Đổi mật khẩu */}
                        <div className="form-section">
                            <h4 className="section-title"><Lock size={18} /> Bảo mật & Mật khẩu</h4>
                            <p className="form-note">
                                * Chỉ điền nếu bạn muốn thay đổi email hoặc mật khẩu mới.
                            </p>
                            
                            <div className="form-group">
                                <label>Mật khẩu hiện tại</label>
                                <div className="input-icon-wrapper">
                                    <Lock className="input-icon" size={20} />
                                    <input 
                                        type="password" 
                                        name="currentPassword" 
                                        value={formData.currentPassword} 
                                        onChange={handleChange} 
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="grid-inputs">
                                <div className="form-group">
                                    <label>Mật khẩu mới</label>
                                    <input 
                                        type="password" 
                                        name="newPassword" 
                                        value={formData.newPassword} 
                                        onChange={handleChange} 
                                        placeholder="Tối thiểu 8 ký tự"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Xác nhận mật khẩu mới</label>
                                    <input 
                                        type="password" 
                                        name="confirmPassword" 
                                        value={formData.confirmPassword} 
                                        onChange={handleChange} 
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn-save-profile">
                            <Save size={20} /> Lưu thay đổi
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default EditProfile;