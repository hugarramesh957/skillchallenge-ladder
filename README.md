# SkillChallenge Ladder 🪜

> **"Start Small. Build Skills. Reach Higher."**  
> A full-stack MERN educational platform featuring practical skill challenges, reviewer scoring & mentorship, and an automated rule-based smart challenge unlocking system.

---

## 1. Project Overview & Problem Statement

### Problem Statement
Traditional computer science education and online video courses often leave students trapped in "tutorial purgatory" without practical execution. Students need a structured, progressive path where they can advance from beginner exercises to demanding real-world full-stack systems with genuine code review feedback.

### Main Objective
Develop a production-quality platform where students improve their practical engineering capabilities by completing challenges organized into progressive difficulty ladders:
- Explore practical challenges across Frontend, Backend, Database, Security, and Real-Time Systems.
- Progress systematically from Beginner to Expert tiers.
- Access detailed instructions, expected deliverables, and sequential hints.
- Submit actual project implementations (descriptions, architectural approaches, GitHub links, and live demos).
- Receive mentor scoring, rating criteria (correctness, code quality, creativity), identified strengths, and guidance for growth.
- **Smart Challenge Unlocking & Personalized Suggestions**: Automatically unlock dependent challenges when prerequisites are approved by reviewers, and recommend personalized next steps influenced by reviewer feedback tags and score trajectories.

---

## 2. Key Differentiating Feature: Smart Unlocking & Recommendation Engine

The highlight of **SkillChallenge Ladder** is its transparent, backend-verified unlocking and personalized recommendation system:

1. **Prerequisite Dependency Graphs**:
   Challenges form an acyclic dependency graph. Challenges with no prerequisites are available to any student immediately.
2. **Reviewer Approval Gate**:
   A challenge is considered completed **only** after an authorized reviewer reviews and approves the student's submission. If improvements are requested (`needs_revision`), dependent challenges remain strictly locked.
3. **Backend-Enforced Security**:
   Direct API requests to start (`POST /api/progress/:id/start`) or submit (`POST /api/submissions`) for locked challenges are blocked on the server with `403 Forbidden` errors.
4. **Rule-Based Recommendation Engine**:
   - Analyzes recent reviewer `recommendedFocusTags` (e.g. `CSS3`, `Flexbox`, `Debugging`, `State Management`).
   - Evaluates average review scores: high performers ($\ge 80\%$) are guided toward the next difficulty level; students requiring reinforcement ($< 70\%$) receive targeted practice challenges.
   - Generates contextual explanations (e.g., *"Recommended because you completed previous work and your reviewer specifically suggested strengthening CSS3 and Flexbox."*).
5. **Circular Dependency Prevention**:
   The challenge management system checks for self-referencing and deep cyclic dependencies before any challenge prerequisite relationship is saved.

---

## 3. Technology Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **Styling**: Tailwind CSS (custom brand color palette: Indigo, Purple, Emerald)
- **Icons**: Lucide React
- **Routing**: React Router DOM (v6) with declarative `ProtectedRoute` layouts
- **HTTP Client**: Axios with automatic cookie authentication and request interceptors

### Backend
- **Runtime**: Node.js
- **Web Framework**: Express.js (REST API architecture)
- **Authentication**: JWT with secure `HttpOnly`, `SameSite` cookies
- **Security**: Helmet security headers, CORS origin whitelisting, Express Rate Limiting
- **Validation**: Zod schema validation middleware for all mutation endpoints
- **Password Hashing**: Bcrypt with salt rounds

### Database
- **Engine**: MongoDB with Mongoose ODM
- **Standalone Development**: Dynamic fallback to embedded `mongodb-memory-server` with automated disk caching, allowing instant setup without manual MongoDB service installation.

---

## 4. User Roles & Access Control

| Role | Permissions |
| :--- | :--- |
| **Student** | Register, log in, view personalized dashboard, explore catalogue, filter/search challenges, view hints, start unlocked challenges, submit work, view review evaluations and scores, track learning ladder progress. |
| **Reviewer** | Access reviewer command center, review pending submissions, assign scores (0-100) and criteria ratings (correctness, code quality, creativity), write feedback, approve or request revisions, manage curriculum (create, edit, publish, delete challenges). |

