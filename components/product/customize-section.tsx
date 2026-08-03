"use client";

import * as React from "react";
import { Ruler, Scissors } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Container } from "@/components/luxury/container";
import { Reveal } from "@/components/luxury/reveal";
import { useCartStore } from "@/lib/store/cart-store";
import { cn, formatINR } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface CustomizeSectionProps {
  product: Product;
  /**
   * "section" (default): the original full-bleed, full-page-width treatment
   * — its own <section>/<Container>, border-y, heavy vertical padding, and
   * (when expanded) a two-column form with a sticky order-summary sidebar.
   * "inline": embedded directly inside BuyBox's narrow product-info column,
   * right below Size/Size Guide. Tailwind breakpoints key off the *viewport*
   * width, not this column's width, so the section variant's `sm:`/`lg:`
   * layout switches would activate at desktop viewport sizes while the
   * column itself stays narrow — inline strips those breakpoint-driven
   * layouts in favor of a plain single-column flow (and drops its own
   * sticky positioning, since BuyBox itself is already sticky-positioned
   * on the page).
   */
  variant?: "section" | "inline";
}

const EMBELLISHMENT_OPTIONS = [
  {
    value: "minimal",
    label: "Minimal",
    description: "Clean lines, finished with our signature hand-set seams only.",
    delta: 0,
  },
  {
    value: "signature",
    label: "Signature",
    description: "Hand embroidery worked along the border and neckline.",
    delta: 4500,
  },
  {
    value: "opulent",
    label: "Opulent",
    description: "Full hand embellishment in zardozi, sequin, or thread work.",
    delta: 9500,
  },
] as const;

const LINING_OPTIONS = [
  { value: "silk", label: "Silk Lining", description: "Our standard lining — smooth and structured." },
  { value: "cotton", label: "Cotton Voile Lining", description: "Breathable and cooler against the skin for daytime wear." },
] as const;

const MONOGRAM_PRICE = 1500;
const CUSTOM_MEASUREMENT_PRICE = 3500;

// Sourced from the Website Content Handoff doc, section 5 ("Product Page —
// Custom Order + Size Guide"): the made-to-order timeline and "How It
// Works" steps that should appear on every product page's custom-order UI.
const CUSTOM_ORDER_TIMELINE = "10 days from order confirmation to shipping";
const HOW_IT_WORKS_STEPS = [
  "Choose your piece",
  "Share your measurements",
  "Our karigar begins work",
  "Shipped to you",
];

type Embellishment = (typeof EMBELLISHMENT_OPTIONS)[number]["value"];
type Lining = (typeof LINING_OPTIONS)[number]["value"];

/**
 * A bespoke, made-to-measure configurator — collapsed to a single quiet
 * callout by default so it doesn't compete with the primary "buy as shown"
 * decision in BuyBox, but expands in place into a full atelier order form.
 * Adds a distinctly-priced, distinctly-labelled line to the same cart the
 * standard Add To Bag flow uses (via an optional `customization` summary on
 * the cart line), rather than standing up a separate checkout path.
 */
