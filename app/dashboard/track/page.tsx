"use client";

import { useRouter } from "next/navigation";
import { useAuthStore, useLmsStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  Code2,
  Lock,
  ArrowLeft,
} from "lucide-react";

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
  } = useLmsStore();

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
                    const lessonProgress = getProgressForLesson(
                      user.id,
                      lesson.id
                    );
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
                      <button
                        key={lesson.id}
                        onClick={() => {
                          if (!isLocked) {
                            router.push(
                              `/dashboard/lesson/${lesson.id}`
                            );
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
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
