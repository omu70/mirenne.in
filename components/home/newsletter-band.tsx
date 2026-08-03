"use client";

import * as React from "react";
import { toast } from "sonner";
import { Container } from "@/components/luxury/container";
import { Reveal } from "@/components/luxury/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterBand() {
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Welcome to the house of Mirenne — check your inbox to confirm.");
    setEmail("");
  };

  return (
    <section className="relative overflow-hidden bg-ink py-24 text-ivory md:py-32">
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay" />
      <Container className="relative z-10 flex flex-col items-center px-6 text-center">
        <Reveal className="flex flex-col items-center">
          <p className="label-luxury text-gold-light">Join The House</p>
          <h2 className="mt-5 max-w-xl font-serif text-4xl leading-[1.1] md:text-5xl">
            Stay a Little Closer
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-ivory/75">
            Be the first to know when a new collection drops, when festive season pieces are
            ready, or when there&rsquo;s a special offer worth knowing about. No noise, no spam,
            just the updates that actually matter.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              aria-label="Email address"
              className="border-ivory/30 text-ivory placeholder:text-ivory/50 focus-visible:border-ivory"
            />
            <Button type="submit" variant="gold" size="md" className="shrink-0">
              Subscribe
            </Button>
          </form>
          <p className="mt-4 text-xs text-ivory/50">No spam. Unsubscribe anytime.</p>
        </Reveal>
      </Container>
    </section>
  );
}
