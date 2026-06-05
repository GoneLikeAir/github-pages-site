import { readFileSync } from "node:fs";
import { webcrypto, randomBytes } from "node:crypto";
import vm from "node:vm";

const password = "correct horse battery staple";
const wrongPassword = "wrong password";
const homeHtml = '<section id="siteContent">Home unlocked</section>';
const docHtml = '<!doctype html><html><head><title>Doc</title></head><body><h1>Doc unlocked</h1></body></html>';
const homeScript = readFileSync("script.js", "utf8");
const pageScript = readFileSync("page-unlock.js", "utf8");

class FakeElement {
  constructor(id) {
    this.id = id;
    this.hidden = false;
    this.innerHTML = "";
    this.textContent = "";
    this.value = "";
    this.disabled = false;
    this.dataset = {};
    this.listeners = {};
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  querySelector(selector) {
    if (selector === "button[type='submit']") return this.submitButton || (this.submitButton = new FakeElement(`${this.id}:submit`));
    if (selector === "#siteContent") return new FakeElement("siteContent");
    return null;
  }

  focus() {
    this.focused = true;
  }
}

const sharedSessionStorage = createSessionStorage();

const home = createHarness({
  script: homeScript,
  payload: await encrypt(homeHtml, password),
  sessionStorage: sharedSessionStorage,
  pathname: "/github-pages-site/",
  ids: ["authShell", "unlockForm", "passwordInput", "authMessage", "protectedContent"],
});
home.elements.passwordInput.value = password;
await home.submit("unlockForm");
assert(home.elements.protectedContent.innerHTML === homeHtml, "homepage should unlock with the submitted password");

const page = createHarness({
  script: pageScript,
  payload: await encrypt(docHtml, password),
  sessionStorage: sharedSessionStorage,
  pathname: "/github-pages-site/pages/wiki-index/",
  ids: ["authShell", "docShell", "docFrame", "unlockForm", "passwordInput", "authMessage", "lockButton"],
});
await waitFor(() => page.elements.docShell.hidden === false, "document page auto unlock");
assert(page.elements.authShell.hidden === true, "document page should hide password gate after prior homepage unlock");
assert(page.elements.docShell.hidden === false, "document page should show content after prior homepage unlock");
assert(page.elements.docFrame.srcdoc === docHtml, "document page should decrypt itself using the cross-page session password");
assert(page.elements.passwordInput.value !== password, "document password input should not be prefilled with the saved password");

await page.click("lockButton");
assert(!sharedSessionStorage.dump().some(([key]) => key.includes("passphrase") || key.includes("credential")), "logout should clear saved cross-page credential");

const staleSessionStorage = createSessionStorage();
staleSessionStorage.setItem("github_pages_site_passphrase_v1", wrongPassword);
const lockedPage = createHarness({
  script: pageScript,
  payload: await encrypt(docHtml, password),
  sessionStorage: staleSessionStorage,
  pathname: "/github-pages-site/pages/wiki-index/",
  ids: ["authShell", "docShell", "docFrame", "unlockForm", "passwordInput", "authMessage", "lockButton"],
});
await waitFor(() => staleSessionStorage.getItem("github_pages_site_passphrase_v1") === null, "wrong saved password cleanup");
assert(lockedPage.elements.authShell.hidden !== true, "wrong saved password should leave document gate visible");
assert(staleSessionStorage.getItem("github_pages_site_passphrase_v1") === null, "wrong saved password should be cleared");

console.log("cross-page session checks passed");

function createHarness({ script, payload, sessionStorage, pathname, ids }) {
  const elements = Object.fromEntries(ids.map((id) => [id, new FakeElement(id)]));
  if (elements.authShell) elements.authShell.hidden = false;
  if (elements.protectedContent) elements.protectedContent.hidden = true;
  if (elements.docShell) elements.docShell.hidden = true;
  if (elements.docFrame) elements.docFrame.srcdoc = "";

  const document = {
    querySelector(selector) {
      if (selector.startsWith("#")) return elements[selector.slice(1)] || null;
      if (selector === "[data-page-list]") return null;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "[data-lock-button]") return [];
      return [];
    },
  };

  const context = {
    window: { PROTECTED_PAYLOAD: payload, location: { reload() {} } },
    document,
    sessionStorage,
    location: { pathname, reload() {} },
    crypto: webcrypto,
    TextEncoder,
    TextDecoder,
    atob: (value) => Buffer.from(value, "base64").toString("binary"),
    console: { ...console, warn() {} },
    setTimeout,
    clearTimeout,
    fetch: async () => ({ ok: true, json: async () => [] }),
  };
  context.globalThis = context;
  context.window.sessionStorage = sessionStorage;
  context.window.crypto = webcrypto;
  context.window.document = document;

  vm.runInNewContext(script, context, { filename: "site-script.js" });

  return {
    elements,
    async submit(id) {
      const event = { preventDefault() {} };
      const handler = elements[id]?.listeners.submit;
      assert(handler, `${id} submit listener missing`);
      await handler(event);
      await flushMicrotasks();
    },
    async click(id) {
      const handler = elements[id]?.listeners.click;
      assert(handler, `${id} click listener missing`);
      await handler({ preventDefault() {} });
      await flushMicrotasks();
    },
    flush: flushMicrotasks,
  };
}

function createSessionStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    dump() {
      return Array.from(store.entries());
    },
  };
}

async function encrypt(html, passphrase) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const iterations = 1_000;
  const keyMaterial = await webcrypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
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
  const ciphertext = await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(html));
  const b64 = (value) => Buffer.from(value).toString("base64");
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

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

async function waitFor(predicate, label) {
  const deadline = Date.now() + 2_000;
  while (Date.now() < deadline) {
    await flushMicrotasks();
    if (predicate()) return;
  }
  throw new Error(`timed out waiting for ${label}`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
