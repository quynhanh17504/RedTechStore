import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Save, CircleUserRound, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import MyOrders from './MyOrders'; 
import './EditProfile.css';

const EditProfile = () => {
    const [activeTab, setActiveTab] = useState('profile'); 
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Lấy userId từ localStorage
    const userStorage = JSON.parse(localStorage.getItem('user'));
    const userId = userStorage?.id;

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
            try {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            return toast.error("Mật khẩu xác nhận không khớp!");
        }

        try {
            const res = await axios.put('http://localhost:3005/client/auth/update-profile', {
                userId: userId,
                fullName: formData.fullName,
                email: formData.email,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            toast.success(res.data.message);
            
            // Cập nhật lại localStorage để đồng bộ UI toàn trang
            const updatedUser = { ...userStorage, fullname: formData.fullName, email: formData.email };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Reset field mật khẩu sau khi lưu thành công
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            
            window.dispatchEvent(new Event('storage'));
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi cập nhật dữ liệu");
        }
    };

    if (!userId) {
        return <div className="login-required">Vui lòng đăng nhập để tiếp tục.</div>;
    }

    return (
        <div className="profile-edit-page" style={{ fontFamily: 'Cabin, sans-serif' }}>
            <div className="container profile-container">
                {/* SIDEBAR */}
                <aside className="profile-sidebar">
                    <div className="user-avatar-section">
                        <div className="avatar-wrapper">
                            <CircleUserRound size={80} strokeWidth={1.2} color="var(--primary-color)" />
                        </div>
                        <h3>{formData.fullName || "Người dùng"}</h3>
                        <p className="user-role">Thành viên RedTech</p>
                    </div>
                    <nav className="profile-nav">
                        <button 
                            className={activeTab === 'profile' ? 'active' : ''} 
                            onClick={() => setActiveTab('profile')}
                        >
                            <User size={18} /> Thông tin cá nhân
                        </button>
                        <button 
                            className={activeTab === 'orders' ? 'active' : ''} 
                            onClick={() => setActiveTab('orders')}
                        >
                            <ShoppingBag size={18} /> Đơn hàng của tôi
                        </button>
                    </nav>
                </aside>

                {/* CONTENT AREA */}
                <main className="profile-content">
                    {activeTab === 'profile' ? (
                        <div className="tab-fade-in">
                            <div className="content-header">
                                <h2>Thiết lập <span>tài khoản</span></h2>
                                <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                            </div>

                            <form onSubmit={handleSubmit} className="edit-form">
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
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h4 className="section-title"><Lock size={18} /> Bảo mật & Mật khẩu</h4>
                                    <p className="form-note">* Chỉ điền nếu bạn muốn thay đổi mật khẩu.</p>
                                    
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
                                            <label>Xác nhận mật khẩu</label>
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
                        </div>
                    ) : (
                        <MyOrders userId={userId} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default EditProfile;