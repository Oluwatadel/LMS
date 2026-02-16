import type {
  Track,
  Course,
  Lesson,
  Assignment,
  StudentProgress,
  User,
  Certificate,
  MentorStudent,
} from "./types";

// ============================================================
// Users
// ============================================================

export const mockUsers: User[] = [
  // Superadmin - seeded, cannot be registered
  {
    id: "superadmin-1",
    name: "System Admin",
    email: "superadmin@codepath.com",
    password: "admin@2024",
    role: "superadmin",
    authProvider: "credentials",
    createdAt: "2024-01-01",
  },
  // Admin
  {
    id: "admin-1",
    name: "Sarah Admin",
    email: "sarah@example.com",
    password: "sarah123",
    role: "admin",
    authProvider: "credentials",
    createdAt: "2024-03-01",
  },
  // Mentor
  {
    id: "mentor-1",
    name: "David Mentor",
    email: "david@example.com",
    password: "david123",
    role: "mentor",
    authProvider: "credentials",
    createdAt: "2024-03-15",
  },
  // Current Students
  {
    id: "student-1",
    name: "Alex Johnson",
    email: "alex@example.com",
    password: "alex123",
    role: "student",
    enrolledTrackId: "track-1",
    authProvider: "credentials",
    createdAt: "2024-06-01",
  },
  {
    id: "student-2",
    name: "Maria Garcia",
    email: "maria@example.com",
    password: "maria123",
    role: "student",
    enrolledTrackId: "track-2",
    authProvider: "credentials",
    createdAt: "2024-07-10",
  },
  {
    id: "student-3",
    name: "James Wilson",
    email: "james@example.com",
    password: "james123",
    role: "student",
    enrolledTrackId: "track-1",
    authProvider: "credentials",
    createdAt: "2024-08-05",
  },
  // Previous students (completed tracks, need to re-register to download certificates)
  {
    id: "student-prev-1",
    name: "Emily Chen",
    email: "emily@example.com",
    password: "emily123",
    role: "student",
    enrolledTrackId: "track-1",
    isPreviousStudent: true,
    authProvider: "credentials",
    createdAt: "2023-09-01",
  },
  {
    id: "student-prev-2",
    name: "Michael Brown",
    email: "michael@example.com",
    password: "michael123",
    role: "student",
    enrolledTrackId: "track-3",
    isPreviousStudent: true,
    authProvider: "credentials",
    createdAt: "2023-10-15",
  },
];

// ============================================================
// Tracks
// ============================================================

export const mockTracks: Track[] = [
  {
    id: "track-1",
    name: "JavaScript Fundamentals",
    description:
      "Master the core concepts of JavaScript, from variables and functions to async programming and DOM manipulation.",
    isCodingTrack: true,
    courseCount: 3,
    lessonCount: 9,
  },
  {
    id: "track-2",
    name: "Python for Beginners",
    description:
      "Learn Python from scratch. Cover data types, control flow, functions, and object-oriented programming.",
    isCodingTrack: true,
    courseCount: 2,
    lessonCount: 6,
  },
  {
    id: "track-3",
    name: "C# and .NET Core",
    description:
      "Build modern applications with C# and .NET. Learn LINQ, async/await, and web APIs with ASP.NET Core.",
    isCodingTrack: true,
    courseCount: 2,
    lessonCount: 6,
  },
];

// ============================================================
// Courses
// ============================================================

export const mockCourses: Course[] = [
  // JS Track
  { id: "course-1", trackId: "track-1", title: "Variables & Types", order: 1 },
  { id: "course-2", trackId: "track-1", title: "Functions & Scope", order: 2 },
  { id: "course-3", trackId: "track-1", title: "Async Programming", order: 3 },
  // Python Track
  { id: "course-4", trackId: "track-2", title: "Python Basics", order: 1 },
  { id: "course-5", trackId: "track-2", title: "Data Structures in Python", order: 2 },
  // C# Track
  { id: "course-6", trackId: "track-3", title: "C# Fundamentals", order: 1 },
  { id: "course-7", trackId: "track-3", title: "ASP.NET Core Basics", order: 2 },
];

// ============================================================
// Lessons
// ============================================================

