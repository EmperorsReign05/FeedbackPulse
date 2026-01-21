# Feedback Pulse

A modern SaaS application for collecting and managing user feedback with AI-powered sentiment analysis.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)

##  Features

- **Feedback Collection** - Embeddable widget for any website
- **AI Sentiment Analysis** - Powered by Google Gemini API
- **Labels & Tags** - Organize feedback with custom labels
- **Smart Filtering** - Filter by Bug, Feature, or Other
- **Dashboard** - Modern admin interface with pagination
- **Secure Auth** - JWT-based authentication + Google OAuth
- **Cross-Domain** - Widget works on any domain with CORS support
- **Webhooks** - Real-time notifications with HMAC-SHA256 signatures
- **Custom Widget** - Configurable colors, icons, and positions
- **CSV Export** - Export feedback data with labels
- **Rate Limiting** - Protection against abuse and spam

##  Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Node.js, Express, TypeScript        |
| Frontend | Next.js 14 (App Router), React      |
| Database | PostgreSQL (Neon)                   |
| ORM      | Prisma                              |
| Styling  | Tailwind CSS                        |
| Auth     | JWT, bcrypt                         |
| AI       | Google Gemini API                   |
| Deploy   | Vercel (Frontend), Render (Backend) |

##  Project Structure

```
feedback-pulse/
├── backend/                 # Express API server
│   ├── prisma/             # Database schema
│   ├── src/
│   │   ├── config/         # Environment configuration
│   │   ├── controllers/    # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── projectController.ts
│   │   │   ├── feedbackController.ts
│   │   │   ├── labelController.ts
│   │   │   ├── webhookController.ts
│   │   │   └── widgetController.ts
│   │   ├── middleware/     # Auth, CORS, rate limiting
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   │   ├── authService.ts
│   │   │   ├── projectService.ts
│   │   │   ├── feedbackService.ts
│   │   │   ├── webhookService.ts
│   │   │   └── geminiService.ts
│   │   ├── utils/          # Helper functions
│   │   └── index.ts        # Entry point
│   └── package.json
│
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── (auth)/    # Login/Signup
│   │   │   └── dashboard/ # Admin pages
│   │   ├── components/    # Reusable UI components
│   │   └── lib/           # API client, utils
│   └── package.json
│
├── docs/                   # Documentation
│   ├── api.md             # API reference
│   ├── architecture.md    # System design
│   └── demo-site.html     # Widget test page
│
└── README.md
```

##  Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (I recommend [Neon](https://neon.tech))
- Google Gemini API key (for sentiment analysis)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/feedback-pulse.git
cd feedback-pulse
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your .env file with:
# - DATABASE_URL (Neon PostgreSQL connection string)
# - JWT_SECRET (random string)
# - GEMINI_API_KEY (from Google AI Studio)
# - FRONTEND_URL (http://localhost:3000 for development)

# Generate Prisma client and push schema
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

Backend will run at `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Configure NEXT_PUBLIC_API_BASE_URL if needed
# Default: http://localhost:8080

# Start development server
npm run dev
```

Frontend will run at `http://localhost:3000`

### 4. Test the Widget

1. Create an account at `http://localhost:3000/signup`
2. Create a new project in the dashboard
3. Copy the project key
4. Open `docs/demo-site.html` in your browser
5. Enter your project key and click "Load Widget"
6. Submit test feedback!

##  API Endpoints

### Authentication
| Method | Endpoint          | Description          |
|--------|-------------------|----------------------|
| POST   | /api/auth/signup  | Register new user    |
| POST   | /api/auth/login   | Login user           |
| POST   | /api/auth/google  | Google OAuth login   |
| GET    | /api/auth/me      | Get current user     |

### Projects
| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| POST   | /api/projects        | Create project       |
| GET    | /api/projects        | List projects        |
| GET    | /api/projects/:id    | Get project details  |
| DELETE | /api/projects/:id    | Delete project       |

