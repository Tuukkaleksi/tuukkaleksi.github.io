import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
      <h1 className="mt-2 font-display text-3xl font-bold">Sivua ei löytynyt</h1>
      <p className="mt-3 max-w-md text-secondary">
        Etsimääsi sivua ei ole tai se on siirretty uuteen osoitteeseen.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        Etusivulle
      </Link>
    </main>
  );
}