export const mockLessons: Lesson[] = [
  // Course 1: Variables & Types
  {
    id: "lesson-1",
    courseId: "course-1",
    title: "Introduction to JavaScript",
    videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
    duration: 12,
    hasAssignment: false,
    order: 1,
    description: "Get an overview of JavaScript, its history, and why it is one of the most popular programming languages in the world.",
  },
  {
    id: "lesson-2",
    courseId: "course-1",
    title: "Variables: let, const, var",
    videoUrl: "https://www.youtube.com/watch?v=9WIJQDvt4Us",
    duration: 15,
    hasAssignment: true,
    order: 2,
    description: "Understand the difference between let, const, and var. Learn when to use each and the concept of variable hoisting.",
  },
  {
    id: "lesson-3",
    courseId: "course-1",
    title: "Data Types & Type Coercion",
    videoUrl: "https://www.youtube.com/watch?v=808eYu9B9Yw",
    duration: 18,
    hasAssignment: true,
    order: 3,
    description: "Explore primitive and reference types in JavaScript, and learn about implicit and explicit type coercion.",
  },
  // Course 2: Functions & Scope
  {
    id: "lesson-4",
    courseId: "course-2",
    title: "Function Declarations vs Expressions",
    videoUrl: "https://www.youtube.com/watch?v=gigtS_5KOqo",
    duration: 14,
    hasAssignment: false,
    order: 1,
    description: "Learn the different ways to define functions in JavaScript and the nuances of each approach.",
  },
  {
    id: "lesson-5",
    courseId: "course-2",
    title: "Arrow Functions & Closures",
    videoUrl: "https://www.youtube.com/watch?v=h33Srr5J9nY",
    duration: 20,
    hasAssignment: true,
    order: 2,
    description: "Understand arrow function syntax, lexical this binding, and the powerful concept of closures.",
  },
  {
    id: "lesson-6",
    courseId: "course-2",
    title: "Scope & the Call Stack",
    videoUrl: "https://www.youtube.com/watch?v=QyUFheng6J0",
    duration: 16,
    hasAssignment: true,
    order: 3,
    description: "Dive into the JavaScript execution context, scope chain, and call stack to understand how code executes.",
  },
  // Course 3: Async Programming
  {
    id: "lesson-7",
    courseId: "course-3",
    title: "Callbacks & Promises",
    videoUrl: "https://www.youtube.com/watch?v=DHvZLI7Db8E",
    duration: 22,
    hasAssignment: false,
    order: 1,
    description: "Learn asynchronous programming patterns starting with callbacks and transitioning to Promises.",
  },
  {
    id: "lesson-8",
    courseId: "course-3",
    title: "Async/Await Deep Dive",
    videoUrl: "https://www.youtube.com/watch?v=V_Kr9OSfDeU",
    duration: 25,
    hasAssignment: true,
    order: 2,
    description: "Master async/await syntax for cleaner asynchronous code and learn error handling with try/catch.",
  },
  {
    id: "lesson-9",
    courseId: "course-3",
    title: "Fetch API & Error Handling",
    videoUrl: "https://www.youtube.com/watch?v=cuEtnrL9-H0",
    duration: 19,
    hasAssignment: true,
    order: 3,
    description: "Use the Fetch API to make HTTP requests and learn robust error handling patterns.",
  },
  // Python courses
  {
    id: "lesson-10",
    courseId: "course-4",
    title: "Hello Python",
    videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
    duration: 10,
    hasAssignment: false,
    order: 1,
    description: "Install Python and write your first programs.",
  },
  {
    id: "lesson-11",
    courseId: "course-4",
    title: "Variables & Data Types",
    videoUrl: "https://www.youtube.com/watch?v=cQT33yu9pY8",
    duration: 14,
    hasAssignment: true,
    order: 2,
    description: "Explore Python variables, strings, numbers, and booleans.",
  },
  {
    id: "lesson-12",
    courseId: "course-4",
    title: "Control Flow",
    videoUrl: "https://www.youtube.com/watch?v=Zp5MuPOtsSY",
    duration: 16,
    hasAssignment: true,
    order: 3,
    description: "Learn if/else statements, for loops, and while loops.",
  },
  {
    id: "lesson-13",
    courseId: "course-5",
    title: "Lists & Tuples",
    videoUrl: "https://www.youtube.com/watch?v=W8KRzm-HUcc",
    duration: 18,
    hasAssignment: true,
    order: 1,
    description: "Work with Python lists, tuples, and list comprehensions.",
  },
  {
    id: "lesson-14",
    courseId: "course-5",
    title: "Dictionaries & Sets",
    videoUrl: "https://www.youtube.com/watch?v=daefaLgNkw0",
    duration: 15,
    hasAssignment: false,
    order: 2,
    description: "Master dictionaries, sets, and their common operations.",
  },
  {
    id: "lesson-15",
    courseId: "course-5",
    title: "Functions in Python",
    videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
    duration: 20,
    hasAssignment: true,
    order: 3,
    description: "Define functions, use default parameters, and return values.",
  },
  // C# courses
  {
    id: "lesson-16",
    courseId: "course-6",
    title: "Getting Started with C#",
    videoUrl: "https://www.youtube.com/watch?v=GhQdlMFylQ8",
    duration: 12,
    hasAssignment: false,
    order: 1,
    description: "Set up your development environment and write your first C# program.",
  },
  {
    id: "lesson-17",
    courseId: "course-6",
    title: "Types and Variables in C#",
    videoUrl: "https://www.youtube.com/watch?v=_D1aeOsQFOE",
    duration: 18,
    hasAssignment: true,
    order: 2,
    description: "Learn value types, reference types, and type safety in C#.",
  },
  {
    id: "lesson-18",
    courseId: "course-6",
    title: "Classes and Objects",
    videoUrl: "https://www.youtube.com/watch?v=ZqDZcrBRl4o",
    duration: 22,
    hasAssignment: true,
    order: 3,
    description: "Object-oriented programming with classes, constructors, and methods.",
  },
  {
    id: "lesson-19",
    courseId: "course-7",
    title: "Intro to ASP.NET Core",
    videoUrl: "https://www.youtube.com/watch?v=lE8NdaX97m0",
    duration: 20,
    hasAssignment: false,
    order: 1,
    description: "Introduction to building web APIs with ASP.NET Core.",
  },
  {
    id: "lesson-20",
    courseId: "course-7",
    title: "Controllers and Routing",
    videoUrl: "https://www.youtube.com/watch?v=aIkpVzqLuhA",
    duration: 25,
    hasAssignment: true,
    order: 2,
    description: "Build RESTful endpoints with controllers and attribute routing.",
  },
  {
    id: "lesson-21",
    courseId: "course-7",
    title: "Dependency Injection",
    videoUrl: "https://www.youtube.com/watch?v=YR6HkvRBDiI",
    duration: 18,
    hasAssignment: true,
    order: 3,
    description: "Master the built-in DI container in ASP.NET Core.",
  },
];