> **Note**: Public registration creates **Student** accounts only. Reviewer accounts are created via secure database seeding or authorized administration.

---

## 5. Project Folder Structure

```
c:\Users\admin\Desktop\Backend/
├── client/                     # Frontend Vite + React application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ChallengeCard.jsx
│   │   │   ├── DifficultyBadge.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global user authentication & role state
│   │   ├── pages/              # Application views
│   │   │   ├── ChallengeCatalogue.jsx
│   │   │   ├── ChallengeDetails.jsx
│   │   │   ├── ChallengeManagement.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MyProgress.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ReviewerDashboard.jsx
│   │   │   ├── ReviewSubmission.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── SubmissionPage.jsx
│   │   ├── services/           # Axios API services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── challengeService.js
│   │   │   ├── progressService.js
│   │   │   ├── recommendationService.js
│   │   │   └── submissionService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Backend Node.js + Express API
│   ├── config/
│   │   └── db.js               # MongoDB connection with memory fallback
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── challengeController.js
│   │   ├── progressController.js
│   │   ├── recommendationController.js
│   │   ├── reviewerController.js
│   │   └── submissionController.js
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT cookie & header verification
│   │   ├── errorMiddleware.js  # Centralized error handler
│   │   ├── roleMiddleware.js   # Role-based authorization
│   │   └── validateMiddleware.js # Zod schema validator
│   ├── models/
│   │   ├── Challenge.js
│   │   ├── StudentChallengeProgress.js
│   │   ├── Submission.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── challengeRoutes.js
│   │   ├── progressRoutes.js
│   │   ├── recommendationRoutes.js
│   │   ├── reviewerRoutes.js
│   │   └── submissionRoutes.js
│   ├── seed/
│   │   └── seed.js             # Realistic 12-challenge curriculum seed
│   ├── services/
│   │   ├── recommendationService.js # Next-challenge recommendation engine
│   │   └── unlockService.js    # Graph traversal & unlock calculator
│   ├── test/
│   │   └── test-runner.js      # Automated comprehensive test suite
│   ├── validators/             # Zod input schemas
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── package.json                # Root package with orchestration scripts
├── .env.example
└── README.md
```

---

## 6. Database Models Overview

1. **User**: Name, email (unique), hashed password, role (`student` or `reviewer`), timestamps.
2. **Challenge**: Title, unique slug, description, problem statement, instructions, difficulty (`Beginner`, `Intermediate`, `Advanced`, `Expert`), category, skills array, estimated minutes, deliverables array, hints array, prerequisites array (references to `Challenge`), `isPublished` boolean, creator reference.
3. **Submission**: Student reference, challenge reference, attempt number (auto-incremented per challenge), description, approach explanation, repository URL, live project URL, notes, status (`pending`, `approved`, `needs_revision`), score (0-100), criteria ratings (correctness, code quality, creativity), reviewer feedback, strengths, improvement areas, recommended focus tags, reviewer reference, reviewed timestamp.
4. **StudentChallengeProgress**: Compound unique index on `(studentId, challengeId)`, record of challenge start timestamp.

---

## 7. API Endpoints

### Authentication
- `POST /api/auth/register` — Register a student account (Rate-limited, Zod-validated)
- `POST /api/auth/login` — Sign in as student or reviewer (Issues HttpOnly JWT cookie)
- `POST /api/auth/logout` — Invalidate JWT cookie
- `GET /api/auth/me` — Hydrate current session user

### Challenges
- `GET /api/challenges` — List challenges with filters (difficulty, category, status, search, sort)
- `GET /api/challenges/:id` — Get detailed challenge by ID or slug
- `GET /api/challenges/:id/status` — Get student-specific status & missing prerequisites
- `POST /api/challenges` — Create challenge (*Reviewer only*, cyclic check)
- `PUT /api/challenges/:id` — Update challenge (*Reviewer only*)
- `DELETE /api/challenges/:id` — Delete challenge (*Reviewer only*, dependency check)

