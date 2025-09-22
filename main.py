import google.generativeai as genai # Google Gemini API
from dotenv import load_dotenv
import os
import PyPDF2 # Used to read PDF files
import sys

# --- Function to extract text from a PDF file ---
def extract_text_from_pdf(pdf_path):
    """Opens and reads the text content from a PDF file."""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() or "" # Add page text, or empty string if None
            return text
    except FileNotFoundError:
        print(f"Error: The file '{pdf_path}' was not found.")
        return None
    except Exception as e:
        print(f"An error occurred while reading the PDF: {e}")
        return None

# --- Main part of the script ---
def main():
    """Main function to run the resume analysis."""

    # --- 2. Check for command-line arguments ---
    if len(sys.argv) !=3:
        print("Error: You must provide the resume and job description file paths.")
        print("Usage: python main.py <path_to_resume.pdf> <path_to_jd.txt>")
        return

    # --- 3. Load the resume and job description ---
    resume_file_name = sys.argv[1] # Path to the resume PDF file
    jd_file_name = sys.argv[2] # Path to the job description text file


    # Load environment variables from .env file
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        print("Error: GEMINI_API_KEY not found. Please create a .env file with your API key.")
        return

    genai.configure(api_key=api_key)

    # 1. Get Resume Content from PDF
     
    resume_text = extract_text_from_pdf(resume_file_name)

    if not resume_text:
        # Stop the script if the resume could not be read
        return

    # 2. Define the Job Description
    try:
        with open(jd_file_name, "r") as jd_file:
            job_description_text = jd_file.read()
    except FileNotFoundError:
        print(f"Error: The file '{jd_file_name}' was not found.")
        return
    except Exception as e:
        print(f"An error occurred while reading the job description: {e}")
        return

    # 3. Construct the Prompt for the AI
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

    # 4. Call the AI model and print the response
    try:


        
        model=genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)


        # Clean up the response to ensure it's valid JSON
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        print("\n--- Analysis Result ---")
        print(cleaned_response)
    except Exception as e:
        print(f"\nAn error occurred while calling the Gemini API: {e}")

# Run the main function when the script is executed
if __name__ == "__main__":
    main()