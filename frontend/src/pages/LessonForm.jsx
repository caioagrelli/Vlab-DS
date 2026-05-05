import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function LessonForm() {
  const { courseId, id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({ title: '', status: 'draft', video_url: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) fetchLesson();
  }, [id]);

  async function fetchLesson() {
    try {
      const { data } = await api.get(`/courses/${courseId}/lessons`);
      const lesson = data.find((l) => l.id === Number(id));
      if (!lesson) return navigate(`/courses/${courseId}`);
      setForm({ title: lesson.title, status: lesson.status, video_url: lesson.video_url || '' });
    } catch {
      navigate(`/courses/${courseId}`);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title) return setError('Título é obrigatório');
    if (form.title.trim().length < 3) return setError('Título deve ter no mínimo 3 caracteres');

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/courses/${courseId}/lessons/${id}`, form);
        setSuccess('Aula atualizada!');
      } else {
        await api.post(`/courses/${courseId}/lessons`, form);
        setSuccess('Aula criada!');
      }
      setTimeout(() => navigate(`/courses/${courseId}`), 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar aula');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', marginBottom: '1rem' }}
        >
          ← Voltar
        </button>

        <div className="card" style={{ maxWidth: 480 }}>
          <h2 style={{ marginBottom: '1.5rem' }}>{isEditing ? 'Editar aula' : 'Nova aula'}</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Título</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Mínimo 3 caracteres"
              />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="published">Publicado</option>
              </select>
            </div>
            <div className="form-group">
              <label>URL do vídeo (opcional)</label>
              <input
                name="video_url"
                value={form.video_url}
                onChange={handleChange}
                placeholder="https://youtube.com/..."
              />
            </div>
            <div className="actions">
              <button className="btn btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar aula'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate(`/courses/${courseId}`)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