// ============================================================
// Assignments
// ============================================================

export const mockAssignments: Assignment[] = [
  {
    id: "assign-1",
    lessonId: "lesson-2",
    title: "Variable Declaration Practice",
    instructions:
      "Create three variables:\n1. A `const` called `PI` with the value 3.14159\n2. A `let` called `counter` with the value 0\n3. Increment `counter` by 1\n4. Print both values using console.log()\n\nExpected output:\n```\n3.14159\n1\n```",
    language: "javascript",
    starterCode:
      '// Declare your variables below\n\n// Print the values\nconsole.log(PI);\nconsole.log(counter);',
    expectedOutput: "3.14159\n1",
  },
  {
    id: "assign-2",
    lessonId: "lesson-3",
    title: "Type Checking Challenge",
    instructions:
      'Write a function `getType(value)` that returns the type of the given value as a string.\n\nTest it with:\n- 42\n- "hello"\n- true\n- null\n\nPrint each result on a new line.\n\nExpected output:\n```\nnumber\nstring\nboolean\nobject\n```',
    language: "javascript",
    starterCode:
      "function getType(value) {\n  // Your code here\n}\n\nconsole.log(getType(42));\nconsole.log(getType(\"hello\"));\nconsole.log(getType(true));\nconsole.log(getType(null));",
    expectedOutput: "number\nstring\nboolean\nobject",
  },
  {
    id: "assign-3",
    lessonId: "lesson-5",
    title: "Closure Counter",
    instructions:
      "Create a function `createCounter()` that returns an object with two methods:\n- `increment()`: increases the count by 1 and returns the new count\n- `getCount()`: returns the current count\n\nUse closures to keep the count private.\n\nExpected output:\n```\n1\n2\n2\n```",
    language: "javascript",
    starterCode:
      "function createCounter() {\n  // Your code here\n}\n\nconst counter = createCounter();\nconsole.log(counter.increment());\nconsole.log(counter.increment());\nconsole.log(counter.getCount());",
    expectedOutput: "1\n2\n2",
  },
  {
    id: "assign-4",
    lessonId: "lesson-6",
    title: "Scope Quiz",
    instructions:
      'Predict and fix the output of the following code so it correctly prints:\n```\ninner: 10\nouter: 5\n```\n\nHint: The inner function should have its own variable.',
    language: "javascript",
    starterCode:
      "let x = 5;\n\nfunction outer() {\n  // Create a local x = 10 in inner\n  function inner() {\n    // Your code here\n    console.log(\"inner:\", x);\n  }\n  inner();\n  console.log(\"outer:\", x);\n}\n\nouter();",
    expectedOutput: "inner: 10\nouter: 5",
  },
  {
    id: "assign-5",
    lessonId: "lesson-8",
    title: "Async Data Fetcher",
    instructions:
      "Write an async function `fetchData()` that:\n1. Simulates fetching data with a delay\n2. Returns the string \"Data loaded successfully\"\n3. Prints the result\n\nUse setTimeout wrapped in a Promise.\n\nExpected output:\n```\nFetching...\nData loaded successfully\n```",
    language: "javascript",
    starterCode:
      'async function fetchData() {\n  console.log("Fetching...");\n  // Your code here\n}\n\nfetchData();',
    expectedOutput: "Fetching...\nData loaded successfully",
  },
  {
    id: "assign-6",
    lessonId: "lesson-9",
    title: "Error Handling Practice",
    instructions:
      "Write a function `safeDivide(a, b)` that:\n- Returns a / b if b is not zero\n- Throws an Error with message \"Cannot divide by zero\" if b is zero\n\nUse try/catch to handle the error.\n\nExpected output:\n```\n5\nError: Cannot divide by zero\n```",
    language: "javascript",
    starterCode:
      'function safeDivide(a, b) {\n  // Your code here\n}\n\ntry {\n  console.log(safeDivide(10, 2));\n  console.log(safeDivide(10, 0));\n} catch (e) {\n  console.log("Error: " + e.message);\n}',
    expectedOutput: "5\nError: Cannot divide by zero",
  },
  // Python assignments
  {
    id: "assign-7",
    lessonId: "lesson-11",
    title: "Python Variables",
    instructions:
      'Create variables for your name, age, and whether you are a student.\nPrint them on separate lines.\n\nExpected output:\n```\nAlex\n25\nTrue\n```',
    language: "python",
    starterCode: '# Create your variables\nname = ""\nage = 0\nis_student = False\n\n# Print them\n',
    expectedOutput: "Alex\n25\nTrue",
  },
  {
    id: "assign-8",
    lessonId: "lesson-12",
    title: "FizzBuzz Lite",
    instructions:
      "Print numbers 1-15. For multiples of 3, print 'Fizz'. For multiples of 5, print 'Buzz'. For both, print 'FizzBuzz'.\n\nExpected output (first 5 lines):\n```\n1\n2\nFizz\n4\nBuzz\n```",
    language: "python",
    starterCode: "# Write your FizzBuzz solution\nfor i in range(1, 16):\n    pass  # Replace with your code\n",
    expectedOutput: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
  },
  {
    id: "assign-9",
    lessonId: "lesson-13",
    title: "List Operations",
    instructions:
      "Create a list of numbers [1, 2, 3, 4, 5], then:\n1. Double each number using list comprehension\n2. Print the result\n\nExpected output:\n```\n[2, 4, 6, 8, 10]\n```",
    language: "python",
    starterCode: "numbers = [1, 2, 3, 4, 5]\n\n# Double each number\ndoubled = []\n\nprint(doubled)\n",
    expectedOutput: "[2, 4, 6, 8, 10]",
  },
  {
    id: "assign-10",
    lessonId: "lesson-15",
    title: "Python Functions",
    instructions:
      "Write a function `greet(name, greeting='Hello')` that returns a formatted greeting string.\n\nExpected output:\n```\nHello, World!\nHi, Python!\n```",
    language: "python",
    starterCode:
      "def greet(name, greeting='Hello'):\n    pass  # Your code here\n\nprint(greet('World'))\nprint(greet('Python', 'Hi'))\n",
    expectedOutput: "Hello, World!\nHi, Python!",
  },
  // C# assignments
  {
    id: "assign-11",
    lessonId: "lesson-17",
    title: "C# Type System",
    instructions:
      'Declare variables of types int, double, string, and bool. Print each.\n\nExpected output:\n```\n42\n3.14\nHello C#\nTrue\n```',
    language: "csharp",
    starterCode:
      'using System;\n\nclass Program {\n    static void Main() {\n        // Declare your variables\n\n        // Print them\n    }\n}',
    expectedOutput: "42\n3.14\nHello C#\nTrue",
  },
  {
    id: "assign-12",
    lessonId: "lesson-18",
    title: "Create a Class",
    instructions:
      'Create a `Person` class with Name and Age properties. Create an instance and print the details.\n\nExpected output:\n```\nAlice is 30 years old\n```',
    language: "csharp",
    starterCode:
      'using System;\n\n// Define Person class here\n\nclass Program {\n    static void Main() {\n        // Create instance and print\n    }\n}',
    expectedOutput: "Alice is 30 years old",
  },
  {
    id: "assign-13",
    lessonId: "lesson-20",
    title: "REST Controller",
    instructions:
      'Write a basic ASP.NET Core controller skeleton for a "Products" resource with GET and POST methods.\n\nThis is a code structure exercise - focus on correct attribute routing.',
    language: "csharp",
    starterCode:
      'using Microsoft.AspNetCore.Mvc;\n\n// Create your ProductsController here\n',
    expectedOutput: "Controller structure verified",
  },
  {
    id: "assign-14",
    lessonId: "lesson-21",
    title: "DI Registration",
    instructions:
      'Register a service interface and implementation using the built-in DI container.\n\nCreate an IGreetingService and GreetingService, then register it.',
    language: "csharp",
    starterCode:
      'using System;\n\n// Define IGreetingService interface\n// Define GreetingService class\n// Show registration code\n',
    expectedOutput: "DI setup verified",
  },
];

