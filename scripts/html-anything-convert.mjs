import { readFileSync, writeFileSync } from "node:fs";

const [,, inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  console.error("usage: node scripts/html-anything-convert.mjs <input.md> <output.html>");
  process.exit(2);
}

const content = readFileSync(inputPath, "utf8");
const response = await fetch("http://127.0.0.1:3001/api/convert", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    agent: "codex",
    model: "gpt-5.5",
    templateId: "article-magazine",
    format: "markdown",
    content,
  }),
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
