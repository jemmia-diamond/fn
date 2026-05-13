/** Remove src/one-off scripts with YYYYMMDDHHmmss_ prefix older than ONE_OFF_RETENTION_DAYS (default 7, UTC); sync index.ts. */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ONE_OFF_DIR = path.join(ROOT, "src", "one-off");
const INDEX_PATH = path.join(ONE_OFF_DIR, "index.ts");
const FILE_RE = /^(\d{14})_.+\.ts$/;
const MAX_AGE_MS =
  parseInt(process.env.ONE_OFF_RETENTION_DAYS ?? "7", 10) * 24 * 60 * 60 * 1000;

/** Escape a string so it is safe inside a RegExp source. */
function escapeForRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function prefixUtcMs(filename) {
  const match = filename.match(FILE_RE);
  if (!match) return null;
  const yyyymmddhhmmss = match[1];
  return Date.UTC(
    +yyyymmddhhmmss.slice(0, 4),
    +yyyymmddhhmmss.slice(4, 6) - 1,
    +yyyymmddhhmmss.slice(6, 8),
    +yyyymmddhhmmss.slice(8, 10),
    +yyyymmddhhmmss.slice(10, 12),
    +yyyymmddhhmmss.slice(12, 14)
  );
}

function stripIndex(indexText, moduleStem) {
  const importRe = new RegExp(
    `^import\\s+(\\w+)\\s+from\\s+[\"']src/one-off/${escapeForRegex(moduleStem)}[\"'];?\\s*\\r?\\n`,
    "m"
  );
  const handlerName = indexText.match(importRe)?.[1] ?? null;
  let out = indexText.replace(importRe, "");
  const handlerLineRe = handlerName ? new RegExp(`handler:\\s*${handlerName}\\b`) : null;
  out = out
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith("{")) return true;
      if (handlerLineRe?.test(trimmed)) return false;
      return !trimmed.includes(`name: "${moduleStem}"`);
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
  return out;
}

function writeGithubOutput(key, value) {
  const outFile = process.env.GITHUB_OUTPUT;
  if (outFile) fs.appendFileSync(outFile, `${key}=${value}\n`);
}

if (!fs.existsSync(ONE_OFF_DIR)) {
  console.warn("Missing directory:", ONE_OFF_DIR);
  process.exit(1);
}

const now = Date.now();
const deletedModuleStems = [];

for (const dirent of fs.readdirSync(ONE_OFF_DIR, { withFileTypes: true })) {
  if (!dirent.isFile() || !dirent.name.endsWith(".ts") || dirent.name === "index.ts") continue;
  if (!FILE_RE.test(dirent.name)) continue;
  const createdUtcMs = prefixUtcMs(dirent.name);
  if (createdUtcMs == null || now - createdUtcMs <= MAX_AGE_MS) continue;
  const moduleStem = dirent.name.replace(/\.ts$/i, "");
  fs.unlinkSync(path.join(ONE_OFF_DIR, dirent.name));
  deletedModuleStems.push(moduleStem);
  console.warn("Deleted:", path.join("src/one-off", dirent.name));
}

if (deletedModuleStems.length === 0) {
  writeGithubOutput("has_changes", "false");
} else {
  let indexText = fs.readFileSync(INDEX_PATH, "utf8");
  for (const stem of deletedModuleStems) indexText = stripIndex(indexText, stem);
  fs.writeFileSync(INDEX_PATH, indexText);
  console.warn("Updated:", path.relative(ROOT, INDEX_PATH));
  writeGithubOutput("has_changes", "true");
}
