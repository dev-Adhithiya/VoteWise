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

## 📊 Project Evaluation Details

### Your Chosen Vertical
**Civic Tech & Voter Education**
VoteWise AI focuses on the Civic Tech vertical, addressing the critical need for accessible, accurate, and localized election information. It empowers citizens to make informed decisions by aggregating candidate data, tracking election timelines, and combating political misinformation through AI-driven fact-checking.

### Approach and Logic
The application is built on the premise of conversational interfaces lowering the barrier to entry for complex information. 
- **AI as an Orchestrator**: Instead of static forms and menus, the Gemini AI acts as an intelligent router. It interprets natural language and decides when to trigger specific frontend UI components (tools) like maps or charts.
- **Context-Aware**: The system uses Geolocation and NextAuth to provide hyper-localized data (e.g., polling stations and local candidates) while respecting user privacy.
- **Performance-First**: React optimizations (`React.memo`, `useCallback`, `useMemo`) are employed to ensure the chat interface remains highly responsive, even when rendering complex interactive widgets.

### How the Solution Works
1. **User Input**: The user asks a question in the chat interface (e.g., "Where do I vote?").
2. **Context Enrichment**: The frontend attaches the user's geographical context (country, lat/lng) to the payload.
3. **LLM Processing**: The request is sent to the `gemini-1.5-flash` model, which is equipped with specific `FunctionDeclarations` (Tools).
4. **Tool Execution**: If Gemini determines a tool is needed (e.g., `getPollingRoute`), it returns a function call instead of plain text.
5. **Component Rendering**: The backend executes the tool logic (fetching data or returning mock data), and the frontend dynamically maps the `toolType` to an interactive React component (e.g., `VotingRouteMap`), displaying it seamlessly inline with the chat.

### Any Assumptions Made
- **API Availability**: It is assumed that production deployment will have active, paid-tier access to Google Maps API, Google Civic Information API, and Fact Check Tools API. Current implementation may utilize simulated data for safety and cost during demonstration.
- **User Environment**: Assumes a modern browser environment with JavaScript enabled and optional Geolocation permissions granted by the user.
- **Scope**: Assumes the primary focus is on US, UK, and India elections, as defined in the timeline logic, though the AI can speak broadly about global democratic processes.

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