### Student Progress
- `GET /api/progress/dashboard` — Live dashboard statistics & recommendations
- `GET /api/progress/my-challenges` — All challenges with student progress flags
- `POST /api/progress/:id/start` — Start an unlocked challenge
- `GET /api/progress/history` — Student submission and completion timeline

### Submissions
- `POST /api/submissions` — Submit completed work (*Locked check enforced*)
- `GET /api/submissions/my-submissions` — View logged-in student submissions
- `GET /api/submissions/:id` — View submission attempt details

### Reviewer
- `GET /api/reviewer/dashboard` — Review queue statistics & metrics
- `GET /api/reviewer/submissions` — Review queue with filters
- `GET /api/reviewer/submissions/:id` — Inspect submission with previous attempt ledger
- `POST /api/reviewer/submissions/:id/review` — Approve or request improvements with scores & tags

### Recommendations
- `GET /api/recommendations/next` — Personalized next challenge recommendation
- `GET /api/recommendations/unlocked` — List of newly unlocked challenges

---

## 8. Demo Accounts

The database seed provides two pre-configured demo accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@skillladder.com` | `Student@123` |
| **Lead Reviewer** | `reviewer@skillladder.com` | `Reviewer@123` |

*(Convenient one-click demo login buttons are also provided directly on the `/login` page for fast review testing!)*

---

## 9. Installation & Getting Started

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm or pnpm

### Quick Setup

1. **Clone the repository and enter the directory**:
   ```bash
   cd Backend
   ```

2. **Install Server Dependencies**:
   ```bash
   npm --prefix server install
   ```

3. **Install Client Dependencies**:
   ```bash
   npm --prefix client install
   ```

4. **Environment Configuration**:
   Create a `.env` file in `server/.env` (or copy from `.env.example`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/skillchallenge_ladder
   JWT_SECRET=skillchallenge_ladder_super_secret_jwt_key_2026_secure
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

5. **Seed the Database with 12 Progressive Challenges**:
   ```bash
   node server/seed/seed.js
   ```

6. **Run the Full Test Suite**:
   ```bash
   node server/test/test-runner.js
   ```

7. **Start the Application**:
   - In terminal 1 (Backend Server):
     ```bash
     npm run start
     # Server listening on http://localhost:5000
     ```
   - In terminal 2 (Frontend Client):
     ```bash
     npm --prefix client run dev
     # Client accessible at http://localhost:5173
     ```

---

## 10. The 12 Progressive Curriculum Challenges

1. **Create a Personal HTML Profile Page** (Beginner • No prerequisites)
2. **Build a Responsive Landing Page** (Beginner • Prerequisite: #1)
3. **Develop a Personal Portfolio Website** (Beginner • Prerequisite: #2)
4. **Create an Interactive Calculator** (Intermediate • Prerequisite: #3)
5. **Build a To-Do List Application** (Intermediate • Prerequisite: #4)
6. **Create a Weather Dashboard** (Intermediate • Prerequisite: #5)
7. **Develop a Student Management System** (Intermediate • Prerequisite: #5)
8. **Build a REST API** (Advanced • Prerequisite: #7)
9. **Create a MongoDB CRUD Application** (Advanced • Prerequisite: #8)
10. **Develop a Full-Stack Authentication System** (Advanced • Prerequisite: #9)
11. **Build a Real-Time Chat Application** (Expert • Prerequisite: #10)
12. **Create a Full-Stack Project Management Platform** (Expert • Prerequisites: #11 & #8)

---

## 11. Security Highlights

- **Bcrypt Password Hashing**: Passwords are never stored in plaintext and are omitted from user queries by default (`select: false`).
- **HttpOnly, SameSite JWT Cookies**: Protects against cross-site scripting (XSS) and cross-site request forgery (CSRF).
- **Backend Validation**: Every input is validated by Zod schemas on the server before database mutation.
- **Role-Based Guards**: Reviewer endpoints are strictly guarded by `restrictTo('reviewer')` middleware.
- **Dependency Guard**: Challenges cannot be deleted if other challenges depend on them.

