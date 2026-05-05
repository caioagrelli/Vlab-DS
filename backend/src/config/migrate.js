require('dotenv').config();
const pool = require('./db');

const sql = `
  CREATE TABLE IF NOT EXISTS users (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(255) NOT NULL,
    email     VARCHAR(255) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS courses (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL CHECK (char_length(name) >= 3),
    description TEXT,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL CHECK (end_date >= start_date),
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id         SERIAL PRIMARY KEY,
    title      VARCHAR(255) NOT NULL CHECK (char_length(title) >= 3),
    status     VARCHAR(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    video_url  VARCHAR(500),
    course_id  INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
`;

async function migrate() {
  try {
    await pool.query(sql);
    console.log('Migrations executadas com sucesso!');
    console.log('Tabelas criadas: users, courses, lessons');
  } catch (err) {
    console.error('Erro ao executar migrations:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
