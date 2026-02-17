import Link from "next/link";
import {
  Code2,
  BookOpen,
  Award,
  Play,
  Terminal,
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const tracks = [
  {
    name: "JavaScript Fundamentals",
    description:
      "Master the core concepts of JavaScript, from variables and functions to async programming and DOM manipulation.",
    courses: 3,
    lessons: 9,
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    tag: "JavaScript",
  },
  {
    name: "Python for Beginners",
    description:
      "Learn Python from scratch. Cover data types, control flow, functions, and object-oriented programming.",
    courses: 2,
    lessons: 6,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    tag: "Python",
  },
  {
    name: "C# and .NET Core",
    description:
      "Build modern applications with C# and .NET. Learn LINQ, async/await, and web APIs with ASP.NET Core.",
    courses: 2,
    lessons: 6,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    tag: "C#",
  },
];

const features = [
  {
    icon: Play,
    title: "Video Lessons",
    description:
      "Watch structured courses crafted by industry experts. Learn at your own pace with high-quality video content.",
  },
  {
    icon: Terminal,
    title: "In-App Code Editor",
    description:
      "Write, run, and test code directly in the browser. Powered by Judge0 for real code execution across multiple languages.",
  },
  {
    icon: Award,
    title: "Earn Certificates",
    description:
      "Complete tracks and earn verified certificates to showcase your skills to employers and peers.",
  },
  {
    icon: Zap,
    title: "Hands-On Assignments",
    description:
      "Practice with real coding assignments that are automatically graded. Get instant feedback on your solutions.",
  },
  {
    icon: Users,
    title: "Mentor Support",
    description:
      "Get guidance from experienced mentors who review your work and help you grow as a developer.",
  },
  {
    icon: Globe,
    title: "Learn Anywhere",
    description:
      "Access your courses on any device. Your progress syncs seamlessly so you can pick up where you left off.",
  },
];

const stats = [
  { value: "3+", label: "Learning Tracks" },
  { value: "7+", label: "Courses" },
  { value: "21+", label: "Lessons" },
  { value: "500+", label: "Students" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Code2 className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">CodePath</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#tracks"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Tracks
            </a>
            <a
              href="#stats"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 md:pb-28 md:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Now with real code execution powered by Judge0
            </div>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl md:leading-[1.1]">
              Master coding with{" "}
              <span className="text-primary">hands-on projects</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
              Interactive video lessons, a real in-browser code editor, and
              graded assignments. Everything you need to go from beginner to
              confident developer.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="gap-2 px-8" asChild>
                <Link href="/auth">
                  Start Learning
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <a href="#tracks">
                  <BookOpen className="h-4 w-4" />
                  Browse Tracks
                </a>
              </Button>
            </div>
          </div>

          {/* Code preview mockup */}
          <div className="mx-auto mt-16 max-w-3xl">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-primary/5">
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-warning/60" />
                <div className="h-3 w-3 rounded-full bg-primary/60" />
                <span className="ml-2 text-xs text-muted-foreground">
                  assignment.js
                </span>
              </div>
              <div className="p-6 font-mono text-sm leading-relaxed">
                <div className="text-muted-foreground">
                  {"// Write a function that returns the sum of two numbers"}
                </div>
                <div className="mt-2">
                  <span className="text-blue-400">function</span>{" "}
                  <span className="text-primary">sum</span>
                  <span className="text-foreground">(a, b) {"{"}</span>
                </div>
                <div className="ml-6">
                  <span className="text-blue-400">return</span>{" "}
                  <span className="text-foreground">a + b;</span>
                </div>
                <div className="text-foreground">{"}"}</div>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs">
                    All test cases passed. Score: 100/100
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              Everything you need to learn to code
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground md:text-lg">
              A complete learning platform with the tools and support to take
              you from your first line of code to job-ready developer.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section id="tracks" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              Choose your learning path
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground md:text-lg">
              Structured tracks designed to take you from zero to proficient.
              Each track includes courses, video lessons, and coding
              assignments.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {tracks.map((track) => (
              <div
                key={track.name}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-md border px-2.5 py-0.5 text-xs font-medium ${track.color}`}
                  >
                    {track.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {track.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {track.description}
                </p>
                <div className="mt-6 flex items-center gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    {track.courses} Courses
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Play className="h-3.5 w-3.5" />
                    {track.lessons} Lessons
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/auth">
                View All Tracks
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        id="stats"
        className="border-t border-border bg-primary/5"
      >
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
              Ready to start your coding journey?
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground md:text-lg">
              Join hundreds of students already building real skills with
              CodePath. Sign up today and start learning.
            </p>
            <div className="mt-8">
              <Button size="lg" className="gap-2 px-8" asChild>
                <Link href="/auth">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Code2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                CodePath
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#tracks" className="hover:text-foreground transition-colors">
                Tracks
              </a>
              <Link href="/auth" className="hover:text-foreground transition-colors">
                Sign In
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Built for developers, by developers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
