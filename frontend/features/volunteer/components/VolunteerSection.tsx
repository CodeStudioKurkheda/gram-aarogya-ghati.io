"use client";

import { useState } from "react";
import { CheckCircle2, Users } from "lucide-react";
import { registerVolunteer } from "../service";

export function VolunteerSection() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [village, setVillage] = useState("");
  const [interest, setInterest] = useState("Field Outreach & Gram Sabha Support");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await registerVolunteer({
      full_name: fullName,
      phone,
      email: email.trim() || undefined,
      village_or_city: village,
      skills_or_interest: interest,
      consent,
      honeypot,
    });
    setSubmitting(false);
    if (ok) {
      setSubmitted(true);
    } else {
      alert("Could not submit form. Please check your phone number and consent box.");
    }
  }

  return (
    <section id="volunteer" className="border-t border-green-100 bg-green-50/30 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2 items-start">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-900">
            <Users className="h-3.5 w-3.5" /> Join Our Field & Tech Network
          </div>
          <h2 className="mt-3 text-2xl font-bold text-green-950">Volunteer With Gram Arogya Ghati</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Whether you are a medical professional, forestry researcher, educator, or software
            volunteer, your time directly supports tribal Gram Sabhas across Kurkheda and
            Gadchiroli.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>• Rural health & preventive care camps</li>
            <li>• Community Forest Resource (CFR) mapping & documentation</li>
            <li>• Women&apos;s Self-Help Group (SHG) bookkeeping & training</li>
          </ul>
        </div>

        <div className="rounded-xl border border-green-200 bg-white p-6 shadow-xs">
          {submitted ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-5 text-sm text-green-900">
              <p className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="h-5 w-5 text-green-700" /> Registration Received!
              </p>
              <p className="mt-2 text-xs leading-relaxed">
                Thank you, <strong>{fullName}</strong>. Our Kurkheda coordinator will reach out
                to you on <strong>{phone}</strong> soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Hidden honeypot anti-spam trap */}
              <input
                type="text"
                name="website_url"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="hidden"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name *"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  type="tel"
                  required
                  minLength={10}
                  maxLength={15}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile Number (WhatsApp/SMS) *"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Village / Town / City *"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (Optional)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <select
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
              >
                <option>Field Outreach & Gram Sabha Support</option>
                <option>Health & Medical Camp Volunteer</option>
                <option>Forestry, Water & Agriculture</option>
                <option>Education & Women SHG Training</option>
                <option>Remote Documentation / Tech Support</option>
              </select>

              <label className="flex items-start gap-2.5 pt-1 text-xs text-slate-600">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-green-800 focus:ring-green-700"
                />
                <span>
                  I consent to Gram Arogya Ghati storing my contact details to coordinate
                  volunteer activities (DPDP Act compliant; removable anytime on request).
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-green-800 py-2.5 text-sm font-semibold text-white hover:bg-green-900 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Sign Up to Volunteer"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
