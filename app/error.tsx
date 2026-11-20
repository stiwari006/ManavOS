"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div>
        <p className="t-mono text-mute">Something went wrong</p>
        <h1 className="t-h2 mt-3">We hit a snag.</h1>
        <p className="mt-4 text-mute">It's on us. Try again, or head back home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={reset} className="t-mono h-11 rounded-full bg-ink px-5 text-paper">Try again</button>
          <a href="/" className="t-mono inline-flex h-11 items-center rounded-full border border-line px-5">Home</a>
        </div>
      </div>
    </main>
  );
}
