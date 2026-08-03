"use client";

import * as React from "react";
import { AtSign, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Container } from "@/components/luxury/container";
import { Reveal } from "@/components/luxury/reveal";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqCategories } from "@/lib/data/faq";

// Placeholders for the two contact details the Website Content Handoff doc
// left as literal brackets ("[@handle]" / "[email address]") rather than
// real values. studio@mirenne.com already appears elsewhere on the site
// (Footer's mail icon), so it's reused here for consistency rather than
// inventing a second placeholder address — both should be swapped for the
// real handle/inbox before launch.
const INSTAGRAM_HANDLE = "@mirenne";
const CONTACT_EMAIL = "studio@mirenne.com";

export function ContactContent() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [orderRelated, setOrderRelated] = React.useState<"yes" | "no">("no");
  const [message, setMessage] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !email.includes("@") || !message.trim()) {
      toast.error("Please fill in your name, a valid email, and a message.");
      return;
    }
    toast.success("Message sent — we'll be in touch soon.", {
      description: "We usually respond within 48 hours (Instagram DMs tend to get the quickest reply).",
    });
    setName("");
    setEmail("");
    setOrderRelated("no");
    setMessage("");
  };

  return (
    <>
      <section className="border-b border-hairline bg-paper py-20 md:py-28">
        <Container className="max-w-2xl text-center">
          <Reveal>
            <p className="label-luxury text-gold">Contact Us</p>
            <h1 className="mt-5 font-serif text-4xl leading-[1.1] text-gold md:text-5xl">Let&rsquo;s Talk</h1>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-gold md:text-base">
              Questions about an order, sizing, or something you&rsquo;re dreaming of? We&rsquo;re here.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <Reveal>
            <p className="label-luxury text-gold">Get In Touch</p>
            <ul className="mt-6 space-y-5">
              <li className="flex items-start gap-3">
                <AtSign className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.25} />
                <div>
                  <a
                    href={`https://instagram.com/${INSTAGRAM_HANDLE.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-sm text-gold"
                  >
                    {INSTAGRAM_HANDLE}
                  </a>
                  <p className="mt-1 text-xs text-gold">DM us, fastest way to reach us.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.25} />
                <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline text-sm text-gold">
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.25} />
                <p className="text-sm text-gold">Based in Indore, India</p>
              </li>
            </ul>

            <p className="mt-8 max-w-sm text-xs leading-relaxed text-gold">
              We usually respond within 48 hours (Instagram DMs tend to get the quickest reply).
            </p>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-gold">
              Whatever the question, sizing, customization, or just a piece you&rsquo;ve been eyeing, we&rsquo;re
              happy to help make it real.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="contact-name" className="mb-2 block text-gold">
                  Name
                </Label>
                <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>

              <div>
                <Label htmlFor="contact-email" className="mb-2 block text-gold">
                  Email
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <Label className="mb-3 block text-gold">Order-related?</Label>
                <RadioGroup
                  value={orderRelated}
                  onValueChange={(v) => setOrderRelated(v as "yes" | "no")}
                  className="grid-flow-col justify-start gap-6"
                >
                  <Label className="flex cursor-pointer items-center gap-2 text-sm font-normal normal-case tracking-normal text-gold">
                    <RadioGroupItem value="yes" />
                    Yes
                  </Label>
                  <Label className="flex cursor-pointer items-center gap-2 text-sm font-normal normal-case tracking-normal text-gold">
                    <RadioGroupItem value="no" />
                    No
                  </Label>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="contact-message" className="mb-2 block text-gold">
                  Message
                </Label>
                <Textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  placeholder="How can we help?"
                />
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
                Send Message
              </Button>
            </form>
          </Reveal>
        </Container>
      </section>

      <section id="faq" className="scroll-mt-28 border-t border-hairline bg-paper py-20 md:py-28">
        <Container className="max-w-3xl">
          <Reveal className="text-center">
            <p className="label-luxury text-gold">Frequently Asked</p>
            <h2 className="mt-5 font-serif text-3xl leading-[1.1] text-gold md:text-4xl">A Few Things To Know</h2>
          </Reveal>

          <div className="mt-14 space-y-12">
            {faqCategories.map((category) => (
              <Reveal key={category.title}>
                <h3 className="label-luxury mb-2 text-gold">{category.title}</h3>
                <Accordion type="multiple">
                  {category.items.map((item) => (
                    <AccordionItem key={item.question} value={item.question}>
                      <AccordionTrigger className="normal-case tracking-normal text-sm font-serif text-base">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
