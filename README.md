# CourseSphere

Plataforma de gerenciamento de cursos e aulas com autenticação JWT.

## Stack

- **Backend:** Node.js + Express + PostgreSQL
- **Frontend:** React + Vite + Nginx
- **Infra:** Docker + Docker Compose

## Como rodar

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

### 1. Clone o repositório

```bash
git clone https://github.com/caioagrelli/Vlab-DS.git
cd Vlab-DS
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
DB_USER=coursesphere
DB_PASSWORD=coursesphere123
DB_NAME=coursesphere_db
JWT_SECRET=troca_por_algo_secreto
```

### 3. Suba os containers

```bash
docker-compose up --build
```

### 4. Rode as migrations (primeira vez)

Em outro terminal:

```bash
cd backend
npm install
npm run migrate
```

### 5. Acesse

| Serviço | URL |
|---|---|
| Frontend | http://localhost |
| API | http://localhost/api |

---

## Credenciais de teste

Após rodar as migrations, registre um usuário em http://localhost/register

Ou use via API:

```bash
curl -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@email.com","password":"123456"}'
```

---

## Rodar sem Docker (desenvolvimento)

### Backend

```bash
cd backend
cp .env.example .env  # configure DATABASE_URL e JWT_SECRET
npm install
npm run migrate
npm run dev           # roda na porta 3000
```

### Frontend

```bash
cd frontend
echo "VITE_API_URL=http://localhost:3000" > .env
npm install
npm run dev           # roda na porta 5173
```

---

## Endpoints da API

### Auth
| Método | Rota | Descrição |
|---|---|---|
| POST | /auth/register | Registrar usuário |
| POST | /auth/login | Login (retorna JWT) |

### Cursos (requer token JWT)
| Método | Rota | Descrição |
|---|---|---|
| GET | /courses?name=&status= | Listar com busca e filtro |
| GET | /courses/:id | Detalhes + aulas |
| POST | /courses | Criar curso |
| PUT | /courses/:id | Editar (só dono) |
| DELETE | /courses/:id | Excluir (só dono) |

### Aulas (requer token JWT + ser dono do curso)
| Método | Rota | Descrição |
|---|---|---|
| GET | /courses/:courseId/lessons | Listar aulas |
| POST | /courses/:courseId/lessons | Criar aula |
| PUT | /courses/:courseId/lessons/:id | Editar aula |
| DELETE | /courses/:courseId/lessons/:id | Excluir aula |

---

## Estrutura do projeto

```
Vlab-DS/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config/
│       │   ├── db.js
│       │   └── migrate.js
│       ├── middleware/
│       │   └── auth.js
│       └── routes/
│           ├── auth.js
│           ├── courses.js
│           └── lessons.js
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── context/AuthContext.jsx
        ├── services/api.js
        ├── components/
        │   ├── Navbar.jsx
        │   └── PrivateRoute.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── CourseDetail.jsx
            ├── CourseForm.jsx
            └── LessonForm.jsx
```
