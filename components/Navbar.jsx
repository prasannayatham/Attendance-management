import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaUser, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { Modal, Button } from 'react-bootstrap';

function Navbar({ user, setUser }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setShowLogoutModal(false);
    router.push('/');
  };

  const isLoginPage = router.pathname === '/';

  return (
    <nav className="navbar">
      <div className="logo-container">
        <a href="https://srkrec.edu.in/" target="_blank" rel="noopener noreferrer">
          <img src="/universitylogo.png" alt="University Logo" className="logo-image" style={{maxHeight: '60px'}} />
        </a>
      </div>
      <div className="navbar-center">
        <img src="/universityheader.png" alt="University Header" className="header-image" />
      </div>
      <div className="nav-right">
        <div className="rankings-container">
          <img src="/naac.png" alt="NAAC Logo" className="rankings-image styled-image" />
        </div>
        {user ? (
          <div className="dropdown" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="dropdown-toggle">
              <FaBars />
            </button>
            {dropdownOpen && (
              <div className="dropdown-content">
                <div className="profile-section">
                  {user.profilePicture && (
                    <img src={user.profilePicture} alt="Profile" className="profile-picture" style={{ maxWidth: '50px', borderRadius: '50%', marginBottom: '10px' }} />
                  )}
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  {user.role === 'faculty' && <p><strong>Subject:</strong> {user.subject}</p>}
                  {user.role === 'student' && (
                    <>
                      <p><strong>Student ID:</strong> {user.studentId}</p>
                      <p><strong>Section:</strong> {user.section}</p>
                    </>
                  )}
                </div>
                <Link href={user.role === 'student' ? '/dashboard/student' : '/dashboard/faculty'} onClick={() => setDropdownOpen(false)} className="dropdown-item">
                  <FaUser /> Dashboard
                </Link>
                <button onClick={handleLogout} className="dropdown-item logout-btn">
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          !isLoginPage && (
            <Link href="/" className="login-link">
              Login
            </Link>
          )
        )}
      </div>
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to logout?</Modal.Body>
        <Modal.Footer>
          <Button className="btn-danger" onClick={confirmLogout}>
            Logout
          </Button>
          <Button className="btn-danger" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </nav>
  );
}

export default Navbar;
