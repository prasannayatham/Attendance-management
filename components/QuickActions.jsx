import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';

function QuickActions({ role }) {
  const studentActions = [
    { icon: '📊', title: 'View Attendance', desc: 'Check your attendance records', color: '#3b82f6' },
    { icon: '📅', title: 'Class Schedule', desc: 'View your timetable', color: '#10b981' },
    { icon: '📢', title: 'Announcements', desc: 'Latest updates', color: '#f59e0b' },
    { icon: '📝', title: 'Leave Request', desc: 'Apply for leave', color: '#ef4444' }
  ];

  const facultyActions = [
    { icon: '✅', title: 'Mark Attendance', desc: 'Quick attendance marking', color: '#10b981' },
    { icon: '👥', title: 'Student List', desc: 'View all students', color: '#3b82f6' },
    { icon: '📅', title: 'Manage Schedule', desc: 'Create/Edit schedule', color: '#8b5cf6' },
    { icon: '📢', title: 'Post Announcement', desc: 'Share updates', color: '#f59e0b' }
  ];

  const actions = role === 'student' ? studentActions : facultyActions;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#1e3a8a', fontWeight: '700' }}>Quick Actions</h3>
      <Row>
        {actions.map((action, index) => (
          <Col key={index} xs={12} sm={6} md={3} style={{ marginBottom: '1rem' }}>
            <Card 
              style={{ 
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                height: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
              }}
            >
              <Card.Body style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                }}>
                  {action.icon}
                </div>
                <h5 style={{ 
                  color: action.color, 
                  fontWeight: '700',
                  marginBottom: '0.5rem',
                  fontSize: '1.1rem'
                }}>
                  {action.title}
                </h5>
                <p style={{ 
                  color: '#64748b', 
                  fontSize: '0.9rem',
                  margin: 0
                }}>
                  {action.desc}
                </p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default QuickActions;
