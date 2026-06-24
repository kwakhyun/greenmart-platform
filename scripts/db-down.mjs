import { spawnSync } from "child_process";

function commandExists(command) {
  return spawnSync("sh", ["-lc", `command -v ${command}`], {
    stdio: "ignore",
  }).status === 0;
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  process.exit(result.status ?? 0);
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

const composeCommand = dockerComposeCommand();
if (composeCommand) {
  run(composeCommand.command, [...composeCommand.args, "down"]);
}

if (commandExists("brew")) {
  const prefix = spawnSync("brew", ["--prefix", "postgresql@16"], {
    encoding: "utf8",
  });

  if (prefix.status === 0) {
    run("brew", ["services", "stop", "postgresql@16"]);
  }
}

console.log("No Docker or Homebrew postgresql@16 service was found.");
