import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import FacultyDashboard from '../../components/FacultyDashboard';

export default function FacultyPage({ user, setUser, isDarkMode, setIsDarkMode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Wait for user to load from localStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!user || user.role !== 'faculty') {
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

  if (!user || user.role !== 'faculty') {
    return null;
  }

  return (
    <FacultyDashboard 
      user={user} 
      setUser={setUser} 
      isDarkMode={isDarkMode} 
      setIsDarkMode={setIsDarkMode} 
    />
  );
}
