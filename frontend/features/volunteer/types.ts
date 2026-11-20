export interface VolunteerPayload {
  full_name: string;
  phone: string;
  email?: string;
  village_or_city: string;
  skills_or_interest: string;
  consent: boolean;
  honeypot?: string;
}
