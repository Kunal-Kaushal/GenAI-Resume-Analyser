# ============================================================================
# CV ANALYZER FLASK API - Backend Server
# ============================================================================
# This Flask server receives resume files and job descriptions from the frontend,
# processes them using AI (Google Gemini), and returns analysis results.

# IMPORTS - External libraries we need
from flask import Flask, request, jsonify  # Web framework for creating API endpoints
from flask_cors import CORS                # Allows frontend to call our API from different port
import google.generativeai as genai       # Google's Gemini AI for resume analysis
from dotenv import load_dotenv            # Loads environment variables from .env file
import os                                 # Operating system interface for environment variables
import PyPDF2                            # Library to extract text from PDF files
import json                              # JSON parsing and generation
import io                                # Input/output operations

# CREATE FLASK APP
app = Flask(__name__)  # Initialize Flask application
CORS(app)             # Enable Cross-Origin Resource Sharing (allows frontend to call API)

# LOAD ENVIRONMENT VARIABLES
# This loads the .env file containing our API keys and configuration
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")  # Get Gemini API key from environment

# CONFIGURE GEMINI AI
# Only configure if API key exists (prevents errors if key is missing)
if api_key:
    genai.configure(api_key=api_key)
else:
    print("Warning: GEMINI_API_KEY not found in environment variables")


# ============================================================================
# HELPER FUNCTIONS - Utility functions used by our API endpoints
# ============================================================================

def extract_text_from_pdf_upload(pdf_file):
    """
    Extract text content from an uploaded PDF file.
    
    Args:
        pdf_file: File object received from frontend (request.files['resume'])
    
    Returns:
        str: Extracted text from all pages, or None if extraction fails
    """
    try:
        # Create PDF reader object from uploaded file
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        
        # Loop through each page and extract text
        for page in pdf_reader.pages:
            # Extract text from page, use empty string if None returned
            page_text = page.extract_text() or ""
            text += page_text
            
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None

def clean_gemini_response(response_text):
    """
    Clean Gemini AI response by removing markdown code blocks.
    
    Gemini sometimes wraps JSON responses in markdown code blocks like:
    ```json
    {"key": "value"}
    ```
    
    This function removes those markers to get clean JSON.
    
    Args:
        response_text (str): Raw response from Gemini API
    
    Returns:
        str: Cleaned response text ready for JSON parsing
    """
    return response_text.strip().replace("```json", "").replace("```", "")


# ============================================================================
# API ENDPOINTS - These are the URLs that frontend can call
# ============================================================================

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    """
    MAIN ANALYSIS ENDPOINT
    
    This is the primary endpoint that receives:
    - A PDF resume file
    - Job description text
    
    And returns AI-powered analysis comparing them.
    
    Frontend calls this like: POST http://localhost:8080/api/analyze
    
    Expected data:
    - resume: PDF file (multipart/form-data)
    - job_description: text string (form field)
    
    Returns:
    - JSON with success status and analysis result
    """
    try:
        # STEP 1: VALIDATE INPUT DATA
        # Check if resume file was uploaded
        if 'resume' not in request.files:
            return jsonify({
                "success": False,
                "error": "No resume file provided"
            }), 400
            
        # Check if job description was provided
        if 'job_description' not in request.form:
            return jsonify({
                "success": False,
                "error": "No job description provided"
            }), 400
        
        # Extract the actual file and text from the request
        resume_file = request.files['resume']           # PDF file object
        job_description = request.form['job_description'] # Text string
        
        # Check if user actually selected a file (not just empty file input)
        if resume_file.filename == '':
            return jsonify({
                "success": False,
                "error": "No resume file selected"
            }), 400
        
        # STEP 2: EXTRACT TEXT FROM PDF
        # Convert the uploaded PDF file to plain text using PyPDF2
        resume_text = extract_text_from_pdf_upload(resume_file)
        if resume_text is None:
            return jsonify({
                "success": False,
                "error": "Failed to extract text from PDF. Please ensure it's a valid PDF file."
            }), 400
        
        # STEP 3: CHECK AI SERVICE AVAILABILITY
        # Make sure we have the Gemini API key to perform analysis
        if not api_key:
            return jsonify({
                "success": False,
                "error": "Gemini API key not configured. Please check your .env file."
            }), 500
        
        # STEP 4: CREATE AI PROMPT
        # This is the instruction we send to Gemini AI to analyze the resume
        # The prompt is carefully crafted to get consistent, structured responses
        prompt = f"""Act as an HR for an IT company. Analyze the following resume against the provided job description. Your response must be a single, valid JSON object and nothing else.

```json
{{
    "resume": {resume_text},
    "job_description": {job_description}
}}

The JSON object must contain two keys:
1. `JD_match`: A numerical score from 0 to 100, where a higher score indicates a closer alignment between the resume and the job description.
2. `analysis`: A brief summary (2-3 sentences) explaining the score, highlighting the candidate's key matching skills and any significant gaps.

---
**Resume:**
{resume_text}
---
**Job Description:**
{job_description}
---
"""
        
        # STEP 5: CALL GEMINI AI
        # Create AI model instance (using same model as main.py for consistency)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Send our prompt to Gemini and get AI analysis
        response = model.generate_content(prompt)
        
        # STEP 6: PROCESS AI RESPONSE
        # Parse the AI response and return structured data to frontend
        try:
            # Clean any markdown formatting from AI response
            response_text = clean_gemini_response(response.text)
            
            # Parse the cleaned response as JSON
            analysis_result = json.loads(response_text)
            
            # Return success response with analysis data
            return jsonify({
                "success": True,
                "result": analysis_result  # Contains JD_match score and analysis text
            })
            
        except json.JSONDecodeError as e:
            # If AI response isn't valid JSON, return a fallback response
            return jsonify({
                "success": True,
                "result": {
                    "JD_match": 0,  # Default score when parsing fails
                    "analysis": f"Analysis completed but response format error: {response.text}"
                }
            })
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Analysis failed: {str(e)}"
        }), 500


