# ============================================================================

# CLOUD RUN DEPLOYMENT GUIDE

# ============================================================================

# Step-by-step instructions to deploy your CV Analyzer API to Google Cloud Run

## Prerequisites:

1. Google Cloud Project with billing enabled
2. Google Cloud CLI installed: https://cloud.google.com/sdk/docs/install
3. Docker installed on your machine

## Deployment Steps:

### 1. Set up Google Cloud

```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID (replace YOUR_PROJECT_ID with actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
```

### 2. Build and Deploy

```bash
# Navigate to your project directory
cd "/Users/kunal_kaushal/Desktop/Project Resume"

# Submit build to Google Cloud Build (this builds the Docker image in the cloud)
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/cv-analyzer-api

# Deploy to Cloud Run
gcloud run deploy cv-analyzer-api \
  --image gcr.io/YOUR_PROJECT_ID/cv-analyzer-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars GEMINI_API_KEY="your_actual_gemini_api_key_here"
```

### 3. Alternative: One-command Deploy

```bash
# Deploy directly from source code (Cloud Build + Cloud Run in one step)
gcloud run deploy cv-analyzer-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars GEMINI_API_KEY="your_actual_gemini_api_key_here"
```

### 4. Update Environment Variables (after deployment)

```bash
# Update the Gemini API key
gcloud run services update cv-analyzer-api \
  --region us-central1 \
  --set-env-vars GEMINI_API_KEY="your_new_api_key"
```

### 5. Get Service URL

```bash
# Get the deployed service URL
gcloud run services describe cv-analyzer-api \
  --region us-central1 \
  --format "value(status.url)"
```

## Important Notes:

### Environment Variables:

- GEMINI_API_KEY: Your Google Gemini API key (required)
- PORT: Automatically set by Cloud Run to 8080

### Security:

- The service is deployed with --allow-unauthenticated for easy testing
- For production, consider implementing authentication
- The container runs as non-root user for security

### Cost Optimization:

- Cloud Run only charges when handling requests
- 1 CPU and 1GB memory is sufficient for this API
- Requests timeout after 5 minutes (Cloud Run default)

### Testing:

Once deployed, test your API:

```bash
curl https://YOUR_SERVICE_URL/api/health
```

### Frontend Integration:

Update your frontend API base URL to:

```javascript
const apiBase = "https://YOUR_CLOUD_RUN_URL/api";
```
