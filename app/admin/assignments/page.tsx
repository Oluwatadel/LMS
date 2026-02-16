"use client";

import { useState } from "react";
import {
  useAuthStore,
  useLmsStore,
  useUserStore,
  usePermissionStore,
} from "@/lib/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  Code2,
} from "lucide-react";
import type { Assignment, StudentProgress, User } from "@/lib/types";

export default function AdminAssignmentsPage() {
  const currentUser = useAuthStore((s) => s.user);
  const {
    tracks,
    courses,
    assignments,
    studentProgress,
    updateProgress,
  } = useLmsStore();
  const { users } = useUserStore();
  const { hasPermission } = usePermissionStore();

  const [search, setSearch] = useState("");
  const [filterTrack, setFilterTrack] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const isSuperAdmin = currentUser?.role === "superadmin";
  const canReview =
    isSuperAdmin ||
    (currentUser
      ? hasPermission(currentUser.id, "review_assignments")
      : false);

  // Build a view model: assignment + student submissions
  const assignmentViews = assignments.map((assignment) => {
    const course = courses.find((c) => c.id === assignment.courseId);
    const track = course
      ? tracks.find((t) => t.id === course.trackId)
      : undefined;

    const submissions = studentProgress.filter(
      (sp) => sp.lessonId === assignment.id && sp.assignmentSubmitted
    );

    const pendingSubmissions = submissions.filter(
      (sp) => !sp.assignmentPassed && !sp.isCompleted
    );

    return {
      assignment,
      course,
      track,
      submissions,
      pendingCount: pendingSubmissions.length,
      totalSubmissions: submissions.length,
    };
  });

  const filteredViews = assignmentViews.filter((view) => {
    const matchesSearch =
      view.assignment.title.toLowerCase().includes(search.toLowerCase()) ||
      (view.course?.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (view.track?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesTrack =
      filterTrack === "all" || view.track?.id === filterTrack;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "pending" && view.pendingCount > 0) ||
      (filterStatus === "no_submissions" && view.totalSubmissions === 0) ||
      (filterStatus === "reviewed" &&
        view.totalSubmissions > 0 &&
        view.pendingCount === 0);
    return matchesSearch && matchesTrack && matchesStatus;
  });

  const totalAssignments = assignments.length;
  const totalSubmissions = studentProgress.filter(
    (sp) => sp.assignmentSubmitted
  ).length;
  const totalPending = assignmentViews.reduce(
    (sum, v) => sum + v.pendingCount,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Assignment Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Review submissions, track progress, and manage student assignments
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Assignments
              </p>
              <p className="text-xl font-bold text-foreground tabular-nums">
                {totalAssignments}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
              <FileText className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Total Submissions
              </p>
              <p className="text-xl font-bold text-foreground tabular-nums">
                {totalSubmissions}
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
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-xl font-bold text-foreground tabular-nums">
                {totalPending}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assignments, courses, or tracks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterTrack} onValueChange={setFilterTrack}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tracks</SelectItem>
            {tracks.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Has Pending</SelectItem>
            <SelectItem value="reviewed">All Reviewed</SelectItem>
            <SelectItem value="no_submissions">No Submissions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignments Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Assignment</TableHead>
              <TableHead className="text-foreground">Course</TableHead>
              <TableHead className="text-foreground">Track</TableHead>
              <TableHead className="text-foreground text-center">
                Type
              </TableHead>
              <TableHead className="text-foreground text-center">
                Submissions
              </TableHead>
              <TableHead className="text-foreground text-center">
                Pending
              </TableHead>
              <TableHead className="text-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredViews.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No assignments found
                </TableCell>
              </TableRow>
            ) : (
              filteredViews.map((view) => (
                <AssignmentRow
                  key={view.assignment.id}
                  view={view}
                  canReview={canReview}
                  users={users}
                  studentProgress={studentProgress}
                  updateProgress={updateProgress}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============================================================
// Assignment Row
// ============================================================

interface AssignmentView {
  assignment: Assignment;
  course: { id: string; title: string; trackId: string } | undefined;
  track: { id: string; name: string } | undefined;
  submissions: StudentProgress[];
  pendingCount: number;
  totalSubmissions: number;
}

function AssignmentRow({
  view,
  canReview,
  users,
  studentProgress,
  updateProgress,
}: {
  view: AssignmentView;
  canReview: boolean;
  users: User[];
  studentProgress: StudentProgress[];
  updateProgress: (
    studentId: string,
    lessonId: string,
    data: Partial<StudentProgress>
  ) => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const { assignment, course, track, submissions, pendingCount, totalSubmissions } =
    view;

  return (
    <>
      <TableRow>
        <TableCell>
          <div>
            <p className="font-medium text-foreground">{assignment.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
              {assignment.description}
            </p>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm text-muted-foreground">
            {course?.title || "Unknown"}
          </span>
        </TableCell>
        <TableCell>
          {track ? (
            <Badge variant="outline" className="text-xs">
              {track.name}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">--</span>
          )}
        </TableCell>
        <TableCell className="text-center">
          {assignment.isCodingAssignment ? (
            <Badge className="gap-1 bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/10 text-[10px]">
              <Code2 className="h-3 w-3" />
              Code
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px]">
              Written
            </Badge>
          )}
        </TableCell>
        <TableCell className="text-center">
          <span className="font-medium text-foreground tabular-nums">
            {totalSubmissions}
          </span>
        </TableCell>
        <TableCell className="text-center">
          {pendingCount > 0 ? (
            <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/10 text-[10px] tabular-nums">
              {pendingCount}
            </Badge>
          ) : totalSubmissions > 0 ? (
            <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10 text-[10px]">
              Done
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">--</span>
          )}
        </TableCell>
        <TableCell className="text-right">
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-xs"
            onClick={() => setDetailOpen(true)}
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
        </TableCell>
      </TableRow>

      {/* Submission Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {assignment.title}
            </DialogTitle>
            <DialogDescription>
              {course?.title} - {track?.name || "Unknown Track"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <p className="text-sm text-foreground">{assignment.description}</p>
              <div className="flex gap-2 mt-2">
                {assignment.isCodingAssignment && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Code2 className="h-3 w-3" />
                    Coding Assignment
                  </Badge>
                )}
                {assignment.maxScore && (
                  <Badge variant="outline" className="text-xs">
                    Max Score: {assignment.maxScore}
                  </Badge>
                )}
              </div>
            </div>

            {/* Submissions List */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">
                Submissions ({submissions.length})
              </h4>
              {submissions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No submissions yet
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {submissions.map((submission) => {
                    const student = users.find(
                      (u) => u.id === submission.studentId
                    );
                    const isPending =
                      submission.assignmentSubmitted &&
                      !submission.assignmentPassed &&
                      !submission.isCompleted;

                    return (
                      <div
                        key={`${submission.studentId}-${submission.lessonId}`}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            {student?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {student?.name || "Unknown Student"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {student?.email || ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {submission.assignmentPassed ? (
                            <Badge className="gap-1 bg-success/10 text-success border-success/20 hover:bg-success/10 text-xs">
                              <CheckCircle2 className="h-3 w-3" />
                              Passed
                            </Badge>
                          ) : isPending ? (
                            <>
                              <Badge className="gap-1 bg-warning/10 text-warning border-warning/20 hover:bg-warning/10 text-xs">
                                <Clock className="h-3 w-3" />
                                Pending
                              </Badge>
                              {canReview && (
                                <div className="flex gap-1 ml-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 gap-1 text-[10px] text-success border-success/30 hover:bg-success/10 hover:text-success"
                                    onClick={() => {
                                      updateProgress(
                                        submission.studentId,
                                        submission.lessonId,
                                        {
                                          assignmentPassed: true,
                                          isCompleted: true,
                                        }
                                      );
                                      toast.success(
                                        `Submission by ${student?.name} approved`
                                      );
                                    }}
                                  >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 gap-1 text-[10px] text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => {
                                      updateProgress(
                                        submission.studentId,
                                        submission.lessonId,
                                        {
                                          assignmentSubmitted: false,
                                          assignmentPassed: false,
                                        }
                                      );
                                      toast.success(
                                        `Submission by ${student?.name} returned for revision`
                                      );
                                    }}
                                  >
                                    <XCircle className="h-3 w-3" />
                                    Return
                                  </Button>
                                </div>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Not Passed
                            </Badge>
                          )}
                          {submission.score !== undefined && (
                            <Badge variant="secondary" className="text-xs tabular-nums">
                              Score: {submission.score}
                              {assignment.maxScore ? `/${assignment.maxScore}` : ""}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
