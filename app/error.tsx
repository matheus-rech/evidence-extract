'use client';

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div>
      <p>Unexpected error: {error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
