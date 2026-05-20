# Visitor Management System 🏢

A full-stack **Visitor Management System** built during a 6-week internship at **RITES Limited, Gurugram**. .

🔗 **Live Demo:** [https://visitor-management-system-wxsk.onrender.com](https://visitor-management-system-wxsk.onrender.com)

---

## Overview

The system digitizes the visitor entry process — generating gate passes, tracking punch-in/out times, and maintaining complete visitor records. it's a digital solution to replace manual visitor registers at their office premises. 

---

## Features

- Secure Login & Signup with password encryption (bcrypt)
-  Live visitor photo capture using Camera & Canvas API
-  Digital Gate Pass generation for each visitor
-  Punch In / Punch Out time tracking
-  Daily Visitor Report with filterable records
-  Visitor Summary Report Dashboard
-  Persistent MySQL database storage
-  Responsive dashboard interface

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Auth | bcryptjs |
| Image Capture | Canvas API |
| Deployment | Render |

---

## Project Structure

```
Visitor-Management-System/
│
├── public/
│   ├── css/                  # Stylesheets
│   ├── js/                   # Client-side scripts
│   ├── dashboard.html        # Main dashboard
│   ├── login.html            # Login page
│   ├── signup.html           # Signup page
│   ├── gatepass.html         # Gate pass generator
│   ├── today-report.html     # Daily visitor report
│   ├── summary-report.html   # Summary dashboard
│   └── visitor-pass.html     # Visitor pass view
│
├── uploads/                  # Visitor photos
├── server.js                 # Express server & API routes
├── package.json
├── .env                      # Environment variables (not committed)
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js (v16+)
- MySQL

### 1. Clone the repository

```bash
git clone https://github.com/Saxshii/Visitor-Management-System.git
cd Visitor-Management-System
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=project
PORT=3000
```

### 4. Set up the database

Import the SQL schema into MySQL:

```bash
mysql -u root -p project < schema.sql
```

### 5. Start the server

```bash
npm start
```

Visit: [http://localhost:3000](http://localhost:3000)

