import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PostProvider } from './context/PostContext';
import { Header } from './components/Header';
import { HomePage } from './pages/Home';
import { LandingPage } from './pages/Landing';
import { LoginPage, RegisterPage } from './pages/Auth';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={isAuthenticated ? <HomePage /> : <LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <PostProvider>
          <AppContent />
        </PostProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
