'use client';

export default function ErrorBoundary({ error }: { error: Error }) {
  return <p>Unexpected error: {error.message}</p>;
}
