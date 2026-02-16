"use client";

import Link from "next/link";
import {
  useAuthStore,
  useLmsStore,
  useUserStore,
  usePaymentStore,
  usePermissionStore,
} from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  Code2,
  Award,
  ShieldCheck,
  CreditCard,
  Clock,
  TrendingUp,
  ArrowRight,
  ClipboardList,
} from "lucide-react";

export default function AdminDashboard() {
  const user = useAuthStore((s) => s.user);
  const {
    tracks,
    courses,
    lessons,
    assignments,
    studentProgress,
    certificates,
  } = useLmsStore();
  const { users } = useUserStore();
  const { payments, getPendingPayments, getTotalRevenue } = usePaymentStore();
  const { hasPermission } = usePermissionStore();

  const isSuperAdmin = user?.role === "superadmin";
  const studentCount = users.filter((u) => u.role === "student").length;
  const mentorCount = users.filter((u) => u.role === "mentor").length;
  const adminCount = users.filter(
    (u) => u.role === "admin" || u.role === "superadmin"
  ).length;

  const enrolledStudents = users.filter(
    (u) => u.role === "student" && u.enrolledTrackId
  ).length;
  const pendingPayments = getPendingPayments();
  const totalRevenue = getTotalRevenue();
  const submissionCount = studentProgress.filter(
    (p) => p.assignmentSubmitted
  ).length;

  const canViewPayments =
    isSuperAdmin ||
    (user ? hasPermission(user.id, "manage_payments") : false);
  const canManageAssignments =
    isSuperAdmin ||
    (user ? hasPermission(user.id, "manage_assignments") : false);

  const stats = [
    {
      label: "Total Students",
      value: studentCount,
      sub: `${enrolledStudents} enrolled`,
      icon: <Users className="h-5 w-5" />,
      color: "text-primary",
      href: "/admin/students",
    },
    {
      label: "Total Tracks",
      value: tracks.length,
      sub: `${courses.length} courses`,
      icon: <BookOpen className="h-5 w-5" />,
      color: "text-chart-2",
      href: "/admin/tracks",
    },
    {
      label: "Certificates",
      value: certificates.length,
      sub: "issued",
      icon: <Award className="h-5 w-5" />,
      color: "text-chart-3",
      href: "/admin/certificates",
    },
    {
      label: "Assignments",
      value: assignments.length,
      sub: `${submissionCount} submitted`,
      icon: <ClipboardList className="h-5 w-5" />,
      color: "text-chart-4",
      href: "/admin/assignments",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">
            {isSuperAdmin ? "Super Admin" : "Admin"} Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {isSuperAdmin
              ? "Full system control - manage users, content, payments, and certificates"
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

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="group cursor-pointer transition-colors hover:border-primary/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={stat.color}>{stat.icon}</div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground tabular-nums">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.sub}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Payment Stats (if accessible) */}
      {canViewPayments && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold text-foreground tabular-nums">
                  NGN {totalRevenue.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Payments
                </p>
                <p className="text-xl font-bold text-foreground tabular-nums">
                  {pendingPayments.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-xl font-bold text-foreground tabular-nums">
                  {payments.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tracks overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Tracks Overview</CardTitle>
            <Link href="/admin/tracks">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tracks.map((track) => {
                const trackCourses = courses.filter(
                  (c) => c.trackId === track.id
                ).length;
                const trackStudents = users.filter(
                  (u) =>
                    u.role === "student" && u.enrolledTrackId === track.id
                ).length;

                return (
                  <div
                    key={track.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {track.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {trackCourses} courses, {trackStudents} students
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {(track.price ?? 0) > 0 && (
                        <Badge
                          variant="outline"
                          className="text-[10px] tabular-nums"
                        >
                          {track.currency || "NGN"}{" "}
                          {(track.price ?? 0).toLocaleString()}
                        </Badge>
                      )}
                      {track.isCodingTrack && (
                        <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground flex items-center gap-1">
                          <Code2 className="h-3 w-3" />
                          Coding
                        </span>
                      )}
                    </div>
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
            <div className="space-y-3">
              <PlatformStatRow
                icon={<Users className="h-5 w-5 text-muted-foreground" />}
                label="Students"
                value={studentCount}
              />
              <PlatformStatRow
                icon={<Users className="h-5 w-5 text-muted-foreground" />}
                label="Mentors"
                value={mentorCount}
              />
              <PlatformStatRow
                icon={
                  <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                }
                label="Admins"
                value={adminCount}
              />
              <PlatformStatRow
                icon={<Code2 className="h-5 w-5 text-muted-foreground" />}
                label="Total Submissions"
                value={submissionCount}
              />
              <PlatformStatRow
                icon={<BookOpen className="h-5 w-5 text-muted-foreground" />}
                label="Lessons Completed"
                value={
                  studentProgress.filter((p) => p.isCompleted).length
                }
              />
              <PlatformStatRow
                icon={<Award className="h-5 w-5 text-muted-foreground" />}
                label="Total Lessons"
                value={lessons.length}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/students">
              <Button variant="outline" size="sm" className="gap-2">
                <Users className="h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            {canViewPayments && (
              <Link href="/admin/payments">
                <Button variant="outline" size="sm" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  View Payments
                  {pendingPayments.length > 0 && (
                    <Badge className="ml-1 h-5 bg-warning/10 text-warning border-warning/20 hover:bg-warning/10 text-[10px]">
                      {pendingPayments.length}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            {canManageAssignments && (
              <Link href="/admin/assignments">
                <Button variant="outline" size="sm" className="gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Review Assignments
                </Button>
              </Link>
            )}
            <Link href="/admin/certificates">
              <Button variant="outline" size="sm" className="gap-2">
                <Award className="h-4 w-4" />
                Certificates
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PlatformStatRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <span className="text-lg font-bold text-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}
