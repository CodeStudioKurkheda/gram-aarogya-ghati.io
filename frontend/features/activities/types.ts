export interface ActivityImage {
  id: number;
  public_url: string;
  size_bytes: number;
}

export interface Activity {
  id: number;
  headline: string;
  description: string;
  location: string;
  event_date: string;
  images: ActivityImage[];
}
