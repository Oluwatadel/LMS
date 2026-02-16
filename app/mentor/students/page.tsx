"use client";

import { mockMentorStudents } from "@/lib/mock-data";
import { useLmsStore } from "@/lib/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function MentorStudentsPage() {
  const { studentProgress } = useLmsStore();
  const students = mockMentorStudents;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Assigned Students
        </h1>
        <p className="text-muted-foreground mt-1">
          Review student progress and submissions
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Student</TableHead>
              <TableHead className="text-foreground">Track</TableHead>
              <TableHead className="text-foreground">Progress</TableHead>
              <TableHead className="text-foreground text-center">
                Lessons
              </TableHead>
              <TableHead className="text-foreground text-center">
                Assignments
              </TableHead>
              <TableHead className="text-foreground text-center">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((ms) => {
              const initials = ms.student.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();

              const sp = studentProgress.filter(
                (p) => p.studentId === ms.student.id
              );
              const assignmentsSubmitted = sp.filter(
                (p) => p.assignmentSubmitted
              ).length;
              const assignmentsPassed = sp.filter(
                (p) => p.assignmentPassed
              ).length;

              return (
                <TableRow key={ms.student.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">
                          {ms.student.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ms.student.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {ms.trackName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={ms.progressPercentage}
                        className="h-2 w-20"
                      />
                      <span className="text-sm font-medium text-foreground tabular-nums">
                        {ms.progressPercentage}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-foreground">
                    {ms.lessonsCompleted}/{ms.totalLessons}
                  </TableCell>
                  <TableCell className="text-center text-foreground">
                    {assignmentsPassed}/{assignmentsSubmitted}
                  </TableCell>
                  <TableCell className="text-center">
                    {ms.progressPercentage === 100 ? (
                      <Badge className="bg-primary/10 text-primary text-xs">
                        Completed
                      </Badge>
                    ) : ms.progressPercentage > 0 ? (
                      <Badge variant="secondary" className="text-xs">
                        In Progress
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Not Started
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
