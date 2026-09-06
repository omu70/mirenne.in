"use client";

import * as React from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContentStore } from "@/lib/store/content-store";
import { useMounted } from "@/lib/hooks/use-mounted";
import { linksToText, textToLinks, textToList, type NavColumn } from "@/lib/data/navigation";

/**
 * Edits every link and heading in the site's navigation — the header bar, the
 * Shop mega menu (which is also the mobile Shop accordion), and the footer
 * columns.
 *
 * Link lists are edited as text, one "Label | /href" per line, the same shape
 * the product form uses for colours and images. It's a deliberate trade: a
 * row-per-link builder looks tidier but is far more code, and a menu is
 * reordered by dragging lines around in a textarea just as happily.
 */

const LINK_HINT = 'One per line: Label | /href';

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
    const headerLinks = textToLinks(text);
    if (headerLinks.length === 0) {
      toast.error("Keep at least one header link.");
      return;
    }
    updateNavigation({ headerLinks });
    toast.success("Header menu updated.");
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5">
      <Field
        label="Header Links"
        hint='One per line: Label | /href. Add " | menu" to the entry that should open the Shop mega menu instead of navigating — that one is skipped in the mobile list, where the Shop accordion covers it.'
      >
        <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={7} className="font-mono text-xs" />
      </Field>
      <p className="text-xs text-graphite">
        Order here is the order on the site, left to right.
      </p>
      <Button type="submit" variant="primary" size="md">
        Save Header
      </Button>
    </form>
  );
}

function ShopMenuTab() {
  const nav = useContentStore((s) => s.navigation);
  const updateNavigation = useContentStore((s) => s.updateNavigation);

  const [collectionsTitle, setCollectionsTitle] = React.useState(nav.collectionsTitle);
  const [categoriesTitle, setCategoriesTitle] = React.useState(nav.categoriesTitle);
  const [categories, setCategories] = React.useState(nav.categories.join("\n"));
  const [editTitle, setEditTitle] = React.useState(nav.editTitle);
  const [editLinks, setEditLinks] = React.useState(linksToText(nav.editLinks));
  const [helpTitle, setHelpTitle] = React.useState(nav.helpTitle);
  const [helpLinks, setHelpLinks] = React.useState(linksToText(nav.helpLinks));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateNavigation({
      collectionsTitle: collectionsTitle.trim(),
      categoriesTitle: categoriesTitle.trim(),
      categories: textToList(categories),
      editTitle: editTitle.trim(),
      editLinks: textToLinks(editLinks),
      helpTitle: helpTitle.trim(),
      helpLinks: textToLinks(helpLinks),
    });
    toast.success("Shop menu updated.");
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5">
      <Field label="Collections Column — Heading" hint="The collection list itself comes from Collections.">
        <Input value={collectionsTitle} onChange={(e) => setCollectionsTitle(e.target.value)} />
      </Field>

      <Field label="Categories Column — Heading">
        <Input value={categoriesTitle} onChange={(e) => setCategoriesTitle(e.target.value)} />
      </Field>
      <Field
        label="Categories"
        hint="One per line. Each links to Shop filtered by that category — the text has to match a product's category exactly to return anything."
      >
        <Textarea value={categories} onChange={(e) => setCategories(e.target.value)} rows={8} className="font-mono text-xs" />
      </Field>

      <Field label="Edit Column — Heading">
        <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
      </Field>
      <Field label="Edit Column — Links" hint={LINK_HINT}>
        <Textarea value={editLinks} onChange={(e) => setEditLinks(e.target.value)} rows={5} className="font-mono text-xs" />
      </Field>

      <Field label="Help Block — Heading" hint="Leave the links empty to hide this block entirely.">
        <Input value={helpTitle} onChange={(e) => setHelpTitle(e.target.value)} />
      </Field>
      <Field label="Help Block — Links" hint={LINK_HINT}>
        <Textarea value={helpLinks} onChange={(e) => setHelpLinks(e.target.value)} rows={3} className="font-mono text-xs" />
      </Field>

      <Button type="submit" variant="primary" size="md">
        Save Shop Menu
      </Button>
    </form>
  );
}

function FooterTab() {
  const nav = useContentStore((s) => s.navigation);
  const updateNavigation = useContentStore((s) => s.updateNavigation);

  // Three slots, matching the footer's three-column grid. A slot left blank is
  // dropped rather than rendered as an empty column.
  const initial = [0, 1, 2].map((i) => ({
    title: nav.footerColumns[i]?.title ?? "",
    links: linksToText(nav.footerColumns[i]?.links ?? []),
  }));
  const [columns, setColumns] = React.useState(initial);

  const setColumn = (i: number, patch: Partial<{ title: string; links: string }>) =>
    setColumns((c) => c.map((col, n) => (n === i ? { ...col, ...patch } : col)));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const footerColumns: NavColumn[] = columns
      .map((c) => ({ title: c.title.trim(), links: textToLinks(c.links) }))
      .filter((c) => c.title || c.links.length > 0);
    updateNavigation({ footerColumns });
    toast.success("Footer menu updated.");
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-8">
      {columns.map((col, i) => (
        <div key={i} className="space-y-4 border-b border-hairline pb-8 last:border-b-0">
          <Field label={`Column ${i + 1} — Heading`} hint={i === 2 ? "Clear both fields to drop this column." : undefined}>
            <Input value={col.title} onChange={(e) => setColumn(i, { title: e.target.value })} />
          </Field>
          <Field label={`Column ${i + 1} — Links`} hint={LINK_HINT}>
            <Textarea
              value={col.links}
              onChange={(e) => setColumn(i, { links: e.target.value })}
              rows={5}
              className="font-mono text-xs"
            />
          </Field>
        </div>
      ))}
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
    if (window.confirm("Reset the header, shop menu and footer links back to the defaults?")) {
      resetNavigation();
      toast.success("Navigation reset.");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Menu"
        description="Edit the header links, the Shop mega menu, and the footer link columns."
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
          <TabsTrigger value="shop">Shop Menu</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>
        <TabsContent value="header">
          <HeaderTab />
        </TabsContent>
        <TabsContent value="shop">
          <ShopMenuTab />
        </TabsContent>
        <TabsContent value="footer">
          <FooterTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
