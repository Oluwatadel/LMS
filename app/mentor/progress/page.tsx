"use client";

import { mockMentorStudents } from "@/lib/mock-data";
import { useLmsStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Code2 } from "lucide-react";

export default function MentorProgressPage() {
  const {
    getCoursesForTrack,
    getLessonsForCourse,
    getProgressForLesson,
    getAssignmentForLesson,
  } = useLmsStore();

  const students = mockMentorStudents;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Detailed Progress
        </h1>
        <p className="text-muted-foreground mt-1">
          Lesson-by-lesson progress for each student
        </p>
      </div>

      {students.map((ms) => {
        const courses = getCoursesForTrack(ms.trackId);

        return (
          <Card key={ms.student.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">
                  {ms.student.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {ms.trackName}
                  </Badge>
                  <span className="text-sm font-bold text-primary">
                    {ms.progressPercentage}%
                  </span>
                </div>
              </div>
              <Progress value={ms.progressPercentage} className="h-2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map((course) => {
                  const lessons = getLessonsForCourse(course.id);

                  return (
                    <div key={course.id}>
                      <h4 className="mb-2 text-sm font-semibold text-foreground">
                        {course.title}
                      </h4>
                      <div className="space-y-1">
                        {lessons.map((lesson) => {
                          const progress = getProgressForLesson(
                            ms.student.id,
                            lesson.id
                          );
                          const isCompleted = progress?.isCompleted ?? false;
                          const assignment = lesson.hasAssignment
                            ? getAssignmentForLesson(lesson.id)
                            : null;

                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm"
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                              ) : (
                                <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                              )}
                              <span
                                className={
                                  isCompleted
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }
                              >
                                {lesson.title}
                              </span>
                              {assignment && (
                                <Badge
                                  variant={
                                    progress?.assignmentPassed
                                      ? "default"
                                      : "outline"
                                  }
                                  className="ml-auto text-[10px] px-1.5 py-0"
                                >
                                  <Code2 className="mr-1 h-2.5 w-2.5" />
                                  {progress?.assignmentPassed
                                    ? "Passed"
                                    : progress?.assignmentSubmitted
                                    ? "Failed"
                                    : "Pending"}
                                </Badge>
                              )}
                              {progress &&
                                !isCompleted &&
                                progress.watchPercentage > 0 && (
                                  <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                                    {progress.watchPercentage}%
                                  </span>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
