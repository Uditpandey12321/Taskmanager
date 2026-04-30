# Task_Manager 🚀

A full-stack Team Task Management Web Application inspired by Trello and Asana where users can create projects, manage teams, assign tasks, and track progress efficiently.

This platform is designed as a real-world collaborative productivity system with secure authentication, role-based access control (Admin/Member), task management, project tracking, and dashboard analytics.

Built using the MERN Stack with production-ready architecture and a modern SaaS-style UI.

---

## 📌 Features

### 🔐 User Authentication

* User Signup (Name, Email, Password)
* Secure Login using JWT
* Password hashing using bcrypt
* Protected routes
* Current logged-in user fetch
* Logout functionality

---

### 📁 Project Management

* Create new projects
* Project creator becomes Admin automatically
* Add/remove team members
* View assigned projects
* Project details with members, tasks, deadline, and status

---

### ✅ Task Management

* Create tasks inside projects
* Assign tasks to users
* Set due dates and priorities
* Update task status:

  * To Do
  * In Progress
  * Done
* Members can only update their assigned tasks

---

### 📊 Dashboard Analytics

* Total Tasks
* Completed Tasks
* Pending Tasks
* Overdue Tasks
* Tasks by Status
* Tasks per User
* Project completion progress
* Active project overview

---

### 🛡 Role-Based Access Control (RBAC)

#### Admin

* Manage projects
* Add/remove members
* Create/Edit/Delete tasks
* Assign tasks
* View full project analytics

#### Member

* View assigned projects
* View assigned tasks
* Update only their task status

---

## 🛠 Tech Stack

### Frontend

* React.js
* Tailwind CSS
* React Router DOM
* Axios
* Context API / Redux Toolkit

### Backend

* Node.js
* Express.js

### Database

* MongoDB + Mongoose

### Authentication

* JWT
* bcrypt

---

## 📂 Project Structure

```bash
Task_Manager/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│
├── README.md
└── .gitignore
```

---

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-username/Task_Manager.git
cd Task_Manager
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file inside backend:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

Start backend server:

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔗 API Endpoints

### Authentication APIs

```bash
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

---

### Project APIs

```bash
POST /api/projects
GET /api/projects
GET /api/projects/:id
PUT /api/projects/:id
DELETE /api/projects/:id
POST /api/projects/:id/members
DELETE /api/projects/:id/members/:userId
```

---

### Task APIs

```bash
POST /api/projects/:projectId/tasks
GET /api/projects/:projectId/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
GET /api/tasks/my-tasks
```

---

### Dashboard API

```bash
GET /api/dashboard/stats
```

---

## 🗄 Database Models

### User

```js
{
  name,
  email,
  password
}
```

### Project

```js
{
  title,
  description,
  admin,
  members,
  deadline,
  status,
  tasks
}
```

### Task

```js
{
  title,
  description,
  priority,
  status,
  dueDate,
  assignedUser,
  project,
  createdBy
}
```

---

## 🔒 Security Features

* JWT Authentication
* Password Hashing
* Protected Routes
* Role-Based Access Control
* Input Validation
* Unauthorized Access Prevention
* Secure API Handling

---

## 🌐 Deployment

### Frontend

Deploy on Vercel

### Backend

Deploy on Render

### Database

Use MongoDB Atlas

---

## 📸 Screenshots

Add your project screenshots here:

* Login Page
* Dashboard
* Projects Page
* Task Management
* Analytics Dashboard

---

## 👨‍💻 Author

Developed by **Udit Narayan Pandey**
