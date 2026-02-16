"use client";

import { useState } from "react";
import { useLmsStore, useUserStore } from "@/lib/store";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Award, Trash2, Plus, Search } from "lucide-react";

export default function AdminCertificatesPage() {
  const { certificates, tracks, issueCertificate, revokeCertificate, getTrackProgress } =
    useLmsStore();
  const { users } = useUserStore();
  const [search, setSearch] = useState("");

  const students = users.filter((u) => u.role === "student");

  // Students who completed a track but have no certificate for it
  const eligibleForCert = students.flatMap((student) =>
    tracks
      .filter((track) => {
        const progress = getTrackProgress(student.id, track.id);
        const hasCert = certificates.some(
          (c) => c.studentId === student.id && c.trackId === track.id
        );
        return progress === 100 && !hasCert;
      })
      .map((track) => ({ student, track }))
  );

  const filteredCerts = certificates.filter((c) =>
    c.studentName.toLowerCase().includes(search.toLowerCase()) ||
    c.trackName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Certificates</h1>
          <p className="text-muted-foreground mt-1">
            Issue, view, and manage certificates
          </p>
        </div>
        <IssueCertDialog
          students={students}
          tracks={tracks}
          onIssue={issueCertificate}
        />
      </div>

      {/* Eligible students alert */}
      {eligibleForCert.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-warning">
              Students Eligible for Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {eligibleForCert.map(({ student, track }) => (
                <div
                  key={`${student.id}-${track.id}`}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {student.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Completed: {track.name}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                      issueCertificate(
                        student.id,
                        student.name,
                        track.id,
                        track.name
                      );
                      toast.success(
                        `Certificate issued to ${student.name} for ${track.name}`
                      );
                    }}
                  >
                    <Award className="h-3.5 w-3.5" />
                    Issue
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search certificates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Certificates table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Student</TableHead>
              <TableHead className="text-foreground">Track</TableHead>
              <TableHead className="text-foreground">Issued Date</TableHead>
              <TableHead className="text-foreground">Certificate ID</TableHead>
              <TableHead className="text-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No certificates issued yet
                </TableCell>
              </TableRow>
            ) : (
              filteredCerts.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-medium text-foreground">
                    {cert.studentName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {cert.trackName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {cert.id}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-destructive"
                      onClick={() => {
                        revokeCertificate(cert.id);
                        toast.success("Certificate revoked");
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function IssueCertDialog({
  students,
  tracks,
  onIssue,
}: {
  students: any[];
  tracks: any[];
  onIssue: (studentId: string, studentName: string, trackId: string, trackName: string) => void;
}) {
  const [studentId, setStudentId] = useState("");
  const [trackId, setTrackId] = useState("");
  const [open, setOpen] = useState(false);

  const handleIssue = () => {
    if (!studentId || !trackId) {
      toast.error("Please select a student and track");
      return;
    }
    const student = students.find((s: any) => s.id === studentId);
    const track = tracks.find((t: any) => t.id === trackId);
    if (student && track) {
      onIssue(student.id, student.name, track.id, track.name);
      toast.success(`Certificate issued to ${student.name}`);
      setStudentId("");
      setTrackId("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Issue Certificate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">Issue Certificate</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Student</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Track</Label>
            <Select value={trackId} onValueChange={setTrackId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a track" />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleIssue}>Issue Certificate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
