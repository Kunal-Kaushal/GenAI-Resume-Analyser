# 🚀 GenAI Resume Analyser

![Python](https://img.shields.io/badge/Python-3.11-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Run-4285f4)

## 🌐 Live Demo
**Frontend**: [https://frontend-1025255142765.us-central1.run.app](https://frontend-1025255142765.us-central1.run.app)

## 🛠️ Tech Stack
- **Backend**: Flask, Google Gemini AI, PyPDF2
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Deployment**: Google Cloud Run (Docker)
- **AI**: Google Gemini 2.5 Flash

## 🚀 Features
- 📄 PDF resume upload and text extraction
- 🤖 AI-powered job description matching
- 📊 Real-time analysis scores (0-100)
- 🎯 Gap analysis and improvement suggestions
- 🌐 RESTful API with proper error handling

## 📱 Multiple Frontend Versions
- **Production**: React + TypeScript + Tailwind
- **Simple**: Vanilla HTML/CSS/JS for learning
- **Beginner**: React with CDN (no build tools)

## 🏗️ Architecture
Frontend (React) → Flask API → Gemini AI → Analysis Results


## 🔧 Local Development
```bash
# Backend
python api.py

# Frontend  
cd Front-end && npm run dev
```

## 🚀 Deployment
- Dockerized Flask API on Google Cloud Run  
- Environment variables for API keys  
- Production-ready with Gunicorn  

## 🎯 How It Works
- Upload your resume (PDF format)  
- Paste the job description  
- Get AI-powered analysis with match score  
- Receive detailed feedback and improvement suggestions  
