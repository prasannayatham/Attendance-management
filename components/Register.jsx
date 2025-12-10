import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Form, Button, Modal, Alert } from 'react-bootstrap';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [branch, setBranch] = useState('');
  const [section, setSection] = useState('');
  const [subject, setSubject] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/register', {
        email,
        password,
        role,
        name,
        ...(role === 'student' && { studentId, branch, section }),
        ...(role === 'faculty' && { subject, branch, studentId: studentId }),
      });
      setMessage('Registration successful! Redirecting to login...');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        router.push('/');
      }, 1500);
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Registration failed');
      setShowModal(true);
    }
  };

  return (
    <div className="dashboard-content">
      <h2>Create Account</h2>
      {message && !showModal && <Alert variant={message.includes('successfully') ? 'success' : 'danger'}>{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="form-group">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            required
          />
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            required
          />
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>Role</Form.Label>
          <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </Form.Select>
        </Form.Group>
        {role === 'student' && (
          <Form.Group className="form-group">
            <Form.Label>Section</Form.Label>
            <Form.Control
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="Enter section"
              required
            />
          </Form.Group>
        )}
        {role === 'student' && (
          <>
            <Form.Group className="form-group">
              <Form.Label>Student ID</Form.Label>
              <Form.Control
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter student ID"
                required
              />
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label>Branch/Department</Form.Label>
              <Form.Select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
              >
                <option value="">Select Branch</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Electrical">Electrical</option>
              </Form.Select>
            </Form.Group>
          </>
        )}
        {role === 'faculty' && (
          <>
            <Form.Group className="form-group">
              <Form.Label>Department</Form.Label>
              <Form.Select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Electrical">Electrical</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label>Subject/Course</Form.Label>
              <Form.Control
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Data Structures, Database Management"
                required
              />
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label>Employee ID</Form.Label>
              <Form.Control
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter Employee ID"
                required
              />
            </Form.Group>
          </>
        )}
        <Button className="btn-primary" type="submit" style={{width: '100%', marginTop: '1rem'}}>
          Register Account
        </Button>
      </Form>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{message.includes('successfully') ? 'Success' : 'Error'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button className="btn-danger" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Register;