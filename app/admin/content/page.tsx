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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Code2, BookOpen, FileText, ClipboardList } from "lucide-react";
import type { Track, Course, Lesson, Assignment } from "@/lib/types";

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

const assignmentSchema = z.object({
  title: z.string().min(2),
  lessonId: z.string().min(1),
  instructions: z.string().min(10),
  language: z.enum(["javascript", "python", "csharp"]),
  starterCode: z.string().min(1),
  expectedOutput: z.string().min(1),
});

type TrackFormData = z.infer<typeof trackSchema>;
type CourseFormData = z.infer<typeof courseSchema>;
type LessonFormData = z.infer<typeof lessonSchema>;
type AssignmentFormData = z.infer<typeof assignmentSchema>;

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Content Management</h1>
        <p className="text-muted-foreground mt-1">
          Create, edit, and manage tracks, courses, lessons, and assignments
        </p>
      </div>

      <Tabs defaultValue="track" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="track" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Tracks
          </TabsTrigger>
          <TabsTrigger value="course" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="lesson" className="gap-1.5">
            <Code2 className="h-3.5 w-3.5" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="assignment" className="gap-1.5">
            <ClipboardList className="h-3.5 w-3.5" />
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="track">
          <TrackSection />
        </TabsContent>
        <TabsContent value="course">
          <CourseSection />
        </TabsContent>
        <TabsContent value="lesson">
          <LessonSection />
        </TabsContent>
        <TabsContent value="assignment">
          <AssignmentSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Track Section (Create + List with Edit/Delete)
// ============================================================

