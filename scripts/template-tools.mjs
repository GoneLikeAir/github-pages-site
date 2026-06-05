import { readFileSync } from "node:fs";
import { extname } from "node:path";

const DEFAULT_TEMPLATE_ENDPOINT = "http://127.0.0.1:3001/api/templates";

const PINYIN = new Map(Object.entries({
  交: "jiao", 易: "yi", 体: "ti", 系: "xi", 总: "zong", 览: "lan",
  会: "hui", 议: "yi", 纪: "ji", 要: "yao", 文: "wen", 档: "dang",
  数: "shu", 据: "ju", 报: "bao", 告: "gao", 产: "chan", 品: "pin",
  需: "xu", 求: "qiu", 技: "ji", 术: "shu", 分: "fen", 享: "xiang",
  周: "zhou", 复: "fu", 盘: "pan", 索: "suo", 引: "yin",
}));

export async function fetchTemplates(endpoint = DEFAULT_TEMPLATE_ENDPOINT) {
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) throw new Error(`template endpoint failed: HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data.templates)) throw new Error("template endpoint did not return { templates: [] }");
  return normalizeTemplates(data.templates);
}

export function readTemplates(path = "data/html-anything-templates.json") {
  const data = JSON.parse(readFileSync(path, "utf8"));
  return normalizeTemplates(Array.isArray(data) ? data : data.templates);
}

export function normalizeTemplates(templates) {
  return templates
    .filter((template) => template && template.id)
    .map((template) => ({
      id: String(template.id),
      zhName: template.zhName || template.name || template.enName || template.id,
      enName: template.enName || template.name || template.id,
      emoji: template.emoji || "",
      description: template.description || "",
      category: template.category || "other",
      scenario: template.scenario || "general",
      aspectHint: template.aspectHint || "",
      tags: Array.isArray(template.tags) ? template.tags.map(String) : [],
      featured: template.featured,
      example: template.example || null,
    }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.id.localeCompare(b.id));
}

export function detectFormat(filename = "") {
  const ext = extname(filename).toLowerCase();
  if ([".md", ".markdown", ".mdx"].includes(ext)) return "markdown";
  if (ext === ".csv") return "csv";
  if ([".json", ".jsonl"].includes(ext)) return "json";
  if ([".html", ".htm"].includes(ext)) return "html";
  if ([".txt", ""].includes(ext)) return "text";
  return ext.slice(1) || "text";
}

export function inferDocMeta(content, filename = "document") {
  const title = extractTitle(content, filename);
  const description = extractDescription(content, title);
  return {
    title,
    slug: slugify(title || filename.replace(/\.[^.]+$/, "")),
    description,
    format: detectFormat(filename),
  };
}

export function extractTitle(content, filename = "document") {
  const h1 = String(content).match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (h1) return stripMarkdown(h1).slice(0, 80);
  const htmlTitle = String(content).match(/<title>(.*?)<\/title>/i)?.[1]?.trim();
  if (htmlTitle) return stripMarkdown(htmlTitle).slice(0, 80);
  const firstTextLine = String(content)
    .split(/\r?\n/)
    .map((line) => stripMarkdown(line).trim())
    .find((line) => line && !/^[-=*_`#>|\s]+$/.test(line));
  if (firstTextLine && firstTextLine.length <= 80) return firstTextLine;
  return filename.replace(/\.[^.]+$/, "").replaceAll(/[-_]+/g, " ").trim() || "Untitled Document";
}

