# Feedback Pulse Frontend

Next.js 14 frontend application for the Feedback Pulse SaaS platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Auth**: JWT + Google OAuth (@react-oauth/google)

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see backend README)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Configure environment variables
# Edit .env.local with your values
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:8080` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL (for SEO) | `http://localhost:3000` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID | - |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── dashboard/         # Protected dashboard pages
│   │   ├── projects/      # Project management
│   │   │   ├── new/       # Create project
│   │   │   └── [projectId]/ # Project details & feedback
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
│
├── components/            # Reusable UI components
│
└── lib/                   # Utilities
    ├── api.ts            # API client
    └── utils.ts          # Helper functions
```

## Features

- 🔐 **Authentication** - Login, signup, Google OAuth
- 📊 **Dashboard** - Project and feedback management
- 🎨 **Widget Customization** - Configure widget appearance
- 📥 **CSV Export** - Export feedback data
- 🏷️ **Labels** - Tag and organize feedback
- 🔔 **Webhooks** - Configure webhook notifications
- 🤖 **Sentiment Analysis** - AI-powered analysis

## Deployment

### Vercel (Recommended)

1. Import project on Vercel
2. Set root directory to `frontend`
3. Add environment variables
4. Deploy

### Environment Variables for Production

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
