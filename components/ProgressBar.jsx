import React from 'react';

function ProgressBar({ percentage, label, color = '#3b82f6' }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '0.5rem',
        alignItems: 'center'
      }}>
        <span style={{ 
          fontWeight: '600', 
          color: '#1e293b',
          fontSize: '0.95rem'
        }}>
          {label}
        </span>
        <span style={{ 
          fontWeight: '700', 
          color: color,
          fontSize: '1.1rem'
        }}>
          {percentage}%
        </span>
      </div>
      <div style={{
        width: '100%',
        height: '12px',
        background: '#e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
          borderRadius: '10px',
          transition: 'width 1s ease-out',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shimmer 2s infinite'
          }} />
        </div>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export default ProgressBar;
