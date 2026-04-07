import React, { useEffect, useState } from "react";
import { AlertCircle, Calendar, Loader2, Target, Trophy, X, Zap } from "lucide-react";
import api from "../lib/api";

interface StudentMetricsProps {
  userId: string;
  fullName: string;
  onClose: () => void;
}

interface UserPerformance {
  user_id: string;
  total_score: number | null;
  tasks_completed: number | null;
  tasks_failed: number | null;
  avg_score: number | null;
  streak_days: number | null;
  current_level: string | number | null;
  last_task_completed_at: string | null;
  updated_at: string | null;
}

export default function StudentMetrics({ userId, fullName, onClose }: StudentMetricsProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<UserPerformance | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true);
        setError(null);
        // Using our backend API instead of direct Supabase call
        const response = await api.get(`/users/${userId}/details`);
        setMetrics(response.data.performance);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Failed to load metrics.");
        setMetrics(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
  }, [userId]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const hasMetrics = !!metrics;
  const totalScore = metrics?.total_score ?? 0;
  const completed = metrics?.tasks_completed ?? 0;
  const failed = metrics?.tasks_failed ?? 0;
  const avgScore = metrics?.avg_score ?? 0;
  const streakDays = metrics?.streak_days ?? 0;
  const currentLevel = metrics?.current_level?.toString() ?? "1";
  const lastTaskCompletedAt = metrics?.last_task_completed_at;
  const updatedAt = metrics?.updated_at;

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${fullName} performance metrics`}
    >
      <div
        className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">{fullName}</h2>
            <p className="text-sm text-slate-400">Performance Overview</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="h-80 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mb-4 text-primary" size={32} />
              <p>Loading performance metrics...</p>
            </div>
          ) : error ? (
            <div className="h-80 flex flex-col items-center justify-center text-red-400">
              <AlertCircle className="mb-4" size={32} />
              <p>Error loading metrics: {error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {!hasMetrics && (
                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10 text-slate-300">
                  <AlertCircle className="shrink-0 mt-0.5 text-primary" size={18} />
                  <div>
                    <p className="text-sm font-semibold text-white">No performance data yet</p>
                    <p className="text-xs text-slate-400">This student hasn’t generated metrics in the system.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard icon={<Trophy className="text-yellow-500" size={20} />} label="Total Score" value={totalScore} />
                <StatCard icon={<Target className="text-blue-500" size={20} />} label="Completed" value={completed} />
                <StatCard icon={<AlertCircle className="text-red-500" size={20} />} label="Failed" value={failed} />
                <StatCard icon={<Zap className="text-orange-500" size={20} />} label="Streak Days" value={streakDays} />
                <StatCard icon={<Calendar className="text-primary" size={20} />} label="Avg. Score" value={`${avgScore}%`} />
                <StatCard icon={<Calendar className="text-slate-400" size={20} />} label="Level" value={capitalize(currentLevel)} />
              </div>

              <div className="bg-primary/10 rounded-lg border border-primary/20 p-4 text-sm text-slate-300 space-y-1">
                <p>
                  <span className="font-semibold text-white">Last Task Completed:</span>{" "}
                  {lastTaskCompletedAt ? new Date(lastTaskCompletedAt).toLocaleString() : "—"}
                </p>
                <p>
                  <span className="font-semibold text-white">Metrics Updated:</span>{" "}
                  {updatedAt ? new Date(updatedAt).toLocaleString() : "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-xl shadow-sm hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
