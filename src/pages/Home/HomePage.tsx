import { Feed } from '../../components/Feed';
import { Sidebar } from '../../components/Sidebar';
import { RightSidebar } from '../../components/RightSidebar';
import { useAuth } from '../../context/AuthContext';
import './HomePage.css';

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={`home-page ${isAuthenticated ? 'authenticated' : ''}`}>
      <Sidebar />
      <main className="main-content">
        <Feed />
      </main>
      <RightSidebar />
    </div>
  );
}
