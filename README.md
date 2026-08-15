# 📋 Kanban Task Management Backend API

A scalable, production-ready, modular REST API and Real-Time WebSocket backend for Kanban Task Management built with **Node.js**, **Express.js**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, and **Socket.IO**.

---

## 🌟 Features & Highlights

- **Layered Architecture**: Strict `Route -> Middleware -> Controller -> Service -> Repository -> Database` separation.
- **Normalized PostgreSQL Schema**: UUID primary keys, normalized join tables for task assignees and tags, foreign key cascade rules, and optimized indexes.
- **Real-Time Synchronization**: Socket.IO room-based synchronization (`board:{boardId}`) emitting instant updates for Kanban movements, task creation, updates, deletions, and comments.
- **Authentication & RBAC**: Stateless JWT authentication with role-based access control (`ADMIN`, `MANAGER`, `MEMBER`).
- **Comprehensive Task Operations**: Filtering (status, priority, assignee, category, board, due date), search (title, description), and pagination.
- **Dashboard Analytics**: Database-level aggregation queries for task statuses, priority distributions, and overdue counts.
- **Request Validation**: Strict runtime schema parsing and coercion using **Zod**.
- **Centralized Error Handling**: Custom error hierarchy (`AppError`, `NotFoundError`, `ValidationError`, `ForbiddenError`, `ConflictError`, `DatabaseError`).
- **OpenAPI / Swagger Documentation**: Interactive API Explorer available at `/api-docs`.
- **Automated Testing**: 50+ unit and integration tests covering utilities, validators, services, REST APIs, and Socket.IO real-time events.
- **Docker Support**: Multi-stage `Dockerfile` and `docker-compose.yml` for PostgreSQL and backend containerization.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Runtime & Language | Node.js (v20+) & TypeScript (Strict Mode) |
| Web Framework | Express.js |
| Database & ORM | PostgreSQL & Prisma ORM |
| Real-time WebSockets | Socket.IO |
| Authentication | JSON Web Tokens (JWT) & bcryptjs |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Logging | Pino & Pino-HTTP |
| Documentation | OpenAPI 3.0 & Swagger UI |
| Testing | Jest & Supertest |
| Containerization | Docker & Docker Compose |

---

## 📂 Project Structure

```text
backend/
├── prisma/
│   ├── schema.prisma           # Relational schema, enums, indexes, cascade rules
│   └── seed.ts                 # Database seeder (Admin, Managers, Members, Boards, Tags, Tasks)
├── src/
│   ├── config/
│   │   ├── env.ts              # Zod-validated environment configuration
│   │   ├── database.ts         # PrismaClient singleton and connection lifecycle
│   │   ├── socket.ts           # Socket.IO server initialization and room manager
│   │   └── swagger.ts          # Swagger UI setup
│   ├── constants/
│   │   └── index.ts            # Status codes, error codes, socket events, enum constants
│   ├── controllers/            # HTTP Request/Response handlers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── board.controller.ts
│   │   ├── task.controller.ts
│   │   ├── category.controller.ts
│   │   ├── tag.controller.ts
│   │   ├── comment.controller.ts
│   │   └── dashboard.controller.ts
│   ├── middleware/             # Security, Auth, Validation, Error Handling
│   │   ├── auth.middleware.ts
│   │   ├── rbac.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── not-found.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── request-logger.middleware.ts
│   ├── repositories/           # Database queries and Prisma transactions
│   │   ├── user.repository.ts
│   │   ├── board.repository.ts
│   │   ├── task.repository.ts
│   │   ├── category.repository.ts
│   │   ├── tag.repository.ts
│   │   ├── comment.repository.ts
│   │   └── dashboard.repository.ts
│   ├── routes/                 # Express API route definitions
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── board.routes.ts
│   │   ├── task.routes.ts
│   │   ├── category.routes.ts
│   │   ├── tag.routes.ts
│   │   ├── comment.routes.ts
│   │   └── dashboard.routes.ts
│   ├── services/               # Business logic, permissions, and Socket emissions
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── board.service.ts
│   │   ├── task.service.ts
│   │   ├── category.service.ts
│   │   ├── tag.service.ts
│   │   ├── comment.service.ts
│   │   └── dashboard.service.ts
│   ├── sockets/                # Socket.IO service and event broadcasters
│   │   └── socket.service.ts
│   ├── types/                  # TypeScript interface and type declarations
│   ├── utils/                  # Reusable ApiResponse, errors, logger, pagination, query-builder
│   ├── validators/             # Zod validation schemas
│   ├── app.ts                  # Express application setup
│   └── server.ts               # HTTP & WebSocket server entry point
├── tests/
│   ├── helpers/                # Test utilities & token generators
│   ├── unit/                   # Unit tests (pagination, validation, auth service, task service)
│   ├── integration/            # REST API integration tests (auth, tasks, boards, comments, dashboard)
│   └── socket/                 # Socket.IO real-time event tests
├── docs/
│   └── openapi.yaml            # OpenAPI 3.0 specification
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **PostgreSQL**: v14.x or higher (or Docker)
- **npm** or **pnpm**

### 2. Environment Configuration
Copy `.env.example` to `.env` and adjust the variables:

```bash
cp .env.example .env
```

Default configuration in `.env`:
```env
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kanban_db?schema=public

