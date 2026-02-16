"use client";

import { useState } from "react";
import {
  useAuthStore,
  useLmsStore,
  useUserStore,
  usePermissionStore,
  usePaymentStore,
} from "@/lib/store";
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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  UserPlus,
  Trash2,
  Pencil,
  Award,
  Search,
  ShieldCheck,
  MoreHorizontal,
  BookOpen,
  UserMinus,
  CreditCard,
  Shield,
} from "lucide-react";
import type { Role, User, Track, PermissionGroup, Payment } from "@/lib/types";

export default function AdminStudentsPage() {
  const currentUser = useAuthStore((s) => s.user);
  const { users, addUser, updateUser, deleteUser, enrollStudentInTrack, removeStudentFromTrack, assignPermissionGroup } = useUserStore();
  const { tracks, getTrackProgress, issueCertificate, getCertificatesForStudent } = useLmsStore();
  const { permissionGroups, hasPermission } = usePermissionStore();
  const { payments, addPayment, getPaymentForEnrollment } = usePaymentStore();

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterTrack, setFilterTrack] = useState<string>("all");

  const isSuperAdmin = currentUser?.role === "superadmin";
  const canManageStudents =
    isSuperAdmin || (currentUser ? hasPermission(currentUser.id, "manage_students") : false);
  const canEnroll =
    isSuperAdmin || (currentUser ? hasPermission(currentUser.id, "enroll_students") : false);
  const canManageUsers =
    isSuperAdmin || (currentUser ? hasPermission(currentUser.id, "manage_users") : false);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const matchesTrack =
      filterTrack === "all" ||
      (filterTrack === "unassigned" ? !u.enrolledTrackId : u.enrolledTrackId === filterTrack);
    if (!isSuperAdmin && u.role === "superadmin") return false;
    return matchesSearch && matchesRole && matchesTrack;
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
        {(isSuperAdmin || canManageUsers) && (
          <AddUserDialog onAdd={addUser} permissionGroups={permissionGroups} />
        )}
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
        <Select value={filterTrack} onValueChange={setFilterTrack}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by track" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tracks</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {tracks.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">
            Students ({students.length})
          </TabsTrigger>
          <TabsTrigger value="staff">Staff ({staff.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <StudentTable
            students={students}
            tracks={tracks}
            payments={payments}
            getTrackProgress={getTrackProgress}
            getCertificatesForStudent={getCertificatesForStudent}
            issueCertificate={issueCertificate}
            updateUser={updateUser}
            deleteUser={deleteUser}
            enrollStudentInTrack={enrollStudentInTrack}
            removeStudentFromTrack={removeStudentFromTrack}
            addPayment={addPayment}
            getPaymentForEnrollment={getPaymentForEnrollment}
            canManageStudents={canManageStudents}
            canEnroll={canEnroll}
            currentUser={currentUser}
          />
        </TabsContent>

        <TabsContent value="staff">
          <StaffTable
            staff={staff}
            permissionGroups={permissionGroups}
            isSuperAdmin={isSuperAdmin}
            deleteUser={deleteUser}
            updateUser={updateUser}
            assignPermissionGroup={assignPermissionGroup}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Student Table
// ============================================================

function StudentTable({
  students,
  tracks,
  payments,
  getTrackProgress,
  getCertificatesForStudent,
  issueCertificate,
  updateUser,
  deleteUser,
  enrollStudentInTrack,
  removeStudentFromTrack,
  addPayment,
  getPaymentForEnrollment,
  canManageStudents,
  canEnroll,
  currentUser,
}: {
  students: User[];
  tracks: Track[];
  payments: Payment[];
  getTrackProgress: (studentId: string, trackId: string) => number;
  getCertificatesForStudent: (studentId: string) => any[];
  issueCertificate: (studentId: string, studentName: string, trackId: string, trackName: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  enrollStudentInTrack: (studentId: string, trackId: string) => void;
  removeStudentFromTrack: (studentId: string) => void;
  addPayment: (payment: Payment) => void;
  getPaymentForEnrollment: (studentId: string, trackId: string) => Payment | undefined;
  canManageStudents: boolean;
  canEnroll: boolean;
  currentUser: User | null;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-foreground">Student</TableHead>
            <TableHead className="text-foreground">Email</TableHead>
            <TableHead className="text-foreground">Track</TableHead>
            <TableHead className="text-foreground">Progress</TableHead>
            <TableHead className="text-foreground text-center">Payment</TableHead>
            <TableHead className="text-foreground text-center">Status</TableHead>
            <TableHead className="text-foreground text-center">Certs</TableHead>
            {canManageStudents && (
              <TableHead className="text-foreground text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={canManageStudents ? 8 : 7}
                className="text-center py-8 text-muted-foreground"
              >
                No students found
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => {
              const trackId = student.enrolledTrackId;
              const track = trackId ? tracks.find((t) => t.id === trackId) : null;
              const progress = trackId ? getTrackProgress(student.id, trackId) : 0;
              const certs = getCertificatesForStudent(student.id);
              const isComplete = progress === 100;
              const payment = trackId
                ? getPaymentForEnrollment(student.id, trackId)
                : undefined;

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
                    {track ? (
                      <Badge variant="outline" className="text-xs">
                        {track.name}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {trackId ? (
                      <div className="flex items-center gap-3">
                        <Progress value={progress} className="h-2 w-20" />
                        <span className="text-sm font-medium text-foreground tabular-nums">
                          {progress}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <PaymentBadge payment={payment} />
                  </TableCell>
                  <TableCell className="text-center">
                    {trackId ? (
                      isComplete ? (
                        <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          In Progress
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" className="text-xs text-muted-foreground">
                        No Track
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-foreground">
                    {certs.length}
                  </TableCell>
                  {canManageStudents && (
                    <TableCell className="text-right">
                      <StudentActions
                        student={student}
                        tracks={tracks}
                        track={track}
                        isComplete={isComplete}
                        certs={certs}
                        issueCertificate={issueCertificate}
                        updateUser={updateUser}
                        deleteUser={deleteUser}
                        enrollStudentInTrack={enrollStudentInTrack}
                        removeStudentFromTrack={removeStudentFromTrack}
                        addPayment={addPayment}
                        getPaymentForEnrollment={getPaymentForEnrollment}
                        canEnroll={canEnroll}
                        currentUser={currentUser}
                      />
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================================
// Student Actions Dropdown
// ============================================================

function StudentActions({
  student,
  tracks,
  track,
  isComplete,
  certs,
  issueCertificate,
  updateUser,
  deleteUser,
  enrollStudentInTrack,
  removeStudentFromTrack,
  addPayment,
  getPaymentForEnrollment,
  canEnroll,
  currentUser,
}: {
  student: User;
  tracks: Track[];
  track: Track | null | undefined;
  isComplete: boolean;
  certs: any[];
  issueCertificate: (sid: string, sn: string, tid: string, tn: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  enrollStudentInTrack: (sid: string, tid: string) => void;
  removeStudentFromTrack: (sid: string) => void;
  addPayment: (payment: Payment) => void;
  getPaymentForEnrollment: (sid: string, tid: string) => Payment | undefined;
  canEnroll: boolean;
  currentUser: User | null;
}) {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open student actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit Student
          </DropdownMenuItem>
          {canEnroll && !student.enrolledTrackId && (
            <DropdownMenuItem onSelect={() => setEnrollOpen(true)}>
              <BookOpen className="mr-2 h-3.5 w-3.5" />
              Enroll in Track
            </DropdownMenuItem>
          )}
          {canEnroll && student.enrolledTrackId && (
            <DropdownMenuItem
              onSelect={() => {
                removeStudentFromTrack(student.id);
                toast.success(`${student.name} removed from track`);
              }}
            >
              <UserMinus className="mr-2 h-3.5 w-3.5" />
              Remove from Track
            </DropdownMenuItem>
          )}
          {isComplete && certs.length === 0 && track && (
            <DropdownMenuItem
              onSelect={() => {
                issueCertificate(student.id, student.name, track.id, track.name);
                toast.success(`Certificate issued to ${student.name}`);
              }}
            >
              <Award className="mr-2 h-3.5 w-3.5" />
              Issue Certificate
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => {
              deleteUser(student.id);
              toast.success(`${student.name} removed`);
            }}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete Student
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Enroll Dialog */}
      <EnrollDialog
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
        student={student}
        tracks={tracks}
        enrollStudentInTrack={enrollStudentInTrack}
        addPayment={addPayment}
        getPaymentForEnrollment={getPaymentForEnrollment}
        currentUser={currentUser}
      />

      {/* Edit Dialog */}
      <EditStudentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        student={student}
        tracks={tracks}
        onSave={(data) => updateUser(student.id, data)}
      />
    </>
  );
}

// ============================================================
// Enroll Dialog (with payment handling)
// ============================================================

function EnrollDialog({
  open,
  onOpenChange,
  student,
  tracks,
  enrollStudentInTrack,
  addPayment,
  getPaymentForEnrollment,
  currentUser,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: User;
  tracks: Track[];
  enrollStudentInTrack: (sid: string, tid: string) => void;
  addPayment: (payment: Payment) => void;
  getPaymentForEnrollment: (sid: string, tid: string) => Payment | undefined;
  currentUser: User | null;
}) {
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "card" | "manual">("bank_transfer");
  const [markAsPaid, setMarkAsPaid] = useState(false);

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);
  const hasPrice = selectedTrack && (selectedTrack.price ?? 0) > 0;
  const existingPayment = selectedTrackId
    ? getPaymentForEnrollment(student.id, selectedTrackId)
    : undefined;

  const handleEnroll = () => {
    if (!selectedTrackId) {
      toast.error("Please select a track");
      return;
    }

    // If track has a price and no existing confirmed payment
    if (hasPrice && !existingPayment?.status?.includes("confirmed")) {
      const refCode = `PAY-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        studentId: student.id,
        studentName: student.name,
        trackId: selectedTrackId,
        trackName: selectedTrack!.name,
        amount: selectedTrack!.price!,
        currency: selectedTrack!.currency || "NGN",
        status: markAsPaid ? "confirmed" : "pending",
        paymentMethod,
        referenceCode: refCode,
        createdAt: new Date().toISOString().split("T")[0],
        ...(markAsPaid
          ? {
              confirmedBy: currentUser?.id,
              confirmedByName: currentUser?.name,
              confirmedAt: new Date().toISOString().split("T")[0],
            }
          : {}),
      };
      addPayment(newPayment);
    }

    enrollStudentInTrack(student.id, selectedTrackId);
    toast.success(
      `${student.name} enrolled in ${selectedTrack?.name}${
        hasPrice && !markAsPaid ? " (Payment pending)" : ""
      }`
    );
    onOpenChange(false);
    setSelectedTrackId("");
    setMarkAsPaid(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Enroll {student.name} in a Track
          </DialogTitle>
          <DialogDescription>
            Select a track to enroll the student. If the track has a fee, you can
            record payment or mark it as manually confirmed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Select Track</Label>
            <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a track" />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-2">
                      {t.name}
                      {(t.price ?? 0) > 0 && (
                        <span className="text-muted-foreground">
                          - {t.currency || "NGN"}{" "}
                          {(t.price ?? 0).toLocaleString()}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasPrice && (
            <>
              <div className="rounded-lg border border-border bg-muted/50 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">
                    Track Fee: {selectedTrack?.currency || "NGN"}{" "}
                    {(selectedTrack?.price ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {existingPayment?.status === "confirmed" ? (
                <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                  <p className="text-sm text-success font-medium">
                    Payment already confirmed (Ref: {existingPayment.referenceCode})
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(v) => setPaymentMethod(v as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="card">Card Payment</SelectItem>
                        <SelectItem value="manual">
                          Manual Confirmation
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={markAsPaid}
                      onChange={(e) => setMarkAsPaid(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">
                      Mark as payment confirmed (manually verified)
                    </span>
                  </label>
                </>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleEnroll}>Enroll Student</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Staff Table (with permission groups)
// ============================================================

function StaffTable({
  staff,
  permissionGroups,
  isSuperAdmin,
  deleteUser,
  updateUser,
  assignPermissionGroup,
}: {
  staff: User[];
  permissionGroups: PermissionGroup[];
  isSuperAdmin: boolean;
  deleteUser: (id: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  assignPermissionGroup: (userId: string, groupId: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-foreground">Name</TableHead>
            <TableHead className="text-foreground">Email</TableHead>
            <TableHead className="text-foreground">Role</TableHead>
            <TableHead className="text-foreground">Permission Group</TableHead>
            <TableHead className="text-foreground">Joined</TableHead>
            {isSuperAdmin && (
              <TableHead className="text-foreground text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isSuperAdmin ? 6 : 5}
                className="text-center py-8 text-muted-foreground"
              >
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
              const group = permissionGroups.find(
                (g) => g.id === member.permissionGroupId
              );

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
                  <TableCell>
                    {group ? (
                      <Badge
                        variant="outline"
                        className="gap-1 text-xs"
                      >
                        <Shield className="h-3 w-3" />
                        {group.label}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        None
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.createdAt ?? "N/A"}
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell className="text-right">
                      {member.role !== "superadmin" && (
                        <StaffActions
                          member={member}
                          permissionGroups={permissionGroups}
                          deleteUser={deleteUser}
                          updateUser={updateUser}
                          assignPermissionGroup={assignPermissionGroup}
                        />
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
  );
}

// ============================================================
// Staff Actions
// ============================================================

function StaffActions({
  member,
  permissionGroups,
  deleteUser,
  updateUser,
  assignPermissionGroup,
}: {
  member: User;
  permissionGroups: PermissionGroup[];
  deleteUser: (id: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  assignPermissionGroup: (userId: string, groupId: string) => void;
}) {
  const [permOpen, setPermOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open staff actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setPermOpen(true)}>
            <Shield className="mr-2 h-3.5 w-3.5" />
            Change Permission Group
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setRoleOpen(true)}>
            <ShieldCheck className="mr-2 h-3.5 w-3.5" />
            Change Role
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => {
              deleteUser(member.id);
              toast.success(`${member.name} removed`);
            }}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Permission Group Dialog */}
      <PermissionGroupDialog
        open={permOpen}
        onOpenChange={setPermOpen}
        member={member}
        permissionGroups={permissionGroups}
        assignPermissionGroup={assignPermissionGroup}
      />

      {/* Role Dialog */}
      <ChangeRoleDialog
        open={roleOpen}
        onOpenChange={setRoleOpen}
        member={member}
        updateUser={updateUser}
      />
    </>
  );
}

// ============================================================
// Permission Group Dialog
// ============================================================

function PermissionGroupDialog({
  open,
  onOpenChange,
  member,
  permissionGroups,
  assignPermissionGroup,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  member: User;
  permissionGroups: PermissionGroup[];
  assignPermissionGroup: (userId: string, groupId: string) => void;
}) {
  const [selectedGroup, setSelectedGroup] = useState(
    member.permissionGroupId || ""
  );

  const handleSave = () => {
    if (selectedGroup) {
      assignPermissionGroup(member.id, selectedGroup);
      const group = permissionGroups.find((g) => g.id === selectedGroup);
      toast.success(
        `${member.name} assigned to ${group?.label || "permission group"}`
      );
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Assign Permission Group
          </DialogTitle>
          <DialogDescription>
            Choose a permission group for {member.name}. This controls what
            sections and actions they can access.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {permissionGroups.map((group) => (
            <label
              key={group.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                selectedGroup === group.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <input
                type="radio"
                name="permGroup"
                value={group.id}
                checked={selectedGroup === group.id}
                onChange={() => setSelectedGroup(group.id)}
                className="mt-0.5 h-4 w-4 border-border text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {group.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {group.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {group.permissions.slice(0, 4).map((p) => (
                    <Badge key={p} variant="secondary" className="text-[10px]">
                      {p.replace(/_/g, " ")}
                    </Badge>
                  ))}
                  {group.permissions.length > 4 && (
                    <Badge variant="secondary" className="text-[10px]">
                      +{group.permissions.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Assign Group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Change Role Dialog
// ============================================================

function ChangeRoleDialog({
  open,
  onOpenChange,
  member,
  updateUser,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  member: User;
  updateUser: (id: string, data: Partial<User>) => void;
}) {
  const [newRole, setNewRole] = useState(member.role);

  const handleSave = () => {
    updateUser(member.id, { role: newRole });
    toast.success(`${member.name} role changed to ${newRole}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-foreground">Change Role</DialogTitle>
          <DialogDescription>
            Change the role for {member.name}. Current role:{" "}
            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Select value={newRole} onValueChange={(v) => setNewRole(v as Role)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="mentor">Mentor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Helper Components
// ============================================================

function PaymentBadge({ payment }: { payment: Payment | undefined }) {
  if (!payment) {
    return (
      <Badge variant="outline" className="text-[10px] text-muted-foreground">
        N/A
      </Badge>
    );
  }
  switch (payment.status) {
    case "confirmed":
      return (
        <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/10 text-[10px]">
          Paid
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-warning/10 text-warning border-warning/20 hover:bg-warning/10 text-[10px]">
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10 text-[10px]">
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px]">
          {payment.status}
        </Badge>
      );
  }
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

function AddUserDialog({
  onAdd,
  permissionGroups,
}: {
  onAdd: (user: User) => void;
  permissionGroups: PermissionGroup[];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("admin");
  const [permGroupId, setPermGroupId] = useState("");
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
      permissionGroupId: permGroupId || undefined,
    });
    toast.success(`${name} added as ${role}`);
    setName("");
    setEmail("");
    setPermGroupId("");
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
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
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
          {role !== "student" && (
            <div className="space-y-2">
              <Label>Permission Group</Label>
              <Select value={permGroupId} onValueChange={setPermGroupId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select permissions" />
                </SelectTrigger>
                <SelectContent>
                  {permissionGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
  open,
  onOpenChange,
  student,
  tracks,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student: User;
  tracks: Track[];
  onSave: (data: Partial<User>) => void;
}) {
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);

  const handleSave = () => {
    onSave({ name, email });
    toast.success("Student updated");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
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
