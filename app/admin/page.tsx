"use client";

import { useAuthStore, useLmsStore, useUserStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Code2, FileText, Award, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const { tracks, courses, lessons, assignments, studentProgress, certificates } =
    useLmsStore();
  const { users } = useUserStore();

  const isSuperAdmin = user?.role === "superadmin";
  const studentCount = users.filter((u) => u.role === "student").length;
  const mentorCount = users.filter((u) => u.role === "mentor").length;
  const adminCount = users.filter((u) => u.role === "admin" || u.role === "superadmin").length;

  const stats = [
    {
      label: "Total Tracks",
      value: tracks.length,
      icon: <BookOpen className="h-5 w-5" />,
      color: "text-primary",
    },
    {
      label: "Total Students",
      value: studentCount,
      icon: <Users className="h-5 w-5" />,
      color: "text-chart-2",
    },
    {
      label: "Certificates Issued",
      value: certificates.length,
      icon: <Award className="h-5 w-5" />,
      color: "text-chart-3",
    },
    {
      label: "Total Lessons",
      value: lessons.length,
      icon: <Code2 className="h-5 w-5" />,
      color: "text-chart-4",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isSuperAdmin ? "Super Admin" : "Admin"} Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSuperAdmin
              ? "Full system control - manage users, content, and certificates"
              : "Manage your learning platform"}
          </p>
        </div>
        {isSuperAdmin && (
          <Badge className="ml-auto gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
            <ShieldCheck className="h-3.5 w-3.5" />
            Super Admin
          </Badge>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={stat.color}>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tracks overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Tracks Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tracks.map((track) => {
                const trackCourses = courses.filter(
                  (c) => c.trackId === track.id
                ).length;
                const trackLessons = lessons.filter((l) =>
                  courses
                    .filter((c) => c.trackId === track.id)
                    .some((c) => c.id === l.courseId)
                ).length;

                return (
                  <div
                    key={track.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {track.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {trackCourses} courses, {trackLessons} lessons
                      </p>
                    </div>
                    {track.isCodingTrack && (
                      <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                        Coding
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Platform stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Platform Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Students
                  </span>
                </div>
                <span className="text-lg font-bold text-foreground">
                  {studentCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Mentors
                  </span>
                </div>
                <span className="text-lg font-bold text-foreground">
                  {mentorCount}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <Code2 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Total Submissions
                  </span>
                </div>
                <span className="text-lg font-bold text-foreground">
                  {studentProgress.filter((p) => p.assignmentSubmitted).length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Lessons Completed
                  </span>
                </div>
                <span className="text-lg font-bold text-foreground">
                  {studentProgress.filter((p) => p.isCompleted).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
