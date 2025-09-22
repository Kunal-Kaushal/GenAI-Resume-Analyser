#!/bin/bash

# ============================================================================
# DEPLOYMENT TEST SCRIPT
# ============================================================================
# This script tests your Cloud Run deployment to ensure it's working correctly

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get service URL (replace with your actual URL after deployment)
SERVICE_URL=${1:-"https://cv-analyzer-api-YOUR_HASH-uc.a.run.app"}

echo -e "${YELLOW}Testing CV Analyzer API deployment...${NC}"
echo "Service URL: $SERVICE_URL"
echo

# Test 1: Health check
echo -e "${YELLOW}1. Testing health endpoint...${NC}"
HEALTH_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" "$SERVICE_URL/api/health")
HTTP_STATUS=$(echo $HEALTH_RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
RESPONSE_BODY=$(echo $HEALTH_RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo "Response: $RESPONSE_BODY"
else
    echo -e "${RED}❌ Health check failed (HTTP $HTTP_STATUS)${NC}"
    echo "Response: $RESPONSE_BODY"
    exit 1
fi

echo

# Test 2: CORS headers
echo -e "${YELLOW}2. Testing CORS headers...${NC}"
CORS_RESPONSE=$(curl -s -I -H "Origin: https://example.com" "$SERVICE_URL/api/health")
if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ CORS headers present${NC}"
else
    echo -e "${RED}❌ CORS headers missing${NC}"
fi

echo

# Test 3: File upload endpoint (without file - should return error)
echo -e "${YELLOW}3. Testing analyze endpoint (should return validation error)...${NC}"
ANALYZE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$SERVICE_URL/api/analyze")
HTTP_STATUS=$(echo $ANALYZE_RESPONSE | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
RESPONSE_BODY=$(echo $ANALYZE_RESPONSE | sed -E 's/HTTPSTATUS:[0-9]{3}$//')

if [ "$HTTP_STATUS" -eq 400 ]; then
    echo -e "${GREEN}✅ Analyze endpoint validation working${NC}"
    echo "Response: $RESPONSE_BODY"
else
    echo -e "${RED}❌ Analyze endpoint unexpected response (HTTP $HTTP_STATUS)${NC}"
    echo "Response: $RESPONSE_BODY"
fi

echo
echo -e "${GREEN}🎉 API deployment test completed!${NC}"
echo
echo "To test with a real resume:"
echo "curl -X POST -F 'resume=@your_resume.pdf' -F 'job_description=Your job description here' '$SERVICE_URL/api/analyze'"