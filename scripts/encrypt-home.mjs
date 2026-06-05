import { writeFileSync } from "node:fs";
import { webcrypto, randomBytes } from "node:crypto";

const password = process.env.SITE_PAGE_PASSWORD;
if (!password) {
  console.error("SITE_PAGE_PASSWORD is required");
  process.exit(2);
}

const homeHtml = `<main class="portal-shell" id="siteContent" tabindex="-1">
  <nav class="site-nav" aria-label="主导航">
    <a class="brand-mark" href="./" aria-label="返回首页">
      <span class="brand-dot"></span>
      <span>GoneLikeAir Pages</span>
    </a>
    <div class="nav-links">
      <a href="#pageDirectory">页面</a>
      <a href="#workflow">工作流</a>
      <button type="button" data-lock-button>退出</button>
    </div>
  </nav>

  <section class="portal-hero">
    <div class="hero-copy">
      <p class="section-kicker">HTML Anything × GitHub Pages</p>
      <h1>一座只给知道密码的人看的文档展厅。</h1>
      <p class="lede">把文档交给本地 HTML Anything 生成页面，再加密挂到 GitHub Pages；主页只负责安全地组织入口。</p>
      <div class="hero-actions">
        <a class="button primary" href="#pageDirectory">打开目录</a>
        <a class="button secondary" href="#workflow">查看流程</a>
      </div>
    </div>
    <div class="hero-board" aria-label="当前发布状态">
      <div class="board-header">
        <span>publish pipeline</span>
        <strong>static / encrypted</strong>
      </div>
      <div class="board-row">
        <span>01</span>
        <p>Document received</p>
      </div>
      <div class="board-row">
        <span>02</span>
        <p>Rendered by HTML Anything</p>
      </div>
      <div class="board-row emphasis">
        <span>03</span>
        <p>Encrypted page mounted</p>
      </div>
    </div>
  </section>

  <section class="workflow-strip" id="workflow" aria-label="工作流">
    <article>
      <span>Generate</span>
      <strong>HTML Anything</strong>
      <p>本地 agent 生成完整 HTML 页面。</p>
    </article>
    <article>
      <span>Encrypt</span>
      <strong>AES-GCM</strong>
      <p>正文变成密文，浏览器输入密码后解锁。</p>
    </article>
    <article>
      <span>Publish</span>
      <strong>GitHub Pages</strong>
      <p>以项目页方式托管，目录自动追加入口。</p>
    </article>
  </section>

  <section class="published-grid" id="pageDirectory">
    <div class="section-header">
      <p class="section-kicker">Published pages</p>
      <h2>已发布页面</h2>
      <p>每个条目都是独立加密页面。点击后会进入该页面自己的密码门。</p>
    </div>
    <div class="page-list" data-page-list>
      <p class="muted">正在加载页面目录…</p>
    </div>
  </section>
</main>`;

const encoder = new TextEncoder();
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
const ciphertext = await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(homeHtml));
const b64 = (buf) => Buffer.from(buf).toString("base64");
writeFileSync(
  "encrypted-content.js",
  `window.PROTECTED_PAYLOAD = ${JSON.stringify({
    version: 1,
    kdf: "PBKDF2",
    hash: "SHA-256",
    iterations,
    cipher: "AES-GCM",
    salt: b64(salt),
    iv: b64(iv),
    ciphertext: b64(ciphertext),
  }, null, 2)};\n`,
  "utf8",
);
console.log("wrote encrypted-content.js");
