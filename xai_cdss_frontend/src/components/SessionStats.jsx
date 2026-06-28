import React from 'react';
import { PlayCircle, CheckCircle, AlertTriangle, Zap, RefreshCw } from 'lucide-react';

const SessionStats = ({ stats, onResetStats }) => {
  if (!stats || stats.total === 0) return null;

  const avgLatency = stats.latencyHistory && stats.latencyHistory.length > 0
    ? (stats.latencyHistory.reduce((a, b) => a + b, 0) / stats.latencyHistory.length).toFixed(0)
    : 0;

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden animate-slide-up mt-8">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Session Statistics</h2>
              <p className="text-sm text-muted-foreground">Dynamic diagnostic metrics for this active session</p>
            </div>
          </div>

          <button
            onClick={onResetStats}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-medium transition-colors ml-auto md:ml-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Session</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Cases */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center">
                <PlayCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-xs text-muted-foreground">Total Scans Run</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>

          {/* Normal Findings */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs text-muted-foreground">Normal Cases</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.normal}</p>
          </div>

          {/* Pneumonia Findings */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-xs text-muted-foreground">Pneumonia Cases</span>
            </div>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{stats.pneumonia}</p>
          </div>

          {/* Last / Avg Latency */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs text-muted-foreground">Avg / Last Latency</span>
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {avgLatency}ms <span className="text-xs font-normal text-muted-foreground">/ {stats.lastLatency ? `${stats.lastLatency.toFixed(0)}ms` : '—'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionStats;
