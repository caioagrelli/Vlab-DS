import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
    fetchInstructor();
  }, [id]);

  async function fetchCourse() {
    try {
      const { data } = await api.get(`/courses/${id}`);
      setCourse(data);
    } catch (err) {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  async function fetchInstructor() {
    try {
      const res = await fetch('https://randomuser.me/api/');
      const data = await res.json();
      setInstructor(data.results[0]);
    } catch {
      // API externa falhou — sem avatar
    }
  }

  async function handleDeleteLesson(lessonId) {
    if (!confirm('Excluir esta aula?')) return;
    try {
      await api.delete(`/courses/${id}/lessons/${lessonId}`);
      setCourse({ ...course, lessons: course.lessons.filter((l) => l.id !== lessonId) });
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir aula');
    }
  }

  async function handleDeleteCourse() {
    if (!confirm('Excluir este curso e todas as suas aulas?')) return;
    try {
      await api.delete(`/courses/${id}`);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir curso');
    }
  }

  if (loading) return <><Navbar /><div className="loading">Carregando...</div></>;
  if (!course) return null;

  const isOwner = course.user_id === user?.id;

  return (
    <>
      <Navbar />
      <div className="page">
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', marginBottom: '1rem' }}
        >
          ← Voltar
        </button>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ marginBottom: '0.25rem' }}>{course.name}</h2>
              <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>{course.description}</p>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                {new Date(course.start_date).toLocaleDateString('pt-BR')} →{' '}
                {new Date(course.end_date).toLocaleDateString('pt-BR')}
              </p>
              {instructor && (
                <div className="instructor">
                  <img
                    src={instructor.picture.thumbnail}
                    alt="Instrutor"
                    className="avatar"
                  />
                  <span>Instrutor: {instructor.name.first} {instructor.name.last}</span>
                </div>
              )}
            </div>

            {isOwner && (
              <div className="actions">
                <Link to={`/courses/${id}/edit`}>
                  <button className="btn btn-outline">Editar curso</button>
                </Link>
                <button className="btn btn-danger" onClick={handleDeleteCourse}>Excluir curso</button>
              </div>
            )}
          </div>
        </div>

        <div className="page-header">
          <h3>Aulas ({course.lessons?.length || 0})</h3>
          {isOwner && (
            <Link to={`/courses/${id}/lessons/new`}>
              <button className="btn btn-primary">+ Nova aula</button>
            </Link>
          )}
        </div>

        {course.lessons?.length === 0 ? (
          <div className="loading">Nenhuma aula cadastrada.</div>
        ) : (
          <div className="lessons-list">
            {course.lessons?.map((lesson) => (
              <div key={lesson.id} className="lesson-item">
                <div>
                  <span style={{ fontWeight: 500 }}>{lesson.title}</span>
                  {lesson.video_url && (
                    <a
                      href={lesson.video_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}
                    >
                      Ver vídeo
                    </a>
                  )}
                </div>
                <div className="lesson-item-actions">
                  <span className={`badge badge-${lesson.status}`}>{lesson.status}</span>
                  {isOwner && (
                    <>
                      <Link to={`/courses/${id}/lessons/${lesson.id}/edit`}>
                        <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}>Editar</button>
                      </Link>
                      <button
                        className="btn btn-danger"
                        style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem' }}
                        onClick={() => handleDeleteLesson(lesson.id)}
                      >
                        Excluir
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
