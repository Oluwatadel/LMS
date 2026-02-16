"use client";

import { useState } from "react";
import { useAuthStore, useLmsStore, useUserStore } from "@/lib/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { UserPlus, Trash2, Pencil, Award, Search, ShieldCheck } from "lucide-react";
import type { Role } from "@/lib/types";

export default function AdminStudentsPage() {
  const currentUser = useAuthStore((s) => s.user);
  const { users, addUser, updateUser, deleteUser } = useUserStore();
  const { tracks, getTrackProgress, studentProgress, issueCertificate, getCertificatesForStudent } =
    useLmsStore();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  const isSuperAdmin = currentUser?.role === "superadmin";

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    // Non-superadmins cannot see superadmin users
    if (!isSuperAdmin && u.role === "superadmin") return false;
    return matchesSearch && matchesRole;
  });

  const students = filteredUsers.filter((u) => u.role === "student");
  const staff = filteredUsers.filter((u) => u.role !== "student");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage students, mentors, and admins
          </p>
        </div>
        {isSuperAdmin && <AddUserDialog onAdd={addUser} />}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="mentor">Mentors</SelectItem>
            {isSuperAdmin && <SelectItem value="superadmin">Super Admin</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="staff">Staff ({staff.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Student</TableHead>
                  <TableHead className="text-foreground">Email</TableHead>
                  <TableHead className="text-foreground">Track</TableHead>
                  <TableHead className="text-foreground">Progress</TableHead>
                  <TableHead className="text-foreground text-center">Status</TableHead>
                  <TableHead className="text-foreground text-center">Certificates</TableHead>
                  <TableHead className="text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => {
                    const trackId = student.enrolledTrackId ?? "track-1";
                    const track = tracks.find((t) => t.id === trackId);
                    const progress = getTrackProgress(student.id, trackId);
                    const studentProg = studentProgress.filter(
                      (p) => p.studentId === student.id
                    );
                    const certs = getCertificatesForStudent(student.id);
                    const isComplete = progress === 100;

                    const initials = student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase();

                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium text-foreground">
                                {student.name}
                              </span>
                              {student.isPreviousStudent && (
                                <Badge variant="outline" className="ml-2 text-[10px] py-0">
                                  Previous
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {track?.name ?? "Not assigned"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Progress value={progress} className="h-2 w-20" />
                            <span className="text-sm font-medium text-foreground tabular-nums">
                              {progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {isComplete ? (
                            <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              In Progress
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-foreground">
                          {certs.length}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isComplete && certs.length === 0 && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 gap-1 text-primary"
                                onClick={() => {
                                  issueCertificate(
                                    student.id,
                                    student.name,
                                    trackId,
                                    track?.name ?? "Unknown Track"
                                  );
                                  toast.success(
                                    `Certificate issued to ${student.name}`
                                  );
                                }}
                              >
                                <Award className="h-3.5 w-3.5" />
                                Issue Cert
                              </Button>
                            )}
                            <EditStudentDialog
                              student={student}
                              tracks={tracks}
                              onSave={(data) => updateUser(student.id, data)}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-destructive"
                              onClick={() => {
                                deleteUser(student.id);
                                toast.success(`${student.name} removed`);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="staff">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">Email</TableHead>
                  <TableHead className="text-foreground">Role</TableHead>
                  <TableHead className="text-foreground">Joined</TableHead>
                  {isSuperAdmin && (
                    <TableHead className="text-foreground text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isSuperAdmin ? 5 : 4} className="text-center py-8 text-muted-foreground">
                      No staff members found
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((member) => {
                    const initials = member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase();

                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">
                              {member.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.email}
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={member.role} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.createdAt ?? "N/A"}
                        </TableCell>
                        {isSuperAdmin && (
                          <TableCell className="text-right">
                            {member.role !== "superadmin" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-destructive"
                                onClick={() => {
                                  deleteUser(member.id);
                                  toast.success(`${member.name} removed`);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  switch (role) {
    case "superadmin":
      return (
        <Badge className="gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
          <ShieldCheck className="h-3 w-3" />
          Super Admin
        </Badge>
      );
    case "admin":
      return <Badge variant="secondary">Admin</Badge>;
    case "mentor":
      return (
        <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20 hover:bg-chart-2/10">
          Mentor
        </Badge>
      );
    default:
      return <Badge variant="outline">Student</Badge>;
  }
}

function AddUserDialog({ onAdd }: { onAdd: (user: any) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("admin");
  const [open, setOpen] = useState(false);

  const handleAdd = () => {
    if (!name || !email) {
      toast.error("Name and email are required");
      return;
    }
    onAdd({
      id: `${role}-${Date.now()}`,
      name,
      email,
      role,
      createdAt: new Date().toISOString().split("T")[0],
    });
    toast.success(`${name} added as ${role}`);
    setName("");
    setEmail("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleAdd}>Add User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditStudentDialog({
  student,
  tracks,
  onSave,
}: {
  student: any;
  tracks: any[];
  onSave: (data: any) => void;
}) {
  const [name, setName] = useState(student.name);
  const [trackId, setTrackId] = useState(student.enrolledTrackId ?? "");
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    onSave({ name, enrolledTrackId: trackId || undefined });
    toast.success("Student updated");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Student</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Enrolled Track</Label>
            <Select value={trackId} onValueChange={setTrackId}>
              <SelectTrigger>
                <SelectValue placeholder="Assign a track" />
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
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
