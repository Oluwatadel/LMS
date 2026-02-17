import { NextResponse } from "next/server";
import { encodeBase64, decodeBase64, LANGUAGE_IDS } from "@/lib/judge0";

const JUDGE0_API_URL =
  process.env.JUDGE0_API_URL || "http://localhost:2358";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { source_code, language, stdin } = body as {
      source_code: string;
      language: string;
      stdin?: string;
    };

    if (!source_code || !language) {
      return NextResponse.json(
        { error: "source_code and language are required" },
        { status: 400 }
      );
    }

    const language_id = LANGUAGE_IDS[language];
    if (!language_id) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      );
    }

    const submission = {
      source_code: encodeBase64(source_code),
      language_id,
      stdin: stdin ? encodeBase64(stdin) : undefined,
    };

    // Submit to Judge0 with wait=true (synchronous, up to ~15s)
    const judge0Res = await fetch(
      `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      }
    );

    if (!judge0Res.ok) {
      const errText = await judge0Res.text();
      return NextResponse.json(
        { error: `Judge0 error: ${judge0Res.status} - ${errText}` },
        { status: 502 }
      );
    }

    const result = await judge0Res.json();

    // Decode base64 responses
    return NextResponse.json({
      stdout: result.stdout ? decodeBase64(result.stdout) : null,
      stderr: result.stderr ? decodeBase64(result.stderr) : null,
      compile_output: result.compile_output
        ? decodeBase64(result.compile_output)
        : null,
      message: result.message || null,
      status: result.status,
      time: result.time,
      memory: result.memory,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to execute code",
      },
      { status: 500 }
    );
  }
}
