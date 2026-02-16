"use client";

import { mockMentorStudents } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, CheckCircle2 } from "lucide-react";

export default function MentorDashboard() {
  const students = mockMentorStudents;

  const avgProgress = students.length
    ? Math.round(
        students.reduce((acc, s) => acc + s.progressPercentage, 0) /
          students.length
      )
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Mentor Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Track and support your assigned students
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assigned Students
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {students.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Progress
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {avgProgress}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {students.filter((s) => s.progressPercentage === 100).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Your Students</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((ms) => {
              const initials = ms.student.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase();

              return (
                <div
                  key={ms.student.id}
                  className="flex items-center gap-4 rounded-lg border border-border p-4"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-sm text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {ms.student.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {ms.student.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {ms.trackName}
                        </Badge>
                        <span className="text-sm font-bold text-foreground tabular-nums">
                          {ms.progressPercentage}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={ms.progressPercentage}
                        className="h-2 flex-1"
                      />
                      <span className="text-xs text-muted-foreground">
                        {ms.lessonsCompleted}/{ms.totalLessons} lessons
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
