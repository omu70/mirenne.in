"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  HOW_TO_MEASURE,
  SIZE_GUIDE_SIGN_OFF,
  SIZE_NOTES,
  SIZE_TABLES,
  type SizeTable,
} from "@/lib/data/size-guide";

/**
 * The house size guide, shown the same way on every piece.
 *
 * It used to branch on `product.sizeGuideType` and show one of three different
 * things, two of which were written from nothing — the saree variant described
 * an unstitched six-metre drape, which is not what any of these pieces are.
 * There is one guide, it covers tops and bottoms, and it applies to the whole
 * catalogue, so there is nothing left to branch on.
 *
 * Note the range: the guide runs XXS to XL, while products are currently sold
 * XS to XL. Anyone measuring XXS will find their size in the chart and no way
 * to order it — add XXS to a product's sizes in /admin/products if the pieces
 * are actually cut that small.
 */
export function SizeGuideDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto p-8 md:p-10">
        <DialogTitle>Size Guide</DialogTitle>

        <p className="mt-2 text-sm text-gold">All measurements are in inches.</p>

        <div className="mt-8 space-y-8">
          {SIZE_TABLES.map((table) => (
            <ChartTable key={table.title} table={table} />
          ))}
        </div>

        <section className="mt-10 border-t border-hairline pt-8">
          <h3 className="label-luxury text-gold">How To Measure</h3>
          <dl className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {HOW_TO_MEASURE.map((m) => (
              <div key={m.label}>
                <dt className="text-sm text-gold-dark">{m.label}</dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-gold">{m.instruction}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8 border-t border-hairline pt-8">
          <dl className="space-y-4">
            {SIZE_NOTES.map((n) => (
              <div key={n.label}>
                <dt className="text-sm text-gold-dark">{n.label}</dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-gold">{n.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="label-luxury mt-10 text-center text-gold/70">{SIZE_GUIDE_SIGN_OFF}</p>
      </DialogContent>
    </Dialog>
  );
}

function ChartTable({ table }: { table: SizeTable }) {
  return (
    <div>
      <h3 className="label-luxury mb-4 text-gold">{table.title}</h3>
      {/* Its own scroll container so a four-column chart never makes the
          dialog itself scroll sideways on a phone. */}
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[22rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-hairline-dark">
              <th scope="col" className="label-luxury py-3 pr-4 text-left font-normal text-gold">
                Size
              </th>
              {table.columns.map((c) => (
                <th key={c} scope="col" className="label-luxury py-3 pl-4 text-right font-normal text-gold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row.size} className="border-b border-hairline last:border-b-0">
                <th scope="row" className="py-3 pr-4 text-left font-normal text-gold">
                  {row.size}
                </th>
                {row.values.map((v, i) => (
                  <td key={table.columns[i]} className="py-3 pl-4 text-right text-gold">
                    {v}&Prime;
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
