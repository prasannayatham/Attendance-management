import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import { Form, Button, Modal } from 'react-bootstrap';

function Login({ setUser }) {
  const [userIdOrEmail, setUserIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const response = await axios.post('/api/login', {
        userIdOrEmail,
        password,
      });
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      router.push(user.role === 'student' ? '/dashboard/student' : '/dashboard/faculty');
    } catch (err) {
      setErrorMessage(err.response?.data?.msg || 'Login failed. Please try again.');
      setShowErrorModal(true);
    }
  };



  const handleCloseModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="/universitylogo.png" alt="University Logo" className="login-logo" />
        <Form onSubmit={handleSubmit}>
          <Form.Group className="form-group">
            <label>User ID or Email</label>
            <div className="input-with-icon">
              <i className="bi bi-person icon"></i>
              <Form.Control
                type="text"
                value={userIdOrEmail}
                onChange={(e) => setUserIdOrEmail(e.target.value)}
                placeholder="Enter User ID or Email"
                required
              />
            </div>
          </Form.Group>
          <Form.Group className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <i className="bi bi-lock icon"></i>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                required
              />
            </div>
          </Form.Group>
          <Button type="submit" className="next-button">
            Sign In
          </Button>
          <div className="or-text">OR</div>
          <Link href="/auth/register" passHref legacyBehavior>
            <Button as="a" className="register-button">
              Create New Account
            </Button>
          </Link>
          <Link href="/auth/forgot-password" className="forgot-password">
            Forgot Password?
          </Link>
        </Form>
      </div>

      <Modal show={showErrorModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errorMessage}</Modal.Body>
        <Modal.Footer>
          <Button className="btn-danger" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Login;