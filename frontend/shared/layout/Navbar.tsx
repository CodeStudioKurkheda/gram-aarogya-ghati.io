import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-green-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-800 font-bold text-white">
            GA
          </div>
          <div>
            <span className="block text-lg font-bold tracking-tight text-green-900">
              Gram Arogya Ghati
            </span>
            <span className="block text-xs text-slate-500">
              Kurkheda, Gadchiroli • Est. 1998
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex">
          <a href="#programs" className="hover:text-green-800">Programs</a>
          <a href="#events" className="hover:text-green-800">Activities</a>
          <a href="#volunteer" className="hover:text-green-800">Volunteer</a>
          <a
            href="#donate"
            className="rounded-md bg-green-800 px-3.5 py-1.5 text-white hover:bg-green-900"
          >
            Donate (80G)
          </a>
          <Link
            href="/admin"
            className="rounded-md border border-green-700 px-3.5 py-1.5 text-green-800 hover:bg-green-50"
          >
            Staff Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
