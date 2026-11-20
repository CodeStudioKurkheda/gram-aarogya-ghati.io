import { CurrentYear } from "./CurrentYear";

export function Footer() {
  return (
    <footer className="border-t border-green-900 bg-green-950 text-green-50">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
        <div>
          <h3 className="text-lg font-bold text-white">Gram Arogya Ghati</h3>
          <p className="mt-1 text-sm text-green-200">
            Post Ta. Kurkheda, Azad Ward, Kurkheda, Dist. Gadchiroli, Maharashtra – 441209
          </p>
          <p className="mt-1 text-sm text-green-200">Phone: +91 9112074733</p>
        </div>
        <p className="text-xs text-green-400">
          © <CurrentYear /> Gram Arogya Ghati. Independent Community Portal.
        </p>
      </div>
    </footer>
  );
}
