import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import StudentDashboard from '../../components/StudentDashboard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function StudentPage({ user, setUser, isDarkMode, setIsDarkMode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for user to load from localStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!user || user.role !== 'student') {
        router.push('/');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'student') {
    return null;
  }

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Navbar user={user} setUser={setUser} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      <div className="content">
        <StudentDashboard user={user} setUser={setUser} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </div>
      <Footer />
    </div>
  );
}
