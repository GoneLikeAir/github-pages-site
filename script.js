const SESSION_KEY = "github_pages_site_unlocked_html_v1";

const authShell = document.querySelector("#authShell");
const unlockForm = document.querySelector("#unlockForm");
const passwordInput = document.querySelector("#passwordInput");
const authMessage = document.querySelector("#authMessage");
const protectedContent = document.querySelector("#protectedContent");

const setMessage = (message, tone = "muted") => {
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.dataset.tone = tone;
};

const fromBase64 = (value) => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
};

const deriveKey = async (password, salt, iterations) => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
};

const decryptProtectedHtml = async (password) => {
  const payload = window.PROTECTED_PAYLOAD;
  if (!payload) throw new Error("encrypted payload missing");

  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const ciphertext = fromBase64(payload.ciphertext);
  const key = await deriveKey(password, salt, payload.iterations);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  return new TextDecoder().decode(plain);
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const loadPageDirectory = async () => {
  const mount = document.querySelector("[data-page-list]");
  if (!mount) return;
  try {
    const response = await fetch("./manifest.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const pages = await response.json();
    if (!Array.isArray(pages) || pages.length === 0) {
      mount.innerHTML = '<p class="muted">还没有发布页面。</p>';
      return;
    }
    mount.innerHTML = pages
      .map((page) => {
        const title = escapeHtml(page.title || page.id || "Untitled");
        const description = escapeHtml(page.description || "");
        const createdAt = escapeHtml(page.createdAt || "");
        const path = escapeHtml(page.path || "#");
        return `<article class="page-card">
          <div>
            <p class="page-date">${createdAt}</p>
            <h3>${title}</h3>
            <p>${description}</p>
          </div>
          <a class="button secondary" href="${path}">打开页面</a>
        </article>`;
      })
      .join("");
  } catch (error) {
    console.warn("Failed to load page directory", error);
    mount.innerHTML = '<p class="auth-message" data-tone="error">页面目录加载失败。</p>';
  }
};

const attachLockButtons = () => {
  for (const button of document.querySelectorAll("[data-lock-button]")) {
    button.addEventListener("click", () => {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.reload();
    });
  }
};

const showProtectedContent = (html) => {
  protectedContent.innerHTML = html;
  protectedContent.hidden = false;
  authShell.hidden = true;
  attachLockButtons();
  loadPageDirectory();
  protectedContent.querySelector("#siteContent")?.focus();
};

const restoreSession = () => {
  const cachedHtml = sessionStorage.getItem(SESSION_KEY);
  if (cachedHtml) showProtectedContent(cachedHtml);
};

unlockForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = passwordInput.value;
  if (!password) return;

  const submit = unlockForm.querySelector("button[type='submit']");
  submit.disabled = true;
  setMessage("正在解密…");

  try {
    const html = await decryptProtectedHtml(password);
    sessionStorage.setItem(SESSION_KEY, html);
    showProtectedContent(html);
  } catch (error) {
    console.warn("Failed to unlock protected page", error);
    setMessage("密码不正确，或者页面密文已损坏。", "error");
    passwordInput.value = "";
    passwordInput.focus();
  } finally {
    submit.disabled = false;
  }
});

restoreSession();
