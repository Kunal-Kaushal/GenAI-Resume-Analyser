# AI Resume Analyzer

An intelligent resume analysis tool that compares resumes against job descriptions using AI-powered insights to provide matching scores and detailed feedback.

## Features

- **PDF Resume Upload**: Upload your resume in PDF format
- **Job Description Analysis**: Input job descriptions for comparison
- **AI-Powered Matching**: Get intelligent matching scores (0-100)
- **Detailed Feedback**: Receive comprehensive analysis of strengths and gaps
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Tech Stack

**Frontend:**

- React 18 with TypeScript
- Tailwind CSS for styling
- shadcn/ui components
- Vite for build tooling

**Backend:**

- Python with Google Gemini AI API
- PyPDF2 for PDF text extraction
- Flask/FastAPI (for API integration)

## Getting Started

### Prerequisites

- Node.js & npm
- Python 3.x
- Google Gemini API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd resume-analyzer
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Set up Python backend**

   ```bash
   pip install google-generativeai python-dotenv PyPDF2
   ```

4. **Configure environment variables**
   Create a `.env` file with your Gemini API key:

   ```
   GEMINI_API_KEY=your_api_key_here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Usage

1. Upload your resume (PDF format)
2. Paste the job description you're targeting
3. Click "Analyze Resume" to get AI-powered insights
4. Review your matching score and detailed feedback

## Project Structure

```
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utility functions
│   └── main.tsx            # App entry point
├── main.py                 # Python AI analysis backend
└── package.json            # Dependencies and scripts
```

## Deployment

You can deploy this project to any hosting platform that supports:

- Static site hosting for the React frontend (Vercel, Netlify, etc.)
- Python backend hosting (Railway, Render, Heroku, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
