import { ENV } from "@/shared/config/env";
import { Activity } from "./types";

export async function getActivities(): Promise<Activity[]> {
  const res = await fetch(`${ENV.API_URL}/api/activities/`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