// ============================================================
// Student Progress
// ============================================================

export const mockStudentProgress: StudentProgress[] = [
  // Student 1 (Alex) - JS track, partially done
  { studentId: "student-1", lessonId: "lesson-1", isCompleted: true, watchPercentage: 100, assignmentSubmitted: false, assignmentPassed: false },
  { studentId: "student-1", lessonId: "lesson-2", isCompleted: true, watchPercentage: 100, assignmentSubmitted: true, assignmentPassed: true },
  { studentId: "student-1", lessonId: "lesson-3", isCompleted: true, watchPercentage: 95, assignmentSubmitted: true, assignmentPassed: true },
  { studentId: "student-1", lessonId: "lesson-4", isCompleted: true, watchPercentage: 92, assignmentSubmitted: false, assignmentPassed: false },
  { studentId: "student-1", lessonId: "lesson-5", isCompleted: false, watchPercentage: 45, assignmentSubmitted: false, assignmentPassed: false },
  // Student 2 (Maria) - Python track
  { studentId: "student-2", lessonId: "lesson-10", isCompleted: true, watchPercentage: 100, assignmentSubmitted: false, assignmentPassed: false },
  { studentId: "student-2", lessonId: "lesson-11", isCompleted: true, watchPercentage: 100, assignmentSubmitted: true, assignmentPassed: true },
  { studentId: "student-2", lessonId: "lesson-12", isCompleted: false, watchPercentage: 60, assignmentSubmitted: false, assignmentPassed: false },
  // Student 3 (James) - JS track
  { studentId: "student-3", lessonId: "lesson-1", isCompleted: true, watchPercentage: 100, assignmentSubmitted: false, assignmentPassed: false },
  { studentId: "student-3", lessonId: "lesson-2", isCompleted: true, watchPercentage: 100, assignmentSubmitted: true, assignmentPassed: true },
  // Previous student (Emily) - JS track COMPLETE
  { studentId: "student-prev-1", lessonId: "lesson-1", isCompleted: true, watchPercentage: 100, assignmentSubmitted: false, assignmentPassed: false },
  { studentId: "student-prev-1", lessonId: "lesson-2", isCompleted: true, watchPercentage: 100, assignmentSubmitted: true, assignmentPassed: true },
  { studentId: "student-prev-1", lessonId: "lesson-3", isCompleted: true, watchPercentage: 100, assignmentSubmitted: true, assignmentPassed: true },
  { studentId: "student-prev-1", lessonId: "lesson-4", isCompleted: true, watchPercentage: 100, assignmentSubmitted: false, assignmentPassed: false },
  { studentId: "student-prev-1", lessonId: "lesson-5", isCompleted: true, watchPercentage: 100, assignmentSubmitted: true, assignmentPassed: true },
  { studentId: "student-prev-1", lessonId: "lesson-6", isCompleted: true, watchPercentage: 100, assignmentSubmitted: true, assignmentPassed: true },
  { studentId: "student-prev-1", lessonId: "lesson-7", isCompleted: true, watchPercentage: 100, assignmentSubmitted: false, assignmentPassed: false },
  { studentId: "student-prev-1", lessonId: "lesson-8", isCompleted: true, watchPercentage: 100, assignmentSubmitted: true, assignmentPassed: true },
  { studentId: "student-prev-1", lessonId: "lesson-9", isCompleted: true, watchPercentage: 100, assignmentSubmitted: true, assignmentPassed: true },
  // Previous student (Michael) - C# track COMPLETE
  { studentId: "student-prev-2", lessonId: "lesson-16", isCompleted: true, watchPercentage: 100, assignmentSubmitted: false, assignmentPassed: false },
  { studentId: "student-prev-2", lessonId: "lesson-17", isCompleted: true, watchPercentage: 100, assignmentSubmitted: true, assignmentPassed: true },
  { studentId: "student-prev-2", lessonId: "lesson-18", isCompleted: true, watchPercentage: 100, assignmentSubmitted: true, assignmentPassed: true },
  { studentId: "student-prev-2", lessonId: "lesson-19", isCompleted: true, watchPercentage: 100, assignmentSubmitted: false, assignmentPassed: false },
  { studentId: "student-prev-2", lessonId: "lesson-20", isCompleted: true, watchPercentage: 100, assignmentSubmitted: true, assignmentPassed: true },
  { studentId: "student-prev-2", lessonId: "lesson-21", isCompleted: true, watchPercentage: 100, assignmentSubmitted: true, assignmentPassed: true },
];

// ============================================================
// Certificates (pre-issued for previous students)
// ============================================================

export const mockCertificates: Certificate[] = [
  {
    id: "cert-1",
    studentId: "student-prev-1",
    studentName: "Emily Chen",
    trackId: "track-1",
    trackName: "JavaScript Fundamentals",
    issuedAt: "2024-01-15",
  },
  {
    id: "cert-2",
    studentId: "student-prev-2",
    studentName: "Michael Brown",
    trackId: "track-3",
    trackName: "C# and .NET Core",
    issuedAt: "2024-02-20",
  },
];

// ============================================================
// Mentor-Student mapping
// ============================================================

export const mockMentorStudents: MentorStudent[] = [
  {
    student: mockUsers.find((u) => u.id === "student-1")!,
    trackId: "track-1",
    trackName: "JavaScript Fundamentals",
    progressPercentage: 44,
    lessonsCompleted: 4,
    totalLessons: 9,
  },
  {
    student: mockUsers.find((u) => u.id === "student-2")!,
    trackId: "track-2",
    trackName: "Python for Beginners",
    progressPercentage: 33,
    lessonsCompleted: 2,
    totalLessons: 6,
  },
];
