import React from 'react';

function StatsCard({ icon, title, value, color, trend }) {
  return (
    <div className="stat-card" style={{ background: `linear-gradient(135deg, ${color}dd 0%, ${color} 100%)` }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{icon}</div>
        <h3 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0.5rem 0' }}>{value}</h3>
        <p style={{ fontSize: '1rem', opacity: '0.9', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
          {title}
        </p>
        {trend && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: '0.8' }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
