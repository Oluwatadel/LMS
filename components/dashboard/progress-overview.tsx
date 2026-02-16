"use client";

import { Progress } from "@/components/ui/progress";
import { BookOpen, CheckCircle2 } from "lucide-react";

interface ProgressOverviewProps {
  trackName: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
}

export function ProgressOverview({
  trackName,
  progress,
  lessonsCompleted,
  totalLessons,
}: ProgressOverviewProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">
            {trackName}
          </h3>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            {lessonsCompleted} of {totalLessons} lessons completed
          </p>
        </div>
        <div className="flex items-center gap-3">
          {progress === 100 && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Complete
            </span>
          )}
          <span className="text-2xl font-bold text-foreground">
            {progress}%
          </span>
        </div>
      </div>
      <Progress value={progress} className="mt-4 h-2" />
    </div>
  );
}
