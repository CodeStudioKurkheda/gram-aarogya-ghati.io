import { ENV } from "@/shared/config/env";
import { VolunteerPayload } from "./types";

export async function registerVolunteer(payload: VolunteerPayload): Promise<boolean> {
  const res = await fetch(`${ENV.API_URL}/api/content/volunteers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.ok;
}
