import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({ 
  value, 
  onChange, 
  disabled 
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Job Description</label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the complete job description here..."
        className="min-h-[120px] resize-none bg-input border-border placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        disabled={disabled}
      />
    </div>
  );
};

export default JobDescriptionInput;