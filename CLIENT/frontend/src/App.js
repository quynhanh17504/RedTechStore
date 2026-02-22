import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; 
import { Toaster } from 'react-hot-toast'; 

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Cart from './pages/Cart';
import Auth from './pages/Auth';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import './App.css';

function App() {
  // Google Client ID của bạn
  const GOOGLE_CLIENT_ID = "408823759078-80ovjpj669bslqn41g88r3bguca2i1bf.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="app-wrapper">
          {/* Cấu hình Toaster để hiển thị thông báo đẹp mắt */}
          <Toaster 
            position="top-center" 
            reverseOrder={false} 
            toastOptions={{
              style: {
                fontFamily: 'Cabin, sans-serif', // Sử dụng font Cabin như yêu cầu
                fontSize: '14px',
                borderRadius: '8px',
              }
            }}
          />

          <Navbar />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Auth />} />
              {/* Bạn có thể thêm trang 404 element={<NotFound />} ở đây */}
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;