import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Login from '../components/Login';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home({ user, setUser }) {
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(user.role === 'student' ? '/dashboard/student' : '/dashboard/faculty');
    }
  }, [user, router]);

  return (
    <div className="app">
      <Navbar user={user} setUser={setUser} />
      <div className="content">
        <Login setUser={setUser} />
      </div>
      <Footer />
    </div>
  );
}
