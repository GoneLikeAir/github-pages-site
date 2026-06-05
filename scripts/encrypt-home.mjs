import { writeFileSync } from "node:fs";
import { webcrypto, randomBytes } from "node:crypto";

const password = process.env.SITE_PAGE_PASSWORD;
if (!password) {
  console.error("SITE_PAGE_PASSWORD is required");
  process.exit(2);
}

const homeHtml = `<main class="shell" id="siteContent" tabindex="-1">
  <section class="hero">
    <p class="eyebrow">Private Project Pages</p>
    <h1>文档页面目录</h1>
    <p class="lede">
      这里收纳由本地 HTML Anything 生成、再加密发布到 GitHub Pages 的静态页面。输入密码进入目录后，可以跳转到各个加密页面。
    </p>
    <div class="actions">
      <a class="button primary" href="#pageDirectory">查看页面目录</a>
      <button class="button secondary" type="button" data-lock-button>退出登录</button>
    </div>
  </section>

  <section class="panel directory-panel" id="pageDirectory">
    <p class="eyebrow">Published Pages</p>
    <h2>已发布页面</h2>
    <p>这些页面本身也有独立的前端加密密码门；知道链接但没有密码的人只能看到解锁页。</p>
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
