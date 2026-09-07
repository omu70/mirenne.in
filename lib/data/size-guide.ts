/**
 * Mirenne's size guide, taken verbatim from the Size Guide document.
 *
 * This replaces an invented chart: the previous one listed five sizes with
 * bust/waist/hip figures that came from nowhere, and told anyone buying a
 * saree that it arrived "6.3 metres in length with an unstitched blouse
 * piece" — which is not what these pieces are. Every number and line below is
 * from the supplied document.
 *
 * All measurements are body measurements in inches, not garment measurements.
 */

export interface SizeRow {
  size: string;
  values: string[];
}

export interface SizeTable {
  title: string;
  columns: string[];
  rows: SizeRow[];
}

export const SIZE_TABLES: SizeTable[] = [
  {
    title: "Tops",
    columns: ["Bust", "Underbust", "Shoulder"],
    rows: [
      { size: "XXS", values: ["32", "26", "14"] },
      { size: "XS", values: ["34", "28", "14"] },
      { size: "S", values: ["36", "30", "15"] },
      { size: "M", values: ["38", "32", "15"] },
      { size: "L", values: ["40", "34", "16"] },
      { size: "XL", values: ["42", "36", "16"] },
    ],
  },
  {
    title: "Bottoms",
    columns: ["Upper Waist", "Lower Waist", "Hips"],
    rows: [
      { size: "XXS", values: ["27", "28", "27"] },
      { size: "XS", values: ["29", "30", "29"] },
      { size: "S", values: ["31", "32", "31"] },
      { size: "M", values: ["33", "34", "33"] },
      { size: "L", values: ["35", "36", "35"] },
      { size: "XL", values: ["37", "38", "37"] },
    ],
  },
];

export const HOW_TO_MEASURE: { label: string; instruction: string }[] = [
  { label: "Bust", instruction: "Measure around the fullest part of your bust." },
  { label: "Underbust", instruction: "Measure directly under your bust." },
  { label: "Upper Waist", instruction: "Measure around your natural waist." },
  { label: "Shoulder", instruction: "Measure from the edge of one shoulder to the other." },
  { label: "Lower Waist", instruction: "Measure around the narrowest part of your waist." },
  { label: "Hips", instruction: "Measure around the fullest part of your hips." },
];

export const SIZE_NOTES: { label: string; body: string }[] = [
  {
    label: "Please note",
    body: "This is a body measurement guide, not garment measurements. Each piece is tailored according to its design and intended fit.",
  },
  { label: "Between sizes?", body: "We recommend choosing the larger size." },
  {
    label: "Made to order",
    body: "For a personalised fit, please contact us with your measurements.",
  },
];

export const SIZE_GUIDE_SIGN_OFF = "Measure with care, wear with confidence.";
