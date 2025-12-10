function Footer() {
  return (
    <footer className="footer">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <p style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          © {new Date().getFullYear()} University Attendance Management System
        </p>
        <p style={{ fontSize: '0.85rem', opacity: '0.9', marginBottom: '0' }}>
          Empowering Education Through Technology | All Rights Reserved
        </p>
      </div>
    </footer>
  );
}

export default Footer;
