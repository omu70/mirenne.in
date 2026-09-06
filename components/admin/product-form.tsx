"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductStore, generateSlug, generateProductId } from "@/lib/store/product-store";
import { collections } from "@/lib/data/collections";
import { slugify } from "@/lib/utils";
import type { Availability, Product } from "@/lib/types";

const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: "in-stock", label: "In Stock" },
  { value: "low-stock", label: "Low Stock" },
  { value: "made-to-order", label: "Made To Order" },
];

// Radix's Select reserves the empty string, so "unassigned" needs a sentinel
// value of its own rather than "".
const NO_COLLECTION = "__none__";

const SIZE_GUIDE_OPTIONS: { value: Product["sizeGuideType"]; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "saree", label: "Saree" },
  { value: "free-size", label: "Free Size" },
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-graphite">{hint}</p>}
    </div>
  );
}

interface ProductFormProps {
  product?: Product;
  onSaved: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSaved, onCancel }: ProductFormProps) {
  const isEditing = Boolean(product);
  const allProducts = useProductStore((s) => s.products);
  const addProduct = useProductStore((s) => s.addProduct);
  const updateProduct = useProductStore((s) => s.updateProduct);

  const [name, setName] = React.useState(product?.name ?? "");
  const [slug, setSlug] = React.useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = React.useState(isEditing);
  const [collection, setCollection] = React.useState<string>(product?.collection ?? NO_COLLECTION);
  const [category, setCategory] = React.useState(product?.category ?? "");
  const [price, setPrice] = React.useState(String(product?.price ?? ""));
  const [compareAtPrice, setCompareAtPrice] = React.useState(
    product?.compareAtPrice ? String(product.compareAtPrice) : ""
  );
  const [availability, setAvailability] = React.useState<Availability>(product?.availability ?? "in-stock");
  const [shortDescription, setShortDescription] = React.useState(product?.shortDescription ?? "");
  const [description, setDescription] = React.useState(product?.description ?? "");
  const [detailsText, setDetailsText] = React.useState((product?.details ?? []).join("\n"));
  const [components, setComponents] = React.useState(product?.components ?? "");
  const [designerNote, setDesignerNote] = React.useState(product?.designerNote ?? "");
  const [fabric, setFabric] = React.useState(product?.fabric ?? "");
  const [care, setCare] = React.useState(product?.care ?? "");
  const [stylingSuggestion, setStylingSuggestion] = React.useState(product?.stylingSuggestion ?? "");
  const [colorsText, setColorsText] = React.useState(
    product ? product.colors.map((c) => `${c.name}, ${c.hex}`).join("\n") : "Black, #1A1A1A"
  );
  const [sizesText, setSizesText] = React.useState(product ? product.sizes.join(", ") : "XS, S, M, L, XL");
  const [sizeGuideType, setSizeGuideType] = React.useState<Product["sizeGuideType"]>(
    product?.sizeGuideType ?? "standard"
  );
  // "src | alt | WIDTHxHEIGHT" per line. Alt and dimensions are optional on
  // input but round-trip through an edit, so opening a product and saving it
  // no longer flattens hand-written alt text or real image dimensions.
  const [imagesText, setImagesText] = React.useState(
    product
      ? product.images.map((i) => `${i.src} | ${i.alt} | ${i.width}x${i.height}`).join("\n")
      : "/images/products/"
  );
  const [isNew, setIsNew] = React.useState(product?.isNew ?? true);
  const [isBestSeller, setIsBestSeller] = React.useState(product?.isBestSeller ?? false);
  const [rating, setRating] = React.useState(String(product?.rating ?? "5"));
  const [reviewCount, setReviewCount] = React.useState(String(product?.reviewCount ?? "0"));
  const [deliveryEstimate, setDeliveryEstimate] = React.useState(product?.deliveryEstimate ?? "");
  const [tagsText, setTagsText] = React.useState(product ? product.tags.join(", ") : "");

  // Keep the slug preview in sync with the name for new products, unless the
  // admin has deliberately typed their own slug. Adjusted during render
  // (rather than in an effect) to avoid the extra cascading-render pass —
  // the same pattern used elsewhere in this codebase (e.g. Navbar's
  // pathname reset) for deriving state from a changed prop/value.
  const [prevName, setPrevName] = React.useState(name);
  if (name !== prevName) {
    setPrevName(name);
    if (!slugTouched) setSlug(slugify(name));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Give the piece a name first.");
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error("Enter a price greater than zero.");
      return;
    }

    const colors = colorsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [colorName, hex] = line.split(",").map((s) => s.trim());
        return { name: colorName || "Default", hex: hex || "#763400" };
      });

    const sizes = sizesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const images = imagesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, i) => {
        const [src, alt, size] = line.split("|").map((s) => s.trim());
        const [w, h] = (size ?? "").toLowerCase().split("x").map((n) => Number(n.trim()));
        return {
          src,
          alt: alt || `${name} — view ${i + 1}`,
          width: Number.isFinite(w) && w > 0 ? w : 1600,
          height: Number.isFinite(h) && h > 0 ? h : 2000,
        };
      });

    const details = detailsText
      .split("\n")
      .map((s) => s.replace(/^[-–—•*]\s*/, "").trim())
      .filter(Boolean);

    const tags = tagsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const otherProducts = isEditing ? allProducts.filter((p) => p.id !== product!.id) : allProducts;
    const finalSlug = generateSlug(slug.trim() || name, otherProducts);

    const result: Product = {
      id: product?.id ?? generateProductId(),
      slug: finalSlug,
      name: name.trim(),
      collection: collection === NO_COLLECTION ? undefined : (collection as Product["collection"]),
      category: category.trim() || "Piece",
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      details: details.length ? details : undefined,
      components: components.trim() || undefined,
      designerNote: designerNote.trim(),
      fabric: fabric.trim(),
      care: care.trim(),
      stylingSuggestion: stylingSuggestion.trim(),
      colors: colors.length ? colors : [{ name: "Default", hex: "#763400" }],
      sizes: sizes.length ? sizes : ["Free Size"],
      sizeGuideType,
      availability,
      images: images.length
        ? images
        : [{ src: "/images/mood/portrait-01.jpg", alt: name, width: 1000, height: 1300 }],
      isNew,
      isBestSeller,
      rating: Math.min(5, Math.max(0, Number(rating) || 0)),
      reviewCount: Math.max(0, Number(reviewCount) || 0),
      deliveryEstimate: deliveryEstimate.trim(),
      tags,
    };

    if (isEditing) {
      updateProduct(product!.id, result);
      toast.success(`${result.name} updated.`);
    } else {
      addProduct(result);
      toast.success(`${result.name} added to the catalogue.`);
    }
    onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
        <Field label="Name *">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kalaghoda Column Gown" />
        </Field>

        <Field label="URL Slug" hint="Used in the product's link — lowercase, hyphenated. Leave it to auto-fill from the name.">
          <Input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="kalaghoda-column-gown"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Collection" hint="Optional — pieces with no collection still appear in Shop and search.">
            <Select value={collection} onValueChange={setCollection}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_COLLECTION}>No collection</SelectItem>
                {collections.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Category" hint="e.g. Gown, Saree, Lehenga">
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Gown" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Price (INR) *">
            <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="52500" />
          </Field>
          <Field label="Compare-at Price" hint="Optional — shows as a struck-through original price.">
            <Input
              type="number"
              min="0"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              placeholder="Optional"
            />
          </Field>
        </div>

        <Field label="Availability">
          <Select value={availability} onValueChange={(v) => setAvailability(v as Availability)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABILITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Short Description" hint="One line — shown on product cards and near the price.">
          <Textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} />
        </Field>

        <Field label="Full Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </Field>

        <Field label="Product Details" hint="One bullet per line — shown as the Product Details list on the product page.">
          <Textarea
            value={detailsText}
            onChange={(e) => setDetailsText(e.target.value)}
            rows={4}
            placeholder={"Sweetheart neckline blouse with pearl embroidery\nOpen criss-cross back\nWaist cutout"}
          />
        </Field>

        <Field label="No. of Components" hint="What ships with the piece, e.g. 2 (Blouse + Saree).">
          <Input value={components} onChange={(e) => setComponents(e.target.value)} placeholder="2 (Blouse + Saree)" />
        </Field>

        <Field label="Designer's Note" hint="Leave blank to hide the designer's note section on the product page.">
          <Textarea value={designerNote} onChange={(e) => setDesignerNote(e.target.value)} rows={2} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Fabric" hint="Leave blank to hide the fabric line.">
            <Input value={fabric} onChange={(e) => setFabric(e.target.value)} placeholder="Net with taffeta lining (blouse)" />
          </Field>
          <Field label="Delivery Estimate" hint="Leave blank to show no lead time.">
            <Input
              value={deliveryEstimate}
              onChange={(e) => setDeliveryEstimate(e.target.value)}
              placeholder="Made to order — ships in 3–4 weeks"
            />
          </Field>
        </div>

        <Field label="Care Instructions">
          <Textarea value={care} onChange={(e) => setCare(e.target.value)} rows={2} />
        </Field>

        <Field label="Styling Suggestion" hint="Leave blank to hide the Styling Notes panel.">
          <Textarea value={stylingSuggestion} onChange={(e) => setStylingSuggestion(e.target.value)} rows={2} />
        </Field>

        <Field label="Colors" hint="One per line: Color Name, #hexcode">
          <Textarea value={colorsText} onChange={(e) => setColorsText(e.target.value)} rows={3} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Sizes" hint="Comma-separated">
            <Input value={sizesText} onChange={(e) => setSizesText(e.target.value)} placeholder="XS, S, M, L, XL" />
          </Field>
          <Field label="Size Guide Type">
            <Select value={sizeGuideType} onValueChange={(v) => setSizeGuideType(v as Product["sizeGuideType"])}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZE_GUIDE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field
          label="Images"
          hint="One per line: path | alt text | WIDTHxHEIGHT. Alt text and dimensions are optional — they default to the product name and 1600x2000."
        >
          <Textarea value={imagesText} onChange={(e) => setImagesText(e.target.value)} rows={5} />
        </Field>

        <Field label="Tags" hint="Comma-separated, used by search and filters.">
          <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} placeholder="raw-silk, evening" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Rating" hint="0–5">
            <Input type="number" min="0" max="5" step="0.1" value={rating} onChange={(e) => setRating(e.target.value)} />
          </Field>
          <Field label="Review Count">
            <Input type="number" min="0" value={reviewCount} onChange={(e) => setReviewCount(e.target.value)} />
          </Field>
        </div>

        <div className="flex flex-col gap-3">
          <Label className="flex cursor-pointer items-center gap-3">
            <Checkbox checked={isNew} onCheckedChange={(v) => setIsNew(Boolean(v))} />
            Mark as New Arrival
          </Label>
          <Label className="flex cursor-pointer items-center gap-3">
            <Checkbox checked={isBestSeller} onCheckedChange={(v) => setIsBestSeller(Boolean(v))} />
            Mark as Best Seller
          </Label>
        </div>
      </div>

      <div className="flex gap-3 border-t border-hairline px-6 py-5">
        <Button type="button" variant="secondary" size="md" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" className="flex-1">
          {isEditing ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
