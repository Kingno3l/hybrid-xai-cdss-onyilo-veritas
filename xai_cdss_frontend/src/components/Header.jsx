import React from 'react';
import { Activity, Brain, Wifi, WifiOff } from 'lucide-react';

const Header = ({ isLive = true }) => {
  return (
    <header className="w-full bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl medical-gradient shadow-medical flex-shrink-0">
              <Brain className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight">
                Explainable AI Clinical Decision Support System.
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground flex items-center gap-1.5 mt-0.5 md:mt-1">
                <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                Pneumonia Detection from Chest X-ray Images
              </p>
            </div>
          </div>

          <div className="flex items-center sm:justify-end">
            {isLive ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30 text-xs font-semibold shadow-sm transition-all duration-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5" />
                <span>CDSS Server: Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30 text-xs font-semibold shadow-sm transition-all duration-300">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <WifiOff className="w-3.5 h-3.5" />
                <span>CDSS Server: Offline</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
