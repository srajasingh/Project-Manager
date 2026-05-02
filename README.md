# Project Nexus - Management Application

Project Nexus is a full-stack project management web application built to streamline task delegation and tracking. It features a robust Role-Based Access Control (RBAC) system, allowing Project Admins to create projects and assign tasks, while Team Members can track and update their progress.

## 🚀 Key Features

- **Authentication System:** Secure signup and login functionality using JWT and bcrypt password hashing.
- **Role-Based Access Control (RBAC):** 
  - **Project Admins:** Full access to create projects, create tasks, and assign tasks to specific team members.
  - **Team Members:** Restricted access to view assigned projects and update task statuses (Todo, In Progress, Done).
- **Project & Team Management:** Admins can oversee all ongoing projects and collaborate with registered team members.
- **Task Tracking:** Full task lifecycle management with due dates, descriptions, assignees, and real-time status updates.
- **Dynamic Dashboard:** A centralized dashboard displaying task progress metrics, status breakdowns, and a list of overdue/active tasks.
- **Premium UI:** Custom-built design system featuring a sleek dark mode, glassmorphism elements, and responsive layouts.

## 🛠️ Technology Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Vanilla CSS with custom CSS variables and glassmorphism utilities
- **Backend API:** Next.js Route Handlers (REST APIs)
- **Database:** PostgreSQL (Production) / SQLite (Local Development)
- **ORM:** Prisma
- **Authentication:** Custom JWT-based authentication
- **Deployment:** Railway

## 🌐 Live Demo

The application is deployed and live on Railway!
**URL:** [https://project-manager-production-d11b.up.railway.app/](https://project-manager-production-d11b.up.railway.app/)

## 💻 Local Development Setup

To run this project locally on your machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Project-Manager.git
   cd Project-Manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   # Local SQLite Database (Development)
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your_super_secret_jwt_key_here"
   ```

4. **Initialize the Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The application will be available at http://localhost:3000*

## 📦 Deployment Instructions (Railway)

This application is configured for seamless deployment on Railway using Nixpacks.

1. Connect your GitHub repository to a new Railway project.
2. Add a **PostgreSQL** database to your Railway project.
3. Link the `DATABASE_URL` variable from the PostgreSQL service to your Next.js application.
4. Add a custom `JWT_SECRET` variable to your Next.js application.
5. Railway will automatically build the Next.js app, run the database migrations (`npx prisma db push`), and start the server!
