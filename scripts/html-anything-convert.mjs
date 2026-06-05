import { readFileSync, writeFileSync } from "node:fs";

const { inputPath, outputPath, options } = parseArgs(process.argv.slice(2));
if (!inputPath || !outputPath || options.help) {
  console.error("usage: node scripts/html-anything-convert.mjs <input> <output.html> [--template=<id>] [--agent=<agent>] [--model=<model>] [--endpoint=<url>]");
  process.exit(inputPath && outputPath ? 0 : 2);
}

const content = readFileSync(inputPath, "utf8");
const templateId = options.template || process.env.HTML_ANYTHING_TEMPLATE_ID || "article-magazine";
const endpoint = options.endpoint || process.env.HTML_ANYTHING_CONVERT_URL || "http://127.0.0.1:3001/api/convert";
const agent = options.agent || process.env.HTML_ANYTHING_AGENT || "codex";
const model = options.model || process.env.HTML_ANYTHING_MODEL || "gpt-5.5";
const format = options.format || detectFormat(inputPath);

console.log(`template=${templateId}`);
console.log(`format=${format}`);
const response = await fetch(endpoint, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ agent, model, templateId, format, content }),
});

if (!response.ok || !response.body) {
  console.error(`HTML Anything convert failed: HTTP ${response.status}`);
  console.error(await response.text().catch(() => ""));
  process.exit(1);
}

const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = "";
let html = "";
let started = false;

function handleBlock(block) {
  const lines = block.split("\n");
  let event = "";
  const dataLines = [];
  for (const line of lines) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (!dataLines.length) return;
  let data;
  try { data = JSON.parse(dataLines.join("\n")); } catch { return; }
  if (event === "start") {
    started = true;
    console.log(`started ${data.bin || "agent"}`);
  } else if (event === "delta" && typeof data.text === "string") {
    html += data.text;
    process.stdout.write(".");
  } else if (event === "html" && typeof data.text === "string") {
    html = data.text;
    console.log("\nreceived recovered html");
  } else if (event === "error") {
    throw new Error(data.message || "unknown convert error");
  }
}

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  let idx;
  while ((idx = buffer.indexOf("\n\n")) !== -1) {
    const block = buffer.slice(0, idx);
    buffer = buffer.slice(idx + 2);
    handleBlock(block);
  }
}
if (buffer.trim()) handleBlock(buffer);

const first = html.indexOf("<");
if (first > 0) html = html.slice(first);
if (!started || !html.trim().startsWith("<") || !html.includes("</html>")) {
  console.error("\nconvert did not produce complete HTML");
  console.error(html.slice(0, 1000));
  process.exit(1);
}
writeFileSync(outputPath, html, "utf8");
console.log(`\nwrote ${outputPath} (${html.length} chars)`);

function parseArgs(args) {
  const positional = [];
  const options = {};
  for (const arg of args) {
    if (arg === "--help") options.help = true;
    else if (arg.startsWith("--")) {
      const [key, ...rest] = arg.slice(2).split("=");
      options[key] = rest.length ? rest.join("=") : true;
    } else positional.push(arg);
  }
  return { inputPath: positional[0], outputPath: positional[1], options };
}

function detectFormat(filename) {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".md") || lower.endsWith(".markdown") || lower.endsWith(".mdx")) return "markdown";
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".json") || lower.endsWith(".jsonl")) return "json";
  if (lower.endsWith(".html") || lower.endsWith(".htm")) return "html";
  return "text";
}
