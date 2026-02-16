import { create } from "zustand";
import type {
  User,
  Track,
  Course,
  Lesson,
  Assignment,
  StudentProgress,
  Certificate,
  Role,
} from "./types";
import {
  mockUsers,
  mockTracks,
  mockCourses,
  mockLessons,
  mockAssignments,
  mockStudentProgress,
  mockCertificates,
} from "./mock-data";

// ============================================================
// Auth Store
// ============================================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (email: string, _password: string) => {
    // Look up user from the users store (which includes seeded + registered users)
    const allUsers = useUserStore.getState().users;
    const user = allUsers.find((u) => u.email === email);
    if (user) {
      set({ user, isAuthenticated: true });
      return true;
    }
    return false;
  },
  register: (name: string, email: string, _password: string) => {
    // Check if email already exists
    const allUsers = useUserStore.getState().users;
    if (allUsers.some((u) => u.email === email)) {
      return false;
    }
    // Registration is always as student
    const newUser: User = {
      id: `student-${Date.now()}`,
      name,
      email,
      role: "student",
      createdAt: new Date().toISOString().split("T")[0],
    };
    useUserStore.getState().addUser(newUser);
    set({ user: newUser, isAuthenticated: true });
    return true;
  },
  logout: () => set({ user: null, isAuthenticated: false }),
  setUser: (user: User) => set({ user, isAuthenticated: true }),
}));

// ============================================================
// User Management Store (for admin to manage all users)
// ============================================================

interface UserState {
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUsersByRole: (role: Role) => User[];
  getStudents: () => User[];
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [...mockUsers],
  addUser: (user: User) =>
    set((state) => ({ users: [...state.users, user] })),
  updateUser: (id: string, data: Partial<User>) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
    })),
  deleteUser: (id: string) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    })),
  getUsersByRole: (role: Role) => {
    return get().users.filter((u) => u.role === role);
  },
  getStudents: () => {
    return get().users.filter((u) => u.role === "student");
  },
}));

// ============================================================
// LMS Data Store
// ============================================================

interface LmsState {
  tracks: Track[];
  courses: Course[];
  lessons: Lesson[];
  assignments: Assignment[];
  studentProgress: StudentProgress[];
  certificates: Certificate[];
  selectedTrackId: string | null;

  // Actions
  selectTrack: (trackId: string) => void;
  getCoursesForTrack: (trackId: string) => Course[];
  getLessonsForCourse: (courseId: string) => Lesson[];
  getAssignmentForLesson: (lessonId: string) => Assignment | undefined;
  getProgressForLesson: (studentId: string, lessonId: string) => StudentProgress | undefined;
  updateProgress: (studentId: string, lessonId: string, data: Partial<StudentProgress>) => void;
  getTrackProgress: (studentId: string, trackId: string) => number;
  getAllLessonsForTrack: (trackId: string) => Lesson[];
  addTrack: (track: Track) => void;
  updateTrack: (id: string, data: Partial<Track>) => void;
  deleteTrack: (id: string) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addLesson: (lesson: Lesson) => void;
  updateLesson: (id: string, data: Partial<Lesson>) => void;
  deleteLesson: (id: string) => void;
  addAssignment: (assignment: Assignment) => void;
  isTrackComplete: (studentId: string, trackId: string) => boolean;
  issueCertificate: (studentId: string, studentName: string, trackId: string, trackName: string) => Certificate;
  getCertificatesForStudent: (studentId: string) => Certificate[];
  getAllCertificates: () => Certificate[];
  revokeCertificate: (certId: string) => void;
}

