"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Terminal, CheckCircle2, XCircle, Clock, Cpu, Loader2, AlertTriangle } from "lucide-react";

interface OutputConsoleProps {
  output: string;
  error?: string;
  compileOutput?: string;
  passed?: boolean | null;
  time?: string | null;
  memory?: number | null;
  isLoading?: boolean;
}

export function OutputConsole({
  output,
  error,
  compileOutput,
  passed,
  time,
  memory,
  isLoading,
}: OutputConsoleProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-[#1e1e1e]">
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2">
        <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Output
        </span>

        {/* Execution metadata */}
        {time && (
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {time}s
          </span>
        )}
        {memory && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Cpu className="h-3 w-3" />
            {(memory / 1024).toFixed(1)} MB
          </span>
        )}

        {passed !== null && passed !== undefined && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              !time && !memory ? "ml-auto" : "",
              passed ? "text-primary" : "text-destructive"
            )}
          >
            {passed ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Passed
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Failed
              </>
            )}
          </span>
        )}
      </div>
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Executing code...
          </div>
        ) : compileOutput ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              Compilation Output
            </div>
            <pre className="font-mono text-sm text-amber-300/80 whitespace-pre-wrap">
              {compileOutput}
            </pre>
          </div>
        ) : error ? (
          <pre className="font-mono text-sm text-destructive whitespace-pre-wrap">
            {error}
          </pre>
        ) : output ? (
          <pre className="font-mono text-sm text-[#d4d4d4] whitespace-pre-wrap">
            {output}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground/50 italic">
            Run your code to see output here...
          </p>
        )}
      </ScrollArea>
    </div>
  );
}
