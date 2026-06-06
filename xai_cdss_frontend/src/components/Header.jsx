import React from 'react';
import { Activity, Brain } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full bg-card border-b border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl medical-gradient shadow-medical">
            <Brain className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              Explainable AI Clinical Decision Support System
            </h1>
            <p className="text-sm md:text-base text-muted-foreground flex items-center gap-2 mt-1">
              <Activity className="w-4 h-4 text-primary" />
              Pneumonia Detection from Chest X-ray Images
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