export function extractDescription(content, title = "") {
  const lines = String(content)
    .split(/\r?\n/)
    .map((line) => stripMarkdown(line).trim())
    .filter((line) => line && line !== title && !/^[-=*_`#>|\s]+$/.test(line));
  return (lines.find((line) => line.length >= 12) || lines[0] || "加密发布页面").slice(0, 120);
}

export function stripMarkdown(value) {
  return String(value)
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#+\s*/, "")
    .replace(/[>*_~]/g, "")
    .trim();
}

export function slugify(value) {
  const transliterated = Array.from(String(value).trim())
    .map((char) => {
      if (/^[\u4e00-\u9fff]$/.test(char)) {
        const word = PINYIN.get(char) || "";
        return word ? ` ${word} ` : " ";
      }
      return char;
    })
    .join("");
  const slug = transliterated
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 72)
    .replace(/-+$/g, "");
  return slug || `document-${new Date().toISOString().slice(0, 10)}`;
}

export function chooseTemplate({ content, filename = "document", templates = [] }) {
  const available = new Set(templates.map((template) => template.id));
  const text = String(content);
  const lower = text.toLowerCase();
  const format = detectFormat(filename);
  const title = extractTitle(text, filename);
  const rules = [
    {
      id: "data-report",
      score: (format === "csv" || format === "json" ? 8 : 0) + hits(lower, ["kpi", "指标", "数据", "chart", "图表", "收入", "revenue", "excel", "csv"]),
      reason: "数据/指标/CSV/JSON 内容，适合数据可视化报告。",
    },
    {
      id: "meeting-notes",
      score: hits(lower, ["会议纪要", "参会", "决议", "action item", "action items", "待办", "下次会议", "agenda"]) * 2,
      reason: "会议、决议和行动项明显，适合会议纪要模板。",
    },
    {
      id: "pm-spec",
      score: hits(lower, ["prd", "产品需求", "需求文档", "用户故事", "user stories", "成功指标", "范围", "roadmap"]) * 2,
      reason: "产品需求/用户故事/范围定义明显，适合 PRD 模板。",
    },
    {
      id: "competitive-teardown",
      score: hits(lower, ["竞品", "竞争", "对比", "矩阵", "pricing", "价格对比", "swot", "定位"]) * 2,
      reason: "包含竞品/价格/定位对比，适合竞品拆解模板。",
    },
    {
      id: "exec-briefing-memo",
      score: hits(lower, ["决策", "recommendation", "建议", "tradeoff", "取舍", "高管", "结论先行"]) * 2,
      reason: "偏决策备忘录，适合高管简报模板。",
    },
    {
      id: "eng-runbook",
      score: hits(lower, ["runbook", "告警", "alert", "on-call", "incident", "dashboard", "操作命令", "故障"]) * 2,
      reason: "工程运维、告警或事故流程明显，适合 Runbook。",
    },
    {
      id: "docs-page",
      score: hits(lower, ["api", "endpoint", "接口", "参数", "安装", "配置", "使用方法", "reference", "目录", "索引", "wiki", "文档"]) * 2,
      reason: "参考文档/接口/目录索引内容，适合技术文档页。",
    },
    {
      id: "deck-tech-sharing",
      score: hits(lower, ["技术分享", "slides", "deck", "演讲", "q&a", "agenda", "架构图"]) * 2,
      reason: "演讲或技术分享材料，适合技术分享 Deck。",
    },
    {
      id: "finance-report",
      score: hits(lower, ["财报", "p&l", "利润", "现金流", "收入", "烧钱", "季度", "finance"]) * 2,
      reason: "财务指标和季度经营信息，适合财报模板。",
    },
    {
      id: "article-magazine",
      score: 1 + (text.length > 2000 ? 2 : 0) + hits(lower, ["观点", "文章", "博客", "essay", "newsletter", "分析"]),
      reason: "长文/观点/博客类内容，适合杂志文章模板。",
    },
  ];

  const ranked = rules
    .filter((rule) => available.has(rule.id))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0] && ranked[0].score > 0 ? ranked[0] : { id: fallbackTemplate(available), reason: "未命中特定结构，使用通用长文排版。", score: 0 };
  const template = templates.find((item) => item.id === best.id);
  return {
    templateId: best.id,
    templateName: template?.zhName || template?.enName || best.id,
    title,
    slug: slugify(title),
    description: extractDescription(text, title),
    format,
    reason: best.reason,
    score: best.score,
  };
}

export function formatTemplateIndexMarkdown(templates, { generatedAt = new Date().toISOString() } = {}) {
  const normalized = normalizeTemplates(templates);
  const groups = groupBy(normalized, (template) => template.category || "other");
  const lines = [
    "# HTML Anything 模板小索引",
    "",
    `生成时间：${generatedAt}`,
    `模板数量：${normalized.length}`,
    "",
    "用法：收到文档后先判断内容形态，再选择模板。优先匹配结构性模板（数据、会议、PRD、竞品、Runbook、技术文档），最后再落到通用长文。",
    "",
  ];
  for (const category of Array.from(groups.keys()).sort()) {
    lines.push(`## ${category}`, "");
    for (const template of groups.get(category)) {
      const name = [template.emoji, template.zhName, template.enName && template.enName !== template.zhName ? `/${template.enName}` : ""].filter(Boolean).join(" ");
      const scene = [template.scenario, template.aspectHint].filter(Boolean).join(" · ");
      const tags = template.tags.length ? `；标签：${template.tags.slice(0, 6).join("、")}` : "";
      lines.push(`- \`${template.id}\` — ${name}`);
      lines.push(`  - 适合场景：${template.description || "通用视觉页面"}${scene ? `（${scene}）` : ""}${tags}`);
    }
    lines.push("");
  }
  return `${lines.join("\n").trim()}\n`;
}

function hits(text, keywords) {
  return keywords.reduce((sum, keyword) => sum + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0);
}

function fallbackTemplate(available) {
  for (const id of ["article-magazine", "blog-post", "docs-page"]) {
    if (available.has(id)) return id;
  }
  return available.values().next().value || "article-magazine";
}

function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}
