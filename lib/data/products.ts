import type { Product } from "@/lib/types";

// Collection 1 — the six pieces supplied in the Mirenne Collection 1 product
// details document, with the photography from the accompanying shoot.
// Descriptions, detail bullets, fabrics, care and component counts are taken
// from that document verbatim; nothing here is invented copy. Fields the
// document didn't cover are deliberately left blank rather than filled with
// plausible-sounding text — an empty fabric, designer's note, styling note or
// delivery estimate is simply not rendered on the product page, so each can be
// filled in from /admin/products as the real values are confirmed.
//
// This array seeds lib/store/product-store.ts, which is the live catalogue the
// storefront actually renders. Editing a product in /admin/products changes the
// store (this browser's local storage) but not this file; "Reset catalogue"
// there restores whatever is written here.
export const products: Product[] = [
  {
    "id": "p01",
    "slug": "ivory-grace",
    "name": "Ivory Grace",
    "category": "Saree Set",
    "price": 9999,
    "shortDescription": "Pearl and sequin embroidered blouse with a ready-to-wear saree and open pallu.",
    "description": "An ivory blouse with a sweetheart neckline and an open criss-cross back, embroidered with pearls, beads and sequins in a floral vine pattern, finished with a waist cutout, paired with a ready-to-wear saree featuring an open pallu for timeless elegance.",
    "details": [
      "Sweetheart neckline blouse with pearl, bead and sequin floral vine embroidery",
      "Open criss-cross back",
      "Waist cutout",
      "Ready-to-wear saree with open pallu"
    ],
    "components": "2 (Blouse + Saree)",
    "designerNote": "",
    "fabric": "",
    "care": "Dry clean only.",
    "stylingSuggestion": "",
    "colors": [
      {
        "name": "Ivory",
        "hex": "#EADDC4"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL"
    ],
    "sizeGuideType": "saree",
    "availability": "made-to-order",
    "images": [
      {
        "src": "/images/products/ivory-grace/ivory-grace-01.jpg",
        "alt": "Ivory Grace saree set — front view of the embroidered blouse and draped saree",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/ivory-grace/ivory-grace-02.jpg",
        "alt": "Ivory Grace — sweetheart neckline with pearl, bead and sequin floral vine embroidery",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/ivory-grace/ivory-grace-03.jpg",
        "alt": "Ivory Grace saree set shown in movement with the pallu held out",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/ivory-grace/ivory-grace-04.jpg",
        "alt": "Ivory Grace — back view showing the open criss-cross back",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/ivory-grace/ivory-grace-05.jpg",
        "alt": "Ivory Grace — close view of the criss-cross lacing across the open back",
        "width": 1600,
        "height": 2000
      }
    ],
    "isNew": true,
    "isBestSeller": false,
    "rating": 0,
    "reviewCount": 0,
    "deliveryEstimate": "",
    "tags": [
      "saree",
      "ready-to-wear-saree",
      "pearl-embroidery",
      "sequins",
      "ivory",
      "open-back"
    ]
  },
  {
    "id": "p02",
    "slug": "champagne-shimmer",
    "name": "Champagne Shimmer",
    "category": "Saree Set",
    "price": 9999,
    "shortDescription": "Sequin-striped blouse with a foil-finish Milano saree and pleated front.",
    "description": "A champagne blouse with a wide, straight neckline, embroidered with sequins and beads in a striped pattern, finished with a waist cutout, paired with a Milano fabric saree in a refined foil finish with a pleated front for a soft, glowing drape.",
    "details": [
      "Wide straight-neckline blouse with sequin and bead striped embroidery",
      "Waist cutout",
      "Milano fabric saree with refined foil finish, pleated front"
    ],
    "components": "2 (Blouse + Saree)",
    "designerNote": "",
    "fabric": "Net with taffeta lining (blouse) · Milano in a refined foil finish (saree)",
    "care": "Dry clean only.",
    "stylingSuggestion": "",
    "colors": [
      {
        "name": "Champagne",
        "hex": "#DFCCC2"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL"
    ],
    "sizeGuideType": "saree",
    "availability": "made-to-order",
    "images": [
      {
        "src": "/images/products/champagne-shimmer/champagne-shimmer-01.jpg",
        "alt": "Champagne Shimmer saree set — front view of the sequin-striped blouse and foil-finish saree",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/champagne-shimmer/champagne-shimmer-02.jpg",
        "alt": "Champagne Shimmer — the pallu held out to show the foil-finish drape",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/champagne-shimmer/champagne-shimmer-03.jpg",
        "alt": "Champagne Shimmer saree set, three-quarter view",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/champagne-shimmer/champagne-shimmer-04.jpg",
        "alt": "Champagne Shimmer — close view of the sequin and bead striped embroidery",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/champagne-shimmer/champagne-shimmer-05.jpg",
        "alt": "Champagne Shimmer — back view of the blouse and saree drape",
        "width": 1600,
        "height": 2000
      }
    ],
    "isNew": true,
    "isBestSeller": false,
    "rating": 0,
    "reviewCount": 0,
    "deliveryEstimate": "",
    "tags": [
      "saree",
      "milano",
      "foil-finish",
      "sequins",
      "champagne",
      "pleated"
    ]
  },
  {
    "id": "p03",
    "slug": "black-fern",
    "name": "Black Fern",
    "category": "Co-ord Set",
    "price": 9999,
    "shortDescription": "Sheer net sequin halter top worn over a bustier, with straight-fit pants.",
    "description": "This top is made with sheer net and sequin embroidery, with a wave-cut halter neckline that ties at the back. It's worn over a separate inner bustier and paired with smooth, straight-fit pants — perfect for an elegant evening look.",
    "details": [
      "Net sequin embroidered top with wave-cut halter neckline",
      "Back tie-up closure",
      "Includes separate inner bustier",
      "Straight-fit pants"
    ],
    "components": "3 (Top + Bustier + Pants)",
    "designerNote": "",
    "fabric": "Net with sequins (top) · Satin (bustier and pants)",
    "care": "Dry clean only.",
    "stylingSuggestion": "",
    "colors": [
      {
        "name": "Black",
        "hex": "#1A1A1A"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL"
    ],
    "sizeGuideType": "standard",
    "availability": "made-to-order",
    "images": [
      {
        "src": "/images/products/black-fern/black-fern-01.jpg",
        "alt": "Black Fern set — front view of the sheer net halter top over the bustier with straight-fit pants",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/black-fern/black-fern-02.jpg",
        "alt": "Black Fern — sequin embroidery seen through the sheer net top",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/black-fern/black-fern-03.jpg",
        "alt": "Black Fern set, three-quarter view",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/black-fern/black-fern-04.jpg",
        "alt": "Black Fern — close view of the wave-cut halter neckline and sequin embroidery",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/black-fern/black-fern-05.jpg",
        "alt": "Black Fern — back view showing the halter tie-up closure",
        "width": 1600,
        "height": 2000
      }
    ],
    "isNew": true,
    "isBestSeller": false,
    "rating": 0,
    "reviewCount": 0,
    "deliveryEstimate": "",
    "tags": [
      "co-ord-set",
      "net",
      "sequins",
      "halter",
      "black",
      "evening"
    ]
  },
  {
    "id": "p04",
    "slug": "butterfly-whisper",
    "name": "Butterfly Whisper",
    "category": "Skirt Set",
    "price": 9999,
    "shortDescription": "Butterfly-embroidered crop top with a ruched, draped skirt.",
    "description": "A wine crop top with a high round neckline, embroidered with butterflies and floral vines in pearls and beads, finished with a waist cutout, paired with a draped skirt with a ruched front panel for a soft, flowing finish.",
    "details": [
      "Sleeveless crop top with high round neckline",
      "Butterfly and floral embroidery in pearls and beads",
      "Waist cutout",
      "Draped skirt with ruched front panel"
    ],
    "components": "2 (Top + Skirt)",
    "designerNote": "",
    "fabric": "",
    "care": "Dry clean only.",
    "stylingSuggestion": "",
    "colors": [
      {
        "name": "Wine",
        "hex": "#4A2028"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL"
    ],
    "sizeGuideType": "standard",
    "availability": "made-to-order",
    "images": [
      {
        "src": "/images/products/butterfly-whisper/butterfly-whisper-01.jpg",
        "alt": "Butterfly Whisper set — front view of the embroidered crop top and draped skirt",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/butterfly-whisper/butterfly-whisper-02.jpg",
        "alt": "Butterfly Whisper set, three-quarter view",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/butterfly-whisper/butterfly-whisper-03.jpg",
        "alt": "Butterfly Whisper — close view of the butterfly and floral vine embroidery in pearls and beads",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/butterfly-whisper/butterfly-whisper-04.jpg",
        "alt": "Butterfly Whisper — detail of the ruched front panel on the draped skirt",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/butterfly-whisper/butterfly-whisper-05.jpg",
        "alt": "Butterfly Whisper set shown from the side",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/butterfly-whisper/butterfly-whisper-06.jpg",
        "alt": "Butterfly Whisper — back view of the crop top and draped skirt",
        "width": 1600,
        "height": 2000
      }
    ],
    "isNew": true,
    "isBestSeller": false,
    "rating": 0,
    "reviewCount": 0,
    "deliveryEstimate": "",
    "tags": [
      "skirt-set",
      "crop-top",
      "pearl-embroidery",
      "butterfly",
      "wine",
      "draped"
    ]
  },
  {
    "id": "p05",
    "slug": "pearl-trail",
    "name": "Pearl Trail",
    "category": "Saree Set",
    "price": 9999,
    "shortDescription": "Pearl trail embroidered blouse with net sleeves and a soft-draped chiffon saree.",
    "description": "A sage blouse with a sweetheart neckline and delicate pearl trail embroidery, finished with full-length sleeves in a pearl-beaded net trellis, paired with a soft-draped chiffon saree for a quiet, romantic finish.",
    "details": [
      "Net blouse with handwork, sweetheart neckline and pearl trail embroidery",
      "Full sleeves in pearl-beaded net trellis pattern",
      "Soft-draped chiffon saree"
    ],
    "components": "2 (Blouse + Saree)",
    "designerNote": "",
    "fabric": "Net with handwork and taffeta lining (blouse) · Chiffon (saree)",
    "care": "Dry clean only.",
    "stylingSuggestion": "",
    "colors": [
      {
        "name": "Sage",
        "hex": "#A7B6A0"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL"
    ],
    "sizeGuideType": "saree",
    "availability": "made-to-order",
    "images": [
      {
        "src": "/images/products/pearl-trail/pearl-trail-01.jpg",
        "alt": "Pearl Trail saree set — front view of the sage blouse and soft-draped chiffon saree",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/pearl-trail/pearl-trail-02.jpg",
        "alt": "Pearl Trail saree set with the arm raised to show the full net sleeve",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/pearl-trail/pearl-trail-03.jpg",
        "alt": "Pearl Trail — three-quarter view of the chiffon drape",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/pearl-trail/pearl-trail-04.jpg",
        "alt": "Pearl Trail saree set shown from the side",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/pearl-trail/pearl-trail-05.jpg",
        "alt": "Pearl Trail — close view of the pearl-beaded net trellis sleeve",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/pearl-trail/pearl-trail-06.jpg",
        "alt": "Pearl Trail — back view of the blouse and saree drape",
        "width": 1600,
        "height": 2000
      }
    ],
    "isNew": true,
    "isBestSeller": false,
    "rating": 0,
    "reviewCount": 0,
    "deliveryEstimate": "",
    "tags": [
      "saree",
      "chiffon",
      "net",
      "pearl-embroidery",
      "sage",
      "full-sleeves"
    ]
  },
  {
    "id": "p06",
    "slug": "cygnet",
    "name": "Cygnet",
    "category": "Co-ord Set",
    "price": 9999,
    "shortDescription": "Cutwork embroidered jacket over a padded bustier, with straight-fit pants.",
    "description": "An ivory cutwork jacket with hand embroidery in a sequin and bead lattice pattern, worn open over a padded bustier, finished with a wraparound tie, paired with straight-fit pants for a delicate, statement-making look.",
    "details": [
      "Open-front cutwork jacket with hand embroidery in sequin and bead lattice pattern",
      "Full sleeves",
      "Padded bustier included",
      "Wraparound tie included",
      "Straight-fit pants"
    ],
    "components": "4 (Jacket + Bustier + Wraparound Tie + Pants)",
    "designerNote": "",
    "fabric": "Handwork (jacket)",
    "care": "Dry clean only.",
    "stylingSuggestion": "",
    "colors": [
      {
        "name": "Ivory",
        "hex": "#F0E8D8"
      }
    ],
    "sizes": [
      "XS",
      "S",
      "M",
      "L",
      "XL"
    ],
    "sizeGuideType": "standard",
    "availability": "made-to-order",
    "images": [
      {
        "src": "/images/products/cygnet/cygnet-01.jpg",
        "alt": "Cygnet set — front view of the cutwork jacket worn open over the bustier with straight-fit pants",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/cygnet/cygnet-02.jpg",
        "alt": "Cygnet set, three-quarter view",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/cygnet/cygnet-03.jpg",
        "alt": "Cygnet — close view of the sequin and bead lattice hand embroidery on the jacket",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/cygnet/cygnet-04.jpg",
        "alt": "Cygnet — the cutwork jacket worn open over the padded bustier",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/cygnet/cygnet-05.jpg",
        "alt": "Cygnet set shown from the side",
        "width": 1600,
        "height": 2000
      },
      {
        "src": "/images/products/cygnet/cygnet-06.jpg",
        "alt": "Cygnet — back view of the cutwork jacket and straight-fit pants",
        "width": 1600,
        "height": 2000
      }
    ],
    "isNew": true,
    "isBestSeller": false,
    "rating": 0,
    "reviewCount": 0,
    "deliveryEstimate": "",
    "tags": [
      "co-ord-set",
      "cutwork",
      "hand-embroidery",
      "bustier",
      "ivory",
      "jacket"
    ]
  }
];

/** Slug → seed product, used for build-time metadata on /product/[slug]. */
export const productMap: Record<string, Product> = Object.fromEntries(products.map((p) => [p.slug, p]));
