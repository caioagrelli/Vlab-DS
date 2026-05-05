const router = require('express').Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// verifica se o usuário é dono do curso
async function requireCourseOwner(req, res) {
  const course = await pool.query('SELECT * FROM courses WHERE id = $1', [req.params.courseId]);

  if (course.rows.length === 0) {
    res.status(404).json({ error: 'Curso não encontrado' });
    return null;
  }

  if (course.rows[0].user_id !== req.userId) {
    res.status(403).json({ error: 'Apenas o criador do curso pode gerenciar as aulas' });
    return null;
  }

  return course.rows[0];
}

// GET /courses/:courseId/lessons
router.get('/:courseId/lessons', auth, async (req, res) => {
  try {
    const course = await pool.query('SELECT id FROM courses WHERE id = $1', [req.params.courseId]);

    if (course.rows.length === 0) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }

    const lessons = await pool.query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY created_at ASC',
      [req.params.courseId]
    );

    res.json(lessons.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar aulas' });
  }
});

// POST /courses/:courseId/lessons
router.post('/:courseId/lessons', auth, async (req, res) => {
  const course = await requireCourseOwner(req, res);
  if (!course) return;

  const { title, status, video_url } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Título é obrigatório' });
  }

  if (title.trim().length < 3) {
    return res.status(400).json({ error: 'Título deve ter no mínimo 3 caracteres' });
  }

  if (status && !['draft', 'published'].includes(status)) {
    return res.status(400).json({ error: 'Status deve ser draft ou published' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO lessons (title, status, video_url, course_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title.trim(), status || 'draft', video_url || null, req.params.courseId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar aula' });
  }
});

// PUT /courses/:courseId/lessons/:id
router.put('/:courseId/lessons/:id', auth, async (req, res) => {
  const course = await requireCourseOwner(req, res);
  if (!course) return;

  const { title, status, video_url } = req.body;

  try {
    const lesson = await pool.query(
      'SELECT * FROM lessons WHERE id = $1 AND course_id = $2',
      [req.params.id, req.params.courseId]
    );

    if (lesson.rows.length === 0) {
      return res.status(404).json({ error: 'Aula não encontrada' });
    }

    if (title && title.trim().length < 3) {
      return res.status(400).json({ error: 'Título deve ter no mínimo 3 caracteres' });
    }

    if (status && !['draft', 'published'].includes(status)) {
      return res.status(400).json({ error: 'Status deve ser draft ou published' });
    }

    const updatedTitle = title ? title.trim() : lesson.rows[0].title;
    const updatedStatus = status || lesson.rows[0].status;
    const updatedUrl = video_url !== undefined ? video_url : lesson.rows[0].video_url;

    const result = await pool.query(
      `UPDATE lessons SET title = $1, status = $2, video_url = $3
       WHERE id = $4 RETURNING *`,
      [updatedTitle, updatedStatus, updatedUrl, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar aula' });
  }
});

// DELETE /courses/:courseId/lessons/:id
router.delete('/:courseId/lessons/:id', auth, async (req, res) => {
  const course = await requireCourseOwner(req, res);
  if (!course) return;

  try {
    const lesson = await pool.query(
      'SELECT * FROM lessons WHERE id = $1 AND course_id = $2',
      [req.params.id, req.params.courseId]
    );

    if (lesson.rows.length === 0) {
      return res.status(404).json({ error: 'Aula não encontrada' });
    }

    await pool.query('DELETE FROM lessons WHERE id = $1', [req.params.id]);

    res.json({ message: 'Aula excluída com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir aula' });
  }
});

module.exports = router;
