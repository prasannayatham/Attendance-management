import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Card, Table, Tabs, Tab, Button, Modal, Form, Alert } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function StudentDashboard({ user, setUser }) {
  const [attendance, setAttendance] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [examSchedule, setExamSchedule] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    studentId: user?.studentId || '',
    branch: user?.branch || '',
    section: user?.section || '',
    profilePicture: user?.profilePicture || ''
  });
  const [leaveRequest, setLeaveRequest] = useState({
    name: user?.name || '',
    studentId: user?.studentId || '',
    section: user?.section || '',
    reason: '',
    fromDate: '',
    toDate: '',
    contactNumber: '',
    leaveType: 'sick'
  });
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const [notifications, setNotifications] = useState([]);
  const [readAnnouncements, setReadAnnouncements] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchAttendance();
      fetchSchedule();
      fetchAnnouncements();
      fetchExamSchedule();
    }
  }, [user]);

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`/api/attendance?studentId=${user.studentId}`);
      setAttendance(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`/api/schedule?section=${user.section}`);
      setSchedule(response.data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('/api/announcements');
      setAnnouncements(response.data);
      const stored = JSON.parse(localStorage.getItem('readAnnouncements') || '[]');
      setReadAnnouncements(stored);
      const unread = response.data.filter(a => !stored.includes(a._id));
      setNotifications(unread.map(a => ({ id: a._id, msg: `New: ${a.title}`, type: 'info' })));
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchExamSchedule = async () => {
    try {
      const response = await axios.get(`/api/exam-schedule/${user.branch}`);
      setExamSchedule(response.data);
    } catch (error) {
      console.error('Error fetching exam schedule:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/users/${user._id}`, profile);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setShowProfileModal(false);
      setAlert({ show: true, message: 'Profile updated successfully!', variant: 'success' });
    } catch (error) {
      setAlert({ show: true, message: 'Error updating profile', variant: 'danger' });
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLeaveChange = (e) => {
    setLeaveRequest({
      ...leaveRequest,
      [e.target.name]: e.target.value
    });
  };

  const [myLeaveRequests, setMyLeaveRequests] = useState([]);

  const fetchMyLeaveRequests = async () => {
    try {
      const response = await axios.get(`/api/leave-requests?studentId=${user._id}`);
      setMyLeaveRequests(response.data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyLeaveRequests();
    }
  }, [user]);

  const submitLeaveRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/leave-requests', {
        ...leaveRequest,
        studentId: user._id
      });
      setShowLeaveModal(false);
      setLeaveRequest({ 
        name: user?.name || '',
        studentId: user?.studentId || '',
        section: user?.section || '',
        reason: '', 
        fromDate: '', 
        toDate: '',
        contactNumber: '',
        leaveType: 'sick'
      });
      setAlert({ show: true, message: 'Leave request submitted successfully!', variant: 'success' });
      fetchMyLeaveRequests();
    } catch (error) {
      setAlert({ show: true, message: 'Error submitting leave request', variant: 'danger' });
    }
  };

  // Chart data
  const attendanceData = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        label: 'Attendance',
        data: [
          attendance.filter(record => record.status === 'present').length,
          attendance.filter(record => record.status === 'absent').length
        ],
        backgroundColor: ['#28a745', '#dc3545'],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Attendance Overview',
      },
    },
  };

  const markAnnouncementRead = (id) => {
    const updated = [...readAnnouncements, id];
    setReadAnnouncements(updated);
    localStorage.setItem('readAnnouncements', JSON.stringify(updated));
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const scrollToAnnouncements = () => {
    const element = document.getElementById('announcements-tab');
    if (element) element.click();
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h2>Student Dashboard</h2>
        <div className="dashboard-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Button variant="outline-primary" onClick={() => setShowProfileModal(true)}>
            Edit Profile
          </Button>
          <Button variant="outline-success" onClick={() => router.push('/leave-application')}>
            Apply for Leave
          </Button>
        </div>
      </div>

      {alert.show && (
        <Alert variant={alert.variant} onClose={() => setAlert({ show: false, message: '', variant: '' })} dismissible>
          {alert.message}
        </Alert>
      )}

      <Tabs defaultActiveKey="attendance" id="student-dashboard-tabs">
        <Tab eventKey="attendance" title="Attendance">
          <Card>
            <Card.Body>
              <Card.Title>Attendance Records</Card.Title>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record) => (
                    <tr key={record._id}>
                      <td>{new Date(record.date).toLocaleDateString()}</td>
                      <td>{record.subject || 'N/A'}</td>
                      <td style={{ color: record.status === 'present' ? 'green' : 'red' }}>
                        {record.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          <Card className="mt-4">
            <Card.Body>
              <Card.Title>Attendance Overview</Card.Title>
              <Bar data={attendanceData} options={options} />
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="schedule" title="Schedule">
          <Card>
            <Card.Body>
              <Card.Title>Class Schedule</Card.Title>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((classItem) => (
                    <tr key={classItem._id}>
                      <td>{classItem.day}</td>
                      <td>{classItem.time}</td>
                      <td>{classItem.subject}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="leave-requests" title="My Leave Requests">
          <Card>
            <Card.Body>
              <Card.Title>Leave Application History</Card.Title>
              {myLeaveRequests.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>From Date</th>
                      <th>To Date</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Submitted On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeaveRequests.map((req) => (
                      <tr key={req._id}>
                        <td style={{ textTransform: 'capitalize' }}>{req.leaveType}</td>
                        <td>{new Date(req.fromDate).toLocaleDateString()}</td>
                        <td>{new Date(req.toDate).toLocaleDateString()}</td>
                        <td>{req.reason}</td>
                        <td>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            backgroundColor: req.status === 'approved' ? '#d1fae5' : req.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                            color: req.status === 'approved' ? '#065f46' : req.status === 'rejected' ? '#991b1b' : '#92400e'
                          }}>
                            {req.status}
                          </span>
                        </td>
                        <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No leave requests found.</p>
              )}
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="announcements" title="Announcements" id="announcements-tab">
          <Card>
            <Card.Body>
              <Card.Title>Announcements</Card.Title>
              {notifications.length > 0 && (
                <Alert variant="info" className="mb-3">
                  <strong>Important Messages:</strong> You have {notifications.length} unread announcement(s).
                </Alert>
              )}
              {announcements.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Content</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map((ann) => (
                      <tr key={ann._id}>
                        <td>{ann.title}</td>
                        <td>{ann.content}</td>
                        <td>{new Date(ann.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No announcements available.</p>
              )}
              <Card className="mt-4">
                <Card.Body>
                  <Card.Title>Exam Schedule</Card.Title>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Exam Type</th>
                        <th>Datesheet Type</th>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Slot No</th>
                        <th>UID</th>
                        <th>Exam Date</th>
                        <th>Exam Timing</th>
                        <th>Exam Venue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examSchedule.map((exam, index) => (
                        <tr key={index}>
                          <td>{exam.examType}</td>
                          <td>{exam.datesheettype}</td>
                          <td>{exam.courseCode}</td>
                          <td>{exam.courseName}</td>
                          <td>{exam.slotNo}</td>
                          <td>{exam.uid}</td>
                          <td>{exam.examDate}</td>
                          <td>{exam.examTiming}</td>
                          <td>{exam.examVenue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleProfileUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Student ID</Form.Label>
              <Form.Control
                type="text"
                value={profile.studentId}
                onChange={(e) => setProfile({ ...profile, studentId: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Branch</Form.Label>
              <Form.Control
                type="text"
                value={profile.branch}
                onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Section</Form.Label>
              <Form.Control
                type="text"
                value={profile.section}
                onChange={(e) => setProfile({ ...profile, section: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Profile Picture</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
              />
              {profile.profilePicture && (
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  className="profile-picture-preview"
                  style={{ maxWidth: '100px', marginTop: '10px' }}
                />
              )}
            </Form.Group>
            <Button className="btn-danger" type="submit">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={showLeaveModal} onHide={() => setShowLeaveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Apply for Leave</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitLeaveRequest}>
            <Form.Group className="mb-3">
              <Form.Label>Student Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={leaveRequest.name}
                onChange={handleLeaveChange}
                required
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Student ID</Form.Label>
              <Form.Control
                type="text"
                name="studentId"
                value={leaveRequest.studentId}
                onChange={handleLeaveChange}
                required
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Section</Form.Label>
              <Form.Control
                type="text"
                name="section"
                value={leaveRequest.section}
                onChange={handleLeaveChange}
                required
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Leave Type</Form.Label>
              <Form.Select
                name="leaveType"
                value={leaveRequest.leaveType}
                onChange={handleLeaveChange}
                required
              >
                <option value="sick">Sick Leave</option>
                <option value="casual">Casual Leave</option>
                <option value="emergency">Emergency Leave</option>
                <option value="medical">Medical Leave</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>From Date</Form.Label>
              <Form.Control
                type="date"
                name="fromDate"
                value={leaveRequest.fromDate}
                onChange={handleLeaveChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>To Date</Form.Label>
              <Form.Control
                type="date"
                name="toDate"
                value={leaveRequest.toDate}
                onChange={handleLeaveChange}
                min={leaveRequest.fromDate || new Date().toISOString().split('T')[0]}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control
                type="tel"
                name="contactNumber"
                value={leaveRequest.contactNumber}
                onChange={handleLeaveChange}
                placeholder="Enter your contact number"
                pattern="[0-9]{10}"
                required
              />
              <Form.Text className="text-muted">
                Enter 10-digit mobile number
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reason for Leave</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="reason"
                value={leaveRequest.reason}
                onChange={handleLeaveChange}
                placeholder="Provide detailed reason for leave"
                required
              />
            </Form.Group>
            <Button type="submit" className="btn-primary">
              Submit Leave Request
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default StudentDashboard;