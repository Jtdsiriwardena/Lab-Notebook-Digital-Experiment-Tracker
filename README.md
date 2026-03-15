# 🧪 Digital Experiment Tracker — Lab Notebook

A full-stack web application for managing scientific experiments with collaboration, version control, file attachments, and role-based access — all in one digital lab notebook.

> Built with Django REST Framework, Django Channels, React, and JWT authentication — featuring real-time collaboration via WebSockets, designed for researchers, students, and lab teams.

---

![Image Alt](https://github.com/Jtdsiriwardena/Lab-Notebook-Digital-Experiment-Tracker/blob/b6fc06fd4b209b34c6c1ae17b5919d31e1d93647/Home_page.png) 

## 📌 Project Overview

The Digital Experiment Tracker enables research teams to:

- **Create and manage** experiments with structured fields
- **Collaborate** with teammates using role-based permissions
- **Track every change** made to an experiment with automatic change logs
- **Attach files** and images directly to experiments
- **Comment** on experiments as a team in **real-time**
- See **who is currently active** on an experiment via presence indicators

---

## 🚀 Features

### 🔐 Authentication
- User registration and login using **JWT tokens**
- All API routes protected by authentication middleware

### 📓 Experiment Management
- Manage operations on experiments
- Fields: `Name`, `Objective`, `Procedure`, `Results`, `Tags`
- Role-based field edit permissions

### 👥 Collaboration System
- Add collaborators with roles: **Owner**, **Editor**, or **Viewer**
- Only **Owners** can add or remove collaborators
- Collaborator role displayed alongside experiment data on the frontend

### 📎 Attachments
- Upload and display image attachments per experiment
- Only **Owners** and **Editors** can upload files

### 📝 Change Logs (Version Control)
- Automatically logs changes to: `name`, `objective`, `procedure`, `results`, `tags`
- Each log entry records:
  - Field that changed
  - Old and new values
  - Who made the change
  - Timestamp
  - Role of the user at the time of change

### 💬 Live Comments System
- Any collaborator (including Viewers) can comment on experiments
- Comments are posted and fetched securely using JWT
- **Real-time propagation** — new comments appear instantly for all users without page refresh
- **Typing indicators** — shows when another collaborator is composing a comment
- **Edit & Delete** — users can modify or remove their own comments with real-time updates
- **Character counter** — visual feedback on comment length limits
- **Reaction system** — basic engagement metrics per comment

### 🟢 Collaborator Presence Indicators
- **Active user avatars** — visual display of who is currently viewing the experiment
- **Real-time join/leave notifications** — updates instantly as users enter or exit
- **Viewer count** — shows total number of active users on the experiment
- **Connection status indicator** — live badge showing WebSocket connection state
- **Hover tooltips** — reveals full username on avatar hover
- **Automatic cleanup** — inactive users removed after disconnection

---

## 🛠 Tech Stack

### 🔙 Backend
| Technology | Purpose |
|---|---|
| Django + DRF | REST API framework |
| Django Channels | WebSocket support for real-time features |
| Daphne | ASGI server for WebSocket connections |
| PostgreSQL | Database |
| djangorestframework-simplejwt | JWT authentication |
| Django FileField | Media handling |

### 🔜 Frontend
| Technology | Purpose |
|---|---|
| React.js | Component-based UI |
| Tailwind CSS | Utility-first styling |
| React Router | Client-side routing |
| Axios | HTTP requests to backend API |
| WebSocket API | Native browser client for real-time communication |
| `useWebSocket` hook | Custom hook managing WS connections, reconnection & presence |
| localStorage | JWT token storage |

---

## 👤 Role-Based Permission System

| Action | Owner | Editor | Viewer |
|---|:---:|:---:|:---:|
| View experiment | ✅ | ✅ | ✅ |
| Edit experiment fields | ✅ | ✅ | ❌ |
| Upload attachments | ✅ | ✅ | ❌ |
| Add/remove collaborators | ✅ | ❌ | ❌ |
| Post comments | ✅ | ✅ | ✅ |
| Edit / delete own comments | ✅ | ✅ | ✅ |
| View change logs | ✅ | ✅ | ✅ |
| View collaborator presence | ✅ | ✅ | ✅ |

---

## 🏗 System Architecture

```
     Client (React)
          │           │
   Axios HTTP     WebSocket
   Requests       (ws://)
          │           │
          ▼           ▼
   Django REST    Django Channels
   Framework API  WebSocket Gateway
          │           │
     ┌────┴───────────┴────────┐
     ▼                         ▼
JWT Auth                Permission Layer
                        (Owner/Editor/Viewer)
                               │
           ┌───────────────────┼──────────────┐
           ▼                   ▼              ▼
      Experiments         Attachments     Live Comments
      ChangeLogs          Versions        Presence Events
           │
           ▼
     PostgreSQL
```

---

## 🗄️ Database Models

| Model | Key Fields |
|---|---|
| `Experiment` | name, objective, procedure, results, tags, owner |
| `Collaboration` | experiment, user, role |
| `Attachment` | experiment, file, uploaded_by |
| `ChangeLog` | experiment, field, old_value, new_value, changed_by, role, timestamp |
| `ExperimentVersion` | experiment, snapshot, created_at |
| `Comment` | experiment, user, content, timestamp |

---

## ⚡ Real-Time Communication

The live collaboration features are powered by **WebSockets** via Django Channels.

### Communication Protocol

| Channel | Purpose |
|---|---|
| WebSocket | Persistent bidirectional connection for real-time updates |
| REST API | Fallback and persistence layer for comments |
| JSON | Data interchange format for all WebSocket messages |

### Key Design Patterns

| Pattern | Usage |
|---|---|
| **Observer Pattern** | WebSocket consumers notify all connected clients of changes |
| **Singleton Pattern** | Single WebSocket connection maintained per experiment view |
| **Exponential Backoff** | Intelligent reconnection strategy for dropped connections |
| **Optimistic Updates** | Immediate UI updates with server-side confirmation |
| **Heartbeat Mechanism** | Regular ping/pong messages to maintain connection health |

---

## ⚙️ Installation

**1. Clone the repository**

```bash
git clone https://github.com/yourusername/digital-experiment-tracker.git
```

**2. Set up the backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**3. Set up the frontend**

```bash
cd ../frontend
npm install
```

---

## 🔑 Environment Variables

### Backend — create a `.env` file in `/backend`:

```env
SECRET_KEY=your_django_secret_key
DEBUG=True

# Database
DATABASE_URL=your_postgresql_connection_string

# JWT
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend — create a `.env` file in `/frontend`:

```env
VITE_API_URL=http://localhost:8000/api
```

---

## ▶️ Running the Application

**Run database migrations**

```bash
cd backend
python manage.py migrate
```

**Create a superuser (optional)**

```bash
python manage.py createsuperuser
```

**Start the backend** *(use Daphne for WebSocket support)*

```bash
daphne -p 8000 your_project.asgi:application
```

**Start the frontend**

```bash
cd frontend
npm run dev
```

---

## 📸 Screenshots

### Experiment Detail
**Experiment View**

![Image Alt](https://github.com/Jtdsiriwardena/Lab-Notebook-Digital-Experiment-Tracker/blob/2b576f87c269d6f557b2482ac328c660a7d51ebe/Experiment.png) 

**Experiment View (Reader Mode)**

![Image Alt](https://github.com/Jtdsiriwardena/Lab-Notebook-Digital-Experiment-Tracker/blob/993011eed7303482dce120ce5786e4a9afab8a69/Experiment_Viewer_Mode.png) 

**Comments**

![Image Alt](https://github.com/Jtdsiriwardena/Lab-Notebook-Digital-Experiment-Tracker/blob/6a29ce7a880c2cdcc67d377a7640be5f40735055/Experiment_Comments.png) 

**Esport As PDF**

![Image Alt](https://github.com/Jtdsiriwardena/Lab-Notebook-Digital-Experiment-Tracker/blob/6e34f77da94bdec0875d8d5a3f40fb145e2539b9/PDF.png) 

---
