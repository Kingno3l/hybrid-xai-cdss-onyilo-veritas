import React from 'react';
import { Trash2, FileText, CheckCircle2, AlertTriangle, PlayCircle } from 'lucide-react';

const SessionHistoryTable = ({ runs, onUpdateGroundTruth, onDeleteRun, onClearAll }) => {
  if (!runs || runs.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden animate-slide-up mt-6">
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Session Scan History</h2>
            </div>
          </div>

          <button
            onClick={onClearAll}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors ml-auto md:ml-0 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        <div className="overflow-x-auto border border-border/50 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border/50 text-xs font-bold text-muted-foreground uppercase">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">X-Ray Scan</th>
                <th className="py-3 px-4">Prediction</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Latency</th>
                <th className="py-3 px-4">Ground Truth Label</th>
                <th className="py-3 px-4 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-sm">
              {runs.map((run, index) => {
                const isPneumonia = run.prediction?.toLowerCase() === 'pneumonia';
                const isCorrect = run.prediction === run.groundTruth;
                
                return (
                  <tr key={run.id || index} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3.5 px-4 text-center font-medium text-muted-foreground">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground max-w-xs truncate">
                      {run.filename || `Scan #${index + 1}`}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                        isPneumonia 
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30' 
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                      }`}>
                        {isPneumonia ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        {run.prediction}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {(run.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-mono text-xs">
                      {run.latency ? `${run.latency.toFixed(0)}ms` : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <select
                          value={run.groundTruth}
                          onChange={(e) => onUpdateGroundTruth(run.id, e.target.value)}
                          className="bg-background border border-border hover:border-muted-foreground rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                        >
                          <option value="Normal">Normal</option>
                          <option value="Pneumonia">Pneumonia</option>
                        </select>

                        {isCorrect ? (
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/20">
                            Correct
                          </span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 text-xs font-semibold bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-900/20">
                            Error
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onDeleteRun(run.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                        title="Delete scan run"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SessionHistoryTable;
