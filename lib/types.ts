// ============================================================
// Domain Models
// ============================================================

export type Role = "student" | "admin" | "mentor" | "superadmin";

export type AuthProvider = "credentials" | "google" | "github";

// ============================================================
// Permission System
// ============================================================

export type PermissionGroupName =
  | "content_manager"
  | "student_manager"
  | "certificate_manager"
  | "assignment_manager"
  | "full_access";

export type Permission =
  | "manage_tracks"
  | "manage_courses"
  | "manage_lessons"
  | "manage_students"
  | "enroll_students"
  | "remove_students"
  | "manage_certificates"
  | "upload_templates"
  | "manage_assignments"
  | "review_assignments"
  | "manage_payments"
  | "confirm_payments"
  | "manage_users"
  | "assign_roles"
  | "view_analytics";

export interface PermissionGroup {
  id: string;
  name: PermissionGroupName;
  label: string;
  description: string;
  permissions: Permission[];
}

// ============================================================
// Payment System
// ============================================================

export type PaymentStatus = "pending" | "confirmed" | "failed" | "refunded";
export type PaymentMethod = "bank_transfer" | "card" | "manual";

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  trackId: string;
  trackName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  referenceCode: string;
  confirmedBy?: string;
  confirmedByName?: string;
  createdAt: string;
  confirmedAt?: string;
}

// ============================================================
// Certificate Template System
// ============================================================

export interface CertificateTextField {
  key: "studentName" | "trackName" | "issueDate" | "certificateId";
  label: string;
  x: number;
  y: number;
  fontSize: number;
  fontColor: string;
  fontWeight: "normal" | "bold";
}

export interface CertificateTemplate {
  id: string;
  name: string;
  backgroundImageUrl: string;
  textFields: CertificateTextField[];
  isDefault: boolean;
  createdAt: string;
}

// ============================================================
// Core Models
// ============================================================

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
  permissionGroupId?: string;
}

export interface Track {
  id: string;
  name: string;
  description: string;
  isCodingTrack: boolean;
  courseCount: number;
  lessonCount: number;
  imageUrl?: string;
  price?: number;
  currency?: string;
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
  templateId?: string;
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
