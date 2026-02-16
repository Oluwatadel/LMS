"use client";

import { use, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useLmsStore } from "@/lib/store";
import { VideoPlayer } from "@/components/video/video-player";
import { LessonSidebar } from "@/components/lesson/lesson-sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Code2,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: lessonId } = use(params);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const {
    lessons,
    courses,
    selectedTrackId,
    getProgressForLesson,
    updateProgress,
    getAssignmentForLesson,
    getCoursesForTrack,
    getLessonsForCourse,
  } = useLmsStore();

  const lesson = lessons.find((l) => l.id === lessonId);
  const course = lesson ? courses.find((c) => c.id === lesson.courseId) : null;

  // Get all lessons in the current track for navigation
  const allTrackLessons = useMemo(() => {
    if (!selectedTrackId) return [];
    const trackCourses = getCoursesForTrack(selectedTrackId);
    const all: typeof lessons = [];
    trackCourses.forEach((c) => {
      all.push(...getLessonsForCourse(c.id));
    });
    return all;
  }, [selectedTrackId, getCoursesForTrack, getLessonsForCourse]);

  const currentIndex = allTrackLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allTrackLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allTrackLessons.length - 1
      ? allTrackLessons[currentIndex + 1]
      : null;

  const progress = user
    ? getProgressForLesson(user.id, lessonId)
    : undefined;
  const isCompleted = progress?.isCompleted ?? false;
  const assignment = lesson?.hasAssignment
    ? getAssignmentForLesson(lessonId)
    : null;

  const handleProgress = useCallback(
    (percentage: number) => {
      if (!user) return;
      updateProgress(user.id, lessonId, {
        watchPercentage: Math.max(
          percentage,
          progress?.watchPercentage ?? 0
        ),
      });
    },
    [user, lessonId, updateProgress, progress?.watchPercentage]
  );

  const handleVideoComplete = useCallback(() => {
    if (!user || !lesson) return;
    // Mark lesson as complete if it has no assignment
    if (!lesson.hasAssignment) {
      updateProgress(user.id, lessonId, {
        isCompleted: true,
        watchPercentage: 100,
      });
      toast.success("Lesson completed!");
    } else {
      updateProgress(user.id, lessonId, {
        watchPercentage: 100,
      });
      toast.info("Video complete! Now finish the assignment to complete this lesson.");
    }
  }, [user, lesson, lessonId, updateProgress]);

  if (!lesson || !course) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Lesson not found.</p>
        <Button onClick={() => router.push("/dashboard/track")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Track
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar - lessons list */}
      <div className="hidden w-72 shrink-0 xl:block">
        <LessonSidebar
          currentLessonId={lessonId}
          trackId={selectedTrackId ?? ""}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 space-y-6">
        {/* Breadcrumb */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/track")}
          className="-ml-2 text-muted-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {course.title}
        </Button>

        {/* Video player */}
        <VideoPlayer
          url={lesson.videoUrl}
          onProgress={handleProgress}
          onComplete={handleVideoComplete}
        />

        {/* Lesson info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-bold text-foreground">
                {lesson.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {lesson.duration} min
                </span>
                {isCompleted && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {lesson.description && (
            <>
              <Separator />
              <p className="leading-relaxed text-muted-foreground">
                {lesson.description}
              </p>
            </>
          )}

          {/* Assignment button */}
          {assignment && (
            <>
              <Separator />
              <div className="flex items-center justify-between rounded-xl border border-border bg-accent/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Code2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {assignment.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {progress?.assignmentPassed
                        ? "Assignment passed"
                        : "Complete this assignment to finish the lesson"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    router.push(`/dashboard/assignment/${assignment.id}`)
                  }
                  variant={progress?.assignmentPassed ? "outline" : "default"}
                >
                  {progress?.assignmentPassed
                    ? "Review"
                    : "Start Assignment"}
                </Button>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              disabled={!prevLesson}
              onClick={() =>
                prevLesson &&
                router.push(`/dashboard/lesson/${prevLesson.id}`)
              }
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={!nextLesson}
              onClick={() =>
                nextLesson &&
                router.push(`/dashboard/lesson/${nextLesson.id}`)
              }
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
