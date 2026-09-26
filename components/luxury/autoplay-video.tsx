"use client";

import * as React from "react";

interface AutoplayVideoProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "src"> {
  src: string;
  poster?: string;
}

/**
 * Muted, looping, inline video that only downloads and plays while it is on
 * screen. The homepage runs one of these per product, so without the
 * IntersectionObserver every clip would fetch and decode at once on load.
 * Until it is near the viewport the poster is all that renders; visitors
 * with reduced motion get the poster and no playback.
 */
export function AutoplayVideo({ src, poster, className, ...rest }: AutoplayVideoProps) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={active ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      className={className}
      {...rest}
    />
  );
}
