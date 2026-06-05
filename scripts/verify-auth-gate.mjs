import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { webcrypto } from "node:crypto";

const root = process.cwd();
const text = (file) => readFileSync(join(root, file), "utf8");
const fail = (message) => {
  throw new Error(message);
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const index = text("index.html");
const script = text("script.js");
const payload = text("encrypted-content.js");

const fromCodes = (...codes) => String.fromCodePoint(...codes);
const headingMarker = fromCodes(19968, 20010, 21487, 20197, 30452, 25509, 25176, 31649, 21040, 32, 71, 105, 116, 72, 117, 98, 32, 80, 97, 103, 101, 115, 32, 30340, 38745, 24577, 32593, 39029, 39033, 30446);
const ledeMarker = fromCodes(36825, 26159, 19968, 20010, 38646, 26500, 24314, 12289, 38646, 21518, 31471, 30340, 32, 72, 84, 77, 76, 47, 67, 83, 83, 47, 74, 83, 32, 39033, 30446);
const deployMarker = fromCodes(37096, 32626, 21040, 32, 71, 105, 116, 72, 117, 98, 32, 80, 97, 103, 101, 115);
const protectedMarkers = [headingMarker, ledeMarker, deployMarker];

for (const marker of protectedMarkers) {
  assert(!index.includes(marker), `index.html still exposes protected marker: ${marker}`);
  assert(!script.includes(marker), `script.js still exposes protected marker: ${marker}`);
  assert(!payload.includes(marker), `encrypted-content.js still exposes protected marker: ${marker}`);
}

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

assert(index.includes("id=\"unlockForm\""), "index.html should render an unlock form");
assert(index.includes("id=\"protectedContent\""), "index.html should have protected content mount point");
assert(index.includes("./encrypted-content.js"), "index.html should load encrypted payload before script.js");
assert(script.includes("crypto.subtle"), "script.js should use Web Crypto");
assert(script.includes("PBKDF2"), "script.js should derive a key with PBKDF2");
assert(script.includes("AES-GCM"), "script.js should decrypt with AES-GCM");
assert(payload.includes("window.PROTECTED_PAYLOAD"), "encrypted-content.js should define window.PROTECTED_PAYLOAD");
assert(/ciphertext:\s*"[A-Za-z0-9+/=]+"/.test(payload), "encrypted payload should include base64 ciphertext");

if (process.env.SITE_TEST_PASSWORD) {
  const vm = await import("node:vm");
  const context = { window: {} };
  vm.runInNewContext(payload, context);
  const data = context.window.PROTECTED_PAYLOAD;
  assert(data, "payload did not initialize");
  const fromBase64 = (value) => Buffer.from(value, "base64");
  const keyMaterial = await webcrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.SITE_TEST_PASSWORD),
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
  const html = new TextDecoder().decode(plain);
  assert(html.includes(headingMarker), "password did not decrypt expected content");
}

console.log("auth gate checks passed");