function TrackSection() {
  const { tracks, addTrack, updateTrack, deleteTrack, courses, lessons } = useLmsStore();
  const [isCoding, setIsCoding] = useState(true);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);
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
    <div className="space-y-6">
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
              <Switch checked={isCoding} onCheckedChange={setIsCoding} />
              <Label>Coding Track</Label>
            </div>
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Create Track
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Tracks */}
      {tracks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Existing Tracks ({tracks.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Courses</TableHead>
                  <TableHead className="text-center">Lessons</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracks.map((track) => {
                  const trackCourses = courses.filter((c) => c.trackId === track.id);
                  const trackLessons = lessons.filter((l) =>
                    trackCourses.some((c) => c.id === l.courseId)
                  );
                  return (
                    <TableRow key={track.id}>
                      <TableCell className="font-medium text-foreground">{track.name}</TableCell>
                      <TableCell>
                        <Badge variant={track.isCodingTrack ? "secondary" : "outline"} className="text-xs">
                          {track.isCodingTrack ? "Coding" : "Theory"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{trackCourses.length}</TableCell>
                      <TableCell className="text-center">{trackLessons.length}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={() => setEditingTrack(track)}>
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Track</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{track.name}&quot;? This will not automatically remove associated courses and lessons.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => {
                                    deleteTrack(track.id);
                                    toast.success(`Track "${track.name}" deleted`);
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Track Dialog */}
      {editingTrack && (
        <EditTrackDialog
          track={editingTrack}
          onSave={(data) => {
            updateTrack(editingTrack.id, data);
            toast.success(`Track "${data.name || editingTrack.name}" updated`);
            setEditingTrack(null);
          }}
          onClose={() => setEditingTrack(null)}
        />
      )}
    </div>
  );
}

function EditTrackDialog({
  track,
  onSave,
  onClose,
}: {
  track: Track;
  onSave: (data: Partial<Track>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(track.name);
  const [description, setDescription] = useState(track.description);
  const [isCoding, setIsCoding] = useState(track.isCodingTrack);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Track</DialogTitle>
          <DialogDescription>Update track details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Track Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isCoding} onCheckedChange={setIsCoding} />
            <Label>Coding Track</Label>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={() => onSave({ name, description, isCodingTrack: isCoding })}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Course Section (Create + List with Edit/Delete)
// ============================================================

function CourseSection() {
  const { tracks, courses, addCourse, updateCourse, deleteCourse } = useLmsStore();
  const [selectedTrack, setSelectedTrack] = useState("");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
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
    <div className="space-y-6">
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
              <Input placeholder="e.g. State Management" {...register("title")} />
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

      {/* Existing Courses */}
      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Existing Courses ({courses.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead className="text-center">Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => {
                  const track = tracks.find((t) => t.id === course.trackId);
                  return (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium text-foreground">{course.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{track?.name || "Unknown"}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{course.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={() => setEditingCourse(course)}>
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{course.title}&quot;?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => {
                                    deleteCourse(course.id);
                                    toast.success(`Course "${course.title}" deleted`);
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Course Dialog */}
      {editingCourse && (
        <EditCourseDialog
          course={editingCourse}
          tracks={tracks}
          onSave={(data) => {
            updateCourse(editingCourse.id, data);
            toast.success(`Course updated`);
            setEditingCourse(null);
          }}
          onClose={() => setEditingCourse(null)}
        />
      )}
    </div>
  );
}

function EditCourseDialog({
  course,
  tracks,
  onSave,
  onClose,
}: {
  course: Course;
  tracks: Track[];
  onSave: (data: Partial<Course>) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(course.title);
  const [trackId, setTrackId] = useState(course.trackId);
  const [order, setOrder] = useState(String(course.order));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Course</DialogTitle>
          <DialogDescription>Update course details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Course Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Track</Label>
            <Select value={trackId} onValueChange={setTrackId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Order</Label>
            <Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} min="1" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={() => onSave({ title, trackId, order: Number(order) })}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Lesson Section (Create + List with Edit/Delete)
// ============================================================

function LessonSection() {
  const { courses, tracks, lessons, addLesson, updateLesson, deleteLesson } = useLmsStore();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [hasAssignment, setHasAssignment] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
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
    <div className="space-y-6">
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
              <Input placeholder="e.g. Introduction to Hooks" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Video URL</Label>
              <Input placeholder="https://youtube.com/watch?v=..." {...register("videoUrl")} />
              {errors.videoUrl && (
                <p className="text-sm text-destructive">{errors.videoUrl.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input type="number" placeholder="15" {...register("duration")} />
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration.message}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={hasAssignment} onCheckedChange={setHasAssignment} />
              <Label>Has Assignment</Label>
            </div>
            <Button type="submit" disabled={!selectedCourse}>
              <Plus className="mr-2 h-4 w-4" />
              Create Lesson
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Lessons */}
      {lessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Existing Lessons ({lessons.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-center">Duration</TableHead>
                  <TableHead className="text-center">Assignment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lessons.map((lesson) => {
                  const course = courses.find((c) => c.id === lesson.courseId);
                  const track = course ? tracks.find((t) => t.id === course.trackId) : undefined;
                  return (
                    <TableRow key={lesson.id}>
                      <TableCell className="font-medium text-foreground">{lesson.title}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {track?.name} - {course?.title || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{lesson.duration} min</TableCell>
                      <TableCell className="text-center">
                        {lesson.hasAssignment ? (
                          <Badge variant="secondary" className="text-xs">Yes</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={() => setEditingLesson(lesson)}>
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Lesson</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{lesson.title}&quot;?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => {
                                    deleteLesson(lesson.id);
                                    toast.success(`Lesson "${lesson.title}" deleted`);
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Lesson Dialog */}
      {editingLesson && (
        <EditLessonDialog
          lesson={editingLesson}
          courses={courses}
          tracks={tracks}
          onSave={(data) => {
            updateLesson(editingLesson.id, data);
            toast.success(`Lesson updated`);
            setEditingLesson(null);
          }}
          onClose={() => setEditingLesson(null)}
        />
      )}
    </div>
  );
}

function EditLessonDialog({
  lesson,
  courses,
  tracks,
  onSave,
  onClose,
}: {
  lesson: Lesson;
  courses: Course[];
  tracks: Track[];
  onSave: (data: Partial<Lesson>) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [courseId, setCourseId] = useState(lesson.courseId);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl);
  const [duration, setDuration] = useState(String(lesson.duration));
  const [hasAssignment, setHasAssignment] = useState(lesson.hasAssignment);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Lesson</DialogTitle>
          <DialogDescription>Update lesson details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Lesson Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => {
                  const track = tracks.find((t) => t.id === c.trackId);
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      {track?.name} - {c.title}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Video URL</Label>
            <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Duration (minutes)</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} min="1" />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={hasAssignment} onCheckedChange={setHasAssignment} />
            <Label>Has Assignment</Label>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={() => onSave({ title, courseId, videoUrl, duration: Number(duration), hasAssignment })}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Assignment Section (Create + List with Edit/Delete)
// ============================================================

function AssignmentSection() {
  const { lessons, courses, tracks, assignments, addAssignment, updateAssignment, deleteAssignment } = useLmsStore();
  const [selectedLesson, setSelectedLesson] = useState("");
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { language: "javascript" },
  });

  // Only show lessons that have assignments enabled
  const eligibleLessons = lessons.filter((l) => l.hasAssignment);

  const onSubmit = (data: AssignmentFormData) => {
    addAssignment({
      id: `assignment-${Date.now()}`,
      lessonId: selectedLesson,
      title: data.title,
      instructions: data.instructions,
      language: data.language,
      starterCode: data.starterCode,
      expectedOutput: data.expectedOutput,
    });
    toast.success("Assignment created successfully");
    reset();
    setSelectedLesson("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">New Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson</Label>
              <Select
                value={selectedLesson}
                onValueChange={(val) => {
                  setSelectedLesson(val);
                  setValue("lessonId", val);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a lesson with assignments enabled" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleLessons.map((lesson) => {
                    const course = courses.find((c) => c.id === lesson.courseId);
                    const track = course ? tracks.find((t) => t.id === course.trackId) : undefined;
                    return (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {track?.name} / {course?.title} / {lesson.title}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assignment Title</Label>
              <Input placeholder="e.g. Build a Counter" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea
                placeholder="Describe what the student needs to do..."
                rows={4}
                {...register("instructions")}
              />
              {errors.instructions && (
                <p className="text-sm text-destructive">{errors.instructions.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select defaultValue="javascript" onValueChange={(val) => setValue("language", val as "javascript" | "python" | "csharp")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="csharp">C#</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Starter Code</Label>
              <Textarea
                placeholder="// Write the starter code here..."
                rows={4}
                className="font-mono text-sm"
                {...register("starterCode")}
              />
              {errors.starterCode && (
                <p className="text-sm text-destructive">{errors.starterCode.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Expected Output</Label>
              <Textarea
                placeholder="The expected console output..."
                rows={2}
                className="font-mono text-sm"
                {...register("expectedOutput")}
              />
              {errors.expectedOutput && (
                <p className="text-sm text-destructive">{errors.expectedOutput.message}</p>
              )}
            </div>
            <Button type="submit" disabled={!selectedLesson}>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Assignments */}
      {assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Existing Assignments ({assignments.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Lesson</TableHead>
                  <TableHead className="text-center">Language</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => {
                  const lesson = lessons.find((l) => l.id === assignment.lessonId);
                  const course = lesson ? courses.find((c) => c.id === lesson.courseId) : undefined;
                  const track = course ? tracks.find((t) => t.id === course.trackId) : undefined;
                  return (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium text-foreground">{assignment.title}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {track?.name} / {lesson?.title || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-xs">{assignment.language}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-8 gap-1" onClick={() => setEditingAssignment(assignment)}>
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 gap-1 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{assignment.title}&quot;?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => {
                                    deleteAssignment(assignment.id);
                                    toast.success(`Assignment "${assignment.title}" deleted`);
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Assignment Dialog */}
      {editingAssignment && (
        <EditAssignmentDialog
          assignment={editingAssignment}
          lessons={eligibleLessons}
          courses={courses}
          tracks={tracks}
          onSave={(data) => {
            updateAssignment(editingAssignment.id, data);
            toast.success(`Assignment updated`);
            setEditingAssignment(null);
          }}
          onClose={() => setEditingAssignment(null)}
        />
      )}
    </div>
  );
}

function EditAssignmentDialog({
  assignment,
  lessons,
  courses,
  tracks,
  onSave,
  onClose,
}: {
  assignment: Assignment;
  lessons: Lesson[];
  courses: Course[];
  tracks: Track[];
  onSave: (data: Partial<Assignment>) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(assignment.title);
  const [instructions, setInstructions] = useState(assignment.instructions);
  const [language, setLanguage] = useState(assignment.language);
  const [starterCode, setStarterCode] = useState(assignment.starterCode);
  const [expectedOutput, setExpectedOutput] = useState(assignment.expectedOutput);
  const [lessonId, setLessonId] = useState(assignment.lessonId);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Assignment</DialogTitle>
          <DialogDescription>Update assignment details, code, and expected output</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Assignment Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Lesson</Label>
            <Select value={lessonId} onValueChange={setLessonId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((l) => {
                  const course = courses.find((c) => c.id === l.courseId);
                  const track = course ? tracks.find((t) => t.id === course.trackId) : undefined;
                  return (
                    <SelectItem key={l.id} value={l.id}>
                      {track?.name} / {course?.title} / {l.title}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Instructions</Label>
            <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={(val) => setLanguage(val as "javascript" | "python" | "csharp")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="csharp">C#</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Starter Code</Label>
            <Textarea
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>Expected Output</Label>
            <Textarea
              value={expectedOutput}
              onChange={(e) => setExpectedOutput(e.target.value)}
              rows={2}
              className="font-mono text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={() => onSave({ title, lessonId, instructions, language, starterCode, expectedOutput })}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
