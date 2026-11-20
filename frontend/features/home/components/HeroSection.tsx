export function HeroSection() {
  return (
    <section className="border-b border-green-100 bg-green-50/60 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-3 inline-block rounded-full bg-green-100 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-green-900">
          Grassroots Tribal & Rural Empowerment • Vidarbha
        </p>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight text-green-950 md:text-5xl">
          Strengthening Gram Sabhas, Forest Rights & Sustainable Livelihoods
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
          Registered non-profit voluntary organization working across remote tribal villages of
          Kurkheda and Gadchiroli since 1998 in water conservation, organic farming, community
          forest governance (FRA/PESA), and women&apos;s self-help federations.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#donate"
            className="rounded-lg bg-green-800 px-6 py-3 text-sm font-semibold text-white hover:bg-green-900"
          >
            Support Our Work (80G)
          </a>
          <a
            href="#events"
            className="rounded-lg border border-green-800 bg-white px-6 py-3 text-sm font-semibold text-green-900 hover:bg-green-50"
          >
            Recent Field Activities
          </a>
        </div>
      </div>
    </section>
  );
}
