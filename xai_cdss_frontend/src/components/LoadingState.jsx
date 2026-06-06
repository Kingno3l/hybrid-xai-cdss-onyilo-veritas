import React from 'react';
import { Brain, Scan, Activity } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden p-8 md:p-12">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center">
              <Brain className="w-12 h-12 text-primary" />
            </div>
            <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
          
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Analyzing X-ray Image
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md">
            Our deep learning model is processing your image and generating explainability visualizations...
          </p>
          
          <div className="w-full max-w-sm space-y-4">
            <LoadingStep icon={Scan} text="Processing image data" delay={0} />
            <LoadingStep icon={Brain} text="Running neural network inference" delay={1} />
            <LoadingStep icon={Activity} text="Generating Grad-CAM visualization" delay={2} />
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingStep = ({ icon: Icon, text, delay }) => {
  return (
    <div 
      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-pulse-slow"
      style={{ animationDelay: `${delay * 0.5}s` }}
    >
      <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
};

export default LoadingState;
