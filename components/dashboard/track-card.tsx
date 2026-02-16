"use client";

import { useRouter } from "next/navigation";
import { useLmsStore } from "@/lib/store";
import type { Track } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Code2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface TrackCardProps {
  track: Track;
}

export function TrackCard({ track }: TrackCardProps) {
  const selectTrack = useLmsStore((s) => s.selectTrack);
  const router = useRouter();

  const handleSelect = () => {
    selectTrack(track.id);
    toast.success(`Selected "${track.name}" track`);
    router.push("/dashboard/track");
  };

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent">
            <Code2 className="h-5 w-5 text-accent-foreground" />
          </div>
          {track.isCodingTrack && (
            <Badge variant="secondary" className="text-xs">
              Coding
            </Badge>
          )}
        </div>
        <h3 className="mt-3 text-lg font-semibold text-foreground">
          {track.name}
        </h3>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {track.description}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            {track.courseCount} courses
          </span>
          <span className="flex items-center gap-1.5">
            <Code2 className="h-3.5 w-3.5" />
            {track.lessonCount} lessons
          </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSelect} className="w-full gap-2">
          Start Track
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
