# Gram Aarogya Ghati

This private repository contains the NGO website frontend and FastAPI backend.
It is separate from the organization's existing documentation repository.

## Free-tier deployment

- The Next.js frontend and Python API run as separate Render web services from
  `render.yaml`.
- Supabase continues to provide the PostgreSQL database and image storage.
- Render's free web services may sleep while idle.

### Deploy the website and API

1. Connect the private GitHub repository to Render using its GitHub integration.
2. Create a Blueprint from the repository and select `render.yaml`.
3. Enter the requested API environment values in Render. Use the Supabase
   PostgreSQL connection string for `DATABASE_URL`.
4. Keep passwords, JWT signing keys, Supabase service keys, and Razorpay secrets
   in Render's environment settings; never commit them to GitHub.
5. Verify the API's `/` health endpoint and the website's Render URL.

The GitHub repository remains private. The deployed website is publicly
accessible, but credentials and backend environment values are not part of its
source or frontend bundle.
