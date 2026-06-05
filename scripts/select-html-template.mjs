import { existsSync, readFileSync } from "node:fs";
import { categoryLabel, chooseTemplate, fetchTemplates, inferDocMeta, inferPageCategory, inferPageTags, readTemplates } from "./template-tools.mjs";

const [inputPath, ...rest] = process.argv.slice(2);
if (!inputPath || rest.includes("--help")) {
  console.error("usage: node scripts/select-html-template.mjs <input-file> [--json] [--templates=data/html-anything-templates.json]");
  process.exit(inputPath ? 0 : 2);
}

const options = parseArgs(rest);
const content = readFileSync(inputPath, "utf8");
const templatePath = options.templates || "data/html-anything-templates.json";
const templates = existsSync(templatePath)
  ? readTemplates(templatePath)
  : await fetchTemplates(options.endpoint || process.env.HTML_ANYTHING_TEMPLATES_URL || "http://127.0.0.1:3001/api/templates");
const selection = chooseTemplate({ content, filename: inputPath, templates });
const meta = inferDocMeta(content, inputPath);
const category = inferPageCategory({ content, filename: inputPath, title: selection.title || meta.title, templateId: selection.templateId });
const result = { ...meta, ...selection, category, categoryLabel: categoryLabel(category), tags: inferPageTags({ content, title: selection.title || meta.title, templateId: selection.templateId, category }) };

if (options.json || options["json"] === true) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`templateId=${result.templateId}`);
  console.log(`templateName=${result.templateName}`);
  console.log(`title=${result.title}`);
  console.log(`slug=${result.slug}`);
  console.log(`description=${result.description}`);
  console.log(`format=${result.format}`);
  console.log(`reason=${result.reason}`);
}

function parseArgs(args) {
  const out = {};
  for (const arg of args) {
    if (arg === "--json") out.json = true;
    else {
      const match = arg.match(/^--([^=]+)=(.*)$/);
      if (match) out[match[1]] = match[2];
    }
  }
  return out;
}
