# Company Management Backend

A production-ready **Node.js + Express + PostgreSQL + Redis** backend designed for managing company operations such as **Departments, Employees, Projects, Tasks, Users, Authentication, File Handling, and Activity Logs**.  
The project includes full **CRUD operations**, **Redis caching**, **JWT authentication**, **Prisma ORM**, **Docker**, **CI/CD (GitHub Actions)**, and **unit/integration tests**.

---

## 🚀 Features

### **Core Modules**

- Department management
- Employee management
- Project management
- Task management
- User & Role management
- Authentication (JWT + Refresh Token)
- File upload (Multer)
- Activity logging for all CRUD operations

### **Performance & Scalability**

- Redis caching layer for fast reads
- Layered architecture (routes → controllers → services → repository → DB)
- Logger (Winston) for audit and debugging

### **Security**

- Bcrypt password hashing
- JWT access & refresh tokens
- Role-based route protection
- Helmet + rate limiting (optional)

### **DevOps & Tooling**

- Dockerized services (Backend + Postgres + Redis)
- Prisma ORM with migrations
- Jest tests (unit + integration)
- GitHub Actions (Continuous Integration)
- ESLint + Prettier formatting

---

## 🏗 Technologies Used

| Category         | Technology              |
| ---------------- | ----------------------- |
| Language         | Node.js (ESM)           |
| Framework        | Express.js              |
| Database         | PostgreSQL              |
| ORM              | Prisma                  |
| Cache            | Redis                   |
| Authentication   | JWT                     |
| Logging          | Winston                 |
| File Upload      | Multer                  |
| Containerization | Docker + Docker Compose |
| Testing          | Jest + Supertest        |
| CI/CD            | GitHub Actions          |

---

## 📦 Project Setup

### **1. Clone Repository**

```bash
git clone https://github.com/AlamgirKhan1996/company-management-backend.git
cd company-management-backend
```
## 🛡 GitHub Status Badges

![CI](https://github.com/AlamgirKhan1996/company-management-backend/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Node](https://img.shields.io/badge/Node-20.x-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)

## 🏛 System Architecture

+-------------------+            +----------------+
|    Client (UI)    | <--------> |   Express API  |
+-------------------+            +----------------+
                                         |
                                         |
                               +---------+---------+
                               |   Controller     |
                               +---------+---------+
                                         |
                                         |
                               +---------+---------+
                               |    Service Layer  |
                               +---------+---------+
                                         |
                                         |
                               +---------+---------+
                               |   Repository      |
                               +---------+---------+
                           /             \
                          /               \
                +----------------+   +----------------+
                | PostgreSQL DB  |   | Redis Cache    |
                +----------------+   +----------------+

## 📚 API Endpoints

### Auth
| Method | Endpoint           | Description           |
|--------|--------------------|-----------------------|
| POST   | /api/auth/register | Register a user       |
| POST   | /api/auth/login    | Login & get token     |

### Departments
| Method | Endpoint              | Description                |
|--------|------------------------|----------------------------|
| GET    | /api/departments       | Get all departments       |
| POST   | /api/departments       | Create department         |
| PUT    | /api/departments/:id   | Update department         |
| DELETE | /api/departments/:id   | Delete department         |

### Employees
| Method | Endpoint              | Description                |
|--------|------------------------|----------------------------|
| GET    | /api/departments       | Get all emplotees       |
| POST   | /api/departments       | Create emplotee         |
| PUT    | /api/departments/:id   | Update emplotees         |
| DELETE | /api/departments/:id   | Delete emplotees         |

### Tasks
| Method | Endpoint              | Description                |
|--------|------------------------|----------------------------|
| GET    | /api/departments       | Get all Tasks      |
| POST   | /api/departments       | Create Tasks         |
| PUT    | /api/departments/:id   | Update Tasks         |
| DELETE | /api/departments/:id   | Delete Tasks         |

### Projects
_| Method | Endpoint              | Description                |
|--------|------------------------|----------------------------|
| GET    | /api/departments       | Get all Projects       |
| POST   | /api/departments       | Create Projects         |
| PUT    | /api/departments/:id   | Update Projects         |
| DELETE | /api/departments/:id   | Delete Projects         |


## 🐳 Run With Docker

```bash
docker compose up --build



---

## 🚀 Deployment Guide


