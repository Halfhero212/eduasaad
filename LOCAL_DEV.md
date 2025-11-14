## Local Development With Dockerized Postgres

Use this workflow when you want to test code on your machine without touching the production database.

### 1. Start Postgres

```bash
docker compose -f docker-compose.local.yml up -d
```

This launches a Postgres 16 container listening on `localhost:5432` with the same credentials used in production. Data is persisted in the `postgres_data` volume so it survives container restarts.

### 2. Create a local env file

Copy the example file and adjust secrets if desired:

```bash
cp .env.local.example .env.local
```

Use `node --env-file=.env.local …` (or set the variables manually) whenever you run the server locally. Keep your production `.env` unchanged so deployments keep working as-is.

### 3. Apply the schema

```bash
node --env-file=.env.local ./node_modules/.bin/drizzle-kit push
```

or run `npx drizzle-kit push` after exporting the env vars in your shell. This ensures the local database has the latest tables.

### 4. Run the server

Build once:

```bash
npm run build
```

Then start it using the local env file:

```bash
node --env-file=.env.local dist/index.js
```

For hot-reload development, use:

```bash
set NODE_ENV=development
node --env-file=.env.local node_modules/.bin/tsx server/index.ts
```

or the equivalent command in Git Bash/WSL.

### 5. Tear down (optional)

```bash
docker compose -f docker-compose.local.yml down
```

Add `-v` if you also want to remove the persisted data volume.
