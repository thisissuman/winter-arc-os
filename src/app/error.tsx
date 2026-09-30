"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="mx-auto flex min-h-[70dvh] max-w-md flex-col justify-center px-6">
    <h1 className="text-2xl font-semibold">We couldn&apos;t load this page.</h1>
    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Try again in a moment. If this keeps happening, check your account service connection and database setup.</p>
    <Button className="mt-6 self-start" onClick={reset}>Try again</Button>
  </main>;
}
