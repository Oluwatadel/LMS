"use client";

import { useState } from "react";
import { useLmsStore } from "@/lib/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { toast } from "sonner";
import { BookOpen, Code2, Pencil, Trash2 } from "lucide-react";
import type { Track } from "@/lib/types";

export default function AdminTracksPage() {
  const { tracks, courses, lessons, updateTrack, deleteTrack } = useLmsStore();
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Tracks</h1>
        <p className="text-muted-foreground mt-1">
          View, edit, and manage all learning tracks including pricing, descriptions, and settings
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Track Name</TableHead>
              <TableHead className="text-foreground">Type</TableHead>
              <TableHead className="text-foreground text-center">Courses</TableHead>
              <TableHead className="text-foreground text-center">Lessons</TableHead>
              <TableHead className="text-foreground text-right">Price</TableHead>
              <TableHead className="text-foreground">Description</TableHead>
              <TableHead className="text-foreground text-right">Actions</TableHead>
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
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                        <BookOpen className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{track.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {track.isCodingTrack ? (
                      <Badge variant="secondary" className="text-xs">
                        <Code2 className="mr-1 h-3 w-3" />
                        Coding
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Theory</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-foreground">{trackCourses.length}</TableCell>
                  <TableCell className="text-center text-foreground">{trackLessons.length}</TableCell>
                  <TableCell className="text-right">
                    {(track.price ?? 0) > 0 ? (
                      <span className="font-medium text-foreground tabular-nums">
                        {track.currency || "NGN"} {(track.price ?? 0).toLocaleString()}
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">Free</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm text-muted-foreground">{track.description}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1"
                        onClick={() => setEditingTrack(track)}
                      >
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
      </div>

      {/* Edit Track Dialog - Full edit including name, description, type, price */}
      {editingTrack && (
        <EditTrackDialog
          track={editingTrack}
          onSave={(data) => {
            updateTrack(editingTrack.id, data);
            toast.success(`Track "${editingTrack.name}" updated`);
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
  const [price, setPrice] = useState(String(track.price ?? 0));
  const [currency, setCurrency] = useState(track.currency || "NGN");

  const handleSave = () => {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error("Please enter a valid price");
      return;
    }
    onSave({ name, description, isCodingTrack: isCoding, price: numPrice, currency });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Track</DialogTitle>
          <DialogDescription>Update all track details including name, description, type, and pricing</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Track Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={isCoding} onCheckedChange={setIsCoding} />
            <Label>Coding Track</Label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="NGN" />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" min="0" />
              <p className="text-xs text-muted-foreground">Set to 0 for a free track.</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
