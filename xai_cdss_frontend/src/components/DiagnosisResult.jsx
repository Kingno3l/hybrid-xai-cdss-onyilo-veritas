import React from 'react';
import { CheckCircle, AlertTriangle, TrendingUp, Shield, Zap } from 'lucide-react';

const DiagnosisResult = ({ prediction, confidence, latency }) => {
  const isPneumonia = prediction?.toLowerCase() === 'pneumonia';
  
  return (
    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden animate-slide-up">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-light">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Diagnosis Result</h2>
            <p className="text-sm text-muted-foreground">AI-powered analysis output</p>
          </div>
          {latency && (
            <div className="ml-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30 text-xs font-semibold shadow-sm animate-pulse">
                <Zap className="w-3.5 h-3.5 fill-indigo-600/10" />
                <span>Live Latency: {latency.toFixed(0)}ms</span>
              </span>
            </div>
          )}
        </div>

        <div className={`p-6 rounded-xl border-2 ${
          isPneumonia 
            ? 'bg-danger-light border-danger/30' 
            : 'bg-success-light border-success/30'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
              isPneumonia ? 'bg-danger/10' : 'bg-success/10'
            }`}>
              {isPneumonia ? (
                <AlertTriangle className="w-7 h-7 text-danger" />
              ) : (
                <CheckCircle className="w-7 h-7 text-success" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Classification</p>
              <h3 className={`text-2xl font-bold ${isPneumonia ? 'text-danger' : 'text-success'}`}>
                {prediction || 'Unknown'}
              </h3>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-muted/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Confidence Score</span>
            </div>
            <span className={`text-lg font-bold ${
              confidence >= 0.8 ? 'text-success' : confidence >= 0.6 ? 'text-warning' : 'text-danger'
            }`}>
              {(confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                confidence >= 0.8 ? 'bg-success' : confidence >= 0.6 ? 'bg-warning' : 'bg-danger'
              }`}
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-accent/50 border border-accent">
          <p className="text-sm text-accent-foreground">
            <strong>Note:</strong> This AI-powered analysis is intended to assist medical professionals 
            in decision-making. It should not replace clinical judgment or professional diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisResult;
