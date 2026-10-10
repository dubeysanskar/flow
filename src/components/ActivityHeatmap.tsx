"use client";

import React, { useMemo } from "react";
import { Flame, Mic, Zap } from "lucide-react";

interface ActivityDay {
  date: string;
  count: number;
  words: number;
  seconds: number;
}

interface ActivityHeatmapProps {
  sessions: any[];
  flows: any[];
}

const LEVEL_COLORS = [
  "bg-surface-highlight border-surface-border",           // 0 - empty
  "bg-violet-900/60 border-violet-800/40",               // 1 - low
  "bg-violet-700/70 border-violet-600/40",               // 2 - medium
  "bg-violet-500/80 border-violet-400/50",               // 3 - high
  "bg-violet-400 border-violet-300/60 shadow-sm shadow-violet-400/30", // 4 - very high
];

function getLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ActivityHeatmap({ sessions, flows }: ActivityHeatmapProps) {
  const { grid, weeks, monthLabels, streak, totalDays, maxCount } = useMemo(() => {
    // Build activity map
    const activityMap: Record<string, ActivityDay> = {};

    const addToDate = (ts: number, words = 0, seconds = 0) => {
      const d = new Date(ts);
      const key = d.toISOString().slice(0, 10);
      if (!activityMap[key]) activityMap[key] = { date: key, count: 0, words: 0, seconds: 0 };
      activityMap[key].count++;
      activityMap[key].words += words;
      activityMap[key].seconds += seconds;
    };

    sessions.forEach((s) => addToDate(s.createdAt, s.wordsCount ?? 0, s.durationSec ?? 0));
    flows.forEach((f) => addToDate(f.createdAt));

    // Build a 52-week grid ending today
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364); // ~52 weeks back
    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const weeks: ActivityDay[][] = [];
    const monthLabels: { month: string; weekIndex: number }[] = [];
    let currentWeek: ActivityDay[] = [];
    let lastMonth = -1;

    const cursor = new Date(startDate);
    while (cursor <= today) {
      const key = cursor.toISOString().slice(0, 10);
      const day = activityMap[key] ?? { date: key, count: 0, words: 0, seconds: 0 };

      // Track month labels
      if (cursor.getDay() === 0) {
        const month = cursor.getMonth();
        if (month !== lastMonth) {
          monthLabels.push({ month: MONTHS[month], weekIndex: weeks.length });
          lastMonth = month;
        }
      }

      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push({ date: "", count: 0, words: 0, seconds: 0 });
      weeks.push(currentWeek);
    }

    // Calculate streak
    let streak = 0;
    const c = new Date(today);
    while (true) {
      const key = c.toISOString().slice(0, 10);
      if (activityMap[key]?.count > 0) {
        streak++;
        c.setDate(c.getDate() - 1);
      } else break;
    }

    const maxCount = Math.max(1, ...Object.values(activityMap).map((d) => d.count));
    const totalDays = Object.values(activityMap).filter((d) => d.count > 0).length;

    return { grid: weeks, weeks, monthLabels, streak, totalDays, maxCount };
  }, [sessions, flows]);

  const [tooltip, setTooltip] = React.useState<{ day: ActivityDay; x: number; y: number } | null>(null);

  return (
    <div className="glass-card rounded-2xl border border-surface-border p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Voice Development Activity
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 font-mono">
            {totalDays} active days in the last year
          </p>
        </div>

        <div className="flex items-center gap-4">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-bold text-orange-300 font-mono">{streak}d streak</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <Mic className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-mono text-violet-300">
              {sessions.length} sessions
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto pb-1 relative">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex mb-1 ml-7">
            {grid.map((_, wi) => {
              const label = monthLabels.find((m) => m.weekIndex === wi);
              return (
                <div key={wi} className="w-3.5 shrink-0 mr-0.5">
                  {label ? (
                    <span className="text-[9px] text-zinc-500 font-mono">{label.month}</span>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="flex gap-0">
            {/* Weekday labels */}
            <div className="flex flex-col gap-0.5 mr-1.5 pt-0.5">
              {WEEKDAYS.map((d, i) => (
                <div key={d} className="h-3 flex items-center">
                  {i % 2 === 1 && (
                    <span className="text-[9px] text-zinc-600 font-mono w-5 text-right">{d.slice(0, 1)}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) => {
                    const level = getLevel(day.count);
                    return (
                      <div
                        key={di}
                        className={`w-3 h-3 rounded-sm border cursor-pointer transition-all duration-100 hover:scale-125 ${LEVEL_COLORS[level]}`}
                        onMouseEnter={(e) => {
                          if (day.date) {
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            setTooltip({ day, x: rect.left, y: rect.top });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && tooltip.day.date && (
          <div
            className="fixed z-50 pointer-events-none glass-panel rounded-xl border border-surface-border p-2.5 text-xs shadow-xl"
            style={{ left: tooltip.x - 60, top: tooltip.y - 80 }}
          >
            <div className="font-mono text-zinc-300 font-semibold">
              {new Date(tooltip.day.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </div>
            {tooltip.day.count > 0 ? (
              <>
                <div className="text-violet-400 mt-0.5">{tooltip.day.count} voice actions</div>
                <div className="text-zinc-500 text-[10px]">{tooltip.day.words}w · {tooltip.day.seconds}s</div>
              </>
            ) : (
              <div className="text-zinc-600 mt-0.5">No activity</div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border/50">
        <span className="text-[11px] text-zinc-600 font-mono">Less</span>
        <div className="flex items-center gap-1">
          {LEVEL_COLORS.map((cls, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm border ${cls}`} />
          ))}
        </div>
        <span className="text-[11px] text-zinc-600 font-mono">More</span>
      </div>
    </div>
  );
}
