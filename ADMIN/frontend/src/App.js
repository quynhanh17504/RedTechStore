import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth'; 
import AdminDashboard from './pages/Dashboard'; 
import UserManagement from './pages/UserManagement'; 
import BrandManagement from './pages/BrandManagement';
import ProductMangement from './pages/ProductManagement';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- ROUTE CHO ADMIN --- */}
        
        {/* 1. Trang đăng nhập */}
        <Route path="/admin/login" element={<Auth />} />
        
        {/* 2. Trang chủ Dashboard - Tổng quan */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* 3. Trang Quản lý tài khoản (Đã cập nhật) */}
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/products" element={<ProductMangement />} /> 
        <Route path="/admin/categories" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminDashboard />} />
        <Route path="/admin/brands" element={<BrandManagement />} />
        <Route path="/admin/reviews" element={<AdminDashboard />} />

        {/* --- ĐIỀU HƯỚNG MẶC ĐỊNH --- */}
        
        <Route path="/" element={<Navigate to="/admin/login" />} />
        
        <Route path="*" element={
          <div style={{
            padding: '100px 20px', 
            textAlign: 'center', 
            fontFamily: 'Cabin, sans-serif'
          }}>
            <h1 style={{fontSize: '4rem', color: '#E10600'}}>404</h1>
            <h2>Oops! Trang bạn tìm kiếm không tồn tại</h2>
            <p>Vui lòng kiểm tra lại đường dẫn hoặc quay về trang đăng nhập.</p>
            <a href="/admin/login" style={{
              color: '#E10600', 
              fontWeight: 'bold', 
              textDecoration: 'underline'
            }}>Quay lại đăng nhập</a>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;