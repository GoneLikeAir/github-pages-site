import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fetchTemplates, formatTemplateIndexMarkdown } from "./template-tools.mjs";

const options = parseArgs(process.argv.slice(2));
const endpoint = options.endpoint || process.env.HTML_ANYTHING_TEMPLATES_URL || "http://127.0.0.1:3001/api/templates";
const jsonPath = options.json || "data/html-anything-templates.json";
const mdPath = options.md || "docs/html-anything-template-index.md";

const templates = await fetchTemplates(endpoint);
writeJson(jsonPath, { generatedAt: new Date().toISOString(), endpoint, templates });
writeText(mdPath, formatTemplateIndexMarkdown(templates));
console.log(`templates: ${templates.length}`);
console.log(`wrote ${jsonPath}`);
console.log(`wrote ${mdPath}`);

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value, "utf8");
}

function parseArgs(args) {
  const out = {};
  for (const arg of args) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) out[match[1]] = match[2];
  }
  return out;
}
