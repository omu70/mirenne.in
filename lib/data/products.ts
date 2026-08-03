import type { Product } from "@/lib/types";

// Seed/scaffolding data only. This is not a curated 'final six' — these are
// simply the first product introduced in each of six collections in the
// original 46-piece placeholder catalogue, kept purely so the site has
// something to render out of the box. The live catalogue now lives in
// lib/store/product-store.ts (persisted, editable from /admin/products) —
// this array only seeds that store on first load. Replace it there.
export const products: Product[] = [
  {
    "id": "p01",
    "slug": "kalaghoda-column-gown",
    "name": "Kalaghoda Column Gown",
    "collection": "evening-wear",
    "category": "Gown",
    "price": 52500,
    "shortDescription": "A structured column gown built for rooms that matter.",
    "description": "Cut from raw silk and finished with a single hand-set seam at the waist, this column gown holds its shape through a full evening without asking for adjustment. The silhouette is narrow by design, built to move as one line rather than several. It is the kind of dress that photographs the same at nine and at midnight.",
    "designerNote": "We drafted this pattern four times before the line through the waist held without a single dart showing.",
    "fabric": "raw silk",
    "care": "Dry clean only. Store on a padded hanger away from direct light.",
    "stylingSuggestion": "Wear with a single cuff and nothing else at the wrist.",
    "colors": [
      {
        "name": "Black",
        "hex": "#1A1A1A"
      },
      {
        "name": "Wine",
        "hex": "#6B1F2A"
      },
      {
        "name": "Midnight Navy",
        "hex": "#1C2333"
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
        "src": "/images/mood/portrait-06.jpg",
        "alt": "Kalaghoda Column Gown — front view",
        "width": 1000,
        "height": 1300
      },
      {
        "src": "/images/mood/portrait-09.jpg",
        "alt": "Kalaghoda Column Gown shown in movement",
        "width": 1000,
        "height": 1300
      },
      {
        "src": "/images/mood/detail-01.jpg",
        "alt": "A closer look at the hand-finished edge of the Kalaghoda Column Gown",
        "width": 900,
        "height": 1100
      },
      {
        "src": "/images/mood/detail-02.jpg",
        "alt": "Texture study of the Kalaghoda Column Gown in raw silk",
        "width": 900,
        "height": 1100
      }
    ],
    "isNew": false,
    "isBestSeller": true,
    "rating": 4.8,
    "reviewCount": 4,
    "deliveryEstimate": "Made to order — ships in 3–4 weeks",
    "tags": [
      "raw-silk",
      "hand-embroidered",
      "column-gown",
      "evening",
      "made-to-order"
    ]
  },
  {
    "id": "p09",
    "slug": "konkan-linen-co-ord",
    "name": "Konkan Linen Co-ord Set",
    "collection": "resort",
    "category": "Co-ord Set",
    "price": 16800,
    "shortDescription": "A relaxed cotton co-ord for slow coastal mornings.",
    "description": "Fine cotton is cut loose through the body and finished with a self-tie waist rather than a fixed seam, so the fit adjusts to the day rather than the other way around. Built for the version of a holiday that involves more sitting than standing. The pieces work separately as easily as together.",
    "designerNote": "We tested this fabric through three humid seasons before it earned a place in the line.",
    "fabric": "fine cotton",
    "care": "Machine wash cold, separately. Line dry out of direct sun.",
    "stylingSuggestion": "Wear the top open over the matching trouser and nothing underneath but skin.",
    "colors": [
      {
        "name": "Ivory",
        "hex": "#F7F3EC"
      },
      {
        "name": "Sage",
        "hex": "#8A9A7E"
      },
      {
        "name": "Champagne",
        "hex": "#E9DCC3"
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
    "availability": "in-stock",
    "images": [
      {
        "src": "/images/mood/portrait-02.jpg",
        "alt": "Konkan Linen Co-ord Set — front view",
        "width": 1000,
        "height": 1300
      },
      {
        "src": "/images/mood/portrait-18.jpg",
        "alt": "Konkan Linen Co-ord Set shown in movement",
        "width": 1000,
        "height": 1300
      },
      {
        "src": "/images/mood/detail-02.jpg",
        "alt": "A closer look at the hand-finished edge of the Konkan Linen Co-ord Set",
        "width": 900,
        "height": 1100
      }
    ],
    "isNew": true,
    "isBestSeller": true,
    "rating": 3.3,
    "reviewCount": 3,
    "deliveryEstimate": "Ships in 3–5 business days",
    "tags": [
      "cotton",
      "co-ord-set",
      "resort"
    ]
  },
  {
    "id": "p15",
    "slug": "kalaghoda-cocktail-dress",
    "name": "Kalaghoda Cocktail Dress",
    "collection": "cocktail",
    "category": "Cocktail Dress",
    "price": 28500,
    "shortDescription": "A fitted cocktail dress in fluid silk chiffon.",
    "description": "Cut close through the bodice and released into movement below the knee, this dress is built for a room smaller than a ballroom and a light closer than a stage. Silk chiffon keeps it from ever looking stiff. It is the dress most often repurchased in a second colour.",
    "designerNote": "We shortened the hem twice before it moved the way we wanted.",
    "fabric": "silk chiffon",
    "care": "Dry clean only.",
    "stylingSuggestion": "Wear with a low, simple heel rather than anything too formal.",
    "colors": [
      {
        "name": "Black",
        "hex": "#1A1A1A"
      },
      {
        "name": "Wine",
        "hex": "#6B1F2A"
      },
      {
        "name": "Dusty Rose",
        "hex": "#C99999"
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
    "availability": "in-stock",
    "images": [
      {
        "src": "/images/mood/portrait-17.jpg",
        "alt": "Kalaghoda Cocktail Dress shown in full length",
        "width": 1000,
        "height": 1300
      },
      {
        "src": "/images/mood/portrait-19.jpg",
        "alt": "Kalaghoda Cocktail Dress styled from the side",
        "width": 1000,
        "height": 1300
      },
      {
        "src": "/images/mood/detail-10.jpg",
        "alt": "Close-up of the silk chiffon on the Kalaghoda Cocktail Dress",
        "width": 900,
        "height": 1100
      }
    ],
    "isNew": false,
    "isBestSeller": true,
    "rating": 4,
    "reviewCount": 4,
    "deliveryEstimate": "Ships in 3–5 business days",
    "tags": [
      "silk-chiffon",
      "cocktail-dress",
      "cocktail"
    ]
  },
  {
    "id": "p22",
    "slug": "lucknow-chikankari-anarkali",
    "name": "Lucknow Chikankari Anarkali",
    "collection": "wedding-guest",
    "category": "Anarkali",
    "price": 47500,
    "shortDescription": "A chikankari-embroidered anarkali in fine chanderi.",
    "description": "Hand-embroidered chikankari covers the yoke in a pattern fine enough to read as texture rather than decoration from across a room. The chanderi base gives the flare its particular soft movement. This is the piece most often described to us as an heirloom in the making.",
    "designerNote": "Chikankari this fine is worked by needle alone, with no machine able to replicate the tension.",
    "fabric": "chanderi",
    "care": "Dry clean only.",
    "stylingSuggestion": "Keep the dupatta draped loosely rather than pinned.",
    "colors": [
      {
        "name": "Ivory",
        "hex": "#F7F3EC"
      },
      {
        "name": "Champagne",
        "hex": "#E9DCC3"
      },
      {
        "name": "Sage",
        "hex": "#8A9A7E"
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
        "src": "/images/mood/portrait-23.jpg",
        "alt": "Lucknow Chikankari Anarkali, standing portrait",
        "width": 1000,
        "height": 1300
      },
      {
        "src": "/images/mood/portrait-24.jpg",
        "alt": "Lucknow Chikankari Anarkali, three-quarter view",
        "width": 1000,
        "height": 1300
      },
      {
        "src": "/images/mood/detail-09.jpg",
        "alt": "Texture study of the Lucknow Chikankari Anarkali in chanderi",
        "width": 900,
        "height": 1100
      },
      {
        "src": "/images/mood/detail-10.jpg",
        "alt": "Close-up of the chanderi on the Lucknow Chikankari Anarkali",
        "width": 900,
        "height": 1100
      }
    ],
    "isNew": false,
    "isBestSeller": true,
    "rating": 4.5,
    "reviewCount": 4,
    "deliveryEstimate": "Made to order — ships in 3–4 weeks",
    "tags": [
      "chanderi",
      "hand-embroidered",
      "anarkali",
      "wedding-guest",
      "made-to-order"
    ]
  },
  {
    "id": "p29",
    "slug": "chanderi-marigold-lehenga",
    "name": "Chanderi Marigold Lehenga Set",
    "collection": "festive",
    "category": "Lehenga Set",
    "price": 56800,
    "shortDescription": "A marigold-toned lehenga with gota-patti detail.",
    "description": "Rust and marigold sit against antique gold in a palette built specifically for lamplight rather than daylight. Gota-patti work covers the hem and blouse in a raised, textured pattern. This is the lehenga we see most often at Diwali, and the one we restock fastest.",
    "designerNote": "We tested this exact rust under lamplight before agreeing on the final shade.",
    "fabric": "gota-patti silk",
    "care": "Dry clean only.",
    "stylingSuggestion": "Wear with gold jewellery and skip anything silver entirely.",
    "colors": [
      {
        "name": "Rust",
        "hex": "#A6472F"
      },
      {
        "name": "Antique Gold",
        "hex": "#B8935A"
      },
      {
        "name": "Wine",
        "hex": "#6B1F2A"
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
        "src": "/images/mood/portrait-09.jpg",
        "alt": "Chanderi Marigold Lehenga Set — front view",
        "width": 1000,
        "height": 1300
      },
      {
        "src": "/images/mood/portrait-17.jpg",
        "alt": "Chanderi Marigold Lehenga Set shown in movement",
        "width": 1000,
        "height": 1300
      },
      {
        "src": "/images/mood/detail-09.jpg",
        "alt": "A closer look at the hand-finished edge of the Chanderi Marigold Lehenga Set",
        "width": 900,
        "height": 1100
      }
    ],
    "isNew": false,
    "isBestSeller": true,
    "rating": 5,
    "reviewCount": 3,
    "deliveryEstimate": "Made to order — ships in 3–4 weeks",
    "tags": [
      "gota-patti",
      "hand-embroidered",
      "lehenga",
      "festive",
      "made-to-order"
    ]
  },
  {
    "id": "p36",
    "slug": "konkan-sunset-kaftan",
    "name": "Konkan Sunset Kaftan",
    "collection": "vacation",
    "category": "Kaftan",
    "price": 17500,
    "shortDescription": "A lightweight kaftan in warm sunset-inspired tones.",
    "description": "Georgette falls loose from a simple gathered yoke, cut wide enough to move through heat without clinging. The colour was chosen to read well against both sand and evening light. This is the piece we recommend packing first for any warm-weather trip.",
    "designerNote": "We named this for the exact hour on the Konkan coast when the light turns this same colour.",
    "fabric": "georgette",
    "care": "Hand wash cold and lay flat to dry.",
    "stylingSuggestion": "Wear open over a swimsuit by day, belted for dinner.",
    "colors": [
      {
        "name": "Blush",
        "hex": "#E3C4C0"
      },
      {
        "name": "Rust",
        "hex": "#A6472F"
      },
      {
        "name": "Champagne",
        "hex": "#E9DCC3"
      }
    ],
    "sizes": [
      "Custom Size"
    ],
    "sizeGuideType": "free-size",
    "availability": "in-stock",
    "images": [
      {
        "src": "/images/mood/portrait-20.jpg",
        "alt": "Konkan Sunset Kaftan, front view against a quiet backdrop",
        "width": 1000,
        "height": 1300
      },
      {
        "src": "/images/mood/portrait-01.jpg",
        "alt": "Konkan Sunset Kaftan, alternate angle",
        "width": 1000,
        "height": 1300
      },
      {
        "src": "/images/mood/detail-08.jpg",
        "alt": "georgette detail from the Konkan Sunset Kaftan",
        "width": 900,
        "height": 1100
      }
    ],
    "isNew": true,
    "isBestSeller": false,
    "rating": 0,
    "reviewCount": 0,
    "deliveryEstimate": "Ships in 3–5 business days",
    "tags": [
      "georgette",
      "kaftan",
      "vacation"
    ]
  }
];

export const productMap: Record<string, Product> = Object.fromEntries(products.map((p) => [p.slug, p]));
