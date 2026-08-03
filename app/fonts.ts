// Self-hosted font faces via @fontsource (no runtime network calls — this sandbox
// cannot reach Google Fonts at build time, so next/font/google is not an option).
//
// Per the Mirenne brand guidelines: Prata (serif, Regular weight only) is the
// primary typeface for headlines, titles, the logo wordmark, and key messaging.
// Poppins (geometric sans, full weight range) is the secondary typeface for
// body copy, captions, product descriptions, and all other digital/UI text —
// which is why it now also covers the tracked-caps "nav/label" role that Jost
// used to serve; the guidelines only define these two typefaces.
import "@fontsource/prata/400.css";

import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
