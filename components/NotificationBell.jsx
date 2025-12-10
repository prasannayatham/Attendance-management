import React, { useState, useEffect, useRef } from 'react';
import { Badge } from 'react-bootstrap';
import axios from 'axios';

function NotificationBell({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`/api/notifications?userId=${userId}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}`, { read: true });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          fontSize: '1.3rem',
          cursor: 'pointer',
          padding: '0.6rem',
          borderRadius: '8px',
          position: 'relative',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        🔔
        {unreadCount > 0 && (
          <Badge 
            bg="danger" 
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              fontSize: '0.7rem',
              padding: '0.25rem 0.4rem',
              borderRadius: '10px'
            }}
          >
            {unreadCount}
          </Badge>
        )}
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: 0,
          background: 'white',
          minWidth: '320px',
          maxWidth: '400px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          borderRadius: '12px',
          padding: '1rem',
          zIndex: 1000,
          animation: 'dropdownSlide 0.3s ease-out'
        }}>
          <h6 style={{ 
            margin: '0 0 1rem 0', 
            color: '#1e3a8a',
            fontWeight: '700',
            fontSize: '1.1rem'
          }}>
            Notifications
          </h6>
          {notifications.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
              <p style={{ margin: 0, fontWeight: '500' }}>No notifications yet</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>You're all caught up!</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif._id}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  background: !notif.read ? '#eff6ff' : '#f8fafc',
                  borderLeft: !notif.read ? '3px solid #3b82f6' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => markAsRead(notif._id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dbeafe';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = !notif.read ? '#eff6ff' : '#f8fafc';
                }}
              >
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.9rem',
                  color: '#1e293b',
                  fontWeight: !notif.read ? '600' : '400'
                }}>
                  {notif.message}
                </p>
                <small style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  {new Date(notif.createdAt).toLocaleString()}
                </small>
              </div>
            ))
          )}
          {notifications.length > 0 && (
          <button
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              marginTop: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            View All Notifications
          </button>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
