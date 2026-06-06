import { writeFileSync } from "node:fs";
import { webcrypto, randomBytes } from "node:crypto";
import "./load-env.mjs";

const password = process.env.SITE_PAGE_PASSWORD;
if (!password) {
  console.error("SITE_PAGE_PASSWORD is required");
  process.exit(2);
}

const homeHtml = `<main class="portal-shell library-shell" id="siteContent" tabindex="-1">
  <nav class="site-nav" aria-label="主导航">
    <a class="brand-mark" href="./" aria-label="返回首页">
      <span class="brand-dot"></span>
      <span>GoneLikeAir Pages</span>
    </a>
    <div class="nav-links">
      <a href="#pageDirectory">文档库</a>
      <a href="#workflow">发布流程</a>
      <button type="button" data-lock-button>退出</button>
    </div>
  </nav>

  <section class="library-hero" aria-labelledby="libraryTitle">
    <div class="library-copy">
      <p class="section-kicker">Encrypted document library</p>
      <h1 id="libraryTitle">先选分类，再打开页面。</h1>
      <p class="lede">HTML Anything 生成的页面会进入分类文档库；主页不再把入口藏在长滚动后面。</p>
      <form class="library-search" role="search" aria-label="搜索已发布页面">
        <label class="sr-only" for="pageSearch">搜索页面</label>
        <input id="pageSearch" data-page-search type="search" autocomplete="off" placeholder="搜索标题、描述或分类…" />
      </form>
    </div>
    <aside class="library-status" aria-label="文档库状态">
      <div class="metric-card primary-metric">
        <span>pages</span>
        <strong data-total-pages>—</strong>
        <small>已发布加密页面</small>
      </div>
      <div class="metric-card">
        <span>categories</span>
        <strong data-category-count>—</strong>
        <small>自动分类维护</small>
      </div>
      <div class="latest-card">
        <span>latest</span>
        <strong data-latest-page>正在读取目录…</strong>
        <small data-updated-at>manifest.json</small>
      </div>
    </aside>
  </section>

  <section class="library-console" id="pageDirectory" aria-label="已发布页面目录">
    <aside class="category-rail" aria-label="页面分类">
      <div class="rail-heading">
        <span>分类</span>
        <small>自动归档</small>
      </div>
      <div class="category-list" data-category-list>
        <button class="category-pill is-active" type="button">全部</button>
      </div>
    </aside>
    <div class="directory-panel">
      <div class="directory-header">
        <div>
          <p class="section-kicker">Published pages</p>
          <h2>页面入口</h2>
        </div>
        <p>每个页面独立加密；同一标签页输入一次密码后，进入子页面会自动解锁。</p>
      </div>
      <div class="page-list grouped-page-list" data-page-list>
        <p class="muted">正在加载页面目录…</p>
      </div>
    </div>
  </section>

  <section class="workflow-strip compact-workflow" id="workflow" aria-label="工作流">
    <article>
      <span>Classify</span>
      <strong>自动归档</strong>
      <p>发布脚本根据模板和内容写入 category / tags，主页按分类维护入口。</p>
    </article>
    <article>
      <span>Generate</span>
      <strong>HTML Anything</strong>
      <p>根据文档类型选择模板，生成可独立打开的静态 HTML 页面。</p>
    </article>
    <article>
      <span>Publish</span>
      <strong>GitHub Pages</strong>
      <p>目录和每个页面正文都以密文保存，浏览器本地解锁。</p>
    </article>
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
