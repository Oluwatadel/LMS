"use client";

import { use, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useLmsStore } from "@/lib/store";
import { CodeEditor } from "@/components/editor/code-editor";
import { OutputConsole } from "@/components/editor/output-console";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  ArrowLeft,
  Play,
  Send,
  Loader2,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function AssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: assignmentId } = use(params);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { assignments, lessons, getProgressForLesson, updateProgress } =
    useLmsStore();

  const assignment = assignments.find((a) => a.id === assignmentId);
  const lesson = assignment
    ? lessons.find((l) => l.id === assignment.lessonId)
    : null;

  const [code, setCode] = useState(assignment?.starterCode ?? "");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [passed, setPassed] = useState<boolean | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = user && assignment
    ? getProgressForLesson(user.id, assignment.lessonId)
    : undefined;

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput("");
    setError("");
    setPassed(null);

    // Simulate backend /api/code/run
    await new Promise((r) => setTimeout(r, 1500));

    // Simple mock execution
    try {
      if (!assignment) throw new Error("No assignment found");

      // Mock: extract console.log outputs from code for demo
      const mockOutput = simulateOutput(code, assignment.language);
      setOutput(mockOutput);
      toast.info("Code executed successfully");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Execution error");
    } finally {
      setIsRunning(false);
    }
  }, [code, assignment]);

  const handleSubmit = useCallback(async () => {
    if (!user || !assignment) return;

    setIsSubmitting(true);
    setOutput("");
    setError("");
    setPassed(null);

    // Simulate backend /api/code/submit
    await new Promise((r) => setTimeout(r, 2000));

    const mockOutput = simulateOutput(code, assignment.language);
    setOutput(mockOutput);

    const isPassed =
      mockOutput.trim() === assignment.expectedOutput.trim();
    setPassed(isPassed);

    if (isPassed) {
      updateProgress(user.id, assignment.lessonId, {
        assignmentSubmitted: true,
        assignmentPassed: true,
        isCompleted: true,
      });
      toast.success("Assignment passed! Lesson marked as complete.");
    } else {
      updateProgress(user.id, assignment.lessonId, {
        assignmentSubmitted: true,
        assignmentPassed: false,
      });
      toast.error("Output doesn't match expected result. Try again!");
    }

    setIsSubmitting(false);
  }, [code, user, assignment, updateProgress]);

  const handleReset = () => {
    setCode(assignment?.starterCode ?? "");
    setOutput("");
    setError("");
    setPassed(null);
  };

  if (!assignment || !lesson) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Assignment not found.</p>
        <Button onClick={() => router.push("/dashboard/track")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Track
        </Button>
      </div>
    );
  }

  const languageLabel =
    assignment.language === "javascript"
      ? "JavaScript"
      : assignment.language === "python"
      ? "Python"
      : "C#";

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/dashboard/lesson/${lesson.id}`)
            }
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Lesson
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="text-lg font-semibold text-foreground">
            {assignment.title}
          </h1>
          <Badge variant="outline" className="text-xs">
            {languageLabel}
          </Badge>
          {progress?.assignmentPassed && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary text-xs"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Passed
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="mr-1 h-3.5 w-3.5" />
            )}
            Run Code
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="mr-1 h-3.5 w-3.5" />
            )}
            Submit
          </Button>
        </div>
      </div>

      {/* Main content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-xl border border-border overflow-hidden">
        {/* Instructions panel */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="flex h-full flex-col bg-card">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">
                Instructions
              </h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {assignment.instructions}
                </pre>
              </div>
              {assignment.expectedOutput && (
                <div className="mt-4 rounded-lg bg-accent/50 p-3">
                  <p className="text-xs font-semibold text-foreground mb-1.5">
                    Expected Output
                  </p>
                  <pre className="font-mono text-xs text-muted-foreground">
                    {assignment.expectedOutput}
                  </pre>
                </div>
              )}
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Editor + Output */}
        <ResizablePanel defaultSize={70} minSize={40}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={65} minSize={30}>
              <CodeEditor
                language={assignment.language}
                value={code}
                onChange={setCode}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={35} minSize={15}>
              <OutputConsole
                output={output}
                error={error}
                passed={passed}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

// Mock code execution simulator for demo purposes
// In production, this would be sent to the backend
function simulateOutput(code: string, language: string): string {
  try {
    if (language === "javascript") {
      const logs: string[] = [];
      const mockConsole = {
        log: (...args: unknown[]) => logs.push(args.map(String).join(" ")),
      };

      // Very basic mock execution
      const wrappedCode = code
        .replace(/console\.log/g, "mockConsole.log");
      
      const fn = new Function("mockConsole", wrappedCode);
      fn(mockConsole);
      return logs.join("\n");
    }

    // For Python/C#, return a placeholder since these need backend execution
    return `[Mock] Code sent to backend for ${language} execution.\nIn production, this would use a secure sandbox.`;
  } catch (e) {
    return `Error: ${e instanceof Error ? e.message : "Unknown error"}`;
  }
}
