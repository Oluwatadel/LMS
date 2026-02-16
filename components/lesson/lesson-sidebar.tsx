"use client";

import Link from "next/link";
import { useAuthStore, useLmsStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";

interface LessonSidebarProps {
  currentLessonId: string;
  trackId: string;
}

export function LessonSidebar({
  currentLessonId,
  trackId,
}: LessonSidebarProps) {
  const user = useAuthStore((s) => s.user);
  const { getCoursesForTrack, getLessonsForCourse, getProgressForLesson } =
    useLmsStore();

  if (!trackId || !user) return null;

  const courses = getCoursesForTrack(trackId);

  return (
    <ScrollArea className="h-[calc(100vh-10rem)]">
      <div className="space-y-4">
        {courses.map((course) => {
          const lessons = getLessonsForCourse(course.id);
          return (
            <div key={course.id}>
              <h4 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {course.title}
              </h4>
              <div className="space-y-0.5">
                {lessons.map((lesson) => {
                  const progress = getProgressForLesson(user.id, lesson.id);
                  const isActive = lesson.id === currentLessonId;
                  const isCompleted = progress?.isCompleted ?? false;

                  return (
                    <Link
                      key={lesson.id}
                      href={`/dashboard/lesson/${lesson.id}`}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      ) : isActive ? (
                        <PlayCircle className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                      )}
                      <span className="truncate">{lesson.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
