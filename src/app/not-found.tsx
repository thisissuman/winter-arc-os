import Link from "next/link";
export default function NotFound() {
  return <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6"><p className="text-sm text-muted-foreground">Page not found</p><h1 className="mt-3 text-2xl font-semibold">Let&apos;s find your way back.</h1><Link href="/" className="mt-6 text-sm text-primary hover:underline">Return to your workspace</Link></main>;
}
