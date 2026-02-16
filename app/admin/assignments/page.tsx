"use client";

import { useState, useMemo } from "react";
import { useLmsStore, useUserStore } from "@/lib/store";
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
  FileCode,
  Eye,
} from "lucide-react";

interface AssignmentView {
  assignmentId: string;
  assignmentTitle: string;
  lessonTitle: string;
  trackId: string;
  trackName: string;
  language: string;
  submissions: SubmissionView[];
}

interface SubmissionView {
  studentId: string;
  studentName: string;
  submitted: boolean;
  passed: boolean;
  lessonId: string;
}

export default function AdminAssignmentsPage() {
  const { assignments, lessons, courses, tracks, studentProgress, updateProgress } =
    useLmsStore();
  const { users } = useUserStore();
  const [search, setSearch] = useState("");
  const [filterTrack, setFilterTrack] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const students = users.filter((u) => u.role === "student");

  // Build assignment views with track info and submissions
  const assignmentViews = useMemo(() => {
    return assignments.map((assignment) => {
      const lesson = lessons.find((l) => l.id === assignment.lessonId);
      const course = lesson
        ? courses.find((c) => c.id === lesson.courseId)
        : null;
      const track = course ? tracks.find((t) => t.id === course.trackId) : null;

      // Find students enrolled in this track
      const trackStudents = students.filter(
        (s) => s.enrolledTrackId === track?.id
      );

      const submissions: SubmissionView[] = trackStudents.map((student) => {
        const progress = studentProgress.find(
          (p) =>
            p.studentId === student.id && p.lessonId === assignment.lessonId
        );
        return {
          studentId: student.id,
          studentName: student.name,
          submitted: progress?.assignmentSubmitted ?? false,
          passed: progress?.assignmentPassed ?? false,
          lessonId: assignment.lessonId,
        };
      });

      return {
        assignmentId: assignment.id,
        assignmentTitle: assignment.title,
        lessonTitle: lesson?.title ?? "Unknown",
        trackId: track?.id ?? "",
        trackName: track?.name ?? "Unknown",
        language: assignment.language,
        submissions,
      } as AssignmentView;
    });
  }, [assignments, lessons, courses, tracks, students, studentProgress]);

  const filteredAssignments = assignmentViews.filter((a) => {
    const matchesSearch =
      a.assignmentTitle.toLowerCase().includes(search.toLowerCase()) ||
      a.lessonTitle.toLowerCase().includes(search.toLowerCase()) ||
      a.trackName.toLowerCase().includes(search.toLowerCase());
    const matchesTrack = filterTrack === "all" || a.trackId === filterTrack;

    if (filterStatus === "all") return matchesSearch && matchesTrack;
    if (filterStatus === "has_submissions") {
      return (
        matchesSearch &&
        matchesTrack &&
        a.submissions.some((s) => s.submitted)
      );
    }
    if (filterStatus === "pending_review") {
      return (
        matchesSearch &&
        matchesTrack &&
        a.submissions.some((s) => s.submitted && !s.passed)
      );
    }
    return matchesSearch && matchesTrack;
  });

  // Stats
  const totalAssignments = assignments.length;
  const totalSubmissions = assignmentViews.reduce(
    (sum, a) => sum + a.submissions.filter((s) => s.submitted).length,
    0
  );
  const totalPassed = assignmentViews.reduce(
    (sum, a) => sum + a.submissions.filter((s) => s.passed).length,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Assignment Management
        </h1>
        <p className="text-muted-foreground mt-1">
          View all assignments across tracks and review student submissions
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
              <FileCode className="h-5 w-5 text-chart-2" />
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Passed</p>
              <p className="text-xl font-bold text-foreground tabular-nums">
                {totalPassed}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
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
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="has_submissions">Has Submissions</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignments Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Assignment</TableHead>
              <TableHead className="text-foreground">Lesson</TableHead>
              <TableHead className="text-foreground">Track</TableHead>
              <TableHead className="text-foreground text-center">
                Language
              </TableHead>
              <TableHead className="text-foreground text-center">
                Submissions
              </TableHead>
              <TableHead className="text-foreground text-center">
                Passed
              </TableHead>
              <TableHead className="text-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssignments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No assignments found
                </TableCell>
              </TableRow>
            ) : (
              filteredAssignments.map((av) => (
                <AssignmentRow
                  key={av.assignmentId}
                  view={av}
                  onReview={(studentId, lessonId, passed) => {
                    updateProgress(studentId, lessonId, {
                      assignmentPassed: passed,
                    });
                    toast.success(
                      `Submission ${passed ? "approved" : "rejected"}`
                    );
                  }}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AssignmentRow({
  view,
  onReview,
}: {
  view: AssignmentView;
  onReview: (studentId: string, lessonId: string, passed: boolean) => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const submittedCount = view.submissions.filter((s) => s.submitted).length;
  const passedCount = view.submissions.filter((s) => s.passed).length;

  const langColor =
    view.language === "javascript"
      ? "bg-warning/10 text-warning border-warning/20"
      : view.language === "python"
      ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
      : "bg-chart-4/10 text-chart-4 border-chart-4/20";

  return (
    <>
      <TableRow>
        <TableCell className="font-medium text-foreground">
          {view.assignmentTitle}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {view.lessonTitle}
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="text-xs">
            {view.trackName}
          </Badge>
        </TableCell>
        <TableCell className="text-center">
          <Badge className={`text-[10px] ${langColor} hover:${langColor}`}>
            {view.language}
          </Badge>
        </TableCell>
        <TableCell className="text-center text-foreground tabular-nums">
          {submittedCount}
        </TableCell>
        <TableCell className="text-center text-foreground tabular-nums">
          {passedCount}
        </TableCell>
        <TableCell className="text-right">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1 text-xs"
            onClick={() => setDetailOpen(true)}
          >
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
        </TableCell>
      </TableRow>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {view.assignmentTitle}
            </DialogTitle>
            <DialogDescription>
              {view.trackName} &mdash; {view.lessonTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            {view.submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                No students enrolled in this track
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-foreground">Student</TableHead>
                    <TableHead className="text-foreground text-center">
                      Submitted
                    </TableHead>
                    <TableHead className="text-foreground text-center">
                      Status
                    </TableHead>
                    <TableHead className="text-foreground text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {view.submissions.map((sub) => (
                    <TableRow key={sub.studentId}>
                      <TableCell className="font-medium text-foreground">
                        {sub.studentName}
                      </TableCell>
                      <TableCell className="text-center">
                        {sub.submitted ? (
                          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 text-[10px]">
                            Yes
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-muted-foreground"
                          >
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {sub.passed ? (
                          <Badge className="gap-1 bg-success/10 text-success border-success/20 hover:bg-success/10 text-[10px]">
                            <CheckCircle2 className="h-3 w-3" />
                            Passed
                          </Badge>
                        ) : sub.submitted ? (
                          <Badge className="gap-1 bg-warning/10 text-warning border-warning/20 hover:bg-warning/10 text-[10px]">
                            <Clock className="h-3 w-3" />
                            Pending Review
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            --
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {sub.submitted && !sub.passed && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="sm"
                              variant="default"
                              className="h-7 text-xs gap-1"
                              onClick={() =>
                                onReview(sub.studentId, sub.lessonId, true)
                              }
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs gap-1 text-destructive border-destructive/20 hover:bg-destructive/10"
                              onClick={() =>
                                onReview(sub.studentId, sub.lessonId, false)
                              }
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
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
