import { Calendar, MapPin } from "lucide-react";
import { Activity } from "../types";

export function ActivityGrid({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return <p className="mt-8 text-sm text-slate-500">No field activities published yet.</p>;
  }

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {activities.map((act) => (
        <article
          key={act.id}
          className="overflow-hidden rounded-xl border border-green-100 bg-white shadow-xs"
        >
          {act.images.length > 0 ? (
            <img
              src={act.images[0].public_url}
              alt={act.headline}
              className="h-48 w-full object-cover"
            />
          ) : (
            <div className="flex h-48 items-center justify-center bg-green-100/60 text-xs font-medium text-green-800">
              Field Documentation • Gram Arogya Ghati
            </div>
          )}

          <div className="p-5">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-green-700" />
                {act.event_date}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-green-700" />
                {act.location}
              </span>
            </div>

            <h3 className="mt-2.5 text-lg font-semibold text-green-950">{act.headline}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
              {act.description}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
