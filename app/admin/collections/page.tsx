"use client";

import * as React from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useContentStore } from "@/lib/store/content-store";
import { useMounted } from "@/lib/hooks/use-mounted";
import type { Collection, CollectionSlug } from "@/lib/types";

function CollectionEditor({ collection }: { collection: Collection }) {
  const updateCollection = useContentStore((s) => s.updateCollection);
  const [name, setName] = React.useState(collection.name);
  const [tagline, setTagline] = React.useState(collection.tagline);
  const [description, setDescription] = React.useState(collection.description);
  const [imageSrc, setImageSrc] = React.useState(collection.bannerImage.src);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateCollection(collection.slug as CollectionSlug, {
      name,
      tagline,
      description,
      bannerImage: { ...collection.bannerImage, src: imageSrc },
    });
    toast.success(`${name} updated.`);
  };

  return (
    <form onSubmit={save} className="space-y-4 pb-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="mb-2 block">Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label className="mb-2 block">Tagline</Label>
          <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </div>
      </div>
      <div>
        <Label className="mb-2 block">Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div>
        <Label className="mb-2 block">Banner Image</Label>
        <Input value={imageSrc} onChange={(e) => setImageSrc(e.target.value)} />
      </div>
      <Button type="submit" variant="secondary" size="sm">
        Save {name}
      </Button>
    </form>
  );
}

export default function AdminCollectionsPage() {
  const mounted = useMounted();
  const collections = useContentStore((s) => s.collections);
  const resetToDefaults = useContentStore((s) => s.resetToDefaults);

  if (!mounted) return null;

  const handleReset = () => {
    if (window.confirm("Reset all homepage & collections content back to what this site shipped with? Your edits will be lost.")) {
      resetToDefaults();
      toast.success("Collections content reset.");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Collections Content"
        description="Edit the name, tagline, description, and banner image for each of the site's seven collections. The set of collections itself is fixed."
        action={
          <button
            onClick={handleReset}
            className="label-luxury link-underline flex cursor-pointer items-center gap-2 text-graphite hover:text-ink"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
            Reset All
          </button>
        }
      />

      <Accordion type="single" collapsible className="max-w-2xl border-t border-hairline">
        {collections.map((c) => (
          <AccordionItem key={c.slug} value={c.slug}>
            <AccordionTrigger>{c.name}</AccordionTrigger>
            <AccordionContent>
              <CollectionEditor collection={c} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
