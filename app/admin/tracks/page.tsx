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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { BookOpen, Code2, Pencil } from "lucide-react";

export default function AdminTracksPage() {
  const { tracks, courses, lessons, updateTrack } = useLmsStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Manage Tracks</h1>
        <p className="text-muted-foreground mt-1">
          View and manage all learning tracks, including pricing
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
              const trackCourses = courses.filter(
                (c) => c.trackId === track.id
              );
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
                      <span className="font-medium text-foreground">
                        {track.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {track.isCodingTrack ? (
                      <Badge variant="secondary" className="text-xs">
                        <Code2 className="mr-1 h-3 w-3" />
                        Coding
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Theory
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-foreground">
                    {trackCourses.length}
                  </TableCell>
                  <TableCell className="text-center text-foreground">
                    {trackLessons.length}
                  </TableCell>
                  <TableCell className="text-right">
                    {(track.price ?? 0) > 0 ? (
                      <span className="font-medium text-foreground tabular-nums">
                        {track.currency || "NGN"}{" "}
                        {(track.price ?? 0).toLocaleString()}
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        Free
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate text-sm text-muted-foreground">
                      {track.description}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <EditPriceDialog
                      trackName={track.name}
                      currentPrice={track.price ?? 0}
                      currentCurrency={track.currency || "NGN"}
                      onSave={(price, currency) => {
                        updateTrack(track.id, { price, currency });
                        toast.success(`Price updated for ${track.name}`);
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function EditPriceDialog({
  trackName,
  currentPrice,
  currentCurrency,
  onSave,
}: {
  trackName: string;
  currentPrice: number;
  currentCurrency: string;
  onSave: (price: number, currency: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(String(currentPrice));
  const [currency, setCurrency] = useState(currentCurrency);

  const handleSave = () => {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      toast.error("Please enter a valid price");
      return;
    }
    onSave(numPrice, currency);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 gap-1"
        onClick={() => setOpen(true)}
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit Price
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Set Price for {trackName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="NGN"
            />
          </div>
          <div className="space-y-2">
            <Label>Price</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              Set to 0 for a free track.
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Price</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
