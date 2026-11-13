import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Challenge from '../models/Challenge.js';
import Submission from '../models/Submission.js';
import StudentChallengeProgress from '../models/StudentChallengeProgress.js';
import { connectDB, closeDB } from '../config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Challenge.deleteMany({});
    await Submission.deleteMany({});
    await StudentChallengeProgress.deleteMany({});

    console.log('[Seed] Creating demo users...');
    // Create Reviewer
    const reviewer = await User.create({
      name: 'Elena Rostova (Lead Reviewer)',
      email: 'reviewer@skillladder.com',
      password: 'Reviewer@123',
      role: 'reviewer',
    });

    // Create Student
    const student = await User.create({
      name: 'Alex Rivera',
      email: 'student@skillladder.com',
      password: 'Student@123',
      role: 'student',
    });

    console.log(`[Seed] Created users: Reviewer (${reviewer.email}), Student (${student.email})`);

    console.log('[Seed] Creating challenges with progressive prerequisite tree...');

    // 1. Beginner 1 (No prerequisites)
    const c1 = await Challenge.create({
      title: 'Create a Personal HTML Profile Page',
      slug: 'create-a-personal-html-profile-page',
      description: 'Craft a semantic HTML5 personal profile page with headings, lists, tables, and multimedia.',
      problemStatement: 'Beginners frequently struggle with semantic markup and accessible document hierarchy. Build a clean personal profile using standard HTML5 tags without external frameworks.',
      instructions: `1. Create an index.html file with proper doctype, meta viewport, and title.
2. Structure the body using semantic tags: <header>, <nav>, <main>, <section>, <article>, and <footer>.
3. Include an avatar image with proper alt text.
4. Add a table showing your education or project experience.
5. Create an accessible contact form with labels, inputs, and a submit button.
6. Validate your HTML with the W3C validator.`,
      difficulty: 'Beginner',
      category: 'Frontend',
      skills: ['HTML5', 'Semantic Web', 'Accessibility', 'Forms'],
      estimatedMinutes: 45,
      deliverables: [
        'Valid semantic HTML5 document',
        'Profile card with avatar and biography',
        'Experience table and contact form with appropriate input types',
      ],
      hints: [
        'Always wrap form inputs in <label> elements or use htmlFor attributes for accessibility.',
        'Use <thead>, <tbody>, and <th> with scope="col" inside your table for proper screen-reader navigation.',
        'Remember to supply descriptive alt attributes on all <img> elements.',
      ],
      prerequisites: [],
      isPublished: true,
      createdBy: reviewer._id,
    });

    // 2. Beginner 2 (Prereq: c1)
    const c2 = await Challenge.create({
      title: 'Build a Responsive Landing Page',
      slug: 'build-a-responsive-landing-page',
      description: 'Design and build a responsive landing page using CSS Flexbox, Grid, and media queries.',
      problemStatement: 'Web applications must adapt flawlessly across desktop, tablet, and mobile screen viewports. Implement modern CSS techniques without layout shifts.',
      instructions: `1. Build upon clean HTML structure and create a responsive CSS stylesheet.
2. Create a sticky navigation bar with a mobile hamburger toggle.
3. Implement a Hero section using CSS Flexbox with call-to-action buttons.
4. Build a 3-column features section using CSS Grid that collapses into a single column on mobile screens (< 768px).
5. Implement smooth scrolling and subtle hover micro-interactions.
6. Verify layout integrity in mobile viewport mode.`,
      difficulty: 'Beginner',
      category: 'Frontend',
      skills: ['CSS3', 'Flexbox', 'CSS Grid', 'Responsive Design', 'Mobile-First'],
      estimatedMinutes: 60,
      deliverables: [
        'Responsive layout adapting smoothly from 320px to 1920px',
        'CSS Grid-powered features showcase',
        'Mobile hamburger navigation drawer',
      ],
      hints: [
        'Adopt a mobile-first workflow: style for mobile first, then use @media (min-width: 768px) to enhance for larger screens.',
        'Use "grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))" for an intrinsically responsive grid without rigid breakpoints.',
        'Set "box-sizing: border-box" universally (*, *::before, *::after) to keep padding calculations predictable.',
      ],
      prerequisites: [c1._id],
      isPublished: true,
      createdBy: reviewer._id,
    });

    // 3. Beginner 3 (Prereq: c2)
    const c3 = await Challenge.create({
      title: 'Develop a Personal Portfolio Website',
      slug: 'develop-a-personal-portfolio-website',
      description: 'Create a multi-section personal portfolio website showcasing your developer bio, projects, and contact avenues.',
      problemStatement: 'A professional online presence is crucial for developers. Build an eye-catching portfolio website featuring dark/light theme toggle and project filter cards.',
      instructions: `1. Create sections: About Me, Skills Matrix, Featured Projects, Testimonials, and Contact.
2. Store project metadata in a JavaScript array and render project cards dynamically.
3. Implement a category filter (e.g., All, Frontend, Full-Stack).
4. Add a working Dark/Light theme switcher that remembers user preference via localStorage.
5. Ensure WCAG AA color contrast ratios throughout both themes.`,
      difficulty: 'Beginner',
      category: 'Frontend',
      skills: ['HTML5', 'CSS3', 'JavaScript', 'DOM Manipulation', 'localStorage'],
      estimatedMinutes: 90,
      deliverables: [
        'Multi-section portfolio with responsive design',
        'Dynamic project card rendering with category filter',
        'Persistent Dark/Light theme toggle',
      ],
      hints: [
        'Use data attributes (e.g. data-theme="dark") on document.documentElement for clean CSS variable switching.',
        'Check window.matchMedia("(prefers-color-scheme: dark)") to detect user system preferences by default.',
      ],
      prerequisites: [c2._id],
      isPublished: true,
      createdBy: reviewer._id,
    });

    // 4. Intermediate 1 (Prereq: c3)
    const c4 = await Challenge.create({
      title: 'Create an Interactive Calculator',
      slug: 'create-an-interactive-calculator',
      description: 'Implement a scientific/standard mathematical calculator handling operations, keyboard input, and edge cases.',
      problemStatement: 'Calculators test precision, state management, operator precedence, floating point corrections, and error handling.',
      instructions: `1. Implement basic operations (+, -, *, /) along with percentage, negation, and clear/reset.
2. Support decimal points with 0.1 + 0.2 floating point fix.
3. Allow keyboard event listeners for all digit keys, operators, Enter (=), and Backspace.
4. Prevent illegal input sequences (e.g. "5++2", multiple decimals, division by zero).
5. Display calculation history in a collapsable ledger.`,
      difficulty: 'Intermediate',
      category: 'JavaScript',
      skills: ['JavaScript', 'State Management', 'Keyboard Events', 'Math Logic', 'Debugging'],
      estimatedMinutes: 75,
      deliverables: [
        'Accurate calculations with floating point rounding safeguards',
        'Complete keyboard event navigation',
        'History ledger and error handling for division by zero',
      ],
      hints: [
        'Keep currentOperand, previousOperand, and operation in clean state variables.',
        'Avoid eval() for security reasons; parse or compute using explicit mathematical functions.',
        'Use Number.EPSILON or .toFixed(8) followed by parseFloat to fix JavaScript 0.1 + 0.2 precision quirks.',
      ],
      prerequisites: [c3._id],
      isPublished: true,
      createdBy: reviewer._id,
    });

    // 5. Intermediate 2 (Prereq: c4)
    const c5 = await Challenge.create({
      title: 'Build a To-Do List Application',
      slug: 'build-a-to-do-list-application',
      description: 'Build a feature-rich task tracker with priority tags, due dates, search, filtering, and local persistence.',
      problemStatement: 'Task management requires CRUD operations on client memory, sorting algorithms, and state synchronization with local storage.',
      instructions: `1. Allow users to create tasks with title, description, priority (High, Medium, Low), and due date.
2. Implement inline editing, marking complete, and deleting with undo toast notification.
3. Provide filters for All, Active, Completed, and priority tiers.
4. Implement live search filtering as user types.
5. Persist tasks in localStorage so data survives browser refreshes.`,
      difficulty: 'Intermediate',
      category: 'Frontend',
      skills: ['React.js', 'State Hooks', 'CRUD', 'Local Storage', 'Event Handling'],
      estimatedMinutes: 90,
      deliverables: [
        'Full CRUD capabilities for tasks',
        'Priority tagging and date sorting',
        'Search & filter controls with zero page reloads',
      ],
      hints: [
        'Generate unique IDs for tasks using crypto.randomUUID() or Date.now().',
        'Keep filter and search state separate from the primary tasks list.',
      ],
      prerequisites: [c4._id],
      isPublished: true,
      createdBy: reviewer._id,
    });

    // 6. Intermediate 3 (Prereq: c5)
    const c6 = await Challenge.create({
      title: 'Create a Weather Dashboard',
      slug: 'create-a-weather-dashboard',
      description: 'Fetch real-time weather data and 5-day forecasts via public REST APIs, handling asynchronous states and geolocation.',
      problemStatement: 'Working with third-party asynchronous APIs introduces network latency, rate limits, invalid queries, and loading states.',
      instructions: `1. Connect to Open-Meteo or OpenWeather API using fetch or Axios.
2. Build a search box with city autocomplete or recent searches dropdown.
3. Display current conditions: temperature, humidity, wind speed, UV index, and weather icons.
4. Render a 5-day forecast card strip with high/low temperatures.
5. Implement robust loading skeletons and user-friendly error banners for failed city lookups.`,
      difficulty: 'Intermediate',
      category: 'API Integration',
      skills: ['Async/Await', 'Axios', 'REST API', 'Error Handling', 'Geolocation'],
      estimatedMinutes: 90,
      deliverables: [
        'Live weather metrics with 5-day forecast',
        'Search history persisted in browser',
        'Loading state indicators and graceful offline/error handling',
      ],
      hints: [
        'Wrap asynchronous API calls in try...catch blocks to handle network failure gracefully.',
        'Use AbortController to cancel previous in-flight requests when the user types a new search query.',
      ],
      prerequisites: [c5._id],
      isPublished: true,
      createdBy: reviewer._id,
    });

    // 7. Intermediate 4 (Prereq: c5)
    const c7 = await Challenge.create({
      title: 'Develop a Student Management System',
      slug: 'develop-a-student-management-system',
      description: 'Create an administrative CRUD interface for student enrollments, course assignments, and grade tracking.',
      problemStatement: 'Enterprise systems demand structured relational data views, paginated tables, sorting, and modal forms with validation.',
      instructions: `1. Build a tabular student registry showing Name, Email, Course, Enrollment Date, and GPA.
2. Implement column-based sorting (asc/desc by name, GPA, date).
3. Add a modal form to enroll new students with rigorous field validation.
4. Implement client-side pagination (10 students per page) with total count indicators.
5. Add a CSV export button to download student records.`,
      difficulty: 'Intermediate',
      category: 'Full Stack',
      skills: ['React.js', 'Forms', 'Pagination', 'Data Tables', 'CSV Export'],
      estimatedMinutes: 100,
      deliverables: [
        'Paginated data table with multi-column sorting',
        'Validated enrollment modal',
        'CSV export functionality',
      ],
      hints: [
        'Use controlled form inputs with local validation state before dispatching to store.',
        'Build a reusable Table and Pagination component for clean architecture.',
      ],
      prerequisites: [c5._id],
      isPublished: true,
      createdBy: reviewer._id,
    });

    // 8. Advanced 1 (Prereq: c7)
    const c8 = await Challenge.create({
      title: 'Build a REST API',
      slug: 'build-a-rest-api',
      description: 'Architect a robust Node.js and Express RESTful API with modular routers, middleware, and Zod validation.',
      problemStatement: 'Scalable backend services require clean routing separation, parameter validation, centralized error handling, and structured JSON responses.',
      instructions: `1. Initialize an Express application with modular routes (/api/courses, /api/students).
2. Implement complete REST verbs: GET, POST, PUT, PATCH, and DELETE.
3. Validate request bodies and query parameters with Zod middleware.
4. Implement centralized error handler middleware for 400, 404, and 500 status codes.
5. Protect endpoints with API key headers and rate-limiting middleware.`,
      difficulty: 'Advanced',
      category: 'Backend',
      skills: ['Node.js', 'Express.js', 'REST API', 'Middleware', 'Zod Validation'],
      estimatedMinutes: 120,
      deliverables: [
        'Organized Express app with routes, controllers, and middlewares',
        'Zod schema validation on all mutation endpoints',
        'Centralized error handling and API healthcheck',
      ],
      hints: [
        'Always return a consistent response envelope: { success: boolean, message: string, data: ... }',
        'Use custom Error classes (e.g. AppError) to pass status codes to next(err).',
      ],
      prerequisites: [c7._id],
      isPublished: true,
      createdBy: reviewer._id,
    });

    // 9. Advanced 2 (Prereq: c8)
    const c9 = await Challenge.create({
      title: 'Create a MongoDB CRUD Application',
      slug: 'create-a-mongodb-crud-application',
      description: 'Integrate Mongoose ODM with MongoDB, implementing schemas, indexes, relationships, and aggregation pipelines.',
      problemStatement: 'Persistent data requires relational modeling in document databases, indexing strategies for high throughput, and data integrity.',
      instructions: `1. Define Mongoose schemas with field constraints, defaults, and timestamps.
2. Establish a one-to-many relationship using ObjectId references and .populate().
3. Create compound indexes on frequently queried fields.
4. Implement an aggregation pipeline to compute summary statistics (e.g., average grade per course).
5. Implement soft-deletes or status flag toggles.`,
      difficulty: 'Advanced',
      category: 'Database',
      skills: ['MongoDB', 'Mongoose', 'Database Indexing', 'Aggregation Pipelines', 'Data Modeling'],
      estimatedMinutes: 120,
      deliverables: [
        'Normalized Mongoose models with referential integrity',
        'Aggregations calculating group metrics',
        'Documented indexing strategy',
      ],
      hints: [
        'Use .select("-password") or schema-level select: false to avoid accidental exposure of sensitive fields.',
        'Use .lean() on read-only queries for improved query execution performance.',
      ],
      prerequisites: [c8._id],
      isPublished: true,
      createdBy: reviewer._id,
    });

    // 10. Advanced 3 (Prereq: c9)
    const c10 = await Challenge.create({
      title: 'Develop a Full-Stack Authentication System',
      slug: 'develop-a-full-stack-authentication-system',
      description: 'Implement secure JWT authentication, password hashing with bcrypt, HttpOnly cookies, and RBAC.',
      problemStatement: 'Web application security relies on safeguarding credentials, protecting against XSS and CSRF, and restricting sensitive routes by role.',
      instructions: `1. Implement user registration and login endpoints with bcrypt password hashing (min 10 salt rounds).
2. Issue JSON Web Tokens stored exclusively in secure HttpOnly, SameSite cookies.
3. Build auth protection and role-based authorization (RBAC) middlewares.
4. Provide a /api/auth/me endpoint to hydrate authenticated sessions.
5. Create React ProtectedRoute components redirecting unauthorized users.`,
      difficulty: 'Advanced',
      category: 'Security',
      skills: ['JWT', 'bcrypt', 'HttpOnly Cookies', 'RBAC', 'Web Security'],
      estimatedMinutes: 150,
      deliverables: [
        'Secure authentication API with HttpOnly cookie tokens',
        'Role-based route protection on backend and frontend',
        'Token expiry and logout invalidation',
      ],
      hints: [
        'Never store JWT tokens in localStorage or sessionStorage due to XSS vulnerability.',
        'Set "sameSite: lax" or "none" (with secure: true in production) on auth cookies.',
      ],
      prerequisites: [c9._id],
      isPublished: true,
      createdBy: reviewer._id,
    });

    // 11. Expert 1 (Prereq: c10)
    const c11 = await Challenge.create({
      title: 'Build a Real-Time Chat Application',
      slug: 'build-a-real-time-chat-application',
      description: 'Construct a bi-directional real-time messaging application with WebSockets, room channels, and online presence tracking.',
      problemStatement: 'Real-time collaboration introduces state concurrency, connection drop recovery, typing indicators, and message delivery guarantees.',
      instructions: `1. Set up a WebSocket server using Socket.io or ws paired with Express.
2. Authenticate WebSocket connections using the existing JWT cookie/handshake token.
3. Implement chat rooms with join/leave events and real-time message broadcasting.
4. Show active online presence and typing indicators.
5. Persist message history in MongoDB with pagination for message scrolls.`,
      difficulty: 'Expert',
      category: 'Real-Time',
      skills: ['WebSockets', 'Socket.io', 'Concurrency', 'Real-Time State', 'Presence Tracking'],
      estimatedMinutes: 180,
      deliverables: [
        'Bi-directional WebSocket messaging platform',
        'JWT-authenticated socket handshakes',
        'Typing indicators and persistent room logs',
      ],
      hints: [
        'Authenticate the socket handshake using jwt.verify inside io.use() middleware.',
        'Throttle typing indicators with debounce/timeout to avoid flooding socket traffic.',
      ],
      prerequisites: [c10._id],
      isPublished: true,
      createdBy: reviewer._id,
    });

    // 12. Expert 2 (Prereq: c11 & c8)
    const c12 = await Challenge.create({
      title: 'Create a Full-Stack Project Management Platform',
      slug: 'create-a-full-stack-project-management-platform',
      description: 'Develop an enterprise Kanban board platform with drag-and-drop tasks, team permissions, analytics, and audit logs.',
      problemStatement: 'Large-scale applications require complex state coordination, optimistic UI updates, drag-and-drop workflows, and team access hierarchies.',
      instructions: `1. Implement Kanban boards with customizable columns (To Do, In Progress, Review, Done).
2. Support smooth drag-and-drop reordering with optimistic UI updates.
3. Implement team workspaces with Owner, Member, and Viewer permissions.
4. Record audit logs for task movements and assignments.
5. Build an analytics view calculating sprint velocity and completion rates.`,
      difficulty: 'Expert',
      category: 'Full Stack',
      skills: ['React DnD', 'Optimistic UI', 'Full Stack Architecture', 'Analytics', 'Enterprise RBAC'],
      estimatedMinutes: 240,
      deliverables: [
        'Interactive Drag-and-drop Kanban workspace',
        'Multi-tenant team workspace permissions',
        'Comprehensive audit log and metrics dashboard',
      ],
      hints: [
        'Update local UI state immediately on drop (optimistic update), then dispatch the API request and revert if the request fails.',
        'Use fractional index positioning or linked list pointers for efficient task reordering.',
      ],
      prerequisites: [c11._id, c8._id],
      isPublished: true,
      createdBy: reviewer._id,
    });

    console.log(`[Seed] Successfully created 12 challenges across all 4 difficulty levels!`);

    // Pre-seed realistic progress & submissions for the demo student:
    // Challenge 1: Approved submission (Score 94) -> Unlocks Challenge 2
    console.log('[Seed] Seeding completed submission for Challenge 1...');
    await StudentChallengeProgress.create({
      studentId: student._id,
      challengeId: c1._id,
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    const sub1 = await Submission.create({
      studentId: student._id,
      challengeId: c1._id,
      attemptNumber: 1,
      description: 'Completed semantic HTML5 profile page with accessible tags, biographical section, education table, and contact form.',
      approach: 'I planned out the document structure using semantic HTML5 tags (<header>, <nav>, <main>, <section>, <footer>). Added descriptive alt tags on the avatar and structured the table using proper <thead> and <tbody> scopes for screen readers.',
      repositoryUrl: 'https://github.com/alex-rivera/html5-profile-showcase',
      liveProjectUrl: 'https://alex-rivera-profile.vercel.app',
      notes: 'Passed W3C validation with zero errors!',
      status: 'approved',
      score: 94,
      correctnessRating: 5,
      codeQualityRating: 5,
      creativityRating: 4,
      reviewerFeedback: 'Outstanding work on semantic structuring and accessibility! The table headers with scope attributes and accessible form labeling are exemplary. Keep this attention to detail.',
      strengths: 'Excellent use of semantic elements, 100% W3C valid, clean indentation.',
      improvementAreas: 'Could enhance form input validation with pattern attributes.',
      recommendedFocusTags: ['CSS3', 'Flexbox', 'Responsive Design'],
      reviewedBy: reviewer._id,
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // Challenge 2: In-Progress / Started by student (Unlocked because Challenge 1 is approved!)
    console.log('[Seed] Seeding in-progress state for Challenge 2...');
    await StudentChallengeProgress.create({
      studentId: student._id,
      challengeId: c2._id,
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    console.log('[Seed] Database successfully seeded with demo accounts and dynamic data!');
  } catch (err) {
    console.error('[Seed Error]:', err);
    throw err;
  }
};

// If run directly via "node seed/seed.js"
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(async () => {
      console.log('[Seed] Finished successfully. Exiting.');
      await closeDB();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error(e);
      await closeDB();
      process.exit(1);
    });
}

