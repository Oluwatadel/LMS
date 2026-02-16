"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Progress } from "@/components/ui/progress";
import type ReactPlayerType from "react-player";

const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });

interface VideoPlayerProps {
  url: string;
  onProgress: (percentage: number) => void;
  onComplete: () => void;
}

export function VideoPlayer({ url, onProgress, onComplete }: VideoPlayerProps) {
  const playerRef = useRef<ReactPlayerType | null>(null);
  const [played, setPlayed] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const hasCompleted = useRef(false);

  const handleProgress = useCallback(
    (state: { played: number }) => {
      const percentage = Math.round(state.played * 100);
      setPlayed(percentage);
      onProgress(percentage);

      if (percentage >= 90 && !hasCompleted.current) {
        hasCompleted.current = true;
        onComplete();
      }
    },
    [onProgress, onComplete]
  );

  return (
    <div className="space-y-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-foreground/5">
        <ReactPlayer
          ref={playerRef}
          url={url}
          width="100%"
          height="100%"
          controls
          onReady={() => setIsReady(true)}
          onProgress={handleProgress}
          progressInterval={2000}
          config={{
            youtube: {
              playerVars: { modestbranding: 1 },
            },
          }}
        />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Progress value={played} className="h-1.5 flex-1" />
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {played}%
        </span>
      </div>
    </div>
  );
}
