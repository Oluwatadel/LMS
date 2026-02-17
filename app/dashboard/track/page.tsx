"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useLmsStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  CheckCircle2,
  Circle,
  PlayCircle,
  Code2,
  Lock,
  ArrowLeft,
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
} from "lucide-react";
import type { Assignment } from "@/lib/types";

export default function TrackPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const {
    selectedTrackId,
    tracks,
    getCoursesForTrack,
    getLessonsForCourse,
    getProgressForLesson,
    getTrackProgress,
    getAssignmentForLesson,
    assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
  } = useLmsStore();

  const [showAssignmentForm, setShowAssignmentForm] = useState<string | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  if (!user || !selectedTrackId) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          No track selected. Please choose a track first.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const track = tracks.find((t) => t.id === selectedTrackId);
  const courses = getCoursesForTrack(selectedTrackId);
  const progress = getTrackProgress(user.id, selectedTrackId);

  if (!track) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="mb-2 -ml-2 text-muted-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{track.name}</h1>
          <p className="mt-1 text-muted-foreground">{track.description}</p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">
            Overall Progress
          </span>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Course accordion */}
      <Accordion
        type="multiple"
        defaultValue={courses.map((c) => c.id)}
        className="space-y-3"
      >
        {courses.map((course, courseIdx) => {
          const lessons = getLessonsForCourse(course.id);
          const completedLessons = lessons.filter((l) => {
            const p = getProgressForLesson(user.id, l.id);
            return p?.isCompleted;
          }).length;

          return (
            <AccordionItem
              key={course.id}
              value={course.id}
              className="rounded-xl border border-border bg-card px-0 overflow-hidden"
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-4 text-left">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
                    {courseIdx + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {course.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {completedLessons}/{lessons.length} lessons completed
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <div className="divide-y divide-border">
                  {lessons.map((lesson, lessonIdx) => {
                    const lessonProgress = getProgressForLesson(user.id, lesson.id);
                    const isCompleted = lessonProgress?.isCompleted ?? false;
                    const hasAssignment = lesson.hasAssignment;
                    const assignment = hasAssignment
                      ? getAssignmentForLesson(lesson.id)
                      : null;

                    // Check if previous lesson is completed (for unlock logic)
                    const prevLesson = lessonIdx > 0 ? lessons[lessonIdx - 1] : null;
                    const prevLessonProgress = prevLesson
                      ? getProgressForLesson(user.id, prevLesson.id)
                      : null;
                    const isLocked =
                      lessonIdx > 0 &&
                      !prevLessonProgress?.isCompleted &&
                      courseIdx === 0
                        ? lessonIdx > 1
                        : false;

                    return (
                      <div key={lesson.id}>
                        {/* Lesson Row */}
                        <button
                          onClick={() => {
                            if (!isLocked) {
                              router.push(`/dashboard/lesson/${lesson.id}`);
                            }
                          }}
                          disabled={isLocked}
                          className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <div className="shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            ) : isLocked ? (
                              <Lock className="h-5 w-5 text-muted-foreground/40" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground/40" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {lesson.title}
                            </p>
                            <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <PlayCircle className="h-3 w-3" />
                                {lesson.duration} min
                              </span>
                              {hasAssignment && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  <Code2 className="mr-1 h-2.5 w-2.5" />
                                  Assignment
                                </Badge>
                              )}
                            </div>
                          </div>
                          {lessonProgress &&
                            !isCompleted &&
                            lessonProgress.watchPercentage > 0 && (
                              <div className="w-16">
                                <Progress
                                  value={lessonProgress.watchPercentage}
                                  className="h-1"
                                />
                              </div>
                            )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        </button>

                        {/* Inline Assignment Management (Admin only) */}
                        {isAdmin && hasAssignment && (
                          <div className="bg-muted/30 px-5 py-3 border-t border-border/50">
                            {assignment ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <ClipboardList className="h-4 w-4 text-primary" />
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      {assignment.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {assignment.language} - {assignment.instructions.substring(0, 60)}...
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 gap-1 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingAssignment(assignment);
                                    }}
                                  >
                                    <Pencil className="h-3 w-3" />
                                    Edit
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        Delete
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete &quot;{assignment.title}&quot;?
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          onClick={() => {
                                            deleteAssignment(assignment.id);
                                            toast.success(`Assignment "${assignment.title}" deleted`);
                                          }}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                  No assignment created for this lesson yet
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 gap-1 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAssignmentForm(lesson.id);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                  Add Assignment
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Add Assignment Dialog */}
      {showAssignmentForm && (
        <AddAssignmentDialog
          lessonId={showAssignmentForm}
          onSave={(data) => {
            addAssignment({
              id: `assignment-${Date.now()}`,
              lessonId: showAssignmentForm,
              ...data,
            });
            toast.success("Assignment created");
            setShowAssignmentForm(null);
          }}
          onClose={() => setShowAssignmentForm(null)}
        />
      )}

      {/* Edit Assignment Dialog */}
      {editingAssignment && (
        <EditAssignmentInlineDialog
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
// Add Assignment Dialog (inline from track view)
// ============================================================

function AddAssignmentDialog({
  lessonId,
  onSave,
  onClose,
}: {
  lessonId: string;
  onSave: (data: Omit<Assignment, "id" | "lessonId">) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [language, setLanguage] = useState<"javascript" | "python" | "csharp">("javascript");
  const [starterCode, setStarterCode] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");

  const isValid = title.length >= 2 && instructions.length >= 10 && starterCode && expectedOutput;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Assignment</DialogTitle>
          <DialogDescription>Create a new coding assignment for this lesson</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build a Counter"
            />
          </div>
          <div className="space-y-2">
            <Label>Instructions</Label>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe what the student needs to do..."
              rows={4}
            />
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
              placeholder="// Write the starter code here..."
              rows={6}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Expected Output</Label>
            <Textarea
              value={expectedOutput}
              onChange={(e) => setExpectedOutput(e.target.value)}
              placeholder="The expected console output..."
              rows={2}
              className="font-mono text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            disabled={!isValid}
            onClick={() => onSave({ title, instructions, language, starterCode, expectedOutput })}
          >
            Create Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Edit Assignment Dialog (inline from track view)
// ============================================================

function EditAssignmentInlineDialog({
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