export function CustomizeSection({ product, variant = "section" }: CustomizeSectionProps) {
  const inline = variant === "inline";
  const addItem = useCartStore((s) => s.addItem);
  const [expanded, setExpanded] = React.useState(false);

  const [color, setColor] = React.useState(product.colors[0]?.name ?? "");
  const [fit, setFit] = React.useState<"standard" | "custom">("standard");
  const [standardSize, setStandardSize] = React.useState(product.sizes[0] ?? "");
  const [bust, setBust] = React.useState("");
  const [waist, setWaist] = React.useState("");
  const [hip, setHip] = React.useState("");
  const [height, setHeight] = React.useState("");
  const [embellishment, setEmbellishment] = React.useState<Embellishment>("minimal");
  const [lining, setLining] = React.useState<Lining>("silk");
  const [monogram, setMonogram] = React.useState("");
  const [instructions, setInstructions] = React.useState("");

  const embellishmentOption = EMBELLISHMENT_OPTIONS.find((o) => o.value === embellishment)!;
  const liningOption = LINING_OPTIONS.find((o) => o.value === lining)!;
  const monogramDelta = monogram.trim() ? MONOGRAM_PRICE : 0;
  const measurementDelta = fit === "custom" ? CUSTOM_MEASUREMENT_PRICE : 0;
  const total = product.price + embellishmentOption.delta + monogramDelta + measurementDelta;

  const handleAdd = () => {
    if (fit === "custom" && (!bust.trim() || !waist.trim() || !hip.trim() || !height.trim())) {
      toast.error("Add all four measurements, or switch back to a standard size.");
      return;
    }

    const parts = [`${embellishmentOption.label} embellishment`, liningOption.label];
    if (monogram.trim()) parts.push(`Monogram: ${monogram.trim().toUpperCase()}`);
    if (fit === "custom") {
      parts.push(`Custom measurements (Bust ${bust}", Waist ${waist}", Hip ${hip}", Height ${height}")`);
    }

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: total,
      image: product.images[0].src,
      color,
      size: fit === "custom" ? "Custom" : standardSize,
      customization: `Bespoke · ${parts.join(" · ")}`,
    });

    toast.success(`${product.name} — bespoke order added to your bag.`, {
      description: "Our atelier will reach out to confirm every detail before cutting begins.",
    });
  };

  const content = (
    <>
      {!expanded ? (
        <Reveal
          className={cn(
            "flex flex-col items-start justify-between gap-6",
            !inline && "sm:flex-row sm:items-center"
          )}
        >
          <div className="flex items-start gap-4">
            <Scissors className="mt-1 h-5 w-5 shrink-0 text-gold" strokeWidth={1.25} />
            <div>
              <p className="label-luxury text-gold">Bespoke Atelier Service</p>
              <h2 className={cn("mt-2 font-serif text-gold", inline ? "text-xl" : "text-2xl md:text-3xl")}>
                Customize This Piece
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-gold">
                Choose your own embellishment, lining and monogram, or have it cut to your exact
                measurements — hand-finished in our atelier and made just for you.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setExpanded(true)}
            className={cn("shrink-0", inline && "w-full")}
          >
            Start Customizing
          </Button>
        </Reveal>
      ) : (
        <Reveal
          className={cn("grid grid-cols-1 gap-12", !inline && "lg:grid-cols-[1fr_340px] lg:gap-16")}
        >
          <div>
            <p className="label-luxury text-gold">Bespoke Atelier Service</p>
            <h2 className={cn("mt-2 font-serif text-gold", inline ? "text-xl" : "text-2xl md:text-3xl")}>
              Customize This Piece
            </h2>

            <ol className="mt-6 flex flex-col gap-2.5 border-y border-hairline py-5">
              {HOW_IT_WORKS_STEPS.map((step, i) => (
                <li key={step} className="flex items-center gap-3 text-sm text-gold">
                  <span className="label-luxury flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-hairline-dark text-[10px] text-gold">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            {product.colors.length > 0 && (
              <div className="mt-8">
                <Label className="mb-3 block text-gold">
                  Color — <span className="text-gold">{color}</span>
                </Label>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setColor(c.name)}
                      aria-label={c.name}
                      aria-pressed={color === c.name}
                      className={cn(
                        "h-9 w-9 cursor-pointer rounded-full border transition-all",
                        color === c.name ? "border-ink ring-1 ring-ink ring-offset-2" : "border-hairline-dark hover:border-ink"
                      )}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8">
              <Label className="mb-3 block text-gold">Fit</Label>
              <RadioGroup value={fit} onValueChange={(v) => setFit(v as "standard" | "custom")} className="gap-3">
                <Label className="flex cursor-pointer items-center gap-3 text-sm font-normal normal-case tracking-normal text-gold">
                  <RadioGroupItem value="standard" />
                  Standard Size
                </Label>
                <Label className="flex cursor-pointer items-center gap-3 text-sm font-normal normal-case tracking-normal text-gold">
                  <RadioGroupItem value="custom" />
                  Custom Measurements
                  <span className="text-xs text-gold">+{formatINR(CUSTOM_MEASUREMENT_PRICE)}</span>
                </Label>
              </RadioGroup>

              {fit === "standard" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStandardSize(s)}
                      aria-pressed={standardSize === s}
                      className={cn(
                        "flex h-11 min-w-11 cursor-pointer items-center justify-center border px-4 text-xs transition-colors",
                        standardSize === s ? "border-ink bg-ink text-ivory" : "border-hairline-dark text-gold hover:border-ink"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={cn("mt-4 grid grid-cols-2 gap-4", !inline && "sm:grid-cols-4")}>
                  <div>
                    <Label htmlFor="measure-bust" className="mb-2 block text-gold">
                      Bust (in)
                    </Label>
                    <Input id="measure-bust" inputMode="decimal" value={bust} onChange={(e) => setBust(e.target.value)} placeholder="34" />
                  </div>
                  <div>
                    <Label htmlFor="measure-waist" className="mb-2 block text-gold">
                      Waist (in)
                    </Label>
                    <Input id="measure-waist" inputMode="decimal" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="27" />
                  </div>
                  <div>
                    <Label htmlFor="measure-hip" className="mb-2 block text-gold">
                      Hip (in)
                    </Label>
                    <Input id="measure-hip" inputMode="decimal" value={hip} onChange={(e) => setHip(e.target.value)} placeholder="37" />
                  </div>
                  <div>
                    <Label htmlFor="measure-height" className="mb-2 block text-gold">
                      Height (in)
                    </Label>
                    <Input id="measure-height" inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="65" />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <Label className="mb-3 block text-gold">Embellishment</Label>
              <RadioGroup
                value={embellishment}
                onValueChange={(v) => setEmbellishment(v as Embellishment)}
                className="gap-3"
              >
                {EMBELLISHMENT_OPTIONS.map((o) => (
                  <Label
                    key={o.value}
                    className="flex cursor-pointer items-start gap-3 text-sm font-normal normal-case tracking-normal text-gold"
                  >
                    <RadioGroupItem value={o.value} className="mt-0.5" />
                    <span>
                      <span className="flex items-center gap-2">
                        {o.label}
                        {o.delta > 0 && <span className="text-xs text-gold">+{formatINR(o.delta)}</span>}
                      </span>
                      <span className="mt-0.5 block text-xs text-gold">{o.description}</span>
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="mt-8">
              <Label className="mb-3 block text-gold">Lining</Label>
              <RadioGroup value={lining} onValueChange={(v) => setLining(v as Lining)} className="gap-3">
                {LINING_OPTIONS.map((o) => (
                  <Label
                    key={o.value}
                    className="flex cursor-pointer items-start gap-3 text-sm font-normal normal-case tracking-normal text-gold"
                  >
                    <RadioGroupItem value={o.value} className="mt-0.5" />
                    <span>
                      {o.label}
                      <span className="mt-0.5 block text-xs text-gold">{o.description}</span>
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="mt-8">
              <Label htmlFor="monogram" className="mb-2 block text-gold">
                Monogram <span className="text-gold">(optional, +{formatINR(MONOGRAM_PRICE)})</span>
              </Label>
              <Input
                id="monogram"
                value={monogram}
                onChange={(e) => setMonogram(e.target.value.slice(0, 3).toUpperCase())}
                placeholder="e.g. AKR"
                className="max-w-40 uppercase"
                maxLength={3}
              />
            </div>

            <div className="mt-8">
              <Label htmlFor="instructions" className="mb-2 block text-gold">
                Notes For Our Atelier <span className="text-gold">(optional)</span>
              </Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                placeholder="Anything else you'd like our tailors to know..."
              />
            </div>
          </div>

          <div className={cn(!inline && "lg:sticky lg:top-28 lg:self-start")}>
            <div className="border border-hairline-dark bg-ivory p-6">
              <p className="label-luxury text-gold">Your Bespoke Order</p>
              <div className="mt-5 flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-gold">
                  <span>Base price</span>
                  <span className="text-gold">{formatINR(product.price)}</span>
                </div>
                {embellishmentOption.delta > 0 && (
                  <div className="flex justify-between text-gold">
                    <span>{embellishmentOption.label} embellishment</span>
                    <span className="text-gold">+{formatINR(embellishmentOption.delta)}</span>
                  </div>
                )}
                {measurementDelta > 0 && (
                  <div className="flex justify-between text-gold">
                    <span>Custom measurements</span>
                    <span className="text-gold">+{formatINR(measurementDelta)}</span>
                  </div>
                )}
                {monogramDelta > 0 && (
                  <div className="flex justify-between text-gold">
                    <span>Monogram</span>
                    <span className="text-gold">+{formatINR(monogramDelta)}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between border-t border-hairline pt-4">
                <span className="text-sm text-gold">Estimated Total</span>
                <span className="font-serif text-xl text-gold">{formatINR(total)}</span>
              </div>
              <Button variant="primary" size="lg" className="mt-6 w-full" onClick={handleAdd}>
                Add Custom Order To Bag
              </Button>
              <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-gold">
                <Ruler className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.25} />
                Bespoke pieces are cut and hand-finished after your order is placed — please allow{" "}
                {CUSTOM_ORDER_TIMELINE}. Final sale, as with all made-to-order pieces.
              </p>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="label-luxury link-underline mt-4 cursor-pointer text-gold hover:text-gold-dark"
              >
                Cancel
              </button>
            </div>
          </div>
        </Reveal>
      )}
    </>
  );

  if (inline) {
    return <div className="mt-7">{content}</div>;
  }

  return (
    <section className="border-y border-hairline bg-paper py-16 md:py-24">
      <Container>{content}</Container>
    </section>
  );
}
