import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <h1>CourseSphere</h1>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Olá, {user?.name}</span>
        <button onClick={handleLogout}>Sair</button>
      </div>
    </nav>
  );
}
