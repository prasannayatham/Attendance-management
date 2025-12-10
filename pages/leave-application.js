import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function LeaveApplication({ user, setUser, isDarkMode, setIsDarkMode }) {
  const router = useRouter();
  const [leaveRequest, setLeaveRequest] = useState({
    name: '',
    studentId: '',
    section: '',
    reason: '',
    fromDate: '',
    toDate: '',
    contactNumber: '',
    leaveType: 'sick',
    proof: null
  });
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'student') {
      router.push('/');
      return;
    }
    setLeaveRequest(prev => ({
      ...prev,
      name: user.name,
      studentId: user.studentId,
      section: user.section
    }));
  }, [user, router]);

  const handleChange = (e) => {
    setLeaveRequest({
      ...leaveRequest,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setAlert({ show: true, message: 'File size should not exceed 5MB', variant: 'danger' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLeaveRequest({ ...leaveRequest, proof: reader.result });
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/leave-requests', {
        ...leaveRequest,
        studentId: user._id
      });
      setAlert({ show: true, message: 'Leave request submitted successfully!', variant: 'success' });
      setTimeout(() => {
        router.push('/dashboard/student');
      }, 2000);
    } catch (error) {
      setAlert({ show: true, message: 'Error submitting leave request', variant: 'danger' });
    }
  };

  if (!user) return null;

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar user={user} setUser={setUser} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <div className="content">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Card.Body style={{ padding: '2.5rem' }}>
              <h2 style={{ marginBottom: '2rem', color: '#1e3a8a', fontWeight: '700' }}>
                Leave Application Form
              </h2>

              {alert.show && (
                <Alert 
                  variant={alert.variant} 
                  onClose={() => setAlert({ show: false, message: '', variant: '' })} 
                  dismissible
                  style={{ marginBottom: '1.5rem' }}
                >
                  {alert.message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <Form.Group>
                    <Form.Label style={{ fontWeight: '600', color: '#64748b' }}>Student Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={leaveRequest.name}
                      readOnly
                      style={{ backgroundColor: '#f1f5f9' }}
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label style={{ fontWeight: '600', color: '#64748b' }}>Student ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="studentId"
                      value={leaveRequest.studentId}
                      readOnly
                      style={{ backgroundColor: '#f1f5f9' }}
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label style={{ fontWeight: '600', color: '#64748b' }}>Section</Form.Label>
                    <Form.Control
                      type="text"
                      name="section"
                      value={leaveRequest.section}
                      readOnly
                      style={{ backgroundColor: '#f1f5f9' }}
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label style={{ fontWeight: '600', color: '#64748b' }}>Leave Type *</Form.Label>
                    <Form.Select
                      name="leaveType"
                      value={leaveRequest.leaveType}
                      onChange={handleChange}
                      required
                    >
                      <option value="sick">Sick Leave</option>
                      <option value="casual">Casual Leave</option>
                      <option value="emergency">Emergency Leave</option>
                      <option value="medical">Medical Leave</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group>
                    <Form.Label style={{ fontWeight: '600', color: '#64748b' }}>From Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="fromDate"
                      value={leaveRequest.fromDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </Form.Group>

                  <Form.Group>
                    <Form.Label style={{ fontWeight: '600', color: '#64748b' }}>To Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="toDate"
                      value={leaveRequest.toDate}
                      onChange={handleChange}
                      min={leaveRequest.fromDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </Form.Group>
                </div>

                <Form.Group style={{ marginTop: '1.5rem' }}>
                  <Form.Label style={{ fontWeight: '600', color: '#64748b' }}>Contact Number *</Form.Label>
                  <Form.Control
                    type="tel"
                    name="contactNumber"
                    value={leaveRequest.contactNumber}
                    onChange={handleChange}
                    placeholder="Enter 10-digit mobile number"
                    pattern="[0-9]{10}"
                    required
                  />
                  <Form.Text className="text-muted">
                    Enter 10-digit mobile number
                  </Form.Text>
                </Form.Group>

                <Form.Group style={{ marginTop: '1.5rem' }}>
                  <Form.Label style={{ fontWeight: '600', color: '#64748b' }}>Reason for Leave *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="reason"
                    value={leaveRequest.reason}
                    onChange={handleChange}
                    placeholder="Provide detailed reason for leave"
                    required
                  />
                </Form.Group>

                <Form.Group style={{ marginTop: '1.5rem' }}>
                  <Form.Label style={{ fontWeight: '600', color: '#64748b' }}>
                    Attach Proof (Medical Certificate/Document)
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                  />
                  <Form.Text className="text-muted">
                    Upload medical certificate or supporting document (Max 5MB, PDF or Image)
                  </Form.Text>
                  {previewUrl && (
                    <div style={{ marginTop: '1rem' }}>
                      {leaveRequest.proof?.startsWith('data:image') ? (
                        <img 
                          src={previewUrl} 
                          alt="Proof Preview" 
                          style={{ 
                            maxWidth: '300px', 
                            maxHeight: '300px',
                            borderRadius: '8px',
                            border: '2px solid #e2e8f0'
                          }} 
                        />
                      ) : (
                        <div style={{ 
                          padding: '1rem', 
                          background: '#f1f5f9', 
                          borderRadius: '8px',
                          display: 'inline-block'
                        }}>
                          📄 PDF Document Attached
                        </div>
                      )}
                    </div>
                  )}
                </Form.Group>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <Button 
                    type="submit" 
                    className="btn-primary"
                    style={{ flex: 1 }}
                  >
                    Submit Leave Request
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => router.push('/dashboard/student')}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
