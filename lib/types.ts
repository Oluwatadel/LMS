// ============================================================
// Domain Models
// ============================================================

export type Role = "student" | "admin" | "mentor" | "superadmin";

export type AuthProvider = "credentials" | "google" | "github";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatarUrl?: string;
  enrolledTrackId?: string;
  isPreviousStudent?: boolean;
  createdAt?: string;
  authProvider?: AuthProvider;
}

export interface Track {
  id: string;
  name: string;
  description: string;
  isCodingTrack: boolean;
  courseCount: number;
  lessonCount: number;
  imageUrl?: string;
}

export interface Course {
  id: string;
  trackId: string;
  title: string;
  order: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  videoUrl: string;
  duration: number; // minutes
  hasAssignment: boolean;
  order: number;
  description?: string;
}

export interface Assignment {
  id: string;
  lessonId: string;
  title: string;
  instructions: string;
  language: "javascript" | "python" | "csharp";
  starterCode: string;
  expectedOutput: string;
}

export interface StudentProgress {
  studentId: string;
  lessonId: string;
  isCompleted: boolean;
  watchPercentage: number;
  assignmentSubmitted: boolean;
  assignmentPassed: boolean;
}

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  trackId: string;
  trackName: string;
  issuedAt: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface CodeRunResult {
  output: string;
  error?: string;
  executionTime: number;
}

export interface CodeSubmitResult {
  passed: boolean;
  output: string;
  expectedOutput: string;
  error?: string;
}

export interface MentorStudent {
  student: User;
  trackId: string;
  trackName: string;
  progressPercentage: number;
  lessonsCompleted: number;
  totalLessons: number;
}
