import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ShoppingCart, DollarSign, Users, Package, ShieldCheck, TrendingUp, ArrowRight } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, 
  PointElement, LineElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const adminInfo = JSON.parse(localStorage.getItem('adminInfo')) || { 
    fullname: 'Trần Huỳnh Bảo Ngọc', // Cập nhật tên theo profile
    email: 'admin@redtech.vn' 
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/admin/dashboard/stats');
        setData(res.data);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Hàm helper để render status badge đồng bộ với OrderManagement
  const renderStatus = (status) => {
    const statusMap = {
      pending: { label: "Chờ xử lý", class: "pending" },
      processing: { label: "Đang chuẩn bị", class: "processing" },
      shipped: { label: "Đang giao", class: "shipping" },
      delivered: { label: "Thành công", class: "success" },
      cancelled: { label: "Đã hủy", class: "cancelled" }
    };
    const s = status?.toLowerCase();
    const config = statusMap[s] || { label: status, class: "default" };
    return <span className={`status-pill ${config.class}`}>{config.label}</span>;
  };

  if (loading) return (
    <div className="loading-screen" style={{ fontFamily: 'Cabin' }}>
      <div className="loader"></div>
      <p>Đang tải dữ liệu RedTech...</p>
    </div>
  );

  const chartData = {
    labels: data?.chartData?.map(item => item.day) || [],
    datasets: [{
      label: 'Doanh thu (VNĐ)',
      data: data?.chartData?.map(item => item.revenue) || [],
      borderColor: '#E10600',
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(225, 6, 0, 0.15)');
        gradient.addColorStop(1, 'rgba(225, 6, 0, 0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#E10600',
      pointBorderWidth: 2,
    }],
  };

  return (
    <div className="admin-layout" style={{ fontFamily: 'Cabin, sans-serif' }}>
      <Sidebar />
      <main className="admin-main">
        <header className="main-header">
          <div className="header-left-group">
            <div className="welcome-badge">
              <span className="dot-pulse"></span>
              Hệ thống đang hoạt động
            </div>
            <div className="header-title">
              <h1>Tổng quan <span>Hệ thống</span></h1>
              <p>
                Chào mừng trở lại, <strong>{adminInfo.fullname}</strong>. 
              </p>
            </div>
          </div>
          
          <div className="header-right">
            <div className="admin-profile-pill">
              <div className="admin-details">
                <span className="admin-name">{adminInfo.fullname}</span>
                <span className="admin-email">{adminInfo.email}</span>
              </div>
              <div className="admin-visual">
                <div className="admin-icon-bg"><ShieldCheck size={20} /></div>
                <div className="online-status"></div>
              </div>
            </div>
          </div>
        </header>

        <section className="stats-grid">
          <StatCard 
            title="Đơn hàng" 
            value={data.stats.orders} 
            icon={<ShoppingCart size={24}/>} 
            color="red" 
            onClick={() => navigate('/admin/orders')}
          />
          <StatCard 
            title="Doanh thu" 
            value={`${parseInt(data.stats.revenue).toLocaleString('vi-VN')}đ`} 
            icon={<DollarSign size={24}/>} 
            color="blue" 
          />
          <StatCard 
            title="Khách hàng" 
            value={data.stats.users} 
            icon={<Users size={24}/>} 
            color="green" 
          />
          <StatCard 
            title="Tồn kho" 
            value={data.stats.stock} 
            icon={<Package size={24}/>} 
            color="orange" 
            onClick={() => navigate('/admin/products')}
          />
        </section>

        <section className="dashboard-content">
          <div className="chart-wrapper card-shadow">
            <div className="card-header">
               <div className="title-with-icon">
                  <TrendingUp size={20} color="#E10600" />
                  <h3>Hiệu suất doanh thu</h3>
               </div>
               <select className="chart-filter">
                  <option>7 ngày gần nhất</option>
                  <option>30 ngày gần nhất</option>
               </select>
            </div>
            <div className="chart-container">
              <Line 
                data={chartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { 
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: '#1a1a1a',
                      titleFont: { family: 'Cabin' },
                      bodyFont: { family: 'Cabin' },
                      callbacks: {
                        label: (context) => ` ${context.parsed.y.toLocaleString()}đ`
                      }
                    }
                  },
                  scales: {
                    y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                    x: { grid: { display: false } }
                  }
                }} 
              />
            </div>
          </div>

          <div className="recent-orders card-shadow">
            <div className="card-header">
              <h3>Đơn hàng mới nhất</h3>
              <button className="btn-view-all" onClick={() => navigate('/admin/orders')}>
                Xem tất cả <ArrowRight size={14} />
              </button>
            </div>
            <div className="order-list">
              {data.recentOrders?.map(order => (
                <div key={order.id} className="order-item" onClick={() => navigate('/admin/orders')}>
                  <div className="order-info">
                    <span className="order-id">#{order.id}</span>
                    <strong className="customer-name">{order.user}</strong>
                  </div>
                  <div className="order-meta">
                    <strong className="order-amount">{parseInt(order.total).toLocaleString()}đ</strong>
                    {renderStatus(order.status)}
                  </div>
                </div>
              ))}
              {(!data.recentOrders || data.recentOrders.length === 0) && (
                <p className="empty-msg">Chưa có đơn hàng mới.</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color, onClick }) => (
  <div className={`stat-card ${color}`} onClick={onClick}>
    <div className="stat-card-inner">
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
      <div className="stat-icon-wrapper">
        {icon}
      </div>
    </div>
    <div className="stat-indicator"></div>
  </div>
);

export default AdminDashboard;