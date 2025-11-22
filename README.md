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
