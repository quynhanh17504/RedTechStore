import React from 'react';
import { Award, Star, ShieldCheck, Zap } from 'lucide-react';
import './MemberCard.css';

const MemberCard = ({ user }) => {
    const getRankClass = (rank) => {
        const r = rank?.toLowerCase();
        if (r === 'silver') return 'card-silver';
        if (r === 'gold') return 'card-gold';
        if (r === 'platinum') return 'card-platinum';
        return 'card-standard'; 
    };

    return (
        <div className={`redtech-card ${getRankClass(user.member_rank)}`}>
            <div className="card-header">
                <div className="card-brand-logo">RedTech <span>Store</span></div>
                <div className="card-rank-badge">
                    {user.member_rank === 'Platinum' ? <Zap size={14} /> : <Award size={14} />}
                    <span className="card-rank-name">{user.member_rank || 'Member'}</span>
                </div>
            </div>

            <div className="card-body">
                <div className="card-user-info">
                    <p className="card-label">Chủ thẻ</p>
                    <h2 className="card-user-name">{user.fullname || 'Khách hàng'}</h2>
                    <p className="card-user-email">{user.email}</p>
                </div>
            </div>

            <div className="card-footer">
                <div className="card-points-info">
                    <Star 
                        size={18} 
                        color={user.member_rank === 'Gold' ? '#443405' : '#ffd700'} 
                        fill={user.member_rank === 'Gold' ? '#443405' : '#ffd700'} 
                    />
                    <span>{Number(user.total_points || 0).toLocaleString()} Điểm tích lũy</span>
                </div>
                <div className="card-verify-icon">
                    <ShieldCheck size={24} />
                </div>
            </div>
            
            <div className="card-bg-circle"></div>
            <div className="card-shine"></div>
        </div>
    );
};

export default MemberCard;