export const useLmsStore = create<LmsState>((set, get) => ({
  tracks: mockTracks,
  courses: mockCourses,
  lessons: mockLessons,
  assignments: mockAssignments,
  studentProgress: mockStudentProgress,
  certificates: [...mockCertificates],
  selectedTrackId: null,

  selectTrack: (trackId: string) => set({ selectedTrackId: trackId }),

  getCoursesForTrack: (trackId: string) => {
    return get()
      .courses.filter((c) => c.trackId === trackId)
      .sort((a, b) => a.order - b.order);
  },

  getLessonsForCourse: (courseId: string) => {
    return get()
      .lessons.filter((l) => l.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  },

  getAssignmentForLesson: (lessonId: string) => {
    return get().assignments.find((a) => a.lessonId === lessonId);
  },

  getProgressForLesson: (studentId: string, lessonId: string) => {
    return get().studentProgress.find(
      (p) => p.studentId === studentId && p.lessonId === lessonId
    );
  },

  updateProgress: (
    studentId: string,
    lessonId: string,
    data: Partial<StudentProgress>
  ) => {
    set((state) => {
      const existing = state.studentProgress.find(
        (p) => p.studentId === studentId && p.lessonId === lessonId
      );
      if (existing) {
        return {
          studentProgress: state.studentProgress.map((p) =>
            p.studentId === studentId && p.lessonId === lessonId
              ? { ...p, ...data }
              : p
          ),
        };
      }
      return {
        studentProgress: [
          ...state.studentProgress,
          {
            studentId,
            lessonId,
            isCompleted: false,
            watchPercentage: 0,
            assignmentSubmitted: false,
            assignmentPassed: false,
            ...data,
          },
        ],
      };
    });
  },

  getAllLessonsForTrack: (trackId: string) => {
    const courses = get().getCoursesForTrack(trackId);
    const lessons: Lesson[] = [];
    courses.forEach((course) => {
      lessons.push(...get().getLessonsForCourse(course.id));
    });
    return lessons;
  },

  getTrackProgress: (studentId: string, trackId: string) => {
    const allLessons = get().getAllLessonsForTrack(trackId);
    if (allLessons.length === 0) return 0;
    const completedCount = allLessons.filter((lesson) => {
      const progress = get().getProgressForLesson(studentId, lesson.id);
      return progress?.isCompleted;
    }).length;
    return Math.round((completedCount / allLessons.length) * 100);
  },

  isTrackComplete: (studentId: string, trackId: string) => {
    return get().getTrackProgress(studentId, trackId) === 100;
  },

  addTrack: (track: Track) =>
    set((state) => ({ tracks: [...state.tracks, track] })),

  updateTrack: (id: string, data: Partial<Track>) =>
    set((state) => ({
      tracks: state.tracks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),

  deleteTrack: (id: string) =>
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== id),
    })),

  addCourse: (course: Course) =>
    set((state) => ({ courses: [...state.courses, course] })),

  updateCourse: (id: string, data: Partial<Course>) =>
    set((state) => ({
      courses: state.courses.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),

  deleteCourse: (id: string) =>
    set((state) => ({
      courses: state.courses.filter((c) => c.id !== id),
    })),

  addLesson: (lesson: Lesson) =>
    set((state) => ({ lessons: [...state.lessons, lesson] })),

  updateLesson: (id: string, data: Partial<Lesson>) =>
    set((state) => ({
      lessons: state.lessons.map((l) => (l.id === id ? { ...l, ...data } : l)),
    })),

  deleteLesson: (id: string) =>
    set((state) => ({
      lessons: state.lessons.filter((l) => l.id !== id),
    })),

  addAssignment: (assignment: Assignment) =>
    set((state) => ({ assignments: [...state.assignments, assignment] })),

  issueCertificate: (studentId: string, studentName: string, trackId: string, trackName: string) => {
    const existing = get().certificates.find(
      (c) => c.studentId === studentId && c.trackId === trackId
    );
    if (existing) return existing;

    const cert: Certificate = {
      id: `cert-${Date.now()}`,
      studentId,
      studentName,
      trackId,
      trackName,
      issuedAt: new Date().toISOString().split("T")[0],
    };
    set((state) => ({ certificates: [...state.certificates, cert] }));
    return cert;
  },

  getCertificatesForStudent: (studentId: string) => {
    return get().certificates.filter((c) => c.studentId === studentId);
  },

  getAllCertificates: () => {
    return get().certificates;
  },

  revokeCertificate: (certId: string) =>
    set((state) => ({
      certificates: state.certificates.filter((c) => c.id !== certId),
    })),
}));
