# Document Management System

A modern full-stack web application designed for students, professionals, and individuals to securely store, organize, and manage important documents (personal records, academic credentials, project specs, resumes, certificates, and client requirements) in one central vault for future reference.

---

## 🛠️ Technology Stack

- **Frontend**: React.js with Next.js 14 (App Router)
- **Backend**: Node.js with Express.js (MVC Architecture)
- **Database**: MySQL (connected via `mysql2/promise` pool)
- **Authentication**: JWT (JSON Web Tokens) & `bcryptjs` password hashing
- **Styling**: Tailwind CSS & Lucide Icons
- **File Upload**: Multer (Local Disk Storage configured in `server/uploads/`)

---

## 📁 Folder Structure

```
Document Management System/
├── server/                    # Node.js Express MVC Backend
│   ├── config/                # Database pool connection (db.js)
│   ├── controllers/           # MVC Controllers (authController.js, documentController.js)
│   ├── database/              # MySQL Schema file (schema.sql)
│   ├── middleware/            # JWT Auth & Multer Upload middlewares
│   ├── models/                # MVC Models (userModel.js, documentModel.js)
│   ├── routes/                # Express API routes (authRoutes.js, documentRoutes.js)
│   ├── uploads/               # Local file storage folder
│   ├── .env                   # Active environment variables
│   ├── package.json
│   └── server.js              # Server entry point
│
└── client/                    # Next.js React Frontend
    ├── src/
    │   ├── app/               # Next.js App Router pages
    │   │   ├── page.tsx       # Responsive Home Page
    │   │   ├── login/         # JWT Login Page
    │   │   ├── register/      # Account Registration Page
    │   │   └── dashboard/     # Dashboard Layout & Overview Page
    │   ├── components/        # UI Navigation & Header Components
    │   │   ├── Navbar.tsx     # Public Top Navigation Bar
    │   │   ├── Footer.tsx     # Responsive Footer
    │   │   ├── Sidebar.tsx    # Dashboard Sidebar Navigation
    │   │   └── Header.tsx     # Dashboard Top Navigation Bar
    │   ├── context/           # AuthContext (React Auth State & JWT token handling)
    │   └── lib/               # Axios API instance (api.ts)
    ├── tailwind.config.ts
    ├── next.config.mjs
    └── package.json
```

---

## 🚀 Running the Project Locally

### 1. Database Setup (MySQL)
Execute `server/database/schema.sql` in your MySQL server or MySQL Workbench to initialize the `document_management_db` database and tables.

### 2. Start Backend Server
```bash
cd server
npm install
npm run dev   # Starts server on http://localhost:5000
```

### 3. Start Frontend App
```bash
cd client
npm install
npm run dev   # Starts Next.js app on http://localhost:3000
```

---

## 🔐 Key Features & Prepared Structure

- **Responsive Home Page**: Highlights features, target user solutions (students, professionals, freelancers), document categories, and CTAs.
- **Login Page**: JWT authenticated login with validation and password toggle.
- **Register Page**: User registration supporting account types (`student`, `professional`, `individual`).
- **Dashboard Layout**: Includes collapsible sidebar, sticky top header bar, user avatar, and status badges.
- **MVC Architecture**: Decoupled models, controllers, and routes in Express backend.
- **Multer Storage**: Configured for local file storage in `server/uploads/`.
