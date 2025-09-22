import React, { useCallback, useState } from 'react';
import { Upload, CheckCircle, Eye, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const pdfFile = files.find(file => file.type === 'application/pdf');
    
    if (pdfFile) {
      setSelectedFile(pdfFile);
      onFileSelect(pdfFile);
    }
  }, [onFileSelect, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    document.getElementById('file-input')?.click();
  }, [disabled]);

  const handlePreview = useCallback(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      window.open(url, '_blank');
    }
  }, [selectedFile]);

  const handleRemove = useCallback(() => {
    setSelectedFile(null);
    onFileSelect(null);
    // Reset the file input
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }, [onFileSelect]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Resume Upload</label>
      <div
        className={`dropzone ${isDragOver ? 'dropzone-active border-primary' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={selectedFile ? undefined : handleClick}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        {selectedFile ? (
          <div className="flex items-center justify-center space-x-3">
            <CheckCircle className="w-6 h-6 text-success" />
            <div className="text-center">
              <p className="text-success font-medium">✅ {selectedFile.name}</p>
              <p className="text-sm text-muted-foreground mt-1">PDF uploaded successfully</p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <button
                  onClick={handlePreview}
                  className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                  title="Preview PDF"
                >
                  <Eye className="w-4 h-4 text-primary" />
                </button>
                <button
                  onClick={handleRemove}
                  className="p-1.5 rounded-full bg-destructive/10 hover:bg-destructive/20 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-foreground font-medium">Drag & Drop Your Resume PDF Here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;