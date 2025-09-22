import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import LoadingAnimation from '@/components/LoadingAnimation';
import RadialProgress from '@/components/RadialProgress';
import { Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { analyzeResume, checkAPIHealth, AnalysisResult } from '@/api';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const { toast } = useToast();

  // Check API health on component mount
  useEffect(() => {
    const checkAPI = async () => {
      const health = await checkAPIHealth();
      setApiStatus(health.status === 'running' ? 'online' : 'offline');
      
      if (health.status !== 'running') {
        toast({
          title: "API Offline",
          description: "Backend API is not responding. Please start your Flask server.",
          variant: "destructive"
        });
      } else if (!health.gemini_configured) {
        toast({
          title: "AI Not Configured",
          description: "Gemini API key not found. AI analysis will be limited.",
          variant: "destructive"
        });
      }
    };
    
    checkAPI();
  }, [toast]);

  const isFormValid = selectedFile && jobDescription.trim().length > 0;

  const handleAnalyze = useCallback(async () => {
    if (!isFormValid) return;

    if (apiStatus !== 'online') {
      toast({
        title: "API Unavailable",
        description: "Backend API is not running. Please start your Flask server.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const response = await analyzeResume(selectedFile!, jobDescription);
      
      if (response.success && response.result) {
        setResult(response.result);
        toast({
          title: "Analysis Complete!",
          description: `Resume analyzed with ${response.result.JD_match}% match score.`,
        });
      } else {
        throw new Error(response.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "There was an error analyzing your resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [isFormValid, apiStatus, selectedFile, jobDescription, toast]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setJobDescription('');
    setResult(null);
    setIsAnalyzing(false);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-2 rounded-xl bg-gradient-primary">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              AI Resume Analyzer
            </h1>
            <div className={`ml-4 flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
              apiStatus === 'online' ? 'bg-green-100 text-green-800' : 
              apiStatus === 'offline' ? 'bg-red-100 text-red-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                apiStatus === 'online' ? 'bg-green-600' : 
                apiStatus === 'offline' ? 'bg-red-600' : 
                'bg-yellow-600'
              }`} />
              <span>
                {apiStatus === 'online' ? 'API Online' : 
                 apiStatus === 'offline' ? 'API Offline' : 
                 'Checking API...'}
              </span>
            </div>
          </div>
          <p className="text-muted-foreground text-lg">
            Get intelligent insights and match scores for your resume
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-gradient-card border-border shadow-card backdrop-blur-sm">
          <div className="p-8">
            {!result && !isAnalyzing && (
              <div className="space-y-6">
                {/* File Upload */}
                <FileUpload 
                  onFileSelect={setSelectedFile}
                  disabled={isAnalyzing}
                />
                
                {/* Job Description Input */}
                <JobDescriptionInput
                  value={jobDescription}
                  onChange={setJobDescription}
                  disabled={isAnalyzing}
                />
                
                {/* Analyze Button */}
                <Button
                  onClick={handleAnalyze}
                  disabled={!isFormValid || isAnalyzing}
                  className="w-full py-6 text-lg font-medium bg-gradient-primary hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 transition-all duration-300 shadow-glow"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze Resume
                </Button>
              </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="text-center py-12">
                <div className="mb-6">
                  <LoadingAnimation type="dots" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Analyzing Your Resume</h3>
                <p className="text-muted-foreground">
                  Our AI is comparing your resume against the job description...
                </p>
                <div className="mt-6">
                  <LoadingAnimation type="bar" />
                </div>
              </div>
            )}

            {/* Results Display */}
            {result && !isAnalyzing && (
              <div className="space-y-8 animate-fade-in">
                {/* Score Display */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-6">Analysis Results</h3>
                  <div className="flex justify-center mb-6">
                    <RadialProgress score={result.JD_match} animate />
                  </div>
                </div>

                {/* Analysis Text */}
                <div className="bg-card/50 rounded-xl p-6 border border-border">
                  <h4 className="font-semibold text-lg mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-primary" />
                    Detailed Analysis
                  </h4>
                  <p className="text-foreground/90 leading-relaxed">
                    {result.analysis}
                  </p>
                </div>

                {/* Reset Button */}
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full py-4 text-base border-border hover:bg-card/50"
                >
                  Analyze Another Resume
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-muted-foreground text-sm">
          <p>
            Made with ❤️  
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help hover:text-foreground transition-colors ml-1">
                  by Kunal Kaushal
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>We do not store your documents. All data is processed in memory and deleted after the analysis is complete.</p>
              </TooltipContent>
            </Tooltip>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;