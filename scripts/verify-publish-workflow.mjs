import { readFileSync } from "node:fs";
import {
  chooseTemplate,
  detectFormat,
  formatTemplateIndexMarkdown,
  inferDocMeta,
  slugify,
} from "./template-tools.mjs";

const fixtureTemplates = [
  { id: "article-magazine", zhName: "杂志文章", category: "article", scenario: "marketing", description: "长文排版", tags: ["blog", "essay"] },
  { id: "docs-page", zhName: "技术文档页", category: "doc", scenario: "engineering", description: "三栏文档页", tags: ["docs", "api"] },
  { id: "data-report", zhName: "数据可视化报告", category: "data", scenario: "finance", description: "CSV 数据转报告", tags: ["data", "chart"] },
  { id: "meeting-notes", zhName: "会议纪要", category: "doc", scenario: "operations", description: "决议和 action items", tags: ["meeting"] },
  { id: "pm-spec", zhName: "PRD / 产品 Spec", category: "doc", scenario: "product", description: "user stories", tags: ["prd", "spec"] },
  { id: "deck-tech-sharing", zhName: "技术分享 Deck", category: "slides", scenario: "engineering", description: "技术分享幻灯片", tags: ["deck", "slides"] },
];

assert(slugify("Wiki Index：交易体系总览") === "wiki-index-jiao-yi-ti-xi-zong-lan", "slugify should produce a stable URL slug");
assert(detectFormat("notes.md") === "markdown", "detect markdown format");
assert(detectFormat("metrics.csv") === "csv", "detect csv format");
assert(inferDocMeta("# 会议纪要\n\n下次 action items", "meeting.md").title === "会议纪要", "infer title from h1");

const cases = [
  ["api-doc", "# API Reference\n\n## Endpoint\nGET /v1/users\n\n## Parameters", "api.md", "docs-page"],
  ["data", "month,revenue\nJan,12\nFeb,18\n", "revenue.csv", "data-report"],
  ["meeting", "# 周会纪要\n\n参会人：A、B\n\n决议：推进上线\nAction items：", "meeting.md", "meeting-notes"],
  ["prd", "# 产品需求文档\n\n用户故事 user stories\n成功指标\n范围", "prd.md", "pm-spec"],
  ["deck", "# 技术分享\n\nAgenda\n架构图\nQ&A", "sharing.md", "deck-tech-sharing"],
  ["article", "# 一篇长文\n\n这是一个观点型博客文章，包含很多段落和分析。", "essay.md", "article-magazine"],
];
for (const [name, content, filename, expected] of cases) {
  const picked = chooseTemplate({ content, filename, templates: fixtureTemplates });
  assert(picked.templateId === expected, `${name} should pick ${expected}, got ${picked.templateId}`);
  assert(picked.reason.length > 0, `${name} should include selection reasons`);
}

const indexMd = formatTemplateIndexMarkdown(fixtureTemplates, { generatedAt: "2026-06-05T00:00:00.000Z" });
for (const marker of ["# HTML Anything 模板小索引", "## article", "## doc", "docs-page", "适合场景"]) {
  assert(indexMd.includes(marker), `template index missing ${marker}`);
}

const publishScript = readFileSync("scripts/publish-document.mjs", "utf8");
for (const marker of ["SITE_PAGE_PASSWORD", "select", "git push", "retry", "gh run watch", "verify-auth-gate.mjs"]) {
  assert(publishScript.includes(marker), `publish script missing ${marker}`);
}

const convertScript = readFileSync("scripts/html-anything-convert.mjs", "utf8");
for (const marker of ["templateId", "HTML_ANYTHING_TEMPLATE_ID", "--template"]) {
  assert(convertScript.includes(marker), `convert script missing ${marker}`);
}

console.log("publish workflow checks passed");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
