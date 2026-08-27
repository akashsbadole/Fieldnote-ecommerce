export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 h-16 animate-pulse border-b border-line" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-paper-dim" />
            <div className="mt-3 h-4 w-3/4 bg-paper-dim" />
            <div className="mt-2 h-3 w-1/3 bg-paper-dim" />
          </div>
        ))}
      </div>
    </div>
  );
}
