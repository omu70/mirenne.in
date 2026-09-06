"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContentStore } from "@/lib/store/content-store";
import { useMounted } from "@/lib/hooks/use-mounted";
import { linksToText, textToLinks, type NavColumn } from "@/lib/data/navigation";

/**
 * Edits the site's navigation: the header row and the footer link columns.
 *
 * Links are edited as text, one "Label | /href" per line — delete a line to
 * remove that link, add a line to add one, move a line to reorder. It's a
 * deliberate trade against a row-per-link builder: far less code, and a menu
 * is reordered by dragging lines around just as happily. Footer columns get
 * real add/remove buttons because a whole column is a bigger unit than a line.
 */

const LINK_HINT = "One per line: Label | /href — delete a line to remove that link, add one to add it.";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-graphite">{hint}</p>}
    </div>
  );
}

function HeaderTab() {
  const nav = useContentStore((s) => s.navigation);
  const updateNavigation = useContentStore((s) => s.updateNavigation);
  const [text, setText] = React.useState(linksToText(nav.headerLinks));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateNavigation({ headerLinks: textToLinks(text) });
    toast.success("Header menu updated.");
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5">
      <Field label="Header Links" hint={LINK_HINT}>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} className="font-mono text-xs" />
      </Field>
      <p className="text-xs text-graphite">
        Top to bottom here is left to right on the site. An empty list leaves the header with just the logo and the
        search, account, wishlist and bag icons.
      </p>
      <Button type="submit" variant="primary" size="md">
        Save Header
      </Button>
    </form>
  );
}

function FooterTab() {
  const nav = useContentStore((s) => s.navigation);
  const updateNavigation = useContentStore((s) => s.updateNavigation);

  const [columns, setColumns] = React.useState(
    nav.footerColumns.map((c) => ({ title: c.title, links: linksToText(c.links) }))
  );

  const setColumn = (i: number, patch: Partial<{ title: string; links: string }>) =>
    setColumns((c) => c.map((col, n) => (n === i ? { ...col, ...patch } : col)));

  const addColumn = () => setColumns((c) => [...c, { title: "New Column", links: "" }]);
  const removeColumn = (i: number) => setColumns((c) => c.filter((_, n) => n !== i));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const footerColumns: NavColumn[] = columns
      .map((c) => ({ title: c.title.trim(), links: textToLinks(c.links) }))
      .filter((c) => c.title || c.links.length > 0);
    updateNavigation({ footerColumns });
    toast.success(
      footerColumns.length === 1 ? "Footer updated — 1 column." : `Footer updated — ${footerColumns.length} columns.`
    );
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-6">
      {columns.length === 0 && (
        <p className="border border-dashed border-hairline-dark px-5 py-8 text-center text-sm text-graphite">
          No footer columns. Add one below, or save as-is to leave the footer with just the logo and standfirst.
        </p>
      )}

      {columns.map((col, i) => (
        <div key={i} className="space-y-4 border border-hairline p-5">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Field label={`Column ${i + 1} — Heading`}>
                <Input value={col.title} onChange={(e) => setColumn(i, { title: e.target.value })} />
              </Field>
            </div>
            <button
              type="button"
              onClick={() => removeColumn(i)}
              aria-label={`Remove column ${i + 1}`}
              className="mb-1 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border border-hairline-dark text-graphite transition-colors hover:border-ink hover:text-ink"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.25} />
            </button>
          </div>
          <Field label="Links" hint={LINK_HINT}>
            <Textarea
              value={col.links}
              onChange={(e) => setColumn(i, { links: e.target.value })}
              rows={5}
              className="font-mono text-xs"
            />
          </Field>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={addColumn}
          className="label-luxury link-underline flex cursor-pointer items-center gap-2 text-graphite hover:text-ink"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
          Add Column
        </button>
      </div>

      <Button type="submit" variant="primary" size="md">
        Save Footer
      </Button>
    </form>
  );
}

export default function AdminMenuPage() {
  const mounted = useMounted();
  const resetNavigation = useContentStore((s) => s.resetNavigation);

  if (!mounted) return null;

  const handleReset = () => {
    if (window.confirm("Reset the header and footer links back to the defaults?")) {
      resetNavigation();
      toast.success("Navigation reset.");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Menu"
        description="Add, rename, reorder and remove the header links and the footer link columns."
        action={
          <button
            onClick={handleReset}
            className="label-luxury link-underline flex cursor-pointer items-center gap-2 text-graphite hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
            Reset Menu
          </button>
        }
      />

      <Tabs defaultValue="header">
        <TabsList>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>
        <TabsContent value="header">
          <HeaderTab />
        </TabsContent>
        <TabsContent value="footer">
          <FooterTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
