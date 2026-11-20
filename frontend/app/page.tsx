import { Suspense } from "react";
import { Navbar } from "@/shared/layout/Navbar";
import { Footer } from "@/shared/layout/Footer";
import { HeroSection } from "@/features/home/components/HeroSection";
import { FocusPillars } from "@/features/home/components/FocusPillars";
import { ActivitiesFeed } from "@/features/activities/components/ActivitiesFeed";
import { VolunteerSection } from "@/features/volunteer/components/VolunteerSection";
import { DonateCard } from "@/features/donations/components/DonateCard";
import { BankTransferCard } from "@/features/donations/components/BankTransferCard";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Navbar />

      <main>
        <HeroSection />
        <FocusPillars />

        {/* Live Field Activities Section (Streamed inside Suspense) */}
        <section id="events" className="border-t border-green-100 bg-green-50/40 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-bold text-green-950">Recent Field Activities</h2>
            <p className="mt-1 text-sm text-slate-600">
              Live updates posted directly by our field team in Kurkheda.
            </p>
            <Suspense
              fallback={
                <p className="mt-8 text-sm text-slate-500">Loading field activities...</p>
              }
            >
              <ActivitiesFeed />
            </Suspense>
          </div>
        </section>

        <VolunteerSection />

        {/* Donations Section */}
        <section id="donate" className="border-t border-green-100 bg-white py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-bold text-green-950">Support Gram Arogya Ghati</h2>
            <p className="mt-1 text-sm text-slate-600">
              All contributions are eligible for tax exemption under Section 80G of the Income Tax Act.
            </p>

            <div className="mt-8 grid items-start gap-8 md:grid-cols-2">
              <DonateCard />
              <BankTransferCard />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
