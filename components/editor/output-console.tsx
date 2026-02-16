"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Terminal, CheckCircle2, XCircle } from "lucide-react";

interface OutputConsoleProps {
  output: string;
  error?: string;
  passed?: boolean | null;
}

export function OutputConsole({ output, error, passed }: OutputConsoleProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-[#1e1e1e]">
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2">
        <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Output
        </span>
        {passed !== null && passed !== undefined && (
          <span
            className={cn(
              "ml-auto flex items-center gap-1 text-xs font-medium",
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
        {error ? (
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
