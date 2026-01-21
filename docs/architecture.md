# Feedback Pulse - Architecture Documentation

## Overview

Feedback Pulse is a SaaS application for collecting and managing user feedback with AI-powered sentiment analysis. It consists of:

1. **Backend API** - Node.js/Express server
2. **Frontend Dashboard** - Next.js App Router application
3. **Embeddable Widget** - Vanilla JavaScript widget served by the backend
4. **Database** - PostgreSQL on Neon

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Websites                               │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  <script src="backend/widget.js?key=fp_xxx"></script>            │   │
│  │                                                                  │   │
│  │     ┌─────────────────┐                                          │   │
│  │     │  Feedback Widget │ ───► POST /api/public/feedback          │   │
│  │     │  (Floating UI)   │                                         │   │
│  │     └─────────────────┘                                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Backend (Render)                              │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     Express.js Server                              │ │
│  │                                                                    │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────────┐     │ │
│  │  │  Routes  │─│Controllers│─│ Services │─│     Prisma ORM     │    │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────────┘     │ │
│  │       │                          │                │                │ │
│  │       │                          │                ▼                │ │
│  │  ┌────┴────┐              ┌──────┴──────┐   ┌──────────┐           │ │
│  │  │Middleware│              │ Gemini API  │   │ Neon DB  │          │ │
│  │  │  (Auth)  │              │ (Sentiment) │   │(Postgres)│          │ │
│  │  └──────────┘              └─────────────┘   └──────────┘          │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                          Frontend (Vercel)                              │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     Next.js App Router                             │ │
│  │                                                                    │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │ │
│  │  │   Auth Pages     │  │  Dashboard Pages │  │   API Client    │   │ │
│  │  │  (Login/Signup)  │  │ (SSR + CSR mix)  │  │   (lib/api.ts)  │   │ │
│  │  └──────────────────┘  └──────────────────┘  └─────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     User     │       │   Project    │       │   Feedback   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ email        │◄──┐   │ userId (FK)  │   ┌──►│ projectId    │
│ passwordHash │   └───│ name         │───┘   │ type         │
│ createdAt    │       │ projectKey   │       │ message      │◄──┐
└──────────────┘       │ createdAt    │       │ sentiment    │   │
                       └──────────────┘       │ createdAt    │   │
                                              └──────────────┘   │
                                                                 │
                                              ┌──────────────┐   │
                                              │FeedbackLabel │   │
                                              ├──────────────┤   │
                                              │ id (PK)      │   │
                                              │ feedbackId   │───┘
                                              │ label        │
                                              │ createdAt    │
                                              └──────────────┘
```

### Models

**User**
- Primary key: `id` (CUID)
- Fields: `email` (unique), `passwordHash`, `createdAt`
- Relations: Has many Projects

**Project**
- Primary key: `id` (CUID)
- Fields: `userId` (FK), `name`, `projectKey` (unique), `createdAt`
- Relations: Belongs to User, Has many Feedback
- Index: `projectKey` (for widget lookup)

**Feedback**
- Primary key: `id` (CUID)
- Fields: `projectId` (FK), `type` (enum), `message`, `sentiment` (nullable enum), `createdAt`
- Relations: Belongs to Project, Has many FeedbackLabels
- Indexes: `projectId`, `type`, `createdAt`

**FeedbackLabel**
- Primary key: `id` (CUID)
- Fields: `feedbackId` (FK), `label`, `createdAt`
- Relations: Belongs to Feedback
- Index: `feedbackId`

### Enums

```prisma
enum FeedbackType {
  Bug
  Feature
  Other
}

enum Sentiment {
  positive
  neutral
  negative
}
```

---

## Authentication Flow

```
┌─────────┐          ┌─────────┐          ┌─────────┐
│ Frontend│          │ Backend │          │Database │
└────┬────┘          └────┬────┘          └────┬────┘
     │                    │                    │
     │  POST /api/auth/signup                  │
     │  {email, password}                      │
     │───────────────────►│                    │
     │                    │  Hash password     │
     │                    │  (bcrypt)          │
     │                    │                    │
     │                    │  Create user       │
     │                    │───────────────────►│
     │                    │                    │
     │                    │  Generate JWT      │
     │                    │  (7 day expiry)    │
     │                    │                    │
     │  {token, user}     │                    │
     │◄───────────────────│                    │
     │                    │                    │
     │  Store token       │                    │
     │  (Cookie)          │                    │
     │                    │                    │
     │  Protected Request │                    │
     │  Authorization:    │                    │
     │  Bearer <token>    │                    │
     │───────────────────►│                    │
     │                    │  Verify JWT        │
     │                    │  Extract userId    │
     │                    │                    │
     │                    │  Query with userId │
     │                    │───────────────────►│
     │                    │                    │
