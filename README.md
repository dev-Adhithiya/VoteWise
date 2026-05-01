# 🗳️ VoteWise AI - Your Intelligent Election Assistant

VoteWise AI is a premium, feature-rich web application designed to empower voters with real-time, accurate, and personalized election information. Built with the latest web technologies and powered by Google's Gemini AI, it provides a comprehensive toolkit for every citizen.

## 🚀 Key Features

- **📍 Location-Aware Election Timeline**: Automatically detects your region (US, UK, India) and displays upcoming election milestones.
- **🤖 Gemini-Powered AI Chat**: An intelligent assistant capable of:
  - Fact-checking candidate claims.
  - Finding polling stations.
  - Summarizing candidate positions.
  - Managing voting checklists.
- **🔍 Candidate Research**: Deep-dive into candidate dossiers with integrated YouTube sentiment analysis and fact-checking.
- **🗺️ Polling Station Finder**: Interactive Google Maps integration to find your nearest voting location.
- **✅ Interactive Voter Checklist**: Step-by-step guide to ensure you're ready for election day, with Google Tasks synchronization.
- **🌐 Multi-Language Support**: Fully localized experience in English and Spanish.
- **🛡️ Secure Authentication**: Seamless sign-in with Google OAuth 2.0.

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **AI / LLM** | [Google Gemini API](https://ai.google.dev/) (with Function Calling) |
| **Auth** | [NextAuth.js v5](https://next-auth.js.org/) |
| **APIs** | Google Civic Information, Google Maps, Fact Check Tools, YouTube Data, Google Tasks, Google Calendar |
| **Deployment** | [Google Cloud Run](https://cloud.google.com/run), [Cloud Build](https://cloud.google.com/build), [Docker](https://www.docker.com/) |

## 📂 Project Structure

```text
election-assistant/
├── src/
│   ├── app/                # Next.js App Router (Routes & API Endpoints)
│   │   ├── api/            # Backend services (Auth, Chat, Civic, etc.)
│   │   └── page.tsx        # Main application dashboard
│   ├── components/         # Modular UI Components (Chat, Timeline, Cards)
│   ├── lib/                # Core Logic & Utility Handlers
│   │   ├── GeminiHandler.ts # AI Tool Logic & Function Calling
│   │   ├── auth.ts         # Authentication Configuration
│   │   ├── geolocation.ts  # Location Detection Service
│   │   └── google-apis.ts  # Google API Wrappers
│   └── types/              # TypeScript Interface Definitions
├── public/                 # Static Assets
├── Dockerfile              # Container Configuration
├── cloudbuild.yaml         # CI/CD Pipeline Definition
├── submit-build.ps1        # Deployment Automation Script
└── next.config.ts          # Next.js Configuration
```

## 🏗️ Getting Started

### 1. Prerequisites
- Node.js 20+
- A Google Cloud Project with necessary APIs enabled.

### 2. Environment Setup
Create a `.env.local` file in the root directory and add your credentials (refer to `DEPLOYMENT.md` for details):
```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
GEMINI_API_KEY=...
GOOGLE_CIVIC_API_KEY=...
GOOGLE_MAPS_API_KEY=...
```

### 3. Run Locally
```bash
npm install
npm run dev
```

## 🚢 Deployment

The project is optimized for deployment on **Google Cloud Run**. 

1. Ensure your Google Cloud SDK is configured.
2. Run the automated deployment script:
   ```powershell
   .\submit-build.ps1
   ```
   Or refer to the [Deployment Guide](DEPLOYMENT.md) for manual steps.

## 📄 License

This project is private and intended for demonstration purposes.

