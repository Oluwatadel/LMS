"use client";

import { useState } from "react";
import { useAuthStore, usePaymentStore } from "@/lib/store";
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
import { Card, CardContent } from "@/components/ui/card";
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
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  CreditCard,
  Eye,
} from "lucide-react";
import type { Payment } from "@/lib/types";

export default function AdminPaymentsPage() {
  const currentUser = useAuthStore((s) => s.user);
  const { payments, confirmPayment, getPendingPayments, getTotalRevenue } =
    usePaymentStore();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const pendingPayments = getPendingPayments();
  const totalRevenue = getTotalRevenue();
  const confirmedCount = payments.filter(
    (p) => p.status === "confirmed"
  ).length;

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.referenceCode.toLowerCase().includes(search.toLowerCase()) ||
      p.trackName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Payment Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Track and confirm student payments for track enrollment
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold text-foreground tabular-nums">
                NGN {totalRevenue.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Pending Payments
              </p>
              <p className="text-xl font-bold text-foreground tabular-nums">
                {pendingPayments.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Confirmed Payments
              </p>
              <p className="text-xl font-bold text-foreground tabular-nums">
                {confirmedCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student, reference code, or track..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-foreground">Student</TableHead>
              <TableHead className="text-foreground">Track</TableHead>
              <TableHead className="text-foreground text-right">
                Amount
              </TableHead>
              <TableHead className="text-foreground text-center">
                Method
              </TableHead>
              <TableHead className="text-foreground text-center">
                Status
              </TableHead>
              <TableHead className="text-foreground">Reference</TableHead>
              <TableHead className="text-foreground">Date</TableHead>
              <TableHead className="text-foreground">Confirmed By</TableHead>
              <TableHead className="text-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  onConfirm={() => {
                    if (currentUser) {
                      confirmPayment(
                        payment.id,
                        currentUser.id,
                        currentUser.name
                      );
                      toast.success(
                        `Payment confirmed for ${payment.studentName}`
                      );
                    }
                  }}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function PaymentRow({
  payment,
  onConfirm,
}: {
  payment: Payment;
  onConfirm: () => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell className="font-medium text-foreground">
          {payment.studentName}
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="text-xs">
            {payment.trackName}
          </Badge>
        </TableCell>
        <TableCell className="text-right font-medium text-foreground tabular-nums">
          {payment.currency} {payment.amount.toLocaleString()}
        </TableCell>
        <TableCell className="text-center">
          <PaymentMethodBadge method={payment.paymentMethod} />
        </TableCell>
        <TableCell className="text-center">
          <PaymentStatusBadge status={payment.status} />
        </TableCell>
        <TableCell>
          <code className="text-xs text-muted-foreground font-mono">
            {payment.referenceCode}
          </code>
        </TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {payment.createdAt}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {payment.confirmedByName ?? "--"}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => setDetailOpen(true)}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="sr-only">View details</span>
            </Button>
            {payment.status === "pending" && (
              <Button
                size="sm"
                variant="default"
                className="h-8 gap-1 text-xs"
                onClick={onConfirm}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Confirm
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>

      {/* Payment Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Payment Details
            </DialogTitle>
            <DialogDescription>
              Reference: {payment.referenceCode}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Student" value={payment.studentName} />
              <DetailItem label="Track" value={payment.trackName} />
              <DetailItem
                label="Amount"
                value={`${payment.currency} ${payment.amount.toLocaleString()}`}
              />
              <DetailItem
                label="Method"
                value={payment.paymentMethod.replace("_", " ")}
              />
              <DetailItem label="Status" value={payment.status} />
              <DetailItem label="Created" value={payment.createdAt} />
              {payment.confirmedByName && (
                <DetailItem
                  label="Confirmed By"
                  value={payment.confirmedByName}
                />
              )}
              {payment.confirmedAt && (
                <DetailItem
                  label="Confirmed At"
                  value={payment.confirmedAt}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            {payment.status === "pending" && (
              <Button
                onClick={() => {
                  onConfirm();
                  setDetailOpen(false);
                }}
              >
                Confirm Payment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground capitalize">{value}</p>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "confirmed":
      return (
        <Badge className="gap-1 bg-success/10 text-success border-success/20 hover:bg-success/10 text-[10px]">
          <CheckCircle2 className="h-3 w-3" />
          Confirmed
        </Badge>
      );
    case "pending":
      return (
        <Badge className="gap-1 bg-warning/10 text-warning border-warning/20 hover:bg-warning/10 text-[10px]">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "failed":
      return (
        <Badge className="gap-1 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/10 text-[10px]">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px]">
          {status}
        </Badge>
      );
  }
}

function PaymentMethodBadge({ method }: { method: string }) {
  switch (method) {
    case "bank_transfer":
      return (
        <Badge variant="secondary" className="text-[10px]">
          Bank Transfer
        </Badge>
      );
    case "card":
      return (
        <Badge variant="secondary" className="text-[10px] gap-1">
          <CreditCard className="h-3 w-3" />
          Card
        </Badge>
      );
    case "manual":
      return (
        <Badge variant="outline" className="text-[10px]">
          Manual
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px]">
          {method}
        </Badge>
      );
  }
}
