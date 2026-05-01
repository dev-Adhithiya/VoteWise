# VoteWise AI - Cloud Build Submit Script
# This script submits the application to Google Cloud Build

# Set project ID
$PROJECT_ID = "votewise-495010"
$REGION = "us-central1"
$SERVICE_NAME = "votewise-service"

# Set active project
Write-Host "Setting active GCP project to $PROJECT_ID..." -ForegroundColor Cyan
gcloud config set project $PROJECT_ID

# Function to read env variable with fallback
function Get-EnvVariable {
    param(
        [string]$VarName
    )
    
    $value = [Environment]::GetEnvironmentVariable($VarName)
    if ([string]::IsNullOrWhiteSpace($value)) {
        # Try to read from .env file
        $envContent = Get-Content .env -ErrorAction SilentlyContinue
        if ($envContent) {
            $match = $envContent | Select-String "^$VarName=(.+)$"
            if ($match) {
                $value = $match.Matches[0].Groups[1].Value
            }
        }
    }
    
    if ([string]::IsNullOrWhiteSpace($value) -or $value -like "*_here") {
        Write-Host "❌ Missing required environment variable: $VarName" -ForegroundColor Red
        return $null
    }
    
    return $value
}

# Retrieve all required environment variables
Write-Host "`nRetrieving environment variables..." -ForegroundColor Cyan
$GOOGLE_CLIENT_ID = Get-EnvVariable "GOOGLE_CLIENT_ID"
$GOOGLE_CLIENT_SECRET = Get-EnvVariable "GOOGLE_CLIENT_SECRET"
$NEXTAUTH_SECRET = Get-EnvVariable "NEXTAUTH_SECRET"
$GEMINI_API_KEY = Get-EnvVariable "GEMINI_API_KEY"
$GOOGLE_CIVIC_API_KEY = Get-EnvVariable "GOOGLE_CIVIC_API_KEY"
$GOOGLE_FACTCHECK_API_KEY = Get-EnvVariable "GOOGLE_FACTCHECK_API_KEY"
$GOOGLE_MAPS_API_KEY = Get-EnvVariable "GOOGLE_MAPS_API_KEY"
$YOUTUBE_API_KEY = Get-EnvVariable "YOUTUBE_API_KEY"
$NEXT_PUBLIC_GOOGLE_MAPS_KEY = Get-EnvVariable "NEXT_PUBLIC_GOOGLE_MAPS_KEY"

# Check if all required variables are present
$missingVars = @(
    $GOOGLE_CLIENT_ID,
    $GOOGLE_CLIENT_SECRET,
    $NEXTAUTH_SECRET,
    $GEMINI_API_KEY
) -contains $null

if ($missingVars) {
    Write-Host "`n⚠️  Some required environment variables are missing or have placeholder values." -ForegroundColor Yellow
    Write-Host "Please update .env with actual values from Google Cloud Console." -ForegroundColor Yellow
    exit 1
}

# Retrieve NEXTAUTH_URL from .env or fallback to construction
$NEXTAUTH_URL = Get-EnvVariable "NEXTAUTH_URL"
if ([string]::IsNullOrWhiteSpace($NEXTAUTH_URL)) {
    $NEXTAUTH_URL = "https://$SERVICE_NAME-$REGION-$PROJECT_ID.run.app"
}

Write-Host "`n✅ All environment variables loaded successfully" -ForegroundColor Green
Write-Host "`nSubmitting build to Cloud Build..." -ForegroundColor Cyan
Write-Host "Project: $PROJECT_ID" -ForegroundColor Gray
Write-Host "Service: $SERVICE_NAME" -ForegroundColor Gray
Write-Host "Region: $REGION" -ForegroundColor Gray

# Submit the build with substitutions
gcloud builds submit `
  --project=$PROJECT_ID `
  --config=cloudbuild.yaml `
  --substitutions="_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID,_GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET,_NEXTAUTH_SECRET=$NEXTAUTH_SECRET,_GEMINI_API_KEY=$GEMINI_API_KEY,_GOOGLE_CIVIC_API_KEY=$GOOGLE_CIVIC_API_KEY,_GOOGLE_FACTCHECK_API_KEY=$GOOGLE_FACTCHECK_API_KEY,_GOOGLE_MAPS_API_KEY=$GOOGLE_MAPS_API_KEY,_YOUTUBE_API_KEY=$YOUTUBE_API_KEY,_NEXT_PUBLIC_GOOGLE_MAPS_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_KEY,_NEXTAUTH_URL=$NEXTAUTH_URL"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Build submitted successfully!" -ForegroundColor Green
    Write-Host "`nMonitor your build at:" -ForegroundColor Cyan
    Write-Host "https://console.cloud.google.com/cloud-build?project=$PROJECT_ID" -ForegroundColor Blue
} else {
    Write-Host "`n❌ Build submission failed" -ForegroundColor Red
    exit 1
}
