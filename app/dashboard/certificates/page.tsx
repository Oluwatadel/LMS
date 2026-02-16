"use client";

import { useRef } from "react";
import { useAuthStore, useLmsStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Lock } from "lucide-react";

export default function CertificatesPage() {
  const user = useAuthStore((s) => s.user);
  const { tracks, selectedTrackId, getTrackProgress, getCertificatesForStudent } =
    useLmsStore();

  if (!user) return null;

  const myCertificates = getCertificatesForStudent(user.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Certificates</h1>
        <p className="text-muted-foreground mt-1">
          {myCertificates.length > 0
            ? "View and download your earned certificates"
            : "Complete a track to earn your certificate"}
        </p>
      </div>

      {/* Issued certificates (downloadable) */}
      {myCertificates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Earned Certificates
          </h2>
          {myCertificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              certId={cert.id}
              studentName={cert.studentName}
              trackName={cert.trackName}
              issuedAt={cert.issuedAt}
            />
          ))}
        </div>
      )}

      {/* Track progress towards certificates */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Track Progress
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => {
            const progress = getTrackProgress(user.id, track.id);
            const isComplete = progress === 100;
            const hasCert = myCertificates.some(
              (c) => c.trackId === track.id
            );
            const isCurrentTrack = track.id === selectedTrackId;

            return (
              <Card
                key={track.id}
                className={hasCert ? "border-primary/30 bg-primary/5" : ""}
              >
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${
                      hasCert
                        ? "bg-primary/10 text-primary"
                        : isComplete
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {hasCert ? (
                      <Award className="h-8 w-8" />
                    ) : (
                      <Lock className="h-8 w-8" />
                    )}
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {track.name}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {hasCert
                      ? "Certificate issued - see above to download"
                      : isComplete
                      ? "Track complete! Certificate will be issued by admin."
                      : isCurrentTrack
                      ? `${progress}% completed - keep going!`
                      : progress > 0
                      ? `${progress}% completed`
                      : "Start this track to earn a certificate"}
                  </p>

                  {!hasCert && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="tabular-nums">{progress}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CertificateCard({
  certId,
  studentName,
  trackName,
  issuedAt,
}: {
  certId: string;
  studentName: string;
  trackName: string;
  issuedAt: string;
}) {
  const certRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    // Create a simple downloadable text certificate
    const certContent = `
======================================================
          CERTIFICATE OF COMPLETION
======================================================

  This certifies that

          ${studentName}

  has successfully completed the

          ${trackName}

  learning track on CodePath LMS.

  Certificate ID: ${certId}
  Issued: ${new Date(issuedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}

======================================================
        CodePath LMS - Learn to Code
======================================================
    `.trim();

    const blob = new Blob([certContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CodePath-Certificate-${trackName.replace(/\s+/g, "-")}-${studentName.replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      ref={certRef}
      className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-card p-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.05),transparent_70%)]" />
      <div className="relative flex flex-col items-center text-center">
        <Award className="h-12 w-12 text-primary" />
        <h3 className="mt-4 text-xl font-bold text-foreground">
          Certificate of Completion
        </h3>
        <p className="mt-2 text-muted-foreground">This certifies that</p>
        <p className="mt-1 text-lg font-semibold text-foreground">
          {studentName}
        </p>
        <p className="mt-2 text-muted-foreground">
          has successfully completed the
        </p>
        <p className="mt-1 text-lg font-semibold text-primary">{trackName}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          learning track on CodePath LMS
        </p>
        <div className="mt-4 flex items-center gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            ID: {certId}
          </p>
          <div className="h-3 w-px bg-border" />
          <p className="text-xs text-muted-foreground">
            Issued:{" "}
            {new Date(issuedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="mt-6 h-px w-32 bg-border" />
        <Button className="mt-4 gap-2" onClick={handleDownload}>
          <Download className="h-4 w-4" />
          Download Certificate
        </Button>
      </div>
    </div>
  );
}
