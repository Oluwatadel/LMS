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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Pencil,
  Trash2,
} from "lucide-react";
import type { Assignment, StudentProgress, User } from "@/lib/types";

export default function AdminAssignmentsPage() {
  const currentUser = useAuthStore((s) => s.user);
  const {
    tracks,
    courses,
    lessons,
    assignments,
    studentProgress,
    updateProgress,
    updateAssignment,
    deleteAssignment,
  } = useLmsStore();
  const { users } = useUserStore();
  const { hasPermission } = usePermissionStore();

  const [search, setSearch] = useState("");
  const [filterTrack, setFilterTrack] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const isSuperAdmin = currentUser?.role === "superadmin";
  const canReview =
    isSuperAdmin ||
    (currentUser
      ? hasPermission(currentUser.id, "review_assignments")
      : false);

  // Build a view model: assignment + student submissions
  const assignmentViews = assignments.map((assignment) => {
    const lesson = lessons.find((l) => l.id === assignment.lessonId);
    const course = lesson ? courses.find((c) => c.id === lesson.courseId) : undefined;
    const track = course ? tracks.find((t) => t.id === course.trackId) : undefined;

    const submissions = studentProgress.filter(
      (sp) => sp.lessonId === assignment.lessonId && sp.assignmentSubmitted
    );

    const pendingSubmissions = submissions.filter(
      (sp) => !sp.assignmentPassed && !sp.isCompleted
    );

    return {
      assignment,
      lesson,
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
          Review submissions, edit assignments, and manage student progress
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
              <p className="text-sm text-muted-foreground">Total Assignments</p>
              <p className="text-xl font-bold text-foreground tabular-nums">{totalAssignments}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
              <FileText className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
              <p className="text-xl font-bold text-foreground tabular-nums">{totalSubmissions}</p>
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
              <p className="text-xl font-bold text-foreground tabular-nums">{totalPending}</p>
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
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
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
              <TableHead className="text-foreground">Lesson / Track</TableHead>
              <TableHead className="text-foreground text-center">Language</TableHead>
              <TableHead className="text-foreground text-center">Submissions</TableHead>
              <TableHead className="text-foreground text-center">Pending</TableHead>
              <TableHead className="text-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredViews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
                  onEdit={() => setEditingAssignment(view.assignment)}
                  onDelete={() => {
                    deleteAssignment(view.assignment.id);
                    toast.success(`Assignment "${view.assignment.title}" deleted`);
                  }}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Assignment Dialog */}
      {editingAssignment && (
        <EditAssignmentDialog
          assignment={editingAssignment}
          onSave={(data) => {
            updateAssignment(editingAssignment.id, data);
            toast.success(`Assignment "${editingAssignment.title}" updated`);
            setEditingAssignment(null);
          }}
          onClose={() => setEditingAssignment(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// Edit Assignment Dialog
// ============================================================

function EditAssignmentDialog({
  assignment,
  onSave,
  onClose,
}: {
  assignment: Assignment;
  onSave: (data: Partial<Assignment>) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(assignment.title);
  const [instructions, setInstructions] = useState(assignment.instructions);
  const [language, setLanguage] = useState(assignment.language);
  const [starterCode, setStarterCode] = useState(assignment.starterCode);
  const [expectedOutput, setExpectedOutput] = useState(assignment.expectedOutput);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Assignment</DialogTitle>
          <DialogDescription>Update assignment details, starter code, and expected output</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Instructions</Label>
            <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={(val) => setLanguage(val as "javascript" | "python" | "csharp")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="csharp">C#</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Starter Code</Label>
            <Textarea
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Expected Output</Label>
            <Textarea
              value={expectedOutput}
              onChange={(e) => setExpectedOutput(e.target.value)}
              rows={2}
              className="font-mono text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={() => onSave({ title, instructions, language, starterCode, expectedOutput })}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Assignment Row
// ============================================================

interface AssignmentView {
  assignment: Assignment;
  lesson: { id: string; title: string; courseId: string } | undefined;
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
  onEdit,
  onDelete,
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
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const { assignment, lesson, course, track, submissions, pendingCount, totalSubmissions } = view;

  return (
    <>
      <TableRow>
        <TableCell>
          <div>
            <p className="font-medium text-foreground">{assignment.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
              {assignment.instructions}
            </p>
          </div>
        </TableCell>
        <TableCell>
          <div>
            <span className="text-sm text-foreground">{lesson?.title || "Unknown"}</span>
            {track && (
              <p className="text-xs text-muted-foreground">{track.name}</p>
            )}
          </div>
        </TableCell>
        <TableCell className="text-center">
          <Badge variant="secondary" className="text-xs">{assignment.language}</Badge>
        </TableCell>
        <TableCell className="text-center">
          <span className="font-medium text-foreground tabular-nums">{totalSubmissions}</span>
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
          <div className="flex items-center justify-end gap-1">
            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={() => setDetailOpen(true)}>
              <Eye className="h-3.5 w-3.5" />
              View
            </Button>
            <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete &quot;{assignment.title}&quot;? This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={onDelete}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>

      {/* Submission Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">{assignment.title}</DialogTitle>
            <DialogDescription>
              {course?.title} - {track?.name || "Unknown Track"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/50 p-3">
              <p className="text-sm text-foreground">{assignment.instructions}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs gap-1">
                  <Code2 className="h-3 w-3" />
                  {assignment.language}
                </Badge>
              </div>
            </div>

            {/* Starter Code Preview */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Starter Code</p>
              <pre className="rounded-lg border border-border bg-muted/50 p-3 text-xs font-mono overflow-x-auto">
                {assignment.starterCode}
              </pre>
            </div>

            {/* Submissions List */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">
                Submissions ({submissions.length})
              </h4>
              {submissions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No submissions yet</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {submissions.map((submission) => {
                    const student = users.find((u) => u.id === submission.studentId);
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
                            <p className="text-xs text-muted-foreground">{student?.email || ""}</p>
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
                                        { assignmentPassed: true, isCompleted: true }
                                      );
                                      toast.success(`Submission by ${student?.name} approved`);
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
                                        { assignmentSubmitted: false, assignmentPassed: false }
                                      );
                                      toast.success(`Submission by ${student?.name} returned for revision`);
                                    }}
                                  >
                                    <XCircle className="h-3 w-3" />
                                    Return
                                  </Button>
                                </div>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs">Not Passed</Badge>
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
