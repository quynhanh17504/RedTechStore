import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Đừng quên Toaster để hiện thông báo
import Auth from './pages/Auth'; 
import AdminDashboard from './pages/Dashboard'; 
import UserManagement from './pages/UserManagement'; 
import BrandManagement from './pages/BrandManagement';
import ProductMangement from './pages/ProductManagement';
import CategoryManagement from './pages/CategoryManagement';
import './App.css';

// Component bảo vệ Route (Chặn khách vãng lai)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" /> {/* Hiển thị thông báo Toast */}
      
      <Routes>
        {/* 1. Trang đăng nhập */}
        <Route path="/admin/login" element={<Auth />} />
        
        {/* Đổi tất cả path về /admin/... để đồng bộ */}
        <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
        <Route path="/admin/products" element={<PrivateRoute><ProductMangement /></PrivateRoute>} /> 
        <Route path="/admin/categories" element={<PrivateRoute><CategoryManagement /></PrivateRoute>} />
        <Route path="/admin/orders" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/brands" element={<PrivateRoute><BrandManagement /></PrivateRoute>} />
        <Route path="/admin/reviews" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        {/* --- ĐIỀU HƯỚNG MẶC ĐỊNH --- */}
        {/* Nếu vào trang chủ / thì tự chuyển về login */}
        <Route path="/" element={<Navigate to="/admin/login" />} />
        
        <Route path="*" element={
          <div style={{
            padding: '100px 20px', 
            textAlign: 'center', 
            fontFamily: 'Cabin, sans-serif'
          }}>
            <h1 style={{fontSize: '4rem', color: '#E10600'}}>404</h1>
            <h2>Oops! Trang bạn tìm kiếm không tồn tại</h2>
            <a href="/admin/login" style={{color: '#E10600', fontWeight: 'bold'}}>Quay lại đăng nhập</a>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;