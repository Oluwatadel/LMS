"use client";

import { useAuthStore, useLmsStore } from "@/lib/store";
import { TrackCard } from "@/components/dashboard/track-card";
import { ProgressOverview } from "@/components/dashboard/progress-overview";
import { BookOpen, Award, Code2, TrendingUp } from "lucide-react";

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);
  const { tracks, selectedTrackId, getTrackProgress } = useLmsStore();

  if (!user) return null;

  // Use enrolled track from user profile, or fallback to selected track
  const activeTrackId = user.enrolledTrackId ?? selectedTrackId;
  const currentTrack = tracks.find((t) => t.id === activeTrackId);
  const progress = activeTrackId
    ? getTrackProgress(user.id, activeTrackId)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">
          {activeTrackId
            ? "Continue your learning journey"
            : "Select a track to start learning"}
        </p>
      </div>

      {/* Stats */}
      {activeTrackId && currentTrack && (
        <ProgressOverview
          trackName={currentTrack.name}
          progress={progress}
          lessonsCompleted={Math.floor(
            (progress / 100) * currentTrack.lessonCount
          )}
          totalLessons={currentTrack.lessonCount}
        />
      )}

      {/* Track selection */}
      {!activeTrackId ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Choose Your Learning Track
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Your Track: {currentTrack?.name}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<BookOpen className="h-5 w-5" />}
              label="Total Lessons"
              value={currentTrack?.lessonCount ?? 0}
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Completed"
              value={Math.floor(
                ((progress / 100) * (currentTrack?.lessonCount ?? 0))
              )}
            />
            <StatCard
              icon={<Code2 className="h-5 w-5" />}
              label="Assignments"
              value={currentTrack?.courseCount ?? 0}
            />
            <StatCard
              icon={<Award className="h-5 w-5" />}
              label="Progress"
              value={`${progress}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
