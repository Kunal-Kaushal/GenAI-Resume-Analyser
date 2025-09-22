import React from 'react';

interface LoadingAnimationProps {
  type?: 'dots' | 'circle' | 'bar';
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ type = 'dots' }) => {
  if (type === 'dots') {
    return (
      <div className="flex items-center justify-center space-x-2">
        <div className="pulse-dots">
          <span style={{ '--i': 0 } as React.CSSProperties}></span>
          <span style={{ '--i': 1 } as React.CSSProperties}></span>
          <span style={{ '--i': 2 } as React.CSSProperties}></span>
        </div>
      </div>
    );
  }

  if (type === 'circle') {
    return (
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="w-full max-w-xs mx-auto">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-primary animate-pulse origin-left transform scale-x-75 transition-transform duration-1000"></div>
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingAnimation;