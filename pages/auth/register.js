import Register from '../../components/Register';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function RegisterPage({ user, setUser, isDarkMode, setIsDarkMode }) {
  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar user={user} setUser={setUser} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <div className="content">
        <Register />
      </div>
      <Footer />
    </div>
  );
}
