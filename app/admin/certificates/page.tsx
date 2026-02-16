"use client";

import { useState, useRef, useCallback } from "react";
import { useLmsStore, useUserStore, useCertificateTemplateStore } from "@/lib/store";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Award,
  Trash2,
  Plus,
  Search,
  Upload,
  Image as ImageIcon,
  Star,
  Eye,
} from "lucide-react";
import type { CertificateTemplate, CertificateTextField } from "@/lib/types";

export default function AdminCertificatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Certificates</h1>
        <p className="text-muted-foreground mt-1">
          Manage certificate templates, issue and revoke certificates
        </p>
      </div>

      <Tabs defaultValue="certificates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="certificates">Issued Certificates</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates">
          <IssuedCertificatesSection />
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManagementSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================
// Issued Certificates Section
// ============================================================

function IssuedCertificatesSection() {
  const {
    certificates,
    tracks,
    issueCertificate,
    revokeCertificate,
    getTrackProgress,
  } = useLmsStore();
  const { users } = useUserStore();
  const { templates } = useCertificateTemplateStore();
  const [search, setSearch] = useState("");

  const students = users.filter((u) => u.role === "student");

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

  const filteredCerts = certificates.filter(
    (c) =>
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.trackName.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student, track, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <IssueCertDialog
          students={students}
          tracks={tracks}
          templates={templates}
          onIssue={issueCertificate}
        />
      </div>

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

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Student</TableHead>
              <TableHead className="text-foreground">Track</TableHead>
              <TableHead className="text-foreground">Issued Date</TableHead>
              <TableHead className="text-foreground">Certificate ID</TableHead>
              <TableHead className="text-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCerts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
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

// ============================================================
// Template Management Section
// ============================================================

function TemplateManagementSection() {
  const { templates, addTemplate, deleteTemplate, setDefaultTemplate } =
    useCertificateTemplateStore();
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage certificate background templates with text overlay positions.
        </p>
        <Button className="gap-2" onClick={() => setShowUpload(true)}>
          <Upload className="h-4 w-4" />
          Upload Template
        </Button>
      </div>

      {showUpload && (
        <TemplateUploadCard
          onSave={(template) => {
            addTemplate(template);
            setShowUpload(false);
            toast.success("Template saved");
          }}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {/* Template Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onDelete={() => {
              deleteTemplate(template.id);
              toast.success("Template deleted");
            }}
            onSetDefault={() => {
              setDefaultTemplate(template.id);
              toast.success(`"${template.name}" set as default`);
            }}
          />
        ))}
        {templates.length === 0 && !showUpload && (
          <Card className="col-span-full border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                No templates yet. Upload a background image to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Template Upload Card
// ============================================================

const defaultTextFields: CertificateTextField[] = [
  {
    key: "studentName",
    label: "Student Name",
    x: 50,
    y: 42,
    fontSize: 32,
    fontColor: "#1a1a2e",
    fontWeight: "bold",
  },
  {
    key: "trackName",
    label: "Track Name",
    x: 50,
    y: 55,
    fontSize: 20,
    fontColor: "#16a34a",
    fontWeight: "normal",
  },
  {
    key: "issueDate",
    label: "Issue Date",
    x: 50,
    y: 68,
    fontSize: 14,
    fontColor: "#6b7280",
    fontWeight: "normal",
  },
  {
    key: "certificateId",
    label: "Certificate ID",
    x: 50,
    y: 78,
    fontSize: 12,
    fontColor: "#9ca3af",
    fontWeight: "normal",
  },
];

function TemplateUploadCard({
  onSave,
  onCancel,
}: {
  onSave: (template: CertificateTemplate) => void;
  onCancel: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [bgImage, setBgImage] = useState("");
  const [textFields, setTextFields] =
    useState<CertificateTextField[]>(defaultTextFields);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState(0);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG, JPG)");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBgImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const updateField = (
    index: number,
    updates: Partial<CertificateTextField>
  ) => {
    setTextFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!bgImage) {
      toast.error("Please upload a background image");
      return;
    }
    onSave({
      id: `tpl-${Date.now()}`,
      name: name.trim(),
      backgroundImageUrl: bgImage,
      textFields,
      isDefault: false,
      createdAt: new Date().toISOString().split("T")[0],
    });
  };

  const selectedField = textFields[selectedFieldIndex];

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Upload New Template</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template name */}
        <div className="space-y-2">
          <Label>Template Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Completion Certificate 2024"
          />
        </div>

        {/* Image upload */}
        <div className="space-y-2">
          <Label>Background Image</Label>
          <div
            className="relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 transition-colors hover:border-primary/50 hover:bg-muted/50"
            onClick={() => fileInputRef.current?.click()}
          >
            {bgImage ? (
              <p className="text-sm text-primary font-medium">
                Image uploaded - click to replace
              </p>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload PNG or JPG
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-2">
          <Label>Live Preview</Label>
          <div
            className="relative w-full overflow-hidden rounded-lg border border-border"
            style={{ aspectRatio: "16/10" }}
          >
            {bgImage ? (
              <img
                src={bgImage}
                alt="Certificate background"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <p className="text-sm text-muted-foreground">
                  Upload an image to preview
                </p>
              </div>
            )}
            {/* Overlay text fields */}
            {textFields.map((field, idx) => (
              <div
                key={field.key}
                className={`absolute cursor-pointer select-none transition-all ${
                  selectedFieldIndex === idx
                    ? "ring-2 ring-primary ring-offset-1 rounded"
                    : ""
                }`}
                style={{
                  left: `${field.x}%`,
                  top: `${field.y}%`,
                  transform: "translate(-50%, -50%)",
                  fontSize: `${Math.max(field.fontSize * 0.5, 8)}px`,
                  color: field.fontColor,
                  fontWeight: field.fontWeight,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
                onClick={() => setSelectedFieldIndex(idx)}
              >
                {field.key === "studentName"
                  ? "John Doe"
                  : field.key === "trackName"
                  ? "JavaScript Fundamentals"
                  : field.key === "issueDate"
                  ? "January 15, 2025"
                  : "CERT-2025-001"}
              </div>
            ))}
          </div>
        </div>

        {/* Text Field Editor */}
        <div className="space-y-3">
          <Label>Text Field Settings</Label>
          <div className="flex flex-wrap gap-2">
            {textFields.map((field, idx) => (
              <Button
                key={field.key}
                size="sm"
                variant={selectedFieldIndex === idx ? "default" : "outline"}
                onClick={() => setSelectedFieldIndex(idx)}
                className="text-xs"
              >
                {field.label}
              </Button>
            ))}
          </div>

          {selectedField && (
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4">
              <div className="space-y-2">
                <Label className="text-xs">X Position (%)</Label>
                <Slider
                  value={[selectedField.x]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) =>
                    updateField(selectedFieldIndex, { x: v })
                  }
                />
                <span className="text-xs text-muted-foreground tabular-nums">
                  {selectedField.x}%
                </span>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Y Position (%)</Label>
                <Slider
                  value={[selectedField.y]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) =>
                    updateField(selectedFieldIndex, { y: v })
                  }
                />
                <span className="text-xs text-muted-foreground tabular-nums">
                  {selectedField.y}%
                </span>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Font Size</Label>
                <Slider
                  value={[selectedField.fontSize]}
                  min={8}
                  max={64}
                  step={1}
                  onValueChange={([v]) =>
                    updateField(selectedFieldIndex, { fontSize: v })
                  }
                />
                <span className="text-xs text-muted-foreground tabular-nums">
                  {selectedField.fontSize}px
                </span>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Font Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedField.fontColor}
                    onChange={(e) =>
                      updateField(selectedFieldIndex, {
                        fontColor: e.target.value,
                      })
                    }
                    className="h-8 w-8 cursor-pointer rounded border-0"
                  />
                  <Input
                    value={selectedField.fontColor}
                    onChange={(e) =>
                      updateField(selectedFieldIndex, {
                        fontColor: e.target.value,
                      })
                    }
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-xs">Font Weight</Label>
                <Select
                  value={selectedField.fontWeight}
                  onValueChange={(v) =>
                    updateField(selectedFieldIndex, {
                      fontWeight: v as "normal" | "bold",
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Template</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Template Card
// ============================================================

function TemplateCard({
  template,
  onDelete,
  onSetDefault,
}: {
  template: CertificateTemplate;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <Card className="border-border overflow-hidden">
        <div
          className="relative h-40 bg-gradient-to-br from-muted to-muted/50 cursor-pointer"
          onClick={() => setPreviewOpen(true)}
        >
          {template.backgroundImageUrl ? (
            <img
              src={template.backgroundImageUrl}
              alt={template.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Award className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          {template.isDefault && (
            <div className="absolute top-2 right-2">
              <Badge className="gap-1 bg-primary text-primary-foreground text-[10px]">
                <Star className="h-3 w-3" />
                Default
              </Badge>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-opacity hover:bg-foreground/10 hover:opacity-100">
            <Eye className="h-6 w-6 text-background" />
          </div>
        </div>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">
                {template.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {template.textFields.length} text fields - Created{" "}
                {template.createdAt}
              </p>
            </div>
            <div className="flex gap-1">
              {!template.isDefault && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1"
                  onClick={onSetDefault}
                >
                  <Star className="h-3 w-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {template.name} - Preview
            </DialogTitle>
          </DialogHeader>
          <div
            className="relative w-full overflow-hidden rounded-lg border border-border"
            style={{ aspectRatio: "16/10" }}
          >
            {template.backgroundImageUrl ? (
              <img
                src={template.backgroundImageUrl}
                alt={template.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <Award className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
            {template.textFields.map((field) => (
              <div
                key={field.key}
                className="absolute select-none"
                style={{
                  left: `${field.x}%`,
                  top: `${field.y}%`,
                  transform: "translate(-50%, -50%)",
                  fontSize: `${Math.max(field.fontSize * 0.6, 10)}px`,
                  color: field.fontColor,
                  fontWeight: field.fontWeight,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                }}
              >
                {field.key === "studentName"
                  ? "John Doe"
                  : field.key === "trackName"
                  ? "JavaScript Fundamentals"
                  : field.key === "issueDate"
                  ? "January 15, 2025"
                  : "CERT-2025-001"}
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================================
// Issue Certificate Dialog (with template selection)
// ============================================================

function IssueCertDialog({
  students,
  tracks,
  templates,
  onIssue,
}: {
  students: any[];
  tracks: any[];
  templates: CertificateTemplate[];
  onIssue: (
    studentId: string,
    studentName: string,
    trackId: string,
    trackName: string
  ) => void;
}) {
  const [studentId, setStudentId] = useState("");
  const [trackId, setTrackId] = useState("");
  const [templateId, setTemplateId] = useState("");
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
      setTemplateId("");
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
          <DialogTitle className="text-foreground">
            Issue Certificate
          </DialogTitle>
          <DialogDescription>
            Select a student and track to issue a certificate.
          </DialogDescription>
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
          {templates.length > 0 && (
            <div className="space-y-2">
              <Label>Template (optional)</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Use default template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                      {t.isDefault ? " (Default)" : ""}
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
          <Button onClick={handleIssue}>Issue Certificate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
