import { cn } from "@/lib/utils";

interface MotifProps {
  className?: string;
}

const base = "stroke-current fill-none";

export function MotifArc({ className }: MotifProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn(className)} aria-hidden="true">
      <path d="M20,150 Q100,30 180,150" className={base} strokeWidth={1} />
    </svg>
  );
}

export function MotifVesica({ className }: MotifProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn(className)} aria-hidden="true">
      <path d="M40,50 A85,85 0 0,1 40,190" className={base} strokeWidth={1} />
      <path d="M160,50 A85,85 0 0,0 160,190" className={base} strokeWidth={1} />
    </svg>
  );
}

export function MotifWave({ className }: MotifProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn(className)} aria-hidden="true">
      <path d="M15,110 C55,50 75,170 115,110 S175,50 185,110" className={base} strokeWidth={1} />
    </svg>
  );
}

export function MotifRings({ className }: MotifProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn(className)} aria-hidden="true">
      <circle cx="85" cy="100" r="55" className={base} strokeWidth={1} />
      <circle cx="130" cy="100" r="30" className={base} strokeWidth={1} />
    </svg>
  );
}

export function MotifFan({ className }: MotifProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn(className)} aria-hidden="true">
      <path d="M30,170 L100,40" className={base} strokeWidth={1} />
      <path d="M70,175 L120,45" className={base} strokeWidth={1} />
      <path d="M115,178 L145,55" className={base} strokeWidth={1} />
    </svg>
  );
}

export function MotifSwirl({ className }: MotifProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn(className)} aria-hidden="true">
      <path
        d="M120,40 C70,40 40,75 45,115 C49,148 80,168 108,155 C130,145 132,118 112,108 C97,101 82,112 88,126"
        className={base}
        strokeWidth={1}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MotifArch({ className }: MotifProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn(className)} aria-hidden="true">
      <path d="M50,180 V90 A60,60 0 0,1 170,90 V180" className={base} strokeWidth={1} />
    </svg>
  );
}

export function MotifChevron({ className }: MotifProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn(className)} aria-hidden="true">
      <path d="M30,60 L100,140 L170,60" className={base} strokeWidth={1} />
      <path d="M45,105 L100,168 L155,105" className={base} strokeWidth={1} opacity={0.5} />
    </svg>
  );
}

export function MotifPin({ className }: MotifProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn(className)} aria-hidden="true">
      <line x1="100" y1="55" x2="100" y2="175" className={base} strokeWidth={1} />
      <circle cx="100" cy="35" r="11" className={base} strokeWidth={1} />
    </svg>
  );
}

export function MotifSprig({ className }: MotifProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn(className)} aria-hidden="true">
      <path d="M100,180 V50" className={base} strokeWidth={1} />
      <path
        d="M100,120 C80,110 68,90 85,75 C102,90 100,112 100,120 Z"
        className={base}
        strokeWidth={1}
        transform="rotate(-18 100 100)"
      />
      <path
        d="M100,140 C120,130 132,110 115,95 C98,110 100,132 100,140 Z"
        className={base}
        strokeWidth={1}
        transform="rotate(18 100 100)"
      />
    </svg>
  );
}

export function MotifAsterisk({ className }: MotifProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn(className)} aria-hidden="true">
      <line x1="100" y1="35" x2="100" y2="165" className={base} strokeWidth={1} />
      <line x1="35" y1="100" x2="165" y2="100" className={base} strokeWidth={1} />
      <line x1="55" y1="55" x2="145" y2="145" className={base} strokeWidth={1} />
      <line x1="145" y1="55" x2="55" y2="145" className={base} strokeWidth={1} />
    </svg>
  );
}

export function MotifCrescent({ className }: MotifProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn(className)} aria-hidden="true">
      <path
        d="M125,40 A70,70 0 1,0 125,160 A55,55 0 1,1 125,40 Z"
        className={base}
        strokeWidth={1}
      />
    </svg>
  );
}

export const MOTIFS = [
  MotifArc,
  MotifVesica,
  MotifWave,
  MotifRings,
  MotifFan,
  MotifSwirl,
  MotifArch,
  MotifChevron,
  MotifPin,
  MotifSprig,
  MotifAsterisk,
  MotifCrescent,
] as const;

export function motifForIndex(index: number) {
  const Motif = MOTIFS[index % MOTIFS.length];
  return Motif;
}
