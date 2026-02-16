import React from 'react';
import Sidebar from '../components/Sidebar';
import { ShoppingCart, DollarSign, Users, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale,LinearScale,PointElement,LineElement,Title,Tooltip,Legend,Filler} from 'chart.js';
import './Dashboard.css';

// Đăng ký các thành phần ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AdminDashboard = () => {
  // Cấu hình dữ liệu biểu đồ
  const chartData = {
    labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
    datasets: [
      {
        label: 'Doanh thu tuần này',
        data: [15000000, 22000000, 18000000, 32000000, 28000000, 45000000, 58000000],
        borderColor: '#E10600',
        backgroundColor: 'rgba(225, 6, 0, 0.05)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#E10600',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f0f0f0' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div className="admin-layout">
      {/* 1. Sidebar Component */}
      <Sidebar />

      {/* 2. Nội dung chính */}
      <main className="admin-main">
        
        {/* Top Header */}
        <header className="main-header">
          <div className="header-title">
            <h1>Tổng quan hệ thống</h1>
            <p>Chào mừng trở lại, Admin. Đây là những gì đang diễn ra hôm nay.</p>
          </div>
          <div className="header-actions">
            <div className="admin-info">
              <div className="text-right">
                <strong>Quản trị viên</strong>
                <span>admin@redtech.vn</span>
              </div>
              <div className="avatar">A</div>
            </div>
          </div>
        </header>

        {/* Thẻ thống kê (Stats Grid) */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon red"><ShoppingCart size={24}/></div>
            <div className="stat-content">
              <p>Đơn hàng mới</p>
              <h3>128</h3>
              <span className="trend up"><ArrowUpRight size={14}/> 12.5%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue"><DollarSign size={24}/></div>
            <div className="stat-content">
              <p>Doanh thu ngày</p>
              <h3>12.450.000đ</h3>
              <span className="trend up"><ArrowUpRight size={14}/> 8.2%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green"><Users size={24}/></div>
            <div className="stat-content">
              <p>Khách hàng mới</p>
              <h3>42</h3>
              <span className="trend down"><ArrowDownRight size={14}/> 2.1%</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange"><Package size={24}/></div>
            <div className="stat-content">
              <p>Kho hàng</p>
              <h3>1,024</h3>
              <span className="sub-text">Sản phẩm có sẵn</span>
            </div>
          </div>
        </section>

        {/* Khu vực Biểu đồ & Danh sách đơn hàng mới */}
        <section className="dashboard-content">
          <div className="chart-wrapper">
            <div className="card-header">
              <h3>Biểu đồ doanh thu (VNĐ)</h3>
              <select className="chart-filter">
                <option>7 ngày qua</option>
                <option>30 ngày qua</option>
              </select>
            </div>
            <div className="chart-body">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="recent-orders">
            <div className="card-header">
              <h3>Đơn hàng mới nhất</h3>
              <button className="view-all">Xem tất cả</button>
            </div>
            <div className="order-list">
              {[
                { id: "#RT102", user: "Nguyễn Văn A", total: "15.000.000đ", status: "Chờ duyệt" },
                { id: "#RT101", user: "Trần Thị B", total: "2.450.000đ", status: "Đã giao" },
                { id: "#RT100", user: "Lê Văn C", total: "8.900.000đ", status: "Đang giao" },
              ].map((order, i) => (
                <div key={i} className="order-item">
                  <div className="order-info">
                    <strong>{order.id}</strong>
                    <span>{order.user}</span>
                  </div>
                  <div className="order-meta text-right">
                    <strong>{order.total}</strong>
                    <span className={`status-pill ${order.status === "Đã giao" ? "success" : "pending"}`}>
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

export default AdminDashboard;