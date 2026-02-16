"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLmsStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus } from "lucide-react";

// Schemas
const trackSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  isCodingTrack: z.boolean(),
});

const courseSchema = z.object({
  title: z.string().min(2),
  trackId: z.string().min(1),
});

const lessonSchema = z.object({
  title: z.string().min(2),
  courseId: z.string().min(1),
  videoUrl: z.string().url(),
  duration: z.coerce.number().positive(),
  hasAssignment: z.boolean(),
});

type TrackFormData = z.infer<typeof trackSchema>;
type CourseFormData = z.infer<typeof courseSchema>;
type LessonFormData = z.infer<typeof lessonSchema>;

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add Content</h1>
        <p className="text-muted-foreground mt-1">
          Create tracks, courses, and lessons
        </p>
      </div>

      <Tabs defaultValue="track" className="space-y-6">
        <TabsList>
          <TabsTrigger value="track">Add Track</TabsTrigger>
          <TabsTrigger value="course">Add Course</TabsTrigger>
          <TabsTrigger value="lesson">Add Lesson</TabsTrigger>
        </TabsList>

        <TabsContent value="track">
          <AddTrackForm />
        </TabsContent>
        <TabsContent value="course">
          <AddCourseForm />
        </TabsContent>
        <TabsContent value="lesson">
          <AddLessonForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AddTrackForm() {
  const addTrack = useLmsStore((s) => s.addTrack);
  const [isCoding, setIsCoding] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TrackFormData>({
    resolver: zodResolver(trackSchema),
    defaultValues: { isCodingTrack: true },
  });

  const onSubmit = (data: TrackFormData) => {
    addTrack({
      id: `track-${Date.now()}`,
      name: data.name,
      description: data.description,
      isCodingTrack: isCoding,
      courseCount: 0,
      lessonCount: 0,
    });
    toast.success("Track created successfully");
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">New Track</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Track Name</Label>
            <Input placeholder="e.g. React Mastery" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Describe what students will learn..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={isCoding}
              onCheckedChange={setIsCoding}
            />
            <Label>Coding Track</Label>
          </div>
          <Button type="submit">
            <Plus className="mr-2 h-4 w-4" />
            Create Track
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AddCourseForm() {
  const { tracks, addCourse, courses } = useLmsStore();
  const [selectedTrack, setSelectedTrack] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
  });

  const onSubmit = (data: CourseFormData) => {
    const trackCourses = courses.filter((c) => c.trackId === selectedTrack);
    addCourse({
      id: `course-${Date.now()}`,
      title: data.title,
      trackId: selectedTrack,
      order: trackCourses.length + 1,
    });
    toast.success("Course created successfully");
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">New Course</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Track</Label>
            <Select onValueChange={setSelectedTrack}>
              <SelectTrigger>
                <SelectValue placeholder="Select a track" />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((track) => (
                  <SelectItem key={track.id} value={track.id}>
                    {track.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Course Title</Label>
            <Input
              placeholder="e.g. State Management"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <Button type="submit" disabled={!selectedTrack}>
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AddLessonForm() {
  const { courses, tracks, addLesson, lessons } = useLmsStore();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [hasAssignment, setHasAssignment] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { hasAssignment: false },
  });

  const onSubmit = (data: LessonFormData) => {
    const courseLessons = lessons.filter((l) => l.courseId === selectedCourse);
    addLesson({
      id: `lesson-${Date.now()}`,
      title: data.title,
      courseId: selectedCourse,
      videoUrl: data.videoUrl,
      duration: data.duration,
      hasAssignment,
      order: courseLessons.length + 1,
    });
    toast.success("Lesson created successfully");
    reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">New Lesson</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Course</Label>
            <Select onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => {
                  const track = tracks.find((t) => t.id === course.trackId);
                  return (
                    <SelectItem key={course.id} value={course.id}>
                      {track?.name} - {course.title}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Lesson Title</Label>
            <Input
              placeholder="e.g. Introduction to Hooks"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Video URL</Label>
            <Input
              placeholder="https://youtube.com/watch?v=..."
              {...register("videoUrl")}
            />
            {errors.videoUrl && (
              <p className="text-sm text-destructive">
                {errors.videoUrl.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              placeholder="15"
              {...register("duration")}
            />
            {errors.duration && (
              <p className="text-sm text-destructive">
                {errors.duration.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={hasAssignment}
              onCheckedChange={setHasAssignment}
            />
            <Label>Has Assignment</Label>
          </div>
          <Button type="submit" disabled={!selectedCourse}>
            <Plus className="mr-2 h-4 w-4" />
            Create Lesson
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
