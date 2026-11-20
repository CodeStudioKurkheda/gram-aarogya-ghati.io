import { getActivities } from "../service";
import { ActivityGrid } from "./ActivityGrid";

export async function ActivitiesFeed() {
  const activities = await getActivities();
  return <ActivityGrid activities={activities} />;
}
