# Developer Collaboration Platform - Project Plan

## 1. Architecture Plan

This platform follows a modern client-server architecture with real-time capabilities.

### 1.1 Tech Stack Selection
*   **Frontend:** HTML, CSS (Vanilla for flexibility/customization), JavaScript (Vanilla or lightweight rendering wrapper).
*   **Backend:** Node.js with Express.js (High performance for I/O bound tasks and excellent WebSocket support).
*   **Real-time Engine:** Socket.io (Simplifies WebSocket connections for real-time code discussions and task board updates).
*   **Database:** MongoDB (via Mongoose). A NoSQL database provides flexibility for dynamic task boards and chat logs.
*   **Payment Gateway:** Razorpay API for handling premium plan subscriptions.
*   **Authentication:** JSON Web Tokens (JWT) for stateless, scalable user sessions.

### 1.2 System Components
1.  **Client (Browser):** Handles the UI, interacts with the user, communicates with REST APIs for standard CRUD operations, and maintains a persistent WebSocket connection for real-time features.
2.  **API Server (Node/Express):** Handles routing, business logic, authenticates users (JWT), interacts with the database, and processes payments via Razorpay.
3.  **WebSocket Server (Socket.io):** Integrated with the Node API server to push live updates to connected clients (chat messages, task movements).
4.  **Database Server (MongoDB):** Stores all persistent data (Users, Projects, Tasks, Messages).

---

## 2. Database Design Draft (MongoDB)

Since we are using MongoDB, here is the schema draft based on collections.

### 2.1 `Users` Collection
*   `_id`: ObjectId
*   `name`: String
*   `email`: String (Unique)
*   `passwordHash`: String
*   `plan`: String (Enum: 'free', 'premium') - Default: 'free'
*   `createdAt`: Timestamp

### 2.2 `Projects` Collection
*   `_id`: ObjectId
*   `name`: String
*   `description`: String
*   `ownerId`: ObjectId (Ref: Users)
*   `collaborators`: Array of ObjectIds (Ref: Users)
*   `createdAt`: Timestamp

### 2.3 `Tasks` Collection
*   `_id`: ObjectId
*   `projectId`: ObjectId (Ref: Projects)
*   `title`: String
*   `description`: String
*   `status`: String (Enum: 'todo', 'in-progress', 'review', 'done')
*   `assigneeId`: ObjectId (Ref: Users) - nullable
*   `createdAt`: Timestamp
*   `updatedAt`: Timestamp

### 2.4 `Messages` (Code Discussions) Collection
*   `_id`: ObjectId
*   `projectId`: ObjectId (Ref: Projects)
*   `senderId`: ObjectId (Ref: Users)
*   `content`: String (Text / Markdown / Code Snippets)
*   `timestamp`: Timestamp

### 2.5 `Transactions` (Premium Plans) Collection
*   `_id`: ObjectId
*   `userId`: ObjectId (Ref: Users)
*   `razorpayOrderId`: String
*   `razorpayPaymentId`: String
*   `amount`: Number
*   `status`: String (Enum: 'created', 'successful', 'failed')
*   `createdAt`: Timestamp

---

## 3. Implementation Plan

The development will be executed in phases to ensure a structured build-up of features.

### Phase 1: Foundation & Authentication (Week 1)
*   Initialize Node.js/Express backend and setup MongoDB connection.
*   Set up basic HTML/CSS/JS scaffolding for the frontend interface.
*   Implement User registration, login, and JWT generation/validation.
*   *Milestone:* A user can successfully sign up, log in, and receive a JWT token.

### Phase 2: Core Platform & Project Management (Week 1-2)
*   Backend REST APIs for creating, reading, updating, and deleting (CRUD) Projects.
*   Implement collaborator invitation logic (adding user IDs to project arrays).
*   Frontend UI for the dashboard and project creation forms.
*   *Milestone:* Users can create projects and invite other registered users to them.

### Phase 3: Task Boards (Kanban) (Week 2)
*   Backend APIs for managing Tasks within specific Projects.
*   Frontend UI for the Kanban board (columns: To Do, In Progress, Review, Done).
*   Implement drag-and-drop logic (or simple button movements) on the frontend to update task status.
*   *Milestone:* Collaborators can create tasks, assign them, and move them across board columns.

### Phase 4: Real-time Collaboration (Week 3)
*   Integrate Socket.io into the backend server.
*   Setup WebSocket connections on the frontend upon entering a project.
*   Develop real-time UI for Code Discussions (chat interface).
*   Enable Socket events to broadcast task board changes to all active collaborators instantly.
*   *Milestone:* Chat messages and task movements reflect instantly across all connected clients without refreshing.

