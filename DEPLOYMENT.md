# Deploy this backend to Vercel

## What this deployment supports

Vercel runs `server.js` as a serverless function. The Express routes remain
under their existing `/api/...` paths, and the MongoDB connection and admin
bootstrap are initialized once per warm function instance. The health endpoint
is available at `/api/health`.

Uploaded media continues to use MongoDB GridFS. Vercel limits a function
request body to 4.5 MB, so requests with larger uploads (including the combined
size of multiple files) will be rejected before reaching this app. Keep uploads
below that total, or move uploads to direct object-storage uploads if larger
files are required.

## 1. Prepare MongoDB Atlas

1. Create a MongoDB database and a dedicated database user with access only to
   that database.
2. Copy the Atlas connection string and replace its username, password, and
   database name. URL-encode special characters in the username or password.
3. Configure Atlas Network Access to allow the Vercel deployment to connect.
   For production, use Vercel static egress IPs or Secure Compute where
   available; a broad `0.0.0.0/0` rule allows connections from anywhere and
   should only be used with a strong database password and least-privilege user.

## 2. Import and deploy

1. Import the Git repository into Vercel.
2. Set the project Root Directory to this backend folder if it is inside a
   larger repository.
3. Select **Other** as the framework preset. No build command or output
   directory is needed; Vercel uses `vercel.json` to publish the Express
   function.
4. Add the environment variables below in **Project Settings → Environment
   Variables**. Add them for Production and any Preview/Development environments
   that need to run.
5. Deploy the project.

## 3. Environment variables

| Variable | Required | Value |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | A unique, long random secret; do not reuse a sample value |
| `ADMIN_EMAIL` | Yes in production | Email address for the seeded administrator |
| `ADMIN_PASSWORD` | Yes in production | Strong administrator password |
| `ADMIN_NAME` | No | Administrator display name; defaults to `Foundation Admin` |
| `JWT_EXPIRES_IN` | No | Token lifetime; defaults to `30d` |
| `CLIENT_URL` | Yes for browser clients | Exact frontend origin, such as `https://example.com`; separate multiple origins with commas |

`NODE_ENV` is set to `production` by Vercel. The app intentionally refuses to
bootstrap an administrator in production unless both administrator credentials
are configured. Each cold function instance verifies or creates that account
using those credentials.

For local development, copy `.env.example` to `.env`, replace the placeholder
values, and run `npm install` followed by `npm run dev`. `.env` is ignored by
Git; never commit production secrets.

## 4. Verify the deployment

1. Open `https://<your-vercel-domain>/api/health`. It should return
   `{"success":true,"message":"Server is running"}`.
2. Test an API endpoint that reads MongoDB, then test administrator login with
   the configured `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
3. Test a small media upload (below the 4.5 MB total request limit) and verify
   it is retrievable from `/api/media/<fileId>`.
4. If a browser frontend cannot call the API, check that its exact origin is
   included in `CLIENT_URL` and redeploy after changing environment variables.
