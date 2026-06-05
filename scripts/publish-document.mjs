import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { spawn } from "node:child_process";
import { categoryLabel, chooseTemplate, fetchTemplates, inferDocMeta, inferPageCategory, inferPageTags, readTemplates, slugify } from "./template-tools.mjs";

const args = parseArgs(process.argv.slice(2));
if (!args.input || args.help) {
  console.error(`usage: SITE_PAGE_PASSWORD=... node scripts/publish-document.mjs <input-file> [options]

Options:
  --title=<title>          Override inferred title
  --slug=<slug>            Override URL slug
  --description=<text>     Override manifest description
  --template=<id>          Override automatic template selection
  --category=<id>          Override manifest category
  --tags=<a,b,c>           Override manifest tags
  --no-commit              Convert/encrypt/verify only
  --no-push                Commit locally but do not push
  --no-watch-deploy        Do not wait for GitHub Pages run
  --push-attempts=<n>      Retry git push n times (default 5)
  --templates=<path>       Template JSON cache (default data/html-anything-templates.json)
  --dry-run                Only inspect content and print selected template`);
  process.exit(args.input ? 0 : 2);
}

const inputPath = args.input;
const content = readFileSync(inputPath, "utf8");
const templates = await loadTemplates(args.templates || "data/html-anything-templates.json");
const selected = chooseTemplate({ content, filename: inputPath, templates });
const inferred = inferDocMeta(content, inputPath);
const title = args.title || selected.title || inferred.title;
const slug = slugify(args.slug || selected.slug || title);
const description = args.description || selected.description || inferred.description;
const templateId = args.template || selected.templateId;
const category = args.category || inferPageCategory({ content, filename: inputPath, title, templateId });
const tags = args.tags ? args.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : inferPageTags({ content, title, templateId, category });

console.log("select template");
console.log(`  input: ${inputPath}`);
console.log(`  title: ${title}`);
console.log(`  slug: ${slug}`);
console.log(`  template: ${templateId} (${selected.templateName || ""})`);
console.log(`  category: ${category} (${categoryLabel(category)})`);
console.log(`  tags: ${tags.join(", ") || "none"}`);
console.log(`  reason: ${args.template ? "manual override" : selected.reason}`);

if (args.dryRun) process.exit(0);

const password = process.env.SITE_PAGE_PASSWORD;
if (!password) {
  console.error("SITE_PAGE_PASSWORD is required. Refusing to publish an unencrypted page.");
  process.exit(2);
}

mkdirSync(".publish-cache", { recursive: true });
const generatedHtml = join(".publish-cache", `${slug}.html`);

await run("node", ["scripts/html-anything-convert.mjs", inputPath, generatedHtml, `--template=${templateId}`], { label: "convert with HTML Anything" });
await run("node", ["scripts/encrypt-doc-page.mjs", generatedHtml, slug, title, description], {
  label: "encrypt page",
  env: { SITE_PAGE_PASSWORD: password, PAGE_CATEGORY: category, PAGE_CATEGORY_LABEL: categoryLabel(category), PAGE_TEMPLATE_ID: templateId, PAGE_TAGS: tags.join(",") },
});

await run("node", ["scripts/verify-auth-gate.mjs"], {
  label: "verify auth gate",
  env: { SITE_TEST_PASSWORD: password },
});
await run("node", ["scripts/verify-cross-page-session.mjs"], { label: "verify cross-page unlock" });
await run("node", ["scripts/verify-publish-workflow.mjs"], { label: "verify publish workflow" });

if (args.noCommit) {
  console.log("--no-commit set; leaving changes uncommitted");
  process.exit(0);
}

await run("git", ["add", "manifest.json", `pages/${slug}/index.html`], { label: "git add page" });
await run("git", ["diff", "--cached", "--quiet"], { label: "check staged diff", allowFailure: true }).then((result) => {
  if (result.code === 0) {
    console.log("no staged page changes; skipping commit");
  }
});
const stagedChanged = await commandSucceeds("git", ["diff", "--cached", "--quiet"]).then((clean) => !clean);
if (stagedChanged) {
  await run("git", ["commit", "-m", `Publish encrypted ${slug} page`], { label: "git commit" });
}

if (args.noPush) {
  console.log("--no-push set; skipping push and deploy watch");
  process.exit(0);
}

await pushWithRetry(Number(args.pushAttempts || 5));
if (!args.noWatchDeploy) await watchLatestDeploy();

console.log("published");
console.log(`  local: pages/${slug}/index.html`);
console.log(`  url: https://gonelikeair.github.io/github-pages-site/pages/${slug}/`);

async function loadTemplates(path) {
  if (existsSync(path)) return readTemplates(path);
  return fetchTemplates(process.env.HTML_ANYTHING_TEMPLATES_URL || "http://127.0.0.1:3001/api/templates");
}

async function pushWithRetry(attempts) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const result = await run("git", ["push", "origin", "main"], { label: `git push attempt ${attempt}/${attempts}`, allowFailure: true });
    if (result.code === 0) return;
    if (attempt === attempts) throw new Error(`git push failed after ${attempts} attempts`);
    await run("git", ["fetch", "origin", "main"], { label: "git fetch before retry", allowFailure: true });
    await run("git", ["rebase", "origin/main"], { label: "git rebase before retry", allowFailure: true });
    await delay(Math.min(2 ** attempt, 30) * 1000);
  }
}

async function watchLatestDeploy() {
  const runList = await run("gh", ["run", "list", "--repo", "GoneLikeAir/github-pages-site", "--limit", "1", "--json", "databaseId,status"], {
    label: "find latest deploy run",
    capture: true,
    allowFailure: true,
  });
  if (runList.code !== 0 || !runList.stdout.trim()) {
    console.log("could not inspect GitHub Actions run; push already completed");
    return;
  }
  let runId;
  try {
    runId = JSON.parse(runList.stdout)[0]?.databaseId;
  } catch {}
  if (!runId) return;
  await run("gh", ["run", "watch", String(runId), "--repo", "GoneLikeAir/github-pages-site", "--exit-status"], {
    label: "gh run watch deploy",
    allowFailure: true,
  });
}

async function commandSucceeds(command, commandArgs) {
  const result = await run(command, commandArgs, { label: `${command} ${commandArgs.join(" ")}`, allowFailure: true, quiet: true });
  return result.code === 0;
}

function run(command, commandArgs, { label, env = {}, capture = false, allowFailure = false, quiet = false } = {}) {
  if (!quiet) console.log(`\n$ ${label || [command, ...commandArgs].join(" ")}`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      env: { ...process.env, ...env },
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });
    let stdout = "";
    let stderr = "";
    if (capture) {
      child.stdout.on("data", (chunk) => { stdout += chunk; });
      child.stderr.on("data", (chunk) => { stderr += chunk; });
    }
    child.on("error", reject);
    child.on("close", (code) => {
      const result = { code, stdout, stderr };
      if (code !== 0 && !allowFailure) reject(new Error(`${label || command} failed with exit code ${code}`));
      else resolve(result);
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(argv) {
  const out = {};
  for (const arg of argv) {
    if (arg === "--help") out.help = true;
    else if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--no-commit") out.noCommit = true;
    else if (arg === "--no-push") out.noPush = true;
    else if (arg === "--no-watch-deploy") out.noWatchDeploy = true;
    else if (arg.startsWith("--")) {
      const [key, ...rest] = arg.slice(2).split("=");
      out[toCamel(key)] = rest.join("=");
    } else if (!out.input) out.input = arg;
  }
  if (out.slug) out.slug = basename(out.slug);
  return out;
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}
