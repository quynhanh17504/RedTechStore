import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { ShoppingCart, DollarSign, Users, Package, ShieldCheck } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, 
  PointElement, LineElement, Title, Tooltip, Legend, Filler 
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const adminInfo = JSON.parse(localStorage.getItem('adminInfo')) || { 
    fullname: 'Quản trị viên', 
    email: 'admin@redtech.vn' 
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/admin/dashboard/stats');
        setData(res.data);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="loader"></div>
      <p>Đang tải dữ liệu RedTech...</p>
    </div>
  );

  const chartData = {
    labels: data?.chartData?.map(item => item.day) || [],
    datasets: [{
      label: 'Doanh thu',
      data: data?.chartData?.map(item => item.revenue) || [],
      borderColor: '#E10600',
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(225, 6, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(225, 6, 0, 0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: '#E10600',
    }],
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <header className="main-header">
          <div className="header-title">
            <h1>Tổng quan hệ thống</h1>
            <p>Chào mừng trở lại, {adminInfo.fullname.split(' ').pop()}!</p>
          </div>
          
          <div className="header-right">
            {/* Đã bỏ Bell và Dropdown Arrow theo yêu cầu */}
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
          <StatCard title="Đơn hàng" value={data.stats.orders} icon={<ShoppingCart size={24}/>} color="red" />
          <StatCard title="Doanh thu" value={`${parseInt(data.stats.revenue).toLocaleString()}đ`} icon={<DollarSign size={24}/>} color="blue" />
          <StatCard title="Khách hàng" value={data.stats.users} icon={<Users size={24}/>} color="green" />
          <StatCard title="Tồn kho" value={data.stats.stock} icon={<Package size={24}/>} color="orange" />
        </section>

        <section className="dashboard-content">
          <div className="chart-wrapper card-shadow">
            <div className="card-header">
               <h3>Hiệu suất doanh thu</h3>
            </div>
            <div className="chart-container">
              <Line data={chartData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } } 
              }} />
            </div>
          </div>

          <div className="recent-orders card-shadow">
            <div className="card-header">
              <h3>Đơn hàng mới nhất</h3>
              <button className="btn-view-all">Xem tất cả</button>
            </div>
            <div className="order-list">
              {data.recentOrders?.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <strong>#{order.id}</strong>
                    <span>{order.user}</span>
                  </div>
                  <div className="order-meta">
                    <strong>{parseInt(order.total).toLocaleString()}đ</strong>
                    <span className={`status-pill ${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className={`stat-card ${color}`}>
    <div className="stat-card-body">
      <div className="stat-info">
        <p>{title}</p>
        <h3>{value}</h3>
      </div>
      <div className="stat-icon-box">{icon}</div>
    </div>
  </div>
);

export default AdminDashboard;