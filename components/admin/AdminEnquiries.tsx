"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Mail, MessageCircle, Phone, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type Status = "NEW" | "CONTACTED" | "SCHEDULED" | "CLOSED";
type Item = {
  id: string;
  kind: "APPOINTMENT" | "CONTACT";
  parentName: string;
  phone: string;
  email: string | null;
  childName: string | null;
  childAge: string | null;
  service: string | null;
  requestType: string | null;
  preferredDate: string | null;
  message: string | null;
  locale: string;
  status: Status;
  adminNotes: string;
  createdAt: string;
};

const STATUSES: Status[] = ["NEW", "CONTACTED", "SCHEDULED", "CLOSED"];
const LABEL: Record<Status, string> = { NEW: "New", CONTACTED: "Contacted", SCHEDULED: "Scheduled", CLOSED: "Closed" };
const TONE: Record<Status, string> = {
  NEW: "bg-primary/10 text-primary",
  CONTACTED: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  SCHEDULED: "bg-green-500/15 text-green-700 dark:text-green-400",
  CLOSED: "bg-muted text-muted-foreground",
};

const waLink = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  const intl = d.startsWith("880") ? d : d.startsWith("0") ? `88${d}` : d;
  return `https://wa.me/${intl}`;
};

export default function AdminEnquiries() {
  const [items, setItems] = useState<Item[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<Status | "ALL">("ALL");
  const [kind, setKind] = useState<"ALL" | "APPOINTMENT" | "CONTACT">("ALL");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Item | null>(null);

  const load = useCallback(async () => {
    const sp = new URLSearchParams();
    if (status !== "ALL") sp.set("status", status);
    if (kind !== "ALL") sp.set("kind", kind);
    if (q.trim()) sp.set("q", q.trim());
    try {
      const res = await fetch(`/api/admin/enquiries?${sp}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const j = await res.json();
      setItems(j.items);
      setCounts(j.counts);
    } catch {
      toast.error("Could not load requests");
    } finally {
      setLoading(false);
    }
  }, [status, kind, q]);

  useEffect(() => {
    const t = setTimeout(load, q ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  useEffect(() => {
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  async function patch(id: string, data: { status?: Status; adminNotes?: string }) {
    const res = await fetch("/api/admin/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    if (!res.ok) return toast.error("Could not save");
    setItems((all) => all.map((i) => (i.id === id ? { ...i, ...data } : i)));
    toast.success("Saved");
    if (data.status) void load();
  }

  async function remove(item: Item) {
    const res = await fetch(`/api/admin/enquiries?id=${item.id}`, { method: "DELETE" });
    setToDelete(null);
    if (!res.ok) return toast.error("Could not delete");
    setItems((all) => all.filter((i) => i.id !== item.id));
    toast.success("Deleted");
    void load();
  }

  const chip = (active: boolean) =>
    cn(
      "rounded-full px-3 py-1.5 text-xs font-semibold transition",
      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Appointments & messages</h1>
        <p className="text-sm text-muted-foreground">Everything submitted from the Appointment and Contact pages.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(status === s ? "ALL" : s)}
            className={cn("rounded-2xl border border-border bg-card p-4 text-start shadow-sm transition hover:-translate-y-0.5", status === s && "ring-2 ring-primary")}
          >
            <p className="text-xs font-semibold text-muted-foreground">{LABEL[s]}</p>
            <p className="mt-1 text-2xl font-extrabold">{counts[s] ?? 0}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, email, message…"
            className="h-10 w-full rounded-lg border border-input bg-card ps-9 pe-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
          />
        </div>
        {(["ALL", "APPOINTMENT", "CONTACT"] as const).map((k) => (
          <button key={k} onClick={() => setKind(k)} className={chip(kind === k)}>
            {k === "ALL" ? "All" : k === "APPOINTMENT" ? "Appointments" : "Messages"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nothing here yet. New appointment requests will show up as soon as someone submits the form.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.id} className="rounded-2xl border border-border bg-card shadow-sm">
              <button className="flex w-full flex-wrap items-center gap-3 p-4 text-start" onClick={() => setOpen(open === i.id ? null : i.id)}>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", TONE[i.status])}>{LABEL[i.status]}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {i.parentName}
                    {i.childName ? <span className="font-normal text-muted-foreground"> · child: {i.childName}{i.childAge ? ` (${i.childAge})` : ""}</span> : null}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {i.kind === "APPOINTMENT" ? `${i.requestType ?? "Appointment"}${i.service ? ` · ${i.service}` : ""}` : "Contact message"} ·{" "}
                    {new Date(i.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} · {i.locale.toUpperCase()}
                  </span>
                </span>
                {i.preferredDate && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="size-3.5" /> {i.preferredDate}
                  </span>
                )}
              </button>

              {open === i.id && (
                <div className="space-y-4 border-t border-border p-4">
                  <div className="flex flex-wrap gap-2">
                    <a href={`tel:${i.phone}`} className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/70">
                      <Phone className="size-4" /> {i.phone}
                    </a>
                    <a href={waLink(i.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-green-500/15 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-500/25 dark:text-green-400">
                      <MessageCircle className="size-4" /> WhatsApp
                    </a>
                    {i.email && (
                      <a href={`mailto:${i.email}`} className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-sm font-medium hover:bg-muted/70">
                        <Mail className="size-4" /> {i.email}
                      </a>
                    )}
                  </div>
                  {i.message && <p className="whitespace-pre-wrap rounded-xl bg-muted/50 p-3 text-sm">{i.message}</p>}

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Status</span>
                    {STATUSES.map((s) => (
                      <button key={s} onClick={() => patch(i.id, { status: s })} className={chip(i.status === s)}>
                        {LABEL[s]}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground" htmlFor={`n-${i.id}`}>
                      Internal notes
                    </label>
                    <textarea
                      id={`n-${i.id}`}
                      rows={3}
                      value={notes[i.id] ?? i.adminNotes}
                      onChange={(e) => setNotes((n) => ({ ...n, [i.id]: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-background p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
                    />
                    <div className="flex justify-between">
                      <Button size="sm" disabled={(notes[i.id] ?? i.adminNotes) === i.adminNotes} onClick={() => patch(i.id, { adminNotes: notes[i.id] ?? "" })}>
                        Save notes
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setToDelete(i)}>
                        <Trash2 /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this request?</AlertDialogTitle>
            <AlertDialogDescription>{toDelete?.parentName}’s request will be removed permanently.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => toDelete && remove(toDelete)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
