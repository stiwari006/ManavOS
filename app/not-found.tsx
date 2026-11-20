import "@fontsource/dm-mono/400.css";
import Link from "next/link";
export default function NotFound() {
  return (
    <div className="grid min-h-svh place-items-center bg-paper p-6 text-center">
      <div>
        <p className="t-mono text-mute">404</p>
        <h1 className="t-h2 mt-4">Nobody&rsquo;s here.</h1>
        <p className="mt-3 text-ink/65">The page you&rsquo;re looking for doesn&rsquo;t exist.</p>
        <Link href="/" className="t-mono mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 text-paper">Back home</Link>
      </div>
    </div>
  );
}
