import ForgotPassword from '../../components/ForgotPassword';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ForgotPasswordPage({ user, setUser, isDarkMode, setIsDarkMode }) {
  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar user={user} setUser={setUser} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <div className="content">
        <ForgotPassword />
      </div>
      <Footer />
    </div>
  );
}
