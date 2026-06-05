import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { webcrypto } from "node:crypto";
import vm from "node:vm";

const root = process.cwd();
const text = (file) => readFileSync(join(root, file), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const filesToScan = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    if ([".git", "node_modules"].includes(name)) continue;
    const full = join(dir, name);
    const rel = full.slice(root.length + 1);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else filesToScan.push(rel);
  }
};
walk(root);

if (process.env.SITE_TEST_PASSWORD) {
  for (const file of filesToScan) {
    const body = text(file);
    assert(!body.includes(process.env.SITE_TEST_PASSWORD), `plain password leaked into ${file}`);
  }
}

const index = text("index.html");
const script = text("script.js");
const payload = text("encrypted-content.js");
assert(index.includes("id=\"unlockForm\""), "index.html should render an unlock form");
assert(index.includes("id=\"protectedContent\""), "index.html should have protected content mount point");
assert(index.includes("./encrypted-content.js"), "index.html should load encrypted payload before script.js");
assert(script.includes("crypto.subtle"), "script.js should use Web Crypto");
assert(script.includes("PBKDF2"), "script.js should derive a key with PBKDF2");
assert(script.includes("AES-GCM"), "script.js should decrypt with AES-GCM");
assert(script.includes("./manifest.json"), "script.js should load the page manifest");
assert(payload.includes("window.PROTECTED_PAYLOAD"), "encrypted-content.js should define window.PROTECTED_PAYLOAD");
assert(/"ciphertext":\s*"[A-Za-z0-9+/=]+"/.test(payload), "encrypted homepage payload should include base64 ciphertext");

let manifest = [];
try {
  manifest = JSON.parse(text("manifest.json"));
} catch (error) {
  throw new Error(`manifest.json missing or invalid: ${error.message}`);
}
assert(Array.isArray(manifest), "manifest.json should be an array");

for (const item of manifest) {
  assert(item.id && item.title && item.path, "manifest item should include id, title, path");
  const pagePath = item.path.replace(/^\.\//, "");
  const html = text(join(pagePath, "index.html"));
  assert(html.includes("id=\"unlockForm\""), `${item.id} should render an unlock form`);
  assert(html.includes("../../page-unlock.js"), `${item.id} should load page unlock script`);
  assert(html.includes("window.PROTECTED_PAYLOAD"), `${item.id} should include encrypted payload`);
  assert(!html.includes("<article class=\"article-wrap\""), `${item.id} appears to expose generated HTML directly`);
}

if (process.env.SITE_TEST_PASSWORD) {
  const homeData = readWindowPayload(payload);
  const homeHtml = await decryptPayload(homeData, process.env.SITE_TEST_PASSWORD);
  assert(homeHtml.includes("data-page-list"), "homepage password did not decrypt directory shell");

  for (const item of manifest) {
    const pagePath = item.path.replace(/^\.\//, "");
    const html = text(join(pagePath, "index.html"));
    const pageData = readInlinePayload(html);
    const pageHtml = await decryptPayload(pageData, process.env.SITE_TEST_PASSWORD);
    assert(pageHtml.includes("</html>"), `${item.id} did not decrypt to a complete HTML document`);
    assert(pageHtml.includes(item.title), `${item.id} decrypted HTML does not contain its title`);
  }
}

console.log("auth gate checks passed");

function readWindowPayload(source) {
  const context = { window: {} };
  vm.runInNewContext(source, context);
  assert(context.window.PROTECTED_PAYLOAD, "payload did not initialize");
  return context.window.PROTECTED_PAYLOAD;
}

function readInlinePayload(source) {
  const match = source.match(/window\.PROTECTED_PAYLOAD\s*=\s*(\{[\s\S]*?\})\s*;\s*<\/script>/);
  assert(match, "inline protected payload missing");
  return JSON.parse(match[1]);
}

async function decryptPayload(data, password) {
  const fromBase64 = (value) => Buffer.from(value, "base64");
  const keyMaterial = await webcrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await webcrypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: fromBase64(data.salt),
      iterations: data.iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  const plain = await webcrypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(data.iv) },
    key,
    fromBase64(data.ciphertext),
  );
  return new TextDecoder().decode(plain);
}
