# 🎫 Ticket Management System

A secure RESTful Ticket Management System built with **Go**, **Gin**, **GORM**, and **SQLite**. The application provides JWT-based authentication and allows authenticated users to create, manage, update, and delete their own support tickets.

---

# Features

* User Registration
* User Login with JWT Authentication
* Password Hashing using bcrypt
* Create Support Tickets
* Retrieve All User Tickets
* Retrieve a Specific Ticket
* Update Ticket Status
* Delete Tickets
* Protected Routes using JWT Middleware
* SQLite Database with GORM ORM
* Docker Support
* RESTful API Design

---

# Tech Stack

| Technology | Purpose            |
| ---------- | ------------------ |
| Go         | Backend Language   |
| Gin        | HTTP Web Framework |
| GORM       | ORM                |
| SQLite     | Database           |
| JWT        | Authentication     |
| bcrypt     | Password Hashing   |
| Docker     | Containerization   |

---

# Project Architecture

```
ticket-system/
│
├── cmd/
│   └── main.go
│
├── internal/
│   ├── database/
│   ├── dto/
│   ├── handlers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── utils/
│
├── Dockerfile
├── .dockerignore
├── go.mod
├── go.sum
└── README.md
```

### Architecture Overview

```
Client
   │
   ▼
Gin Router
   │
   ▼
JWT Middleware
   │
   ▼
Handlers
   │
   ▼
GORM
   │
   ▼
SQLite Database
```

---

# Installation

## Clone the Repository

```bash
git clone <repository-url>
cd ticket-system
```

## Install Dependencies

```bash
go mod tidy
```

## Run the Application

```bash
go run ./cmd
```

The server starts on:

```
http://localhost:8080
```

---

# Running with Docker

## Build Image

```bash
docker build -t ticket-system .
```

## Run Container

```bash
docker run -p 8080:8080 ticket-system
```

---

# Authentication

After a successful login, the API returns a JWT token.

Include the token in every protected request.

```
Authorization: Bearer <JWT_TOKEN>
```

---

# API Endpoints

## Health Check

| Method | Endpoint |
| ------ | -------- |
| GET    | /health  |

---

## Authentication

| Method | Endpoint       |
| ------ | -------------- |
| POST   | /auth/register |
| POST   | /auth/login    |

---

## Ticket APIs

| Method | Endpoint            | Description          |
| ------ | ------------------- | -------------------- |
| POST   | /tickets            | Create Ticket        |
| GET    | /tickets            | Get All User Tickets |
| GET    | /tickets/:id        | Get Ticket By ID     |
| PATCH  | /tickets/:id/status | Update Ticket Status |
| DELETE | /tickets/:id        | Delete Ticket        |

---

# Ticket Status Flow

```
Open
   │
   ▼
In Progress
   │
   ▼
Closed
```

A closed ticket cannot be reopened.

---

# Sample Request

## Register

```http
POST /auth/register
```

```json
{
    "email":"user@example.com",
    "password":"123456"
}
```

---

## Login

```http
POST /auth/login
```

```json
{
    "email":"user@example.com",
    "password":"123456"
}
```

---

## Create Ticket

```http
POST /tickets
```

```json
{
    "title":"Bug Report",
    "description":"JWT authentication is failing."
}
```

---

# Security Features

* JWT Authentication
* Password Hashing using bcrypt
* Protected API Endpoints
* User-specific Ticket Access
* Secure Database Operations

---

# Future Improvements

* PostgreSQL Support
* Role-Based Access Control (RBAC)
* Ticket Priority Levels
* Ticket Categories
* File Attachments
* Email Notifications
* Refresh Tokens
* API Rate Limiting
* Request Logging
* Swagger/OpenAPI Documentation
* Unit and Integration Testing
* CI/CD Pipeline
* Redis Caching

---

# Author

**Saurabh Tiwari**

Backend Developer | Go | Node.js | PostgreSQL | Docker

---

# License

This project is developed as part of a backend development assignment for educational purposes.