@app.route('/api/analyze-text', methods=['POST'])
def analyze_resume_text():
    """Alternative endpoint for text-based input."""
    try:
        data = request.json
        
        if not data or 'resume_text' not in data or 'job_description_text' not in data:
            return jsonify({
                "success": False,
                "error": "Both resume_text and job_description_text are required"
            }), 400
            
        resume_text = data['resume_text']
        job_description_text = data['job_description_text']
        
        # Check if Gemini is configured
        if not api_key:
            return jsonify({
                "success": False,
                "error": "Gemini API key not configured"
            }), 500
        
        # Create analysis prompt (same as main.py)
        prompt = f"""Act as an HR for an IT company. Analyze the following resume against the provided job description. Your response must be a single, valid JSON object and nothing else.

```json
{{
    "resume": {resume_text},
    "job_description": {job_description_text}
}}

The JSON object must contain two keys:
1. `JD_match`: A numerical score from 0 to 100, where a higher score indicates a closer alignment between the resume and the job description.
2. `analysis`: A brief summary (2-3 sentences) explaining the score, highlighting the candidate's key matching skills and any significant gaps.

---
**Resume:**
{resume_text}
---
**Job Description:**
{job_description_text}
---
"""
        
        # Generate response using Gemini (same model as main.py)
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        
        # Parse the JSON response
        try:
            response_text = clean_gemini_response(response.text)
            analysis_result = json.loads(response_text)
            return jsonify({
                "success": True,
                "result": analysis_result
            })
        except json.JSONDecodeError as e:
            # If JSON parsing fails, return the raw text
            return jsonify({
                "success": True,
                "result": {
                    "JD_match": 0,
                    "analysis": f"Analysis completed but response format error: {response.text}"
                }
            })
        
    except Exception as e:
        # STEP 7: HANDLE ERRORS
        # If anything goes wrong during the process, return error response
        return jsonify({
            "success": False,
            "error": f"Analysis failed: {str(e)}"
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    HEALTH CHECK ENDPOINT
    
    This endpoint allows the frontend to check if:
    1. The Flask server is running and responding
    2. The Gemini API is properly configured
    
    Frontend calls this like: GET http://localhost:8080/api/health
    
    Returns:
    - status: "running" if server is working
    - gemini_configured: true/false based on API key availability
    
    This is called when the frontend first loads to show API status.
    """
    return jsonify({
        "status": "running",                    # Server is responding
        "gemini_configured": bool(api_key)      # Whether AI service is available
    })

# ============================================================================
# SERVER STARTUP - This runs when you execute: python api.py
# ============================================================================

if __name__ == '__main__':
    # Get port from environment variable, default to 8080
    # (Changed from Flask's default 5000 to avoid macOS AirPlay conflicts)
    port = int(os.environ.get('PORT', 8080))
    
    print(f"🚀 Starting CV Analyzer API Server...")
    
    print(f"🤖 Gemini AI configured: {'✅ Yes' if api_key else '❌ No - Check .env file'}")
    print(f"📍 API endpoints available:")
    print(f"   • GET  /api/health  - Check server status")
    print(f"   • POST /api/analyze - Analyze resume")
    print()
    
    # Start the Flask development server
    # host='0.0.0.0' allows access from other devices on network
    # debug=True enables auto-reload when code changes
    app.run(host='0.0.0.0', port=port, debug=True)