```

### JWT Token Structure

```json
{
  "userId": "clxxxxxxxxxxxxxx",
  "email": "user@example.com",
  "iat": 1705312200,
  "exp": 1705917000
}
```

### Token Storage

- Frontend stores JWT in browser cookie (`feedback_pulse_token`)
- Cookie is accessible via JavaScript (not httpOnly) for SSR compatibility
- Token is attached to all API requests via Authorization header

---

## Widget Design

### Loading Flow

```
┌─────────────────────┐
│   Client Website    │
└──────────┬──────────┘
           │
           │ 1. Script tag loaded
           │ <script src="/widget.js?key=fp_xxx">
           ▼
┌─────────────────────┐
│   Backend Server    │
│                     │
│ 2. Validate key     │
│ 3. Return widget JS │
└──────────┬──────────┘
           │
           │ 4. JavaScript executed
           ▼
┌─────────────────────┐
│ Widget Initialized  │
│                     │
│ 5. Inject styles    │
│ 6. Create button    │
│ 7. Create modal     │
└──────────┬──────────┘
           │
           │ User clicks button
           ▼
┌─────────────────────┐
│   Modal Opens       │
│                     │
│ - Type dropdown     │
│ - Message textarea  │
│ - Submit button     │
└──────────┬──────────┘
           │
           │ User submits
           ▼
┌─────────────────────┐
│   POST /api/public/ │
│   feedback          │
│                     │
│ - projectKey        │
│ - type              │
│ - message           │
└─────────────────────┘
```

### Widget Features

1. **Self-contained** - No external dependencies
2. **Scoped styles** - Uses unique IDs/classes to avoid CSS conflicts
3. **Inline CSS** - All styles embedded in JavaScript
4. **Accessible** - Keyboard navigation, ARIA labels
5. **Responsive** - Works on mobile and desktop
6. **Error handling** - Graceful failure with user feedback

### Widget UI Components

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              Client Page                │
│                                         │
│                                         │
│                           ┌───────────┐ │
│                           │    💬     │ │  ◄── Floating button
│                           └───────────┘ │      (bottom-right)
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           Modal (when open)             │
│  ┌───────────────────────────────────┐  │
│  │  Share Your Feedback              │  │
│  │                                   │  │
│  │  Type: [Bug Report      ▼]        │  │
│  │                                   │  │
│  │  Message:                         │  │
│  │  ┌───────────────────────────┐    │  │
│  │  │                           │    │  │
│  │  │                           │    │  │
│  │  └───────────────────────────┘    │  │
│  │                                   │  │
│  │  [Cancel]        [Submit]         │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## CORS Configuration

### Strategy

**Public Routes** (Widget & Feedback Submission)
- Origin: `*` (all origins allowed)
- Methods: `GET`, `POST`, `OPTIONS`
- Headers: `Content-Type`
- Credentials: `false`

**Protected Routes** (Auth & Dashboard APIs)
- Origin: Restricted to `FRONTEND_URL`
- Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- Headers: `Content-Type`, `Authorization`
- Credentials: `true`

### Implementation

```typescript
// Public CORS (widget routes)
cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
});

// API routes
cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
```

---

## Backend Layering

### Directory Structure

```
backend/
├── src/
│   ├── config/          # Environment configuration
│   │   └── index.ts
│   │
│   ├── controllers/     # Request/Response handlers
│   │   ├── authController.ts
│   │   ├── projectController.ts
│   │   ├── feedbackController.ts
│   │   ├── labelController.ts
│   │   └── widgetController.ts
│   │
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts      # JWT verification
│   │   ├── cors.ts      # CORS configuration
│   │   └── errorHandler.ts
│   │
│   ├── routes/          # Route definitions
│   │   ├── authRoutes.ts
│   │   ├── projectRoutes.ts
│   │   ├── feedbackRoutes.ts
│   │   ├── publicRoutes.ts
│   │   └── widgetRoutes.ts
│   │
│   ├── services/        # Business logic
│   │   ├── authService.ts
│   │   ├── projectService.ts
│   │   ├── feedbackService.ts
│   │   ├── labelService.ts
│   │   └── geminiService.ts
│   │
│   ├── utils/           # Helper functions
│   │   ├── jwt.ts
│   │   ├── keyGenerator.ts
│   │   └── validation.ts
│   │
│   └── index.ts         # Application entry point
│
├── prisma/
│   └── schema.prisma    # Database schema
│
└── package.json
```

### Layer Responsibilities

| Layer      | Responsibility                                    |
|------------|---------------------------------------------------|
| Routes     | Define endpoints, assign middleware, wire to controllers |
| Controllers| Parse request, call services, format response     |
| Services   | Business logic, database operations               |
| Middleware | Cross-cutting concerns (auth, CORS, errors)       |
| Utils      | Reusable helper functions                         |

---

## Frontend Structure

### App Router Organization

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   ├── globals.css          # Global styles
│   │   │
│   │   ├── (auth)/              # Auth group (no layout)
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   │
│   │   └── dashboard/           # Protected dashboard
│   │       ├── layout.tsx       # Dashboard layout with sidebar
│   │       ├── page.tsx         # Dashboard home
│   │       └── projects/
│   │           ├── page.tsx     # Project list
│   │           ├── new/page.tsx # Create project
│   │           └── [projectId]/
│   │               ├── page.tsx     # Project detail
│   │               └── feedback/page.tsx # Feedback list (CSR)
│   │
│   └── lib/
│       ├── api.ts               # API client
│       ├── validation.ts        # Zod schemas
│       └── utils.ts             # Helper functions
│
└── package.json
```

### Rendering Strategy

| Page                    | Rendering | Reason                           |
|-------------------------|-----------|----------------------------------|
| Landing (/)             | CSR       | Auth check needed               |
| Login/Signup            | CSR       | Form handling                    |
| Dashboard               | CSR       | Auth protected, dynamic data     |
| Project List            | CSR       | Auth protected, dynamic data     |
| Project Detail          | CSR       | Auth protected, dynamic data     |
| Feedback List           | CSR       | Pagination, filters, real-time   |

---

## Gemini AI Integration

### Sentiment Analysis Flow

```
┌─────────────────────┐
│  Button: "Analyze   │
│  Sentiment"         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ POST /api/feedback/ │
│ :feedbackId/        │
│ sentiment           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ geminiService.ts    │
│                     │
│ Prompt:             │
│ "Classify sentiment │
│  as positive/       │
│  neutral/negative"  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Gemini API          │
│ (gemini-1.5-flash)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Parse response      │
│ Normalize to enum   │
│ Save to database    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Return sentiment    │
│ badge to frontend   │
└─────────────────────┘
```

---

## Security Measures

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Authentication**: 7-day expiration, secure signing
3. **Resource Ownership**: Users can only access their own projects/feedback
4. **Input Validation**: Zod schemas on all inputs
5. **CORS Protection**: Restricted origins for protected routes
6. **Widget Isolation**: Project key doesn't expose user information
7. **Helmet.js**: Security headers (XSS, CSRF, clickjacking protection)
8. **Rate Limiting**: Tiered rate limits for API, auth, and feedback endpoints
9. **Request Size Limits**: Body size limited to prevent payload attacks
10. **Google OAuth**: Secure OAuth 2.0 authentication flow

---

## Implemented Features

The following features are now fully implemented:

| Feature | Description |
|---------|-------------|
| ✅ Rate Limiting | Tiered rate limits (100/15min for API, 20/15min for auth, 10/min for feedback) |
| ✅ Webhook Notifications | Real-time webhook delivery on new feedback with HMAC-SHA256 signatures |
| ✅ Custom Widget Styling | Configurable icon, colors, text, and position |
| ✅ CSV Export | Export feedback with labels to CSV format |
| ✅ Google OAuth | Sign in with Google support |
| ✅ Feedback Deletion | Delete individual feedback items |
| ✅ Project Deletion | Delete projects with cascade delete for feedback |

---

## Future Improvements

1. **Email Verification**: Verify user email on signup
2. **Analytics Dashboard**: Aggregate feedback statistics
3. **PDF Export**: Export feedback reports as PDF
4. **Team Collaboration**: Multiple users per project
5. **Real-time Updates**: WebSocket for live feedback notifications
6. **Feedback Categories**: Custom categories beyond Bug/Feature/Other
7. **Response Templates**: Quick response templates for common feedback