### Phase 5: Monetization & Polish (Week 4)
*   Integrate Razorpay Node.js SDK and frontend checkout scripts.
*   Create endpoints to generate Razorpay orders and verify payment signatures.
*   Implement payment success webhooks to upgrade User `plan` status to 'premium'.
*   Final review of UI/UX, bug fixing, and security audits.
*   *Milestone:* Successful end-to-end payment flow and stable application ready for use.

---

## 4. User Flow Plan

### 4.1 Onboarding & Authentication
1.  **Landing Page:** User visits the platform (sees benefits, features, pricing).
2.  **Sign Up / Login:** User creates an account or logs in.
    *   *Success:* Redirected to Dashboard.
    *   *Failure:* Shows error message (invalid credentials, email taken).

### 4.2 Dashboard & Projects
1.  **Dashboard View:** User sees a list of their owned projects and projects they are collaborating on.
2.  **Create Project:** User clicks "New Project", enters details (name, description), and creates it.
3.  **Open Project:** User clicks on a project card to enter the Project Workspace.

### 4.3 Project Workspace (The Core)
1.  **Sidebar navigation:** Switches between Task Board, Code Discussions, and Settings.
2.  **Invite Collaborators (Settings):** Owner can add users by email/username.
3.  **Task Board (Kanban):**
    *   User creates a task in "To Do".
    *   User assigns task to a collaborator.
    *   User drags task to "In Progress", "Review", then "Done". (Updates sync via WebSockets to all active viewers).
4.  **Code Discussions:** User opens the chat interface, sends messages, shares code snippets in real-time.

### 4.4 Premium Upgrade (Monetization)
1.  **Upgrade Prompt:** User clicks "Upgrade to Premium" in navbar or settings.
2.  **Checkout:** User selects plan, Razorpay modal opens.
3.  **Payment:** User completes transaction.
4.  **Confirmation:** Webhook verifies payment, user plan updates to 'premium', unlocking advanced features (e.g., more projects, larger file uploads).

---

## 5. UI Design Plan

### 5.1 Design System & Aesthetics
*   **Theme:** Modern Dark Mode by default (sleek developer aesthetic).
*   **Typography:** 'Inter' or 'Roboto Mono' for code snippets, 'Outfit' for headings.
*   **Color Palette:**
    *   Background: `#121212` (Very dark gray)
    *   Surface/Cards: `#1E1E1E` (Slightly lighter gray)
    *   Primary Accent: `#6366F1` (Indigo - for buttons, active states)
    *   Secondary/Success: `#10B981` (Emerald - for 'Done' tasks, success messages)
    *   Text: `#F3F4F6` (Light Gray) / `#9CA3AF` (Muted Gray)
*   **Elements:** Glassmorphism for modals/dropdowns, subtle hover animations (scale up, glow effects).

### 5.2 Key Views
*   **Landing Page:** Hero section with an animated 3D element or code typing effect, feature grid, pricing table.
*   **Dashboard:** Grid of project cards. Cards have hover effects revealing quick stats (open tasks).
*   **Kanban Board:** 4 distinct columns. Task cards are draggable objects with assignee avatars and status color tags.
*   **Chat Interface:** Split view (left: chat history, right/bottom: input area with Markdown/Code snippet support).

---

## 6. Project Folder Structure Plan

Here is the proposed folder structure separating Frontend and Backend for clarity and scalability.

```text
/project-root
│
├── /backend                 # Node.js / Express Server
│   ├── /config              # Env vars, database connection config, Razorpay config
│   ├── /controllers         # Route logic (authController, projectController, etc.)
│   ├── /models              # Mongoose Schemas (User, Project, Task, Message)
│   ├── /routes              # Express API Routes (/api/auth, /api/projects)
│   ├── /middleware          # JWT verification, error handling
│   ├── /services            # Business logic, Socket.io event handlers setup
│   ├── server.js            # Entry point, Express app setup, Server start
│   ├── package.json         # Backend dependencies
│   └── .env                 # Secrets (DB URI, JWT Secret, Razorpay Keys)
│
├── /frontend                # HTML/CSS/Vanilla JS (or lightweight framework)
│   ├── /public              # Static assets (images, icons)
│   ├── /css
│   │   ├── style.css        # Global styles, variables
│   │   ├── dashboard.css    # Dashboard specific styles
│   │   └── board.css        # Kanban board styles
│   ├── /js
│   │   ├── api.js           # API request wrappers (fetch/axios)
│   │   ├── auth.js          # Login/Signup logic, token management
│   │   ├── dashboard.js     # Rendering projects, handling dashboard UI
│   │   ├── board.js         # Kanban drag-drop logic, rendering tasks
│   │   └── socket.js        # Socket.io client initialization and event listeners
│   ├── index.html           # Landing Page
│   ├── login.html           # Auth Page
│   ├── dashboard.html       # Main Dashboard view
│   └── project.html         # Project Workspace (Kanban + Chat)
│
└── .gitignore               # Ignore node_modules, .env, etc.
```
