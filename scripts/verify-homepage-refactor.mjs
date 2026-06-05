import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import vm from "node:vm";

const password = process.env.SITE_TEST_PASSWORD;
if (!password) {
  console.error("SITE_TEST_PASSWORD is required");
  process.exit(2);
}

const payloadSource = readFileSync("encrypted-content.js", "utf8");
const context = { window: {} };
vm.runInNewContext(payloadSource, context);
const payload = context.window.PROTECTED_PAYLOAD;
if (!payload) throw new Error("homepage payload missing");

const html = await decrypt(payload, password);
const mustInclude = [
  'class="site-nav"',
  'class="library-hero"',
  'class="library-console"',
  'class="workflow-strip compact-workflow"',
  'data-page-list',
  'data-category-list',
  'data-page-search',
  'HTML Anything',
  'GitHub Pages',
];
for (const marker of mustInclude) {
  if (!html.includes(marker)) throw new Error(`decrypted homepage missing marker: ${marker}`);
}

const index = readFileSync("index.html", "utf8");
for (const marker of ["access-shell", "lock-visual", "private document portal"]) {
  if (!index.includes(marker)) throw new Error(`lock screen missing marker: ${marker}`);
}

const styles = readFileSync("styles.css", "utf8");
for (const marker of [".site-nav", ".library-hero", ".library-console", ".category-rail", ".directory-panel", ".workflow-strip", ".lock-visual"]) {
  if (!styles.includes(marker)) throw new Error(`styles missing marker: ${marker}`);
}

console.log("homepage refactor checks passed");

async function decrypt(data, password) {
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
