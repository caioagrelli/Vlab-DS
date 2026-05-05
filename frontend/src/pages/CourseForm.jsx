import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function CourseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) fetchCourse();
  }, [id]);

  async function fetchCourse() {
    try {
      const { data } = await api.get(`/courses/${id}`);
      setForm({
        name: data.name,
        description: data.description || '',
        start_date: data.start_date?.split('T')[0],
        end_date: data.end_date?.split('T')[0],
      });
    } catch {
      navigate('/dashboard');
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.start_date || !form.end_date) {
      return setError('Nome, data de início e data de fim são obrigatórios');
    }
    if (form.name.trim().length < 3) {
      return setError('Nome deve ter no mínimo 3 caracteres');
    }
    if (new Date(form.end_date) < new Date(form.start_date)) {
      return setError('Data de fim deve ser igual ou posterior à data de início');
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/courses/${id}`, form);
        setSuccess('Curso atualizado com sucesso!');
        setTimeout(() => navigate(`/courses/${id}`), 1000);
      } else {
        const { data } = await api.post('/courses', form);
        setSuccess('Curso criado com sucesso!');
        setTimeout(() => navigate(`/courses/${data.id}`), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar curso');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="page">
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', marginBottom: '1rem' }}
        >
          ← Voltar
        </button>

        <div className="card" style={{ maxWidth: 560 }}>
          <h2 style={{ marginBottom: '1.5rem' }}>{isEditing ? 'Editar curso' : 'Novo curso'}</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome do curso</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Mínimo 3 caracteres"
              />
            </div>
            <div className="form-group">
              <label>Descrição</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Descreva o curso..."
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Data de início</label>
                <input type="date" name="start_date" value={form.start_date} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Data de fim</label>
                <input type="date" name="end_date" value={form.end_date} onChange={handleChange} />
              </div>
            </div>
            <div className="actions">
              <button className="btn btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar curso'}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
