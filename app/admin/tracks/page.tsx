"use client";

import { useLmsStore } from "@/lib/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Code2 } from "lucide-react";

export default function AdminTracksPage() {
  const { tracks, courses, lessons } = useLmsStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Tracks</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all learning tracks
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Track Name</TableHead>
              <TableHead className="text-foreground">Type</TableHead>
              <TableHead className="text-foreground text-center">Courses</TableHead>
              <TableHead className="text-foreground text-center">Lessons</TableHead>
              <TableHead className="text-foreground">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tracks.map((track) => {
              const trackCourses = courses.filter(
                (c) => c.trackId === track.id
              );
              const trackLessons = lessons.filter((l) =>
                trackCourses.some((c) => c.id === l.courseId)
              );

              return (
                <TableRow key={track.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                        <BookOpen className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <span className="font-medium text-foreground">
                        {track.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {track.isCodingTrack ? (
                      <Badge variant="secondary" className="text-xs">
                        <Code2 className="mr-1 h-3 w-3" />
                        Coding
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Theory
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-foreground">
                    {trackCourses.length}
                  </TableCell>
                  <TableCell className="text-center text-foreground">
                    {trackLessons.length}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm text-muted-foreground">
                      {track.description}
                    </p>
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
