"use client";

import dynamic from "next/dynamic";
import type { Assignment } from "@/lib/types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e]">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  ),
});

interface CodeEditorProps {
  language: Assignment["language"];
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const languageMap: Record<Assignment["language"], string> = {
  javascript: "javascript",
  python: "python",
  csharp: "csharp",
};

export function CodeEditor({
  language,
  value,
  onChange,
  readOnly = false,
}: CodeEditorProps) {
  return (
    <div className="h-full overflow-hidden rounded-lg border border-border">
      <MonacoEditor
        height="100%"
        language={languageMap[language]}
        value={value}
        onChange={(val) => onChange(val ?? "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--font-jetbrains-mono), monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          tabSize: 2,
          automaticLayout: true,
          readOnly,
          padding: { top: 16 },
        }}
      />
    </div>
  );
}
