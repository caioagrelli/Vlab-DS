import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [search, statusFilter]);

  async function fetchCourses() {
    try {
      const params = {};
      if (search) params.name = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/courses', { params });
      setCourses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir curso');
    }
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h2>Cursos</h2>
          <Link to="/courses/new">
            <button className="btn btn-primary">+ Novo curso</button>
          </Link>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="draft">Draft</option>
            <option value="published">Publicado</option>
          </select>
        </div>

        {loading ? (
          <div className="loading">Carregando cursos...</div>
        ) : courses.length === 0 ? (
          <div className="loading">Nenhum curso encontrado.</div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course.id} className="card" style={{ cursor: 'pointer' }}>
                <div onClick={() => navigate(`/courses/${course.id}`)}>
                  <h3 style={{ marginBottom: '0.25rem' }}>{course.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    {course.description || 'Sem descrição'}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {new Date(course.start_date).toLocaleDateString('pt-BR')} →{' '}
                    {new Date(course.end_date).toLocaleDateString('pt-BR')}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    por {course.owner_name}
                  </p>
                </div>
                {course.user_id === user?.id && (
                  <div className="actions" style={{ marginTop: '0.75rem' }}>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
                      onClick={() => navigate(`/courses/${course.id}/edit`)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger"
                      style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
                      onClick={() => handleDelete(course.id)}
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
