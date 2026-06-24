import { existsSync } from "fs";
import { spawnSync } from "child_process";
import path from "path";

const DEFAULT_DATABASE_URL =
  "postgres://greenmart:greenmart@localhost:5432/greenmart";

function commandExists(command) {
  return spawnSync("sh", ["-lc", `command -v ${command}`], {
    stdio: "ignore",
  }).status === 0;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function getBrewPostgresPrefix() {
  if (!commandExists("brew")) return null;

  const result = spawnSync("brew", ["--prefix", "postgresql@16"], {
    encoding: "utf8",
  });

  if (result.status !== 0) return null;
  return result.stdout.trim();
}

function setupHomebrewPostgres(prefix) {
  const psql = path.join(prefix, "bin", "psql");
  if (!existsSync(psql)) return false;

  run("brew", ["services", "start", "postgresql@16"]);

  const setupSql = `
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'greenmart') THEN
    CREATE ROLE greenmart LOGIN PASSWORD 'greenmart';
  ELSE
    ALTER ROLE greenmart WITH LOGIN PASSWORD 'greenmart';
  END IF;
END
$$;

SELECT 'CREATE DATABASE greenmart OWNER greenmart'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'greenmart')\\gexec

SELECT 'CREATE DATABASE greenmart_test OWNER greenmart'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'greenmart_test')\\gexec
`;

  const result = spawnSync(psql, ["-d", "postgres", "-v", "ON_ERROR_STOP=1"], {
    input: setupSql,
    stdio: ["pipe", "inherit", "inherit"],
  });

  if (result.status !== 0) {
    console.error(
      "\nHomebrew Postgres is running, but database setup failed. Check your local Postgres user permissions.",
    );
    process.exit(result.status ?? 1);
  }

  console.log(`\nPostgres is ready: ${DEFAULT_DATABASE_URL}`);
  return true;
}

function printManualOptions() {
  console.error(`
Docker CLI was not found, and Homebrew postgresql@16 is not installed.

Choose one setup path:

1. Install Docker Desktop, then run:
   npm run db:up

2. Use Homebrew Postgres:
   brew install postgresql@16
   npm run db:up

3. Use a hosted Postgres database and set one of:
   DATABASE_URL=postgres://...
   GREENMART_DATABASE_URL=postgres://...

Put the URL in apps/web/.env.local or the repository root .env.
`);
}

const composeCommand = dockerComposeCommand();
if (composeCommand) {
  run(composeCommand.command, [...composeCommand.args, "up", "-d", "postgres"]);
  process.exit(0);
}

function dockerComposeCommand() {
  if (!commandExists("docker")) return null;

  const compose = spawnSync("docker", ["compose", "version"], {
    stdio: "ignore",
  });
  if (compose.status === 0) {
    return { command: "docker", args: ["compose"] };
  }

  if (commandExists("docker-compose")) {
    return { command: "docker-compose", args: [] };
  }

  return null;
}

const brewPostgresPrefix = getBrewPostgresPrefix();
if (brewPostgresPrefix && setupHomebrewPostgres(brewPostgresPrefix)) {
  process.exit(0);
}

printManualOptions();
process.exit(1);
