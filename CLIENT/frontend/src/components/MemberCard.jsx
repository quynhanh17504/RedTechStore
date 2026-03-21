import React from 'react';
import { Award, Star, ShieldCheck } from 'lucide-react';
import './MemberCard.css';

const MemberCard = ({ user }) => {
    // Logic xác định màu thẻ dựa trên Rank
    const getRankStyle = (rank) => {
        switch (rank?.toLowerCase()) {
            case 'gold': return 'card-gold';
            case 'silver': return 'card-silver';
            default: return 'card-standard';
        }
    };

    return (
        <div className={`redtech-card ${getRankStyle(user.member_rank)}`}>
            <div className="card-header">
                <div className="brand-logo">RedTech <span>Store</span></div>
                <div className="rank-badge">
                    <Award size={16} /> {user.member_rank || 'Member'}
                </div>
            </div>

            <div className="card-body">
                <p className="label">Chủ thẻ</p>
                <h2 className="user-name">{user.fullname}</h2>
                <p className="user-email">{user.email}</p>
            </div>

            <div className="card-footer">
                <div className="points-info">
                    <Star size={18} color="#ffd700" fill="#ffd700" />
                    <span>{user.total_points || 0} Điểm tích lũy</span>
                </div>
                <div className="verify-icon">
                    <ShieldCheck size={24} />
                </div>
            </div>
            
            {/* Hiệu ứng bóng mờ trang trí */}
            <div className="card-bg-circle"></div>
        </div>
    );
};

export default MemberCard;