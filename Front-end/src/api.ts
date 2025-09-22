const API_BASE = 'https://api-1025255142765.us-central1.run.app/api';

export interface AnalysisResult {
  JD_match: number;
  analysis: string;
}

export interface APIResponse {
  success: boolean;
  result?: AnalysisResult;
  error?: string;
}

export interface HealthResponse {
  status: string;
  gemini_configured: boolean;
}

export async function analyzeResume(resumeFile: File, jdText: string): Promise<APIResponse> {
    try {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('job_description', jdText);
        
        const response = await fetch(`${API_BASE}/analyze`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

export async function analyzeResumeText(resumeText: string, jdText: string): Promise<APIResponse> {
    try {
        const response = await fetch(`${API_BASE}/analyze-text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                resume_text: resumeText,
                job_description_text: jdText
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
}

export async function checkAPIHealth(): Promise<HealthResponse> {
    try {
        const response = await fetch(`${API_BASE}/health`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Health check failed:', error);
        return {
            status: 'error',
            gemini_configured: false
        };
    }
}