import { Sprout, ShieldCheck, Users, HeartHandshake } from "lucide-react";

const PILLARS = [
  {
    icon: Sprout,
    title: "Forest Rights & CFR",
    desc: "Supporting tribal Gram Sabhas to manage community forest resources and Tendu Patta trade.",
  },
  {
    icon: ShieldCheck,
    title: "Water Conservation",
    desc: "Community-driven lake deepening, desilting, and watershed revival across drought-prone villages.",
  },
  {
    icon: Users,
    title: "Women's SHGs",
    desc: "Capacity building and micro-enterprise federations for tribal and rural women.",
  },
  {
    icon: HeartHandshake,
    title: "Health & Education",
    desc: "Rural preventive health awareness, naturopathy training, and quality schooling access.",
  },
];

export function FocusPillars() {
  return (
    <section id="programs" className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-bold text-green-950">Core Focus Areas</h2>
      <p className="mt-1 text-sm text-slate-600">
        Community-led initiatives anchored in local governance and ecological regeneration.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-green-100 bg-white p-6 shadow-xs"
          >
            <item.icon className="h-7 w-7 text-green-800" />
            <h3 className="mt-4 font-semibold text-green-950">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
