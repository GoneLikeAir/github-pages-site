import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { webcrypto, randomBytes } from "node:crypto";

const [,, inputHtmlPath, slug, title, description = ""] = process.argv;
if (!inputHtmlPath || !slug || !title) {
  console.error("usage: SITE_PAGE_PASSWORD=... node scripts/encrypt-doc-page.mjs <input.html> <slug> <title> [description]");
  process.exit(2);
}

const password = process.env.SITE_PAGE_PASSWORD;
if (!password) {
  console.error("SITE_PAGE_PASSWORD is required");
  process.exit(2);
}

const root = process.cwd();
const createdAt = process.env.PAGE_CREATED_AT || new Date().toISOString().slice(0, 10);
const sourceHtml = readFileSync(inputHtmlPath, "utf8");
const category = process.env.PAGE_CATEGORY || "uncategorized";
const categoryLabel = process.env.PAGE_CATEGORY_LABEL || "未分类";
const templateId = process.env.PAGE_TEMPLATE_ID || "";
const tags = (process.env.PAGE_TAGS || "").split(",").map((tag) => tag.trim()).filter(Boolean);
const encoder = new TextEncoder();

async function encryptHtml(html) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const iterations = 210_000;
  const keyMaterial = await webcrypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await webcrypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const ciphertext = await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(html));
  const b64 = (buf) => Buffer.from(buf).toString("base64");
  return {
    version: 1,
    kdf: "PBKDF2",
    hash: "SHA-256",
    iterations,
    cipher: "AES-GCM",
    salt: b64(salt),
    iv: b64(iv),
    ciphertext: b64(ciphertext),
  };
}

const payload = await encryptHtml(sourceHtml);
const pageHtml = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="../../styles.css" />
</head>
<body>
  <main class="shell lock-shell" id="authShell">
    <section class="hero lock-card" aria-labelledby="authTitle">
      <p class="eyebrow">Encrypted Page</p>
      <h1 id="authTitle">${escapeHtml(title)}</h1>
      <p class="lede">${escapeHtml(description || "这个页面已加密。输入访问密码后，会在浏览器本地解密并显示正文。")}</p>
      <form class="unlock-form" id="unlockForm" autocomplete="off">
        <label class="password-label" for="passwordInput">访问密码</label>
        <div class="password-row">
          <input id="passwordInput" name="password" type="password" inputmode="text" autocomplete="current-password" placeholder="输入密码" required />
          <button class="button primary" type="submit">解锁</button>
        </div>
        <p class="auth-message" id="authMessage" role="status" aria-live="polite"></p>
      </form>
      <p class="note"><a class="inline-link" href="../../">返回目录</a> · 纯前端加密门，不等同于服务器鉴权。</p>
    </section>
  </main>

  <main class="doc-frame-shell" id="docShell" hidden>
    <div class="doc-toolbar">
      <a class="button secondary" href="../../">返回目录</a>
      <button class="button secondary" type="button" id="lockButton">退出登录</button>
    </div>
    <iframe id="docFrame" title="${escapeHtml(title)}" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"></iframe>
  </main>

  <script>
    window.PROTECTED_PAYLOAD = ${JSON.stringify(payload)};
  </script>
  <script src="../../page-unlock.js"></script>
</body>
</html>
`;

const outDir = join(root, "pages", slug);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "index.html"), pageHtml, "utf8");

const manifestPath = join(root, "manifest.json");
let manifest = [];
try { manifest = JSON.parse(readFileSync(manifestPath, "utf8")); } catch {}
manifest = manifest.filter((item) => item.id !== slug);
manifest.unshift({
  id: slug,
  title,
  description,
  path: `./pages/${slug}/`,
  createdAt,
  source: inputHtmlPath.split("/").pop(),
  encrypted: true,
  category,
  categoryLabel,
  templateId,
  tags,
});
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(`published pages/${slug}/index.html`);
console.log(`manifest entries: ${manifest.length}`);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
