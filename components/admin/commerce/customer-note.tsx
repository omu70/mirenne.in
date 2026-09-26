"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export function CustomerNote({ id, initial }: { id: string; initial: string }) {
  const router = useRouter();
  const [note, setNote] = React.useState(initial);
  const [busy, setBusy] = React.useState(false);

  const save = async () => {
    setBusy(true);
    const res = await fetch(`/api/admin/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      toast.success("Note saved.");
      router.refresh();
    } else toast.error("Couldn't save the note.");
  };

  return (
    <section className="border border-hairline bg-paper p-6">
      <p className="label-luxury mb-1 text-ink">Notes</p>
      <p className="mb-3 text-xs text-graphite">Measurements, preferences, sizes — only visible in admin.</p>
      <Textarea rows={5} value={note} onChange={(e) => setNote(e.target.value)} />
      <Button variant="secondary" size="sm" className="mt-3" disabled={busy || note === initial} onClick={save}>
        Save Note
      </Button>
    </section>
  );
}
