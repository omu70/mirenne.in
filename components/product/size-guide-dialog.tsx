"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@/lib/types";

const STANDARD_CHART: { size: string; bust: string; waist: string; hip: string }[] = [
  { size: "XS", bust: "32", waist: "25", hip: "35" },
  { size: "S", bust: "34", waist: "27", hip: "37" },
  { size: "M", bust: "36", waist: "29", hip: "39" },
  { size: "L", bust: "38", waist: "31", hip: "41" },
  { size: "XL", bust: "40", waist: "33", hip: "43" },
];

interface SizeGuideDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SizeGuideDialog({ product, open, onOpenChange }: SizeGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-8 md:p-10">
        <DialogTitle>Size Guide</DialogTitle>

        {product.sizeGuideType === "standard" && (
          <div className="mt-6">
            <p className="text-sm leading-relaxed text-gold">
              Measurements in inches, taken against the body. If you fall between two sizes, we
              recommend sizing up for a more comfortable drape.
            </p>
            <table className="mt-6 w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-hairline-dark">
                  <th className="label-luxury py-3 text-left font-normal text-gold">Size</th>
                  <th className="label-luxury py-3 text-right font-normal text-gold">Bust</th>
                  <th className="label-luxury py-3 text-right font-normal text-gold">Waist</th>
                  <th className="label-luxury py-3 text-right font-normal text-gold">Hip</th>
                </tr>
              </thead>
              <tbody>
                {STANDARD_CHART.map((row) => (
                  <tr key={row.size} className="border-b border-hairline">
                    <td className="py-3 text-gold">{row.size}</td>
                    <td className="py-3 text-right text-gold">{row.bust}&Prime;</td>
                    <td className="py-3 text-right text-gold">{row.waist}&Prime;</td>
                    <td className="py-3 text-right text-gold">{row.hip}&Prime;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {product.sizeGuideType === "saree" && (
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-gold">
            <p>
              This saree is 6.3 metres in length and comes with an unstitched blouse piece,
              draping to fit most body types without alteration.
            </p>
            <p>
              For a tailored blouse, we recommend sharing your bust, waist, and blouse-length
              measurements with our styling team by email after your order — we are glad to
              recommend a trusted tailor or advise on fit before you cut the fabric.
            </p>
          </div>
        )}

        {product.sizeGuideType === "free-size" && (
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-gold">
            <p>
              This piece is designed with a relaxed, flowing silhouette that comfortably fits
              bust sizes 34&Prime;–40&Prime; without needing an exact size match.
            </p>
            <p>
              If you prefer a closer fit or fall outside this range, our styling team can advise
              on minor alterations before your order ships.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
