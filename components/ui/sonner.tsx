"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-left"
      toastOptions={{
        classNames: {
          toast:
            "bg-ink! text-ivory! border-none! rounded-none! shadow-[0_20px_50px_-15px_rgba(17,17,17,0.4)]! font-sans! text-sm!",
          title: "text-ivory! font-medium!",
          description: "text-ivory/70!",
          actionButton: "bg-ivory! text-gold!",
          cancelButton: "bg-transparent! text-ivory/70!",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
