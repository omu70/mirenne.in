// Sourced verbatim from the Website Content Handoff doc, section 6.
export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  title: string;
  items: FaqItem[];
}

export const faqCategories: FaqCategory[] = [
  {
    title: "Ordering & Customization",
    items: [
      {
        question: "How does made-to-order work?",
        answer:
          "Every piece is made only after you place your order. Once confirmed, our karigars begin cutting and stitching your piece specifically to your measurements.",
      },
      {
        question: "Can I customize a piece, color, fabric, or design details?",
        answer:
          "Yes, within reason. Let us know what you have in mind when placing your order, and we'll confirm what's possible for that particular piece.",
      },
      {
        question: "How long does an order take to make?",
        answer:
          "10 days from order confirmation to shipping. Festive season pieces may take slightly longer, we'll always confirm your timeline upfront.",
      },
      {
        question: "Can I cancel or modify my order after placing it?",
        answer:
          "Yes, within 24 hours of placing your order. Once your karigar has begun work, we're unable to accept cancellations or major changes.",
      },
    ],
  },
  {
    title: "Sizing & Fit",
    items: [
      {
        question: "How do I know what size to order?",
        answer:
          "We offer standard sizing from XS to XL. Check our Size Guide for detailed measurements for each size, and pick the one closest to your own.",
      },
      {
        question: "Can I request a fully custom fit outside the standard size chart?",
        answer:
          "Yes. If the standard sizes don't work for you, we're happy to make your piece to your exact measurements instead. Just let us know when placing your order.",
      },
      {
        question: "What if I fall between two sizes?",
        answer: "Message us on Instagram, we're happy to help you decide, or suggest a custom fit instead.",
      },
      {
        question: "What if my measurements change after I've placed my order?",
        answer:
          "DM us on Instagram as soon as possible, we'll do our best to accommodate the change depending on how far along your order is.",
      },
      {
        question: "Do you add any ease or allowance for comfort?",
        answer: "Yes, a small comfort allowance is factored into each size for a comfortable fit.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      { question: "Where do you ship?", answer: "Currently, we ship across India." },
      {
        question: "How long does shipping take once my order is ready?",
        answer: "Delivery time depends on your location, typically a few business days after your order is shipped.",
      },
      {
        question: "How can I track my order?",
        answer: "Once your order ships, you'll receive a tracking link so you can follow your delivery in real time.",
      },
      {
        question: "Do you offer express or rush shipping?",
        answer: "Yes, message us on Instagram if you need your order sooner, and we'll do our best to accommodate it.",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      { question: "What payment methods do you accept?", answer: "We accept UPI and net banking." },
      {
        question: "Do I need to pay in full upfront?",
        answer: "Yes, full payment is required at the time of placing your order, since each piece is made specifically for you.",
      },
      { question: "Is my payment secure?", answer: "Yes, all payments are processed through a secure payment gateway." },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        question: "Can I return my order?",
        answer: "Since every piece is made specifically for you, we're unable to accept returns.",
      },
      {
        question: "Can I exchange my order for a different size?",
        answer:
          "We don't offer exchanges for sizing, since sizing is confirmed by you at the time of order. However, if there's a fit issue that isn't due to an incorrect size selection on your part, we're happy to offer an alteration.",
      },
      {
        question: "What if my order arrives damaged or incorrect?",
        answer:
          "If your order arrives damaged or isn't what you ordered, reach out to us within 24 hours of delivery, and we'll arrange an exchange.",
      },
    ],
  },
  {
    title: "Care Instructions",
    items: [
      {
        question: "How should I care for my Mirenne piece?",
        answer: "We recommend dry cleaning only, to preserve the fabric and handwork.",
      },
      { question: "Can I iron my piece?", answer: "Yes, on low heat. Avoid direct heat on any embellished areas." },
      {
        question: "How should I store my piece?",
        answer: "Store in a breathable cloth cover, away from direct sunlight, to keep the fabric and embellishments in good condition.",
      },
    ],
  },
];
