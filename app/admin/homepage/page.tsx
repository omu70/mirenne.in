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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-graphite">{hint}</p>}
    </div>
  );
}

function HeroTab() {
  const hero = useContentStore((s) => s.hero);
  const updateHero = useContentStore((s) => s.updateHero);
  const [draft, setDraft] = React.useState(hero);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateHero(draft);
    toast.success("Homepage hero updated.");
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5">
      <Field label="Eyebrow Label">
        <Input value={draft.eyebrow} onChange={(e) => setDraft({ ...draft, eyebrow: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Headline — Line 1">
          <Input value={draft.headlineLine1} onChange={(e) => setDraft({ ...draft, headlineLine1: e.target.value })} />
        </Field>
        <Field label="Headline — Line 2">
          <Input value={draft.headlineLine2} onChange={(e) => setDraft({ ...draft, headlineLine2: e.target.value })} />
        </Field>
      </div>
      <Field label="Subheadline">
        <Textarea value={draft.subheadline} onChange={(e) => setDraft({ ...draft, subheadline: e.target.value })} rows={3} />
      </Field>
      <Field label="Background Image" hint="Path or URL to the full-bleed hero image.">
        <Input value={draft.backgroundImage} onChange={(e) => setDraft({ ...draft, backgroundImage: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Primary Button Label">
          <Input value={draft.primaryCtaLabel} onChange={(e) => setDraft({ ...draft, primaryCtaLabel: e.target.value })} />
        </Field>
        <Field label="Primary Button Link">
          <Input value={draft.primaryCtaHref} onChange={(e) => setDraft({ ...draft, primaryCtaHref: e.target.value })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Secondary Button Label">
          <Input value={draft.secondaryCtaLabel} onChange={(e) => setDraft({ ...draft, secondaryCtaLabel: e.target.value })} />
        </Field>
        <Field label="Secondary Button Link">
          <Input value={draft.secondaryCtaHref} onChange={(e) => setDraft({ ...draft, secondaryCtaHref: e.target.value })} />
        </Field>
      </div>
      <Button type="submit" variant="primary" size="md">
        Save Hero
      </Button>
    </form>
  );
}

function AboutTab() {
  const about = useContentStore((s) => s.about);
  const updateAbout = useContentStore((s) => s.updateAbout);
  const [draft, setDraft] = React.useState(about);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateAbout(draft);
    toast.success("About & footer copy updated.");
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5">
      <Field label="About — Headline">
        <Input value={draft.heroHeadline} onChange={(e) => setDraft({ ...draft, heroHeadline: e.target.value })} />
      </Field>
      <Field label="About — Subline" hint="Also shown under the logo in the site footer.">
        <Textarea value={draft.heroSubline} onChange={(e) => setDraft({ ...draft, heroSubline: e.target.value })} rows={2} />
      </Field>
      <Field label="Philosophy Statement">
        <Textarea
          value={draft.philosophyStatement}
          onChange={(e) => setDraft({ ...draft, philosophyStatement: e.target.value })}
          rows={5}
        />
      </Field>
      <Field label="Made In India Statement">
        <Textarea
          value={draft.madeInIndiaStatement}
          onChange={(e) => setDraft({ ...draft, madeInIndiaStatement: e.target.value })}
          rows={5}
        />
      </Field>
      <Button type="submit" variant="primary" size="md">
        Save About &amp; Footer Copy
      </Button>
    </form>
  );
}

function FounderTab() {
  const founder = useContentStore((s) => s.founder);
  const updateFounder = useContentStore((s) => s.updateFounder);
  const [name, setName] = React.useState(founder.founderName);
  const [title, setTitle] = React.useState(founder.title);
  const [quote, setQuote] = React.useState(founder.heroQuote);
  const [paragraphsText, setParagraphsText] = React.useState(founder.storyParagraphs.join("\n\n"));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const storyParagraphs = paragraphsText
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    updateFounder({
      founderName: name,
      title,
      heroQuote: quote,
      storyParagraphs: storyParagraphs.length ? storyParagraphs : founder.storyParagraphs,
    });
    toast.success("Designer story updated.");
  };

  return (
    <form onSubmit={save} className="max-w-2xl space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Founder Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
      </div>
      <Field label="Hero Quote" hint="The pull-quote shown on the homepage's Designer Story section.">
        <Textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={2} />
      </Field>
      <Field label="Story Paragraphs" hint="Separate paragraphs with a blank line. Only the first paragraph shows on the homepage.">
        <Textarea value={paragraphsText} onChange={(e) => setParagraphsText(e.target.value)} rows={10} />
      </Field>
      <Button type="submit" variant="primary" size="md">
        Save Designer Story
      </Button>
    </form>
  );
}

export default function AdminHomepagePage() {
  const mounted = useMounted();
  const resetToDefaults = useContentStore((s) => s.resetToDefaults);

  if (!mounted) return null;

  const handleReset = () => {
    if (window.confirm("Reset all homepage content back to what this site shipped with? Your edits will be lost.")) {
      resetToDefaults();
      toast.success("Homepage content reset.");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Homepage Content"
        description="Edit the hero banner, about & footer copy, and the designer story section shown on the homepage."
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

      <Tabs defaultValue="hero">
        <TabsList>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="about">About &amp; Footer</TabsTrigger>
          <TabsTrigger value="founder">Designer Story</TabsTrigger>
        </TabsList>
        <TabsContent value="hero">
          <HeroTab />
        </TabsContent>
        <TabsContent value="about">
          <AboutTab />
        </TabsContent>
        <TabsContent value="founder">
          <FounderTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
