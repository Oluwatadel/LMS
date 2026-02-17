// Judge0 CE language IDs
// Full list at: https://ce.judge0.com/#statuses-and-languages-languages
export const LANGUAGE_IDS: Record<string, number> = {
  javascript: 63, // JavaScript (Node.js 12.14.0)
  python: 71,     // Python (3.8.1)
  csharp: 51,     // C# (Mono 6.6.0.161)
};

export interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
}

export interface Judge0Response {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

export interface ExecutionResult {
  output: string;
  error: string;
  compileOutput: string;
  statusDescription: string;
  time: string | null;
  memory: number | null;
  passed?: boolean;
}

// Judge0 status IDs
export const JUDGE0_STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT_EXCEEDED: 5,
  COMPILATION_ERROR: 6,
  RUNTIME_ERROR_SIGSEGV: 7,
  RUNTIME_ERROR_SIGXFSZ: 8,
  RUNTIME_ERROR_SIGFPE: 9,
  RUNTIME_ERROR_SIGABRT: 10,
  RUNTIME_ERROR_NZEC: 11,
  RUNTIME_ERROR_OTHER: 12,
  INTERNAL_ERROR: 13,
  EXEC_FORMAT_ERROR: 14,
};

export function encodeBase64(str: string): string {
  return typeof window !== "undefined"
    ? btoa(unescape(encodeURIComponent(str)))
    : Buffer.from(str, "utf-8").toString("base64");
}

export function decodeBase64(str: string): string {
  if (!str) return "";
  try {
    return typeof window !== "undefined"
      ? decodeURIComponent(escape(atob(str)))
      : Buffer.from(str, "base64").toString("utf-8");
  } catch {
    return str;
  }
}
