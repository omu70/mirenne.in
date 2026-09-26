"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

/** Search input that writes ?q= to the URL, so results are server-rendered and shareable. */
export function SearchBox({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = React.useState(params.get("q") ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (value.trim()) next.set("q", value.trim());
    else next.delete("q");
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <form onSubmit={submit} className="flex h-10 w-full max-w-sm items-center gap-2 border border-hairline-dark bg-ivory px-3">
      <Search className="h-4 w-4 shrink-0 text-graphite" strokeWidth={1.5} />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-full flex-1 bg-transparent text-sm text-ink placeholder:text-graphite/70 focus:outline-none"
      />
    </form>
  );
}
