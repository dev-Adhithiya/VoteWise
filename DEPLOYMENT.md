# VoteWise AI - Deployment Guide

## Prerequisites

1. **Google Cloud SDK** - Install from https://cloud.google.com/sdk/docs/install
   ```bash
   gcloud --version
   gcloud auth login
   gcloud config set project votewise-495010
   ```

2. **Required GCP APIs Enabled** (in project votewise-495010):
   - Cloud Build API
   - Cloud Run API
   - Artifact Registry API
   - Container Registry API

3. **Artifact Registry Repository** - Create if not exists:
   ```bash
   gcloud artifacts repositories create votewise-repo \
     --repository-format=docker \
     --location=us-central1 \
     --project=votewise-495010
   ```

## Step 1: Configure Environment Variables

Update the `.env` file in the project root with your actual secrets from Google Cloud Console:

```bash
# Required OAuth credentials
GOOGLE_CLIENT_ID=your_oauth_client_id
GOOGLE_CLIENT_SECRET=your_oauth_client_secret

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret

# API Keys from Google Cloud Console
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CIVIC_API_KEY=your_civic_api_key
GOOGLE_FACTCHECK_API_KEY=your_factcheck_api_key
GOOGLE_MAPS_API_KEY=your_maps_api_key
YOUTUBE_API_KEY=your_youtube_api_key
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_public_maps_key
```

**Sources for each key:**

- **GOOGLE_CLIENT_ID/SECRET**: 
  1. Go to [Google Cloud Console](https://console.cloud.google.com)
  2. Select project votewise-495010
  3. APIs & Services → Credentials → Create OAuth 2.0 Client ID
  4. Add authorized redirect URI: `https://votewise-service-us-central1-votewise-495010.run.app/api/auth/callback/google`

- **NEXTAUTH_SECRET**: 
  ```bash
  # Generate on Linux/Mac
  openssl rand -base64 32
  
  # Generate on Windows PowerShell
  [Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))
  ```

- **API Keys**: 
  1. Go to Google Cloud Console
  2. APIs & Services → Credentials → Create API Key
  3. Restrict each key to appropriate APIs:
     - Gemini API (generative-ai-api)
     - Civic Information API
     - Fact Check Tools API
     - Maps API
     - YouTube Data API

## Step 2: Build and Deploy

### Option A: Automated PowerShell Script (Windows)

```powershell
.\submit-build.ps1
```

This script will:
1. Read environment variables from `.env`
2. Verify all required secrets are present
3. Submit the build to Cloud Build
4. Display the build monitoring URL

### Option B: Manual gcloud command

```bash
gcloud builds submit \
  --project=votewise-495010 \
  --config=cloudbuild.yaml \
  --substitutions="\
_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID,\
_GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET,\
_NEXTAUTH_SECRET=YOUR_SECRET,\
_GEMINI_API_KEY=YOUR_KEY,\
_GOOGLE_CIVIC_API_KEY=YOUR_KEY,\
_GOOGLE_FACTCHECK_API_KEY=YOUR_KEY,\
_GOOGLE_MAPS_API_KEY=YOUR_KEY,\
_YOUTUBE_API_KEY=YOUR_KEY,\
_NEXT_PUBLIC_GOOGLE_MAPS_KEY=YOUR_KEY,\
_NEXTAUTH_URL=https://votewise-service-us-central1-votewise-495010.run.app"
```

## Step 3: Monitor Deployment

1. **Cloud Build**: https://console.cloud.google.com/cloud-build?project=votewise-495010
2. **Cloud Run**: https://console.cloud.google.com/run?project=votewise-495010

## Step 4: Configure OAuth Callback URI

After the first deployment, update your OAuth credentials with the actual Cloud Run URL:

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Edit your OAuth Client ID
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for local development)
   - `https://votewise-service-us-central1-votewise-495010.run.app/api/auth/callback/google` (for production)

## Development: Run Locally

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Troubleshooting

### Build fails with "Image not found"
- Ensure Artifact Registry repository exists in us-central1
- Check that Cloud Build has permission to push to Artifact Registry

### Deployment fails with "Permission denied"
- Ensure Cloud Build service account has roles:
  - roles/run.admin
  - roles/iam.serviceAccountUser
  - roles/artifactregistry.writer

### OAuth callback URI mismatch
- Update both `.env` (NEXTAUTH_URL) and Google Console OAuth credentials
- Format: `https://SERVICE-REGION-PROJECT.run.app`

### Environment variables not loading
- Verify all variables in cloudbuild.yaml substitutions match your `.env`
- Check Cloud Run service environment variables in console

## Key Features Deployed

✅ **Location-Aware Election Timeline** - Displays country-specific election dates (US/UK/India)
✅ **Gemini-Powered Chat** - 11 function-calling tools for election assistance
✅ **Voter Checklist** - Region-specific requirements with Google Tasks sync
✅ **Polling Station Finder** - Find nearest voting locations via Google Maps
✅ **Candidate Research** - Multi-tab dossiers with fact-checking
✅ **Multi-Language Support** - English/Spanish with toggle
✅ **Geolocation Detection** - Browser Geolocation + IP fallback

## Architecture

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS + Framer Motion
- **Backend**: Next.js API Routes + Gemini API + Google APIs
- **Auth**: NextAuth.js v5 (Google OAuth 2.0)
- **Deployment**: Docker + Cloud Build + Cloud Run (us-central1)
- **Database**: Optional (currently stateless)
