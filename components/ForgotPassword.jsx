import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Form, Button, Modal, Alert } from 'react-bootstrap';

function ForgotPassword() {
  const [userIdOrEmail, setUserIdOrEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/forgot-password', {
        userIdOrEmail,
        newPassword,
      });
      setMessage('Password reset successfully');
      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
        router.push('/');
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Failed to reset password');
      setShowModal(true);
    }
  };

  return (
    <div className="dashboard-content">
      <h2>Reset Password</h2>
      <p>Enter your User ID or Email and new password.</p>
      {message && !showModal && <Alert variant={message.includes('successfully') ? 'success' : 'danger'}>{message}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="form-group">
          <Form.Label>User ID or Email</Form.Label>
          <Form.Control
            type="text"
            value={userIdOrEmail}
            onChange={(e) => setUserIdOrEmail(e.target.value)}
            placeholder="Enter User ID or Email"
            required
          />
        </Form.Group>
        <Form.Group className="form-group">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter New Password"
            required
          />
        </Form.Group>
        <Button className="btn-danger" type="submit">
          Reset Password
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

export default ForgotPassword;