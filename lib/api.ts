/**
 * API Service Layer - C# Backend Integration
 *
 * This file provides a centralized API abstraction layer.
 * Currently all functions use local Zustand stores for mock data.
 *
 * To integrate with the C# backend:
 * 1. Set the API_BASE_URL to your C# API endpoint
 * 2. Replace each mock implementation with fetch() calls
 * 3. Each function has a comment showing the expected endpoint
 *
 * Example replacement:
 *   // Before (mock):
 *   getUsers: async () => useUserStore.getState().users
 *
 *   // After (C# backend):
 *   getUsers: async (filters) => {
 *     const res = await fetch(`${API_BASE_URL}/api/users?${new URLSearchParams(filters)}`);
 *     if (!res.ok) throw new Error("Failed to fetch users");
 *     return res.json();
 *   }
 */

// TODO: Replace with your C# backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// ============================================================
// DTO Types for API requests
// ============================================================

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: "student" | "admin" | "mentor";
  permissionGroupId?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: string;
  permissionGroupId?: string;
  enrolledTrackId?: string;
}

export interface UserFilters {
  role?: string;
  trackId?: string;
  search?: string;
}

export interface CreatePaymentDTO {
  studentId: string;
  trackId: string;
  amount: number;
  currency: string;
  paymentMethod: "bank_transfer" | "card" | "manual";
}

export interface PaymentFilters {
  status?: string;
  studentId?: string;
  trackId?: string;
  search?: string;
}

export interface IssueCertificateDTO {
  studentId: string;
  trackId: string;
  templateId?: string;
}

export interface AssignmentFilters {
  trackId?: string;
  status?: "submitted" | "passed" | "failed" | "pending";
}

export interface ReviewSubmissionDTO {
  submissionId: string;
  passed: boolean;
  feedback?: string;
}

// ============================================================
// API Service
// ============================================================

export const api = {
  // ----------------------------------------------------------
  // Auth
  // TODO: POST ${API_BASE_URL}/api/auth/login
  // ----------------------------------------------------------
  login: async (_email: string, _password: string) => {
    // Mock: handled by useAuthStore.login()
    // Replace with: fetch(`${API_BASE_URL}/api/auth/login`, { method: "POST", body: JSON.stringify({ email, password }) })
  },

  // TODO: POST ${API_BASE_URL}/api/auth/register
  register: async (_data: { name: string; email: string; password: string }) => {
    // Mock: handled by useAuthStore.register()
  },

  // ----------------------------------------------------------
  // Users
  // TODO: GET ${API_BASE_URL}/api/users
  // ----------------------------------------------------------
  getUsers: async (_filters?: UserFilters) => {
    // Mock: useUserStore.getState().users
  },

  // TODO: POST ${API_BASE_URL}/api/users
  createUser: async (_data: CreateUserDTO) => {
    // Mock: useUserStore.getState().addUser(user)
  },

  // TODO: PUT ${API_BASE_URL}/api/users/:id
  updateUser: async (_id: string, _data: UpdateUserDTO) => {
    // Mock: useUserStore.getState().updateUser(id, data)
  },

  // TODO: DELETE ${API_BASE_URL}/api/users/:id
  deleteUser: async (_id: string) => {
    // Mock: useUserStore.getState().deleteUser(id)
  },

  // TODO: PUT ${API_BASE_URL}/api/users/:id/permission-group
  assignPermissionGroup: async (_userId: string, _groupId: string) => {
    // Mock: useUserStore.getState().assignPermissionGroup(userId, groupId)
  },

  // ----------------------------------------------------------
  // Enrollment
  // TODO: POST ${API_BASE_URL}/api/enrollment
  // ----------------------------------------------------------
  enrollStudent: async (_studentId: string, _trackId: string) => {
    // Mock: useUserStore.getState().enrollStudentInTrack(studentId, trackId)
  },

  // TODO: DELETE ${API_BASE_URL}/api/enrollment/:studentId
  removeFromTrack: async (_studentId: string) => {
    // Mock: useUserStore.getState().removeStudentFromTrack(studentId)
  },

  // ----------------------------------------------------------
  // Payments
  // TODO: POST ${API_BASE_URL}/api/payments
  // ----------------------------------------------------------
  createPayment: async (_data: CreatePaymentDTO) => {
    // Mock: usePaymentStore.getState().addPayment(payment)
  },

  // TODO: PUT ${API_BASE_URL}/api/payments/:id/confirm
  confirmPayment: async (_paymentId: string) => {
    // Mock: usePaymentStore.getState().confirmPayment(paymentId, adminId, adminName)
  },

  // TODO: GET ${API_BASE_URL}/api/payments
  getPayments: async (_filters?: PaymentFilters) => {
    // Mock: usePaymentStore.getState().payments
  },

  // ----------------------------------------------------------
  // Certificates
  // TODO: POST ${API_BASE_URL}/api/certificates
  // ----------------------------------------------------------
  issueCertificate: async (_data: IssueCertificateDTO) => {
    // Mock: useLmsStore.getState().issueCertificate(...)
  },

  // TODO: DELETE ${API_BASE_URL}/api/certificates/:id
  revokeCertificate: async (_certId: string) => {
    // Mock: useLmsStore.getState().revokeCertificate(certId)
  },

  // TODO: POST ${API_BASE_URL}/api/certificate-templates (multipart/form-data)
  uploadTemplate: async (_data: FormData) => {
    // Mock: useCertificateTemplateStore.getState().addTemplate(template)
  },

  // TODO: DELETE ${API_BASE_URL}/api/certificate-templates/:id
  deleteTemplate: async (_id: string) => {
    // Mock: useCertificateTemplateStore.getState().deleteTemplate(id)
  },

  // ----------------------------------------------------------
  // Assignments
  // TODO: GET ${API_BASE_URL}/api/assignments
  // ----------------------------------------------------------
  getAssignments: async (_filters?: AssignmentFilters) => {
    // Mock: useLmsStore.getState().assignments
  },

  // TODO: PUT ${API_BASE_URL}/api/assignments/:submissionId/review
  reviewSubmission: async (_data: ReviewSubmissionDTO) => {
    // Mock: useLmsStore.getState().updateProgress(...)
  },

  // ----------------------------------------------------------
  // Tracks
  // TODO: PUT ${API_BASE_URL}/api/tracks/:id/price
  // ----------------------------------------------------------
  updateTrackPrice: async (_trackId: string, _price: number, _currency: string) => {
    // Mock: useLmsStore.getState().updateTrack(trackId, { price, currency })
  },
};
