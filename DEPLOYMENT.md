# Deployment Instructions for Railway

To deploy this application to Railway, follow these steps:

1. **Create a GitHub Repository**: Commit all your code and push it to a new GitHub repository.
2. **Connect to Railway**:
   - Go to [Railway](https://railway.app) and log in.
   - Click **New Project** -> **Deploy from GitHub repo**.
   - Select your repository.
3. **Database Setup**:
   - In your Railway project, click **New** -> **Database** -> **Add PostgreSQL**.
   - Note: We used SQLite for local development. Before deploying to Railway, open `prisma/schema.prisma` and change:
     ```prisma
     datasource db {
       provider = "postgresql" // change from "sqlite"
       url      = env("DATABASE_URL")
     }
     ```
4. **Environment Variables**:
   - Go to your Next.js service in Railway -> **Variables**.
   - Add `JWT_SECRET` (e.g., `my_super_secret_jwt_key_for_prod`).
   - Add `DATABASE_URL` (Railway will automatically inject this if you link the Postgres DB, but double-check it's there).
5. **Deploy**:
   - The deployment will trigger automatically. Railway will run `npm run build` (which includes `prisma generate`) and then execute the `startCommand` defined in `railway.json` (`npx prisma db push && npm run start`).

Your app will be live and fully functional!
