import React from 'react';
import { BarChart3, Target, Gauge, Timer, TrendingUp, Activity } from 'lucide-react';

const ModelMetrics = ({ metrics }) => {
  const metricItems = [
    { 
      label: 'Accuracy', 
      value: metrics?.accuracy, 
      icon: Target, 
      color: 'primary',
      format: 'percent'
    },
    { 
      label: 'Precision', 
      value: metrics?.precision, 
      icon: Gauge, 
      color: 'success',
      format: 'percent'
    },
    { 
      label: 'Recall', 
      value: metrics?.recall, 
      icon: TrendingUp, 
      color: 'warning',
      format: 'percent'
    },
    { 
      label: 'AUC Score', 
      value: metrics?.auc, 
      icon: Activity, 
      color: 'accent',
      format: 'decimal'
    },
    { 
      label: 'Inference Time', 
      value: metrics?.inference_time, 
      icon: Timer, 
      color: 'muted',
      format: 'time'
    },
  ];

  const formatValue = (value, format) => {
    if (value === undefined || value === null) return '—';
    
    switch (format) {
      case 'percent':
        return `${(value * 100).toFixed(1)}%`;
      case 'decimal':
        return value.toFixed(3);
      case 'time':
        return `${value.toFixed(0)}ms`;
      default:
        return value;
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      primary: { bg: 'bg-primary-light', text: 'text-primary', bar: 'bg-primary' },
      success: { bg: 'bg-success-light', text: 'text-success', bar: 'bg-success' },
      warning: { bg: 'bg-warning-light', text: 'text-warning', bar: 'bg-warning' },
      accent: { bg: 'bg-accent', text: 'text-accent-foreground', bar: 'bg-primary' },
      muted: { bg: 'bg-muted', text: 'text-muted-foreground', bar: 'bg-muted-foreground' },
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-light">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Model Performance</h2>
            <p className="text-sm text-muted-foreground">Evaluation metrics and statistics</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {metricItems.map(({ label, value, icon: Icon, color, format }) => {
            const colors = getColorClasses(color);
            const numericValue = format === 'time' 
              ? Math.min((value || 0) / 500, 1) 
              : (value || 0);
            
            return (
              <div 
                key={label}
                className="p-4 rounded-xl bg-muted/30 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${colors.text}`} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className={`text-xl font-bold ${colors.text}`}>
                  {formatValue(value, format)}
                </p>
                {format !== 'time' && (
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${colors.bar} transition-all duration-1000`}
                      style={{ width: `${numericValue * 100}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 rounded-xl bg-accent/50 border border-accent">
          <p className="text-sm text-accent-foreground">
            <strong>Model Info:</strong> These metrics were computed on a held-out test set. 
            The model uses a convolutional neural network architecture optimized for chest X-ray analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelMetrics;