JWT_SECRET=super_secret_jwt_key_change_in_production_kanban_2026
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000,http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=500
LOG_LEVEL=info
```

### 3. Install Dependencies & Generate Prisma Client

```bash
npm install
npm run db:generate
```

### 4. Database Setup & Seeding

Run migrations and seed realistic sample data:

```bash
npm run db:migrate
npm run db:seed
```

#### Default Seed Credentials:
- **Admin**: `admin@example.com` / `Password123!`
- **Manager**: `alex.manager@example.com` / `Password123!`
- **Manager**: `sarah.manager@example.com` / `Password123!`
- **Member**: `sara.dervashi@example.com` / `Password123!`

### 5. Running the Application

**Development Mode (Hot Reload):**
```bash
npm run dev
```

**Production Build & Run:**
```bash
npm run build
npm start
```

---

## 🐳 Docker Deployment

To launch the complete PostgreSQL database and backend using Docker Compose:

```bash
docker compose up --build -d
```

To stop:
```bash
docker compose down
```

---

## 📖 API Documentation & Swagger UI

Once the backend is running, access the interactive Swagger OpenAPI UI at:

👉 **`http://localhost:5000/api-docs`**

---

## 📡 REST API Summary

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user | Public |
| `POST` | `/api/v1/auth/login` | Login and receive JWT token | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile | Authenticated |

### Tasks (`/api/v1/tasks`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/tasks` | List tasks with filters, search, pagination | Authenticated |
| `GET` | `/api/v1/tasks/:id` | Get task details | Authenticated |
| `POST` | `/api/v1/tasks` | Create task with assignees & tags | Authenticated |
| `PUT` | `/api/v1/tasks/:id` | Update task & trigger Kanban movement | Authenticated |
| `DELETE` | `/api/v1/tasks/:id` | Delete task | Admin / Manager / Creator |

#### Task Filtering & Search Query Parameters:
```http
GET /api/v1/tasks?status=in_progress&priority=high&assignee=<user-uuid>&board_id=<board-uuid>&search=shopify&page=1&limit=20&sortBy=dueDate&order=asc
```

### Boards (`/api/v1/boards`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/boards` | List boards with task counts | Authenticated |
| `GET` | `/api/v1/boards/:id` | Get board with full task hierarchy | Authenticated |
| `POST` | `/api/v1/boards` | Create board | Admin / Manager |
| `PUT` | `/api/v1/boards/:id` | Update board title or theme | Admin / Manager |
| `DELETE` | `/api/v1/boards/:id` | Delete board and its tasks | Admin |

### Comments (`/api/v1/tasks/:taskId/comments` & `/api/v1/comments/:id`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/tasks/:taskId/comments` | List comments for a task | Authenticated |
| `POST` | `/api/v1/tasks/:taskId/comments` | Add comment to a task | Authenticated |
| `PUT` | `/api/v1/comments/:id` | Edit comment | Author / Admin |
| `DELETE` | `/api/v1/comments/:id` | Delete comment | Author / Admin |

### Dashboard (`/api/v1/dashboard`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/v1/dashboard` | Get aggregated metrics & statistics | Authenticated |

---

## ⚡ Real-Time Socket.IO Synchronization

Clients connect to the Socket.IO server and join board rooms for targeted event broadcasting:

### 1. Joining a Board Room
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// Join room for board
socket.emit("join:board", "board-uuid-123");
```

### 2. Listening to Real-time Events
```javascript
// Task moved across Kanban columns
socket.on("task:moved", (task) => {
  console.log("Task moved:", task.id, task.status);
});

// New task created
socket.on("task:created", (task) => {
  console.log("New task created:", task);
});

// Task updated
socket.on("task:updated", (task) => {
  console.log("Task updated:", task);
});

// Task deleted
socket.on("task:deleted", ({ id, boardId }) => {
  console.log("Task deleted:", id);
});

// New comment added
socket.on("task:commented", ({ taskId, comment }) => {
  console.log("New comment on task:", taskId, comment);
});
```

---

## 🧪 Testing Suite

Run the automated test suite:

```bash
# Run all unit, integration, and socket tests
npm test

# Run tests with code coverage report
npm run test:coverage

# Run ESLint validation
npm run lint

# Format code with Prettier
npm run format
```

---

## 🛡️ Response & Error Format Standard

### Success Response:
```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "board_id",
        "message": "Invalid board ID format"
      }
    ]
  }
}
```

---

## 📄 License
This project is licensed under the MIT License.
