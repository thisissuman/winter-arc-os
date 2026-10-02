export default function ReflectionLoading() {
  return <div className="space-y-5" role="status" aria-label="Loading reflections"><div className="h-9 w-48 animate-pulse rounded bg-secondary" /><div className="grid gap-4 md:grid-cols-2">{[0, 1].map((item) => <div key={item} className="h-40 animate-pulse rounded-xl bg-secondary" />)}</div></div>;
}