### Feedback
| Method | Endpoint                             | Description            |
|--------|--------------------------------------|------------------------|
| GET    | /api/projects/:id/feedback           | List feedback (paginated)|
| POST   | /api/public/report                   | Submit feedback (public)|
| POST   | /api/feedback/:id/sentiment          | Analyze sentiment      |
| DELETE | /api/feedback/:id                    | Delete feedback        |

### Labels
| Method | Endpoint                             | Description          |
|--------|--------------------------------------|----------------------|
| GET    | /api/feedback/:id/labels             | Get labels           |
| POST   | /api/feedback/:id/labels             | Add label            |
| DELETE | /api/feedback/:id/labels/:labelId    | Remove label         |

### Webhooks
| Method | Endpoint                                    | Description              |
|--------|---------------------------------------------|--------------------------|
| GET    | /api/projects/:id/webhook                   | Get webhook settings     |
| PUT    | /api/projects/:id/webhook                   | Update webhook settings  |
| POST   | /api/projects/:id/webhook/regenerate-secret | Regenerate secret        |
| POST   | /api/projects/:id/webhook/test              | Test webhook delivery    |

### Widget
| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| GET    | /widget.js?key=xxx   | Get widget script    |

### Health
| Method | Endpoint   | Description          |
|--------|------------|----------------------|
| GET    | /health    | Health check         |

## Widget Integration

Add this script tag to any website:

```html
<script 
  src="https://your-backend-url/widget.js?key=YOUR_PROJECT_KEY" 
  async
></script>
```

The widget will automatically:
- Display a floating feedback button
- Open a modal for feedback submission
- Submit feedback to your backend
- Work on any domain (CORS enabled)

##  Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set root directory to `backend`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`
6. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET` (use a strong random string)
   - `GEMINI_API_KEY`
   - `GOOGLE_CLIENT_ID` (for Google Sign-in)
   - `FRONTEND_URL` (your Vercel URL)
   - `BACKEND_URL` (your Render URL)
   - `NODE_ENV=production`

### Frontend (Vercel)

1. Import project on Vercel
2. Set root directory to `frontend`
3. Framework: Next.js (auto-detected)
4. Add environment variables:
   - `NEXT_PUBLIC_API_BASE_URL` (your Render backend URL)
   - `NEXT_PUBLIC_APP_URL` (your Vercel app URL)
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (for Google Sign-in)

## 📖 Documentation

- [API Reference](./docs/api.md) - Complete API documentation
- [Architecture](./docs/architecture.md) - System design & diagrams
- [Demo Site](./docs/demo-site.html) - Widget testing page

## 🔗 Live Demo

- **Frontend**: [https://feedback-pulse-murex.vercel.app](https://feedback-pulse-murex.vercel.app)
- **Backend**: [https://feedbackpulse.onrender.com](https://feedbackpulse.onrender.com)

## ✅ Definition of Done

- [x] User can sign up and login
- [x] Google OAuth sign-in support
- [x] User can create project and see projectKey + embed snippet
- [x] User can delete projects
- [x] User can delete individual feedback items
- [x] Widget script loads on any domain and submits feedback
- [x] Widget colors, icons, and position are customizable
- [x] Admin dashboard lists projects
- [x] Admin can view feedback by project
- [x] Filter works (All/Bug/Feature/Other)
- [x] Pagination works (CSR feedback list)
- [x] Labels can be added and displayed
- [x] CSV export with labels works
- [x] Sentiment analysis works via Gemini and shows badge
- [x] Webhook integration with HMAC signature verification
- [x] CORS works correctly
- [x] Rate limiting (API, auth, feedback endpoints)
- [x] Code is clean with required layering
- [x] Deployment-ready (Vercel + Render)

## 🔒 Production Security Features

- **Helmet.js** - Security headers (XSS, CSRF, clickjacking protection)
- **Rate Limiting** - Prevents API abuse and brute force attacks
- **Input Validation** - Zod schemas on all inputs
- **JWT Authentication** - Secure token-based auth with 7-day expiry
- **CORS Protection** - Restricted origins for protected routes
- **Request Size Limits** - Prevents payload attacks


## License

This project is licensed under the MIT License.
