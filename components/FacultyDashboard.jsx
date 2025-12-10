import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Button, Table, Modal, Form, Badge, Tabs, Tab, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { FaUsers, FaCalendarCheck, FaChartBar, FaClipboardList, FaBullhorn, FaBook, FaDownload, FaUpload, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Navbar from './Navbar';
import Footer from './Footer';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

function FacultyDashboard({ user, setUser }) {
  // Student & Section Management
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Attendance Management
  const [attendance, setAttendance] = useState({});
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [analytics, setAnalytics] = useState({});
  
  // Schedule Management
  const [schedule, setSchedule] = useState([]);
  const [newSchedule, setNewSchedule] = useState({ day: '', startTime: '', endTime: '', subject: '', section: '' });
  const [editScheduleId, setEditScheduleId] = useState(null);
  const [showAutoScheduleModal, setShowAutoScheduleModal] = useState(false);
  const [autoSchedule, setAutoSchedule] = useState({
    section: '',
    subject: '',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startTime: '09:00',
    endTime: '10:00'
  });
  const [selectedScheduleSection, setSelectedScheduleSection] = useState('');
  
  // Announcements
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  
  // Leave Requests
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState(null);
  const [leaveAction, setLeaveAction] = useState('');
  const [deleteLeaveId, setDeleteLeaveId] = useState(null);
  
  // Profile
  const [profile, setProfile] = useState({ 
    name: user?.name || '', 
    email: user?.email || '', 
    profilePicture: user?.profilePicture || '' 
  });
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [showStudentList, setShowStudentList] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  // Modal States
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showLeaveActionModal, setShowLeaveActionModal] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [showDeleteLeaveModal, setShowDeleteLeaveModal] = useState(false);
  const [showEditAnnouncementModal, setShowEditAnnouncementModal] = useState(false);
  const [showDeleteAnnouncementModal, setShowDeleteAnnouncementModal] = useState(false);
  const [showEditAttendanceModal, setShowEditAttendanceModal] = useState(false);
  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState(false);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState(null);



  // Fetch Initial Data
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch students (required)
        const studentsRes = await axios.get(`${API_BASE}/users`).catch(() => ({ data: [] }));
        setStudents(studentsRes.data);
        
        // Extract unique sections and branches from students data
        const uniqueSections = [...new Set(studentsRes.data.map(s => s.section).filter(Boolean))];
        const uniqueBranches = [...new Set(studentsRes.data.map(s => s.branch).filter(Boolean))];
        setSections(uniqueSections);
        setBranches(uniqueBranches);

        // Fetch optional data (won't break if endpoints don't exist)
        const scheduleRes = await axios.get(`${API_BASE}/schedule`).catch(() => ({ data: [] }));
        setSchedule(scheduleRes.data);
        
        const announcementsRes = await axios.get(`${API_BASE}/announcements`).catch(() => ({ data: [] }));
        setAnnouncements(announcementsRes.data);
        
        const attendanceRes = await axios.get(`${API_BASE}/attendance`).catch(() => ({ data: [] }));
        setAttendanceHistory(attendanceRes.data);
        
        const leaveRes = await axios.get(`${API_BASE}/leave-request`).catch(() => ({ data: [] }));
        setLeaveRequests(leaveRes.data);
        
        const leaveHistoryRes = await axios.get(`${API_BASE}/leave-requests`).catch(() => ({ data: [] }));
        setLeaveHistory(leaveHistoryRes.data);
        
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchAllData();
  }, [user?._id]);

  // Filtered Students with Memoization
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const sectionMatch = !selectedSection || selectedSection === 'all' || student.section === selectedSection;
      const branchMatch = selectedBranch === 'all' || student.branch === selectedBranch;
      return sectionMatch && branchMatch;
    });
  }, [students, selectedSection, selectedBranch]);

  // Extract unique subjects from schedule
  const uniqueSubjects = useMemo(() => {
    return [...new Set(schedule.map(s => s.subject).filter(Boolean))];
  }, [schedule]);

  // Timetable Grid Data
  const timetableData = useMemo(() => {
    if (!selectedScheduleSection) return {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const filtered = schedule.filter(s => s.section === selectedScheduleSection);
    const grouped = {};
    filtered.forEach(item => {
      if (!grouped[item.time]) grouped[item.time] = {};
      grouped[item.time][item.day] = item;
    });
    return grouped;
  }, [schedule, selectedScheduleSection]);

  // Summary Calculation
  const summary = useMemo(() => {
    const count = { present: 0, absent: 0 };
    Object.values(attendance).forEach(status => {
      if (status === 'present') count.present++;
      if (status === 'absent') count.absent++;
    });
    return count;
  }, [attendance]);

  // Analytics Data for Chart
  const analyticsData = useMemo(() => ({
    labels: filteredStudents.map(s => s.name),
    datasets: [
      {
        label: 'Present',
        data: filteredStudents.map(s => analytics[s.studentId]?.present || 0),
        backgroundColor: '#10b981',
      },
      {
        label: 'Absent',
        data: filteredStudents.map(s => analytics[s.studentId]?.absent || 0),
        backgroundColor: '#ef4444',
      },
    ],
  }), [filteredStudents, analytics]);

  // Attendance Handlers
  const handleFilter = useCallback(async () => {
    if (!selectedDate || new Date(selectedDate).toString() === 'Invalid Date') {
      alert('Please select a valid date.');
      return;
    }
    if (!selectedSection) {
      alert('Please select a section.');
      return;
    }

    try {
      setShowStudentList(true);
      const [dateAttendanceRes, analyticsRes] = await Promise.all([
        axios.get(`${API_BASE}/attendance?date=${selectedDate}&section=${selectedSection}`),
        axios.get(`${API_BASE}/attendance?section=${selectedSection}&startDate=${new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() - 30)).toISOString()}&endDate=${selectedDate}`)
      ]);

      const initialAttendance = dateAttendanceRes.data.reduce((acc, record) => {
        acc[record.studentId] = record.status;
        return acc;
      }, {});
      setAttendance(initialAttendance);

      const analyticsData = analyticsRes.data.reduce((acc, record) => {
        acc[record.studentId] = acc[record.studentId] || { present: 0, absent: 0 };
        acc[record.studentId][record.status]++;
        return acc;
      }, {});
      setAnalytics(analyticsData);
      
      const hasExistingRecords = dateAttendanceRes.data.length > 0;
      setHasSubmitted(hasExistingRecords);
      setIsEditMode(false);
      
      if (filteredStudents.length === 0) {
        alert('No students found for selected filters.');
      }
    } catch (err) {
      alert('Failed to filter students: ' + (err.response?.data?.msg || err.message));
    }
  }, [selectedDate, selectedSection, filteredStudents.length]);

  const handleAttendanceChange = useCallback((studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  }, []);

  const markAllPresent = useCallback(() => {
    const allPresent = {};
    filteredStudents.forEach(student => {
      allPresent[student.studentId] = 'present';
    });
    setAttendance(allPresent);
  }, [filteredStudents]);

  const markAllAbsent = useCallback(() => {
    const allAbsent = {};
    filteredStudents.forEach(student => {
      allAbsent[student.studentId] = 'absent';
    });
    setAttendance(allAbsent);
  }, [filteredStudents]);

  const clearAllAttendance = useCallback(() => {
    setAttendance({});
  }, []);

  const submitAttendance = useCallback(async (isEdit = false) => {
    if (!selectedSection || !selectedDate) {
      alert('Please select a section and date.');
      return;
    }
    if (Object.keys(attendance).length === 0) {
      alert('No attendance data to submit.');
      return;
    }

    try {
      const existingRes = await axios.get(`${API_BASE}/attendance?date=${selectedDate}&section=${selectedSection}`);
      const existingRecords = existingRes.data;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(selectedDate);
      selected.setHours(0, 0, 0, 0);

      if (selected < today && existingRecords.length === 0 && !isEdit) {
        alert('Cannot submit attendance for past dates.');
        return;
      }

      if (existingRecords.length > 0 && !isEdit) {
        setShowEditAttendanceModal(true);
        return;
      }

      const subject = selectedSubject || user.subject || 'Default Subject';
      await Promise.all(
        Object.entries(attendance).map(([studentId, status]) => {
          const studentRecord = existingRecords.find(record => record.studentId === studentId);
          const payload = { studentId, section: selectedSection, subject, status, date: selectedDate };
          return studentRecord 
            ? axios.put(`${API_BASE}/attendance/${studentRecord._id}`, payload)
            : axios.post(`${API_BASE}/attendance`, payload);
        })
      );

      const historyRes = await axios.get(`${API_BASE}/attendance`);
      setAttendanceHistory(historyRes.data);
      alert(`Attendance ${isEdit ? 'updated' : 'submitted'} successfully!`);
      setShowEditAttendanceModal(false);
      setShowConfirmSubmitModal(false);
      setShowAttendanceModal(false);
      setHasSubmitted(true);
      setIsEditMode(false);
    } catch (err) {
      alert(`Failed to submit attendance: ${err.message}`);
    }
  }, [selectedSection, selectedDate, attendance, selectedSubject, user.subject]);

  const exportAttendance = useCallback(() => {
    const csv = [
      ['StudentID', 'Name', 'Section', 'Branch', 'Status'],
      ...filteredStudents.map(student => [
        student.studentId,
        student.name,
        student.section,
        student.branch,
        attendance[student.studentId] || '',
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_template_${selectedSection}_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert('Attendance template exported successfully!');
  }, [filteredStudents, attendance, selectedDate, selectedSection]);

  const downloadTemplate = useCallback(() => {
    const csv = [
      ['StudentID', 'Name', 'Section', 'Branch', 'Status'],
      ...filteredStudents.map(student => [
        student.studentId,
        student.name,
        student.section,
        student.branch,
        '',
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_template_${selectedSection}_${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert('Template downloaded successfully!');
  }, [filteredStudents, selectedDate, selectedSection]);

  const handleUpload = useCallback(async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a CSV file.');
      return;
    }

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('CSV file is empty or invalid.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const statusIndex = headers.findIndex(h => h.toLowerCase() === 'status');
      const studentIdIndex = headers.findIndex(h => h.toLowerCase() === 'studentid');

      if (statusIndex === -1 || studentIdIndex === -1) {
        alert('CSV must have StudentID and Status columns.');
        return;
      }

      const uploadedAttendance = {};
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const studentId = values[studentIdIndex];
        const status = values[statusIndex].toLowerCase();
        
        if (studentId && (status === 'present' || status === 'absent')) {
          uploadedAttendance[studentId] = status;
        }
      }

      setAttendance(uploadedAttendance);
      alert(`Attendance loaded from CSV! ${Object.keys(uploadedAttendance).length} students marked.`);
      setFile(null);
      setShowUploadModal(false);
    } catch (err) {
      alert('Failed to parse CSV: ' + err.message);
    }
  }, [file]);

  // Schedule Handlers
  const handleCreateSchedule = useCallback(async (e) => {
    e.preventDefault();
    
    // Handle custom subject selection
    if (newSchedule.subject === '__custom__') {
      const customSubject = prompt('Enter new subject name:');
      if (!customSubject || !customSubject.trim()) {
        alert('Subject name is required.');
        return;
      }
      setNewSchedule({ ...newSchedule, subject: customSubject.trim() });
      return;
    }
    
    const facultyId = user?._id || user?.id;
    if (!facultyId) {
      alert('User session expired. Please login again.');
      console.error('User object:', user);
      return;
    }
    
    try {
      const scheduleData = {
        day: newSchedule.day,
        time: `${newSchedule.startTime} - ${newSchedule.endTime}`,
        subject: newSchedule.subject,
        section: newSchedule.section,
        facultyId: facultyId
      };
      console.log('Sending schedule data:', scheduleData);
      await axios.post(`${API_BASE}/schedule`, scheduleData);
      setNewSchedule({ day: '', startTime: '', endTime: '', subject: '', section: '' });
      const res = await axios.get(`${API_BASE}/schedule`);
      setSchedule(res.data);
      alert('Schedule created successfully!');
    } catch (err) {
      console.error('Schedule creation error:', err.response?.data || err);
      alert('Failed to create schedule: ' + (err.response?.data?.msg || err.message));
    }
  }, [newSchedule, user]);

  const handleEditSchedule = useCallback((id) => {
    const scheduleToEdit = schedule.find(s => s._id === id);
    const [startTime, endTime] = scheduleToEdit.time?.includes('-') 
      ? scheduleToEdit.time.split('-').map(t => t.trim()) 
      : ['', ''];
    setNewSchedule({
      day: scheduleToEdit.day,
      startTime: startTime,
      endTime: endTime,
      subject: scheduleToEdit.subject,
      section: scheduleToEdit.section,
    });
    setEditScheduleId(id);
  }, [schedule]);

  const handleUpdateSchedule = useCallback(async (e) => {
    e.preventDefault();
    
    // Handle custom subject selection
    if (newSchedule.subject === '__custom__') {
      const customSubject = prompt('Enter new subject name:');
      if (!customSubject || !customSubject.trim()) {
        alert('Subject name is required.');
        return;
      }
      setNewSchedule({ ...newSchedule, subject: customSubject.trim() });
      return;
    }
    
    const facultyId = user?._id || user?.id;
    if (!facultyId) {
      alert('User session expired. Please login again.');
      return;
    }
    
    try {
      const scheduleData = {
        day: newSchedule.day,
        time: `${newSchedule.startTime} - ${newSchedule.endTime}`,
        subject: newSchedule.subject,
        section: newSchedule.section,
        facultyId: facultyId
      };
      await axios.put(`${API_BASE}/schedule/${editScheduleId}`, scheduleData);
      setNewSchedule({ day: '', startTime: '', endTime: '', subject: '', section: '' });
      setEditScheduleId(null);
      const res = await axios.get(`${API_BASE}/schedule`);
      setSchedule(res.data);
      alert('Schedule updated successfully!');
    } catch (err) {
      alert('Failed to update schedule: ' + (err.response?.data?.msg || err.message));
    }
  }, [editScheduleId, newSchedule, user]);

  const handleDeleteSchedule = useCallback(async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await axios.delete(`${API_BASE}/schedule/${id}`);
      const res = await axios.get(`${API_BASE}/schedule`);
      setSchedule(res.data);
      alert('Schedule deleted successfully!');
    } catch (err) {
      alert('Failed to delete schedule: ' + (err.response?.data?.msg || err.message));
    }
  }, []);

  const handleAutoGenerateSchedule = useCallback(async (e) => {
    e.preventDefault();
    const facultyId = user?._id || user?.id;
    if (!facultyId) {
      alert('User session expired. Please login again.');
      return;
    }

    try {
      const schedules = autoSchedule.days.map(day => ({
        day,
        time: `${autoSchedule.startTime} - ${autoSchedule.endTime}`,
        subject: autoSchedule.subject,
        section: autoSchedule.section,
        facultyId
      }));

      await Promise.all(schedules.map(s => axios.post(`${API_BASE}/schedule`, s)));
      const res = await axios.get(`${API_BASE}/schedule`);
      setSchedule(res.data);
      setShowAutoScheduleModal(false);
      setAutoSchedule({ section: '', subject: '', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], startTime: '09:00', endTime: '10:00' });
      alert(`Weekly timetable created successfully! ${schedules.length} classes added.`);
    } catch (err) {
      alert('Failed to generate schedule: ' + (err.response?.data?.msg || err.message));
    }
  }, [autoSchedule, user]);

  // Announcement Handlers
  const handleCreateAnnouncement = useCallback(async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/announcements`, { ...newAnnouncement, facultyId: user._id });
      setNewAnnouncement({ title: '', content: '' });
      const res = await axios.get(`${API_BASE}/announcements`);
      setAnnouncements(res.data);
      alert('Announcement posted successfully!');
    } catch (err) {
      alert('Failed to post announcement: ' + (err.response?.data?.msg || err.message));
    }
  }, [newAnnouncement, user._id]);

  const handleUpdateAnnouncement = useCallback(async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/announcements/${editAnnouncement._id}`, {
        title: editAnnouncement.title,
        content: editAnnouncement.content,
        facultyId: user._id,
      });
      setEditAnnouncement(null);
      setShowEditAnnouncementModal(false);
      const res = await axios.get(`${API_BASE}/announcements`);
      setAnnouncements(res.data);
      alert('Announcement updated successfully!');
    } catch (err) {
      alert('Failed to update announcement: ' + (err.response?.data?.msg || err.message));
    }
  }, [editAnnouncement, user._id]);

  const handleDeleteAnnouncement = useCallback(async () => {
    try {
      await axios.delete(`${API_BASE}/announcements/${deleteAnnouncementId}`, {
        data: { facultyId: user._id },
      });
      setShowDeleteAnnouncementModal(false);
      setDeleteAnnouncementId(null);
      const res = await axios.get(`${API_BASE}/announcements`);
      setAnnouncements(res.data);
      alert('Announcement deleted successfully!');
    } catch (err) {
      alert('Failed to delete announcement: ' + (err.response?.data?.msg || err.message));
    }
  }, [deleteAnnouncementId, user._id]);

  // Leave Request Handlers
  const handleLeaveAction = useCallback(async () => {
    try {
      await axios.put(`${API_BASE}/leave-request`, { id: selectedLeaveRequest._id, status: leaveAction });
      const [pendingRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE}/leave-request`),
        axios.get(`${API_BASE}/leave-requests`)
      ]);
      setLeaveRequests(pendingRes.data);
      setLeaveHistory(historyRes.data);
      setShowLeaveConfirmModal(false);
      setShowLeaveActionModal(false);
    } catch (err) {
      alert('Failed to update leave request: ' + (err.response?.data?.msg || err.message));
    }
  }, [selectedLeaveRequest, leaveAction]);

  const handleDeleteLeave = useCallback(async () => {
    try {
      await axios.delete(`${API_BASE}/leave-requests/${deleteLeaveId}`);
      const [pendingRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE}/leave-request`),
        axios.get(`${API_BASE}/leave-requests`)
      ]);
      setLeaveRequests(pendingRes.data);
      setLeaveHistory(historyRes.data);
      setShowDeleteLeaveModal(false);
      setDeleteLeaveId(null);
    } catch (err) {
      alert('Failed to delete leave request: ' + (err.response?.data?.msg || err.message));
    }
  }, [deleteLeaveId]);

  // Profile Handler
  const handleProfileUpdate = useCallback(async (e) => {
    e.preventDefault();
    try {
      const updatedUser = { ...user, name: profile.name, email: profile.email, profilePicture: profile.profilePicture };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowProfileModal(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.msg || err.message));
    }
  }, [user, profile, setUser]);

  const handleProfilePictureChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile(prev => ({ ...prev, profilePicture: reader.result }));
      reader.readAsDataURL(file);
    }
  }, []);

  return (
    <div className="app">
      <Navbar user={user} setUser={setUser} />
      
      <div className="content">
        <div className="dashboard-content">
          {/* Header */}
          <div className="dashboard-header mb-4">
            <div>
              <h2>Faculty Dashboard</h2>
              <p className="text-muted">Welcome back, <strong>{user?.name}</strong>!</p>
              <Badge bg="primary" className="me-2"><FaBook /> {user?.subject}</Badge>
              <Badge bg="info">{user?.branch}</Badge>
              <Button variant="outline-secondary" size="sm" className="ms-3" onClick={() => setShowProfileModal(true)}>
                <FaEdit /> Edit Profile
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <Row className="g-4 mb-4">
            <Col md={3}>
              <Card className="dashboard-card stat-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Total Students</p>
                      <h2 className="mb-0">{students.length}</h2>
                    </div>
                    <div className="stat-icon bg-primary">
                      <FaUsers size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="dashboard-card stat-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Sections</p>
                      <h2 className="mb-0">{sections.length}</h2>
                    </div>
                    <div className="stat-icon bg-success">
                      <FaClipboardList size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="dashboard-card stat-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Departments</p>
                      <h2 className="mb-0">{branches.length}</h2>
                    </div>
                    <div className="stat-icon bg-warning">
                      <FaBullhorn size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="dashboard-card stat-card">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1">Leave Requests</p>
                      <h2 className="mb-0">{leaveRequests.filter(r => r.status === 'pending').length}</h2>
                    </div>
                    <div className="stat-icon bg-danger">
                      <FaCalendarCheck size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tabs */}
          <Tabs defaultActiveKey="attendance" className="mb-4">
            {/* Attendance Tab */}
            <Tab eventKey="attendance" title="Mark Attendance">
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Attendance Management</Card.Title>
                  <Form>
                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Date</Form.Label>
                          <Form.Control
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Section</Form.Label>
                          <Form.Select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                            <option value="">Select Section</option>
                            {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Subject</Form.Label>
                          <Form.Select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                            <option value="">Select Subject</option>
                            <option value={user.subject}>{user.subject}</option>
                            {schedule.filter(s => s.section === selectedSection && s.subject !== user.subject)
                              .map(s => <option key={s._id} value={s.subject}>{s.subject}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Branch</Form.Label>
                          <Form.Select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                            <option value="all">All Branches</option>
                            {branches.map(branch => <option key={branch} value={branch}>{branch}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-flex gap-2 flex-wrap">
                      <Button variant="primary" onClick={handleFilter}>
                        <FaClipboardList /> Filter Students
                      </Button>
                      {showStudentList && (
                        <>
                          <Button variant="warning" onClick={clearAllAttendance} disabled={Object.keys(attendance).length === 0}>
                            Clear All
                          </Button>
                          <Button variant="info" onClick={() => setShowUploadModal(true)}>
                            <FaUpload /> Upload CSV
                          </Button>
                          <Button variant="secondary" onClick={downloadTemplate}>
                            <FaDownload /> Download Template
                          </Button>
                        </>
                      )}
                    </div>
                  </Form>

                  {!showStudentList && (
                    <Alert variant="info" className="mt-4">
                      <FaClipboardList size={20} className="me-2" />
                      Please select Date, Section, and Subject, then click "Filter Students" to view and mark attendance.
                    </Alert>
                  )}

                  {showStudentList && filteredStudents.length === 0 && (
                    <Alert variant="warning" className="mt-4">
                      No students found for the selected filters. Please check your selection.
                    </Alert>
                  )}

                  {showStudentList && filteredStudents.length > 0 && (
                    <>
                      <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
                        <h5 className="mb-0">{hasSubmitted && !isEditMode ? 'Attendance Record' : 'Mark Attendance'} ({filteredStudents.length} Students)</h5>
                        <div>
                          {hasSubmitted && !isEditMode ? (
                            <Button 
                              variant="warning" 
                              onClick={() => setIsEditMode(true)}
                            >
                              <FaEdit /> Edit Attendance
                            </Button>
                          ) : (
                            <Button 
                              variant="primary" 
                              onClick={() => submitAttendance()}
                              disabled={Object.keys(attendance).length === 0}
                            >
                              <FaCalendarCheck /> Submit Attendance ({Object.keys(attendance).length} marked)
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="table-responsive">
                        <Table striped bordered hover>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Student ID</th>
                              <th>Name</th>
                              <th>Section</th>
                              <th>Branch</th>
                              <th className="text-center">
                                {hasSubmitted && !isEditMode ? (
                                  'Status'
                                ) : (
                                  <div className="d-flex align-items-center justify-content-center gap-3">
                                    <div>
                                      <Form.Check
                                        type="checkbox"
                                        label="All Present"
                                        onChange={(e) => e.target.checked ? markAllPresent() : clearAllAttendance()}
                                        className="text-success"
                                      />
                                    </div>
                                    <div>
                                      <Form.Check
                                        type="checkbox"
                                        label="All Absent"
                                        onChange={(e) => e.target.checked ? markAllAbsent() : clearAllAttendance()}
                                        className="text-danger"
                                      />
                                    </div>
                                  </div>
                                )}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStudents.map((student, idx) => (
                              <tr key={student._id}>
                                <td>{idx + 1}</td>
                                <td><Badge bg="secondary">{student.studentId}</Badge></td>
                                <td>{student.name}</td>
                                <td><Badge bg="primary">{student.section}</Badge></td>
                                <td><Badge bg="info">{student.branch}</Badge></td>
                                <td>
                                  {hasSubmitted && !isEditMode ? (
                                    <div className="text-center">
                                      <Badge bg={attendance[student.studentId] === 'present' ? 'success' : 'danger'} style={{fontSize: '0.9rem', padding: '0.5rem 1rem'}}>
                                        {attendance[student.studentId] === 'present' ? 'Present' : attendance[student.studentId] === 'absent' ? 'Absent' : 'Not Marked'}
                                      </Badge>
                                    </div>
                                  ) : (
                                    <div className="d-flex gap-2 justify-content-center">
                                      <Button
                                        size="sm"
                                        variant={attendance[student.studentId] === 'present' ? 'success' : 'outline-success'}
                                        onClick={() => handleAttendanceChange(student.studentId, 'present')}
                                      >
                                        Present
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={attendance[student.studentId] === 'absent' ? 'danger' : 'outline-danger'}
                                        onClick={() => handleAttendanceChange(student.studentId, 'absent')}
                                      >
                                        Absent
                                      </Button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <p className="mb-0">
                          <strong>Summary:</strong> Present - <Badge bg="success">{summary.present}</Badge>, 
                          Absent - <Badge bg="danger">{summary.absent}</Badge>, 
                          Not Marked - <Badge bg="secondary">{filteredStudents.length - summary.present - summary.absent}</Badge>
                        </p>
                        {hasSubmitted && !isEditMode ? (
                          <Button 
                            variant="warning" 
                            onClick={() => setIsEditMode(true)}
                          >
                            <FaEdit /> Edit Attendance
                          </Button>
                        ) : (
                          <Button 
                            variant="primary" 
                            onClick={() => submitAttendance()}
                            disabled={Object.keys(attendance).length === 0}
                          >
                            <FaCalendarCheck /> Submit Attendance
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            {/* Schedule Tab */}
            <Tab eventKey="schedule" title="Manage Schedule">
              <Card className="mb-4">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <Card.Title className="mb-0">Weekly Timetable</Card.Title>
                    <Button variant="success" onClick={() => setShowAutoScheduleModal(true)}>
                      <FaCalendarCheck /> Auto-Generate Weekly Timetable
                    </Button>
                  </div>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Select Section to View Timetable</Form.Label>
                    <Form.Select value={selectedScheduleSection} onChange={(e) => setSelectedScheduleSection(e.target.value)} style={{maxWidth: '300px'}}>
                      <option value="">Select Section</option>
                      {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                    </Form.Select>
                  </Form.Group>

                  {selectedScheduleSection && Object.keys(timetableData).length > 0 ? (
                    <div className="table-responsive" style={{overflowX: 'auto'}}>
                      <Table bordered hover style={{minWidth: '800px'}}>
                        <thead>
                          <tr>
                            <th style={{width: '120px', fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle'}}>Time</th>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                              <th key={day} style={{fontWeight: 'bold', textAlign: 'center', minWidth: '150px'}}>{day}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(timetableData).map(([time, dayData]) => (
                            <tr key={time}>
                              <td style={{fontWeight: '600', textAlign: 'center', verticalAlign: 'middle'}}>
                                {time}
                              </td>
                              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => {
                                const classItem = dayData[day];
                                return (
                                  <td key={day} style={{padding: '12px', verticalAlign: 'top', position: 'relative'}}>
                                    {classItem ? (
                                      <div style={{
                                        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '2px solid #3b82f6',
                                        minHeight: '80px'
                                      }}>
                                        <div style={{fontWeight: 'bold', fontSize: '14px', marginBottom: '6px', color: '#1e40af'}}>
                                          {classItem.subject}
                                        </div>
                                        <div style={{fontSize: '12px', marginBottom: '6px', color: '#475569'}}>
                                          <FaBook size={12} className="me-1" />
                                          Faculty: {classItem.facultyId?.name || user.name}
                                        </div>
                                        <div style={{fontSize: '11px', color: '#64748b'}}>
                                          Section: {classItem.section}
                                        </div>
                                        <div className="mt-2" style={{display: 'flex', gap: '4px'}}>
                                          <Button variant="warning" size="sm" onClick={() => handleEditSchedule(classItem._id)} style={{fontSize: '10px', padding: '2px 6px'}}>
                                            <FaEdit size={10} />
                                          </Button>
                                          <Button variant="danger" size="sm" onClick={() => handleDeleteSchedule(classItem._id)} style={{fontSize: '10px', padding: '2px 6px'}}>
                                            <FaTrash size={10} />
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div style={{textAlign: 'center', color: '#9ca3af', fontSize: '12px', padding: '20px'}}>-</div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : selectedScheduleSection ? (
                    <Alert variant="info">No classes scheduled for {selectedScheduleSection}. Use the form below to add classes.</Alert>
                  ) : (
                    <Alert variant="info">Please select a section to view the timetable.</Alert>
                  )}

                  <hr className="my-4" />
                  <h5 className="mt-4">{editScheduleId ? 'Edit Schedule' : 'Add New Schedule'}</h5>
                  <Form onSubmit={editScheduleId ? handleUpdateSchedule : handleCreateSchedule}>
                    <Row>
                      <Col md={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>Day</Form.Label>
                          <Form.Select value={newSchedule.day} onChange={(e) => setNewSchedule({ ...newSchedule, day: e.target.value })} required>
                            <option value="">Select Day</option>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>Start Time</Form.Label>
                          <Form.Control
                            type="time"
                            value={newSchedule.startTime}
                            onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>End Time</Form.Label>
                          <Form.Control
                            type="time"
                            value={newSchedule.endTime}
                            onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Subject</Form.Label>
                          {newSchedule.subject && !uniqueSubjects.includes(newSchedule.subject) && newSchedule.subject !== user?.subject ? (
                            <div className="d-flex gap-2">
                              <Form.Control
                                type="text"
                                value={newSchedule.subject}
                                onChange={(e) => setNewSchedule({ ...newSchedule, subject: e.target.value })}
                                required
                              />
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => setNewSchedule({ ...newSchedule, subject: '' })}
                              >
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <Form.Select
                              value={newSchedule.subject}
                              onChange={(e) => setNewSchedule({ ...newSchedule, subject: e.target.value })}
                              required
                            >
                              <option value="">Select Subject</option>
                              {user?.subject && <option value={user.subject}>{user.subject}</option>}
                              {uniqueSubjects.filter(s => s !== user?.subject).map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                              ))}
                              <option value="__custom__">+ Add New Subject</option>
                            </Form.Select>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Section</Form.Label>
                          <Form.Select value={newSchedule.section} onChange={(e) => setNewSchedule({ ...newSchedule, section: e.target.value })} required>
                            <option value="">Select Section</option>
                            {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button type="submit" variant="primary">
                      {editScheduleId ? 'Update Schedule' : 'Add Schedule'}
                    </Button>
                    {editScheduleId && (
                      <Button variant="secondary" className="ms-2" onClick={() => {
                        setEditScheduleId(null);
                        setNewSchedule({ day: '', startTime: '', endTime: '', subject: '', section: '' });
                      }}>
                        Cancel
                      </Button>
                    )}
                  </Form>
                </Card.Body>
              </Card>
            </Tab>

            {/* Analytics Tab */}
            <Tab eventKey="analytics" title="Analytics">
              <Card>
                <Card.Body>
                  <Card.Title>30-Day Attendance Analytics</Card.Title>
                  {Object.keys(analytics).length > 0 ? (
                    <Bar
                      data={analyticsData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'top' },
                          title: { display: true, text: 'Student Attendance Overview' },
                        },
                      }}
                    />
                  ) : (
                    <p className="text-muted">No analytics data available. Please filter students first.</p>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            {/* Announcements Tab */}
            <Tab eventKey="announcements" title="Announcements">
              <Card>
                <Card.Body>
                  <Card.Title>Post Announcement</Card.Title>
                  <Form onSubmit={handleCreateAnnouncement}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        type="text"
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                        placeholder="Enter announcement title"
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Content</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={newAnnouncement.content}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                        placeholder="Enter announcement content"
                        required
                      />
                    </Form.Group>
                    <Button type="submit" variant="primary">
                      <FaBullhorn /> Post Announcement
                    </Button>
                  </Form>

                  <h5 className="mt-4">Recent Announcements</h5>
                  {announcements.length > 0 ? (
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Content</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {announcements.map(ann => (
                            <tr key={ann._id}>
                              <td><strong>{ann.title}</strong></td>
                              <td>{ann.content}</td>
                              <td>{new Date(ann.createdAt).toLocaleDateString()}</td>
                              <td>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => {
                                    setEditAnnouncement({ _id: ann._id, title: ann.title, content: ann.content });
                                    setShowEditAnnouncementModal(true);
                                  }}
                                >
                                  <FaEdit /> Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => {
                                    setDeleteAnnouncementId(ann._id);
                                    setShowDeleteAnnouncementModal(true);
                                  }}
                                >
                                  <FaTrash /> Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted">No announcements available.</p>
                  )}
                </Card.Body>
              </Card>
            </Tab>

            {/* Leave Requests Tab */}
            <Tab eventKey="leave-requests" title="Leave Requests">
              <Card className="mb-4">
                <Card.Body>
                  <Card.Title>Pending Leave Requests</Card.Title>
                  {leaveRequests.length > 0 ? (
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Student Name</th>
                            <th>Student ID</th>
                            <th>Section</th>
                            <th>Leave Type</th>
                            <th>From Date</th>
                            <th>To Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaveRequests.map(request => (
                            <tr key={request._id}>
                              <td>{request.name}</td>
                              <td><Badge bg="secondary">{request.studentId}</Badge></td>
                              <td><Badge bg="primary">{request.section}</Badge></td>
                              <td style={{ textTransform: 'capitalize' }}>{request.leaveType}</td>
                              <td>{new Date(request.fromDate).toLocaleDateString()}</td>
                              <td>{new Date(request.toDate).toLocaleDateString()}</td>
                              <td>
                                <Badge bg="warning">{request.status}</Badge>
                              </td>
                              <td>
                                <Button
                                  variant="info"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedLeaveRequest(request);
                                    setShowLeaveActionModal(true);
                                  }}
                                >
                                  Review
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <Alert variant="info">No pending leave requests.</Alert>
                  )}
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <Card.Title>Leave Request History</Card.Title>
                  {leaveHistory.length > 0 ? (
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Student Name</th>
                            <th>Student ID</th>
                            <th>Section</th>
                            <th>Leave Type</th>
                            <th>From Date</th>
                            <th>To Date</th>
                            <th>Status</th>
                            <th>Submitted On</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaveHistory.map(request => (
                            <tr key={request._id}>
                              <td>{request.name}</td>
                              <td><Badge bg="secondary">{request.studentId}</Badge></td>
                              <td><Badge bg="primary">{request.section}</Badge></td>
                              <td style={{ textTransform: 'capitalize' }}>{request.leaveType}</td>
                              <td>{new Date(request.fromDate).toLocaleDateString()}</td>
                              <td>{new Date(request.toDate).toLocaleDateString()}</td>
                              <td>
                                <Badge bg={request.status === 'approved' ? 'success' : request.status === 'rejected' ? 'danger' : 'warning'}>
                                  {request.status}
                                </Badge>
                              </td>
                              <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                              <td>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => {
                                    setDeleteLeaveId(request._id);
                                    setShowDeleteLeaveModal(true);
                                  }}
                                >
                                  <FaTrash /> Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <Alert variant="info">No leave request history.</Alert>
                  )}
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </div>
      <Footer />



      {/* Profile Modal */}
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
                  className="mt-2"
                  style={{ maxWidth: '100px', borderRadius: '8px' }}
                />
              )}
            </Form.Group>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Upload CSV Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Attendance CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <strong>CSV Format Required:</strong>
            <ul className="mb-0 mt-2">
              <li>Headers: StudentID, Name, Section, Branch, Status</li>
              <li>Status values: present or absent (case-insensitive)</li>
              <li>Download template first to ensure correct format</li>
            </ul>
          </Alert>
          <Form onSubmit={handleUpload}>
            <Form.Group className="mb-3">
              <Form.Label>Select CSV File</Form.Label>
              <Form.Control
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button type="submit" variant="primary">
                <FaUpload /> Upload & Load Attendance
              </Button>
              <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Leave Action Modal */}
      <Modal show={showLeaveActionModal} onHide={() => setShowLeaveActionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Review Leave Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLeaveRequest && (
            <>
              <p><strong>Student Name:</strong> {selectedLeaveRequest.name}</p>
              <p><strong>Student ID:</strong> {selectedLeaveRequest.studentId}</p>
              <p><strong>Section:</strong> {selectedLeaveRequest.section}</p>
              <p><strong>Leave Type:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedLeaveRequest.leaveType}</span></p>
              <p><strong>Contact Number:</strong> {selectedLeaveRequest.contactNumber}</p>
              <p><strong>Reason:</strong> {selectedLeaveRequest.reason}</p>
              <p><strong>From Date:</strong> {new Date(selectedLeaveRequest.fromDate).toLocaleDateString()}</p>
              <p><strong>To Date:</strong> {new Date(selectedLeaveRequest.toDate).toLocaleDateString()}</p>
              {selectedLeaveRequest.proof && (
                <p>
                  <strong>Proof Document:</strong>{' '}
                  <a href={`${API_BASE}/${selectedLeaveRequest.proof}`} target="_blank" rel="noopener noreferrer">
                    View Proof
                  </a>
                </p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={() => {
              setLeaveAction('approved');
              setShowLeaveConfirmModal(true);
            }}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setLeaveAction('rejected');
              setShowLeaveConfirmModal(true);
            }}
          >
            Reject
          </Button>
          <Button variant="secondary" onClick={() => setShowLeaveActionModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Leave Confirmation Modal */}
      <Modal show={showLeaveConfirmModal} onHide={() => setShowLeaveConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to <strong>{leaveAction}</strong> this leave request for <strong>{selectedLeaveRequest?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLeaveConfirmModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={leaveAction === 'approved' ? 'success' : 'danger'} 
            onClick={handleLeaveAction}
          >
            Confirm {leaveAction === 'approved' ? 'Approval' : 'Rejection'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Leave Modal */}
      <Modal show={showDeleteLeaveModal} onHide={() => setShowDeleteLeaveModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this leave request? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteLeaveModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteLeave}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Announcement Modal */}
      <Modal show={showEditAnnouncementModal} onHide={() => setShowEditAnnouncementModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Announcement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editAnnouncement && (
            <Form onSubmit={handleUpdateAnnouncement}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={editAnnouncement.title}
                  onChange={(e) => setEditAnnouncement({ ...editAnnouncement, title: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={editAnnouncement.content}
                  onChange={(e) => setEditAnnouncement({ ...editAnnouncement, content: e.target.value })}
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary">
                Update Announcement
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Announcement Modal */}
      <Modal show={showDeleteAnnouncementModal} onHide={() => setShowDeleteAnnouncementModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this announcement? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteAnnouncementModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAnnouncement}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Attendance Confirmation Modal */}
      <Modal show={showEditAttendanceModal} onHide={() => setShowEditAttendanceModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Attendance Already Submitted</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Attendance for {new Date(selectedDate).toLocaleDateString()} has already been submitted. Do you want to edit it?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditAttendanceModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => submitAttendance(true)}>
            Edit Attendance
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Submit Attendance Confirmation Modal */}
      <Modal show={showConfirmSubmitModal} onHide={() => setShowConfirmSubmitModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Attendance Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to submit attendance for {new Date(selectedDate).toLocaleDateString()}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmSubmitModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => {
            setShowConfirmSubmitModal(false);
            submitAttendance(true);
          }}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Auto-Generate Schedule Modal */}
      <Modal show={showAutoScheduleModal} onHide={() => setShowAutoScheduleModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Auto-Generate Weekly Timetable</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <strong>Quick Setup:</strong> Create a recurring class schedule for the entire week with one click.
          </Alert>
          <Form onSubmit={handleAutoGenerateSchedule}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Section</Form.Label>
                  <Form.Select value={autoSchedule.section} onChange={(e) => setAutoSchedule({ ...autoSchedule, section: e.target.value })} required>
                    <option value="">Select Section</option>
                    {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Subject</Form.Label>
                  <Form.Select value={autoSchedule.subject} onChange={(e) => setAutoSchedule({ ...autoSchedule, subject: e.target.value })} required>
                    <option value="">Select Subject</option>
                    {user?.subject && <option value={user.subject}>{user.subject}</option>}
                    {uniqueSubjects.filter(s => s !== user?.subject).map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={autoSchedule.startTime}
                    onChange={(e) => setAutoSchedule({ ...autoSchedule, startTime: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={autoSchedule.endTime}
                    onChange={(e) => setAutoSchedule({ ...autoSchedule, endTime: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Select Days</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                  <Form.Check
                    key={day}
                    type="checkbox"
                    label={day}
                    checked={autoSchedule.days.includes(day)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAutoSchedule({ ...autoSchedule, days: [...autoSchedule.days, day] });
                      } else {
                        setAutoSchedule({ ...autoSchedule, days: autoSchedule.days.filter(d => d !== day) });
                      }
                    }}
                  />
                ))}
              </div>
            </Form.Group>
            <Alert variant="success" className="mt-3">
              <strong>Preview:</strong> This will create {autoSchedule.days.length} classes for {autoSchedule.subject || 'selected subject'} in section {autoSchedule.section || 'selected section'} from {autoSchedule.startTime} to {autoSchedule.endTime}.
            </Alert>
            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={autoSchedule.days.length === 0}>
                <FaCalendarCheck /> Generate Timetable
              </Button>
              <Button variant="secondary" onClick={() => setShowAutoScheduleModal(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default FacultyDashboard;
