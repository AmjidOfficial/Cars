import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";

function Placeholder({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[10px] tracking-widest uppercase text-muted-foreground">
        <Construction className="h-3 w-3" /> Coming soon
      </div>
      <h1 className="mt-6 font-display text-4xl tracking-display">{title}</h1>
      <p className="mt-4 text-muted-foreground">{blurb}</p>
    </div>
  );
}

export const MediaFeedRoute = createFileRoute("/media-feed")({
  head: () => ({ meta: [{ title: "Media Feed — Bazar360" }] }),
  component: () => <Placeholder title="Media Feed" blurb="A scrolling, social-style feed of walkarounds, reels, and stories from every showroom is launching next." />,
});
