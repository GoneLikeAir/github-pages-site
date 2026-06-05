const PAGE_SESSION_KEY = `github_pages_doc_unlocked:${location.pathname}`;
const HOME_SESSION_KEY = "github_pages_site_unlocked_html_v1";
const SHARED_PASSPHRASE_KEY = "github_pages_site_passphrase_v1";
const DOC_SESSION_PREFIX = "github_pages_doc_unlocked:";

const authShell = document.querySelector("#authShell");
const docShell = document.querySelector("#docShell");
const docFrame = document.querySelector("#docFrame");
const unlockForm = document.querySelector("#unlockForm");
const passwordInput = document.querySelector("#passwordInput");
const authMessage = document.querySelector("#authMessage");
const lockButton = document.querySelector("#lockButton");

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
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
};

const decryptProtectedHtml = async (password) => {
  const payload = window.PROTECTED_PAYLOAD;
  if (!payload) throw new Error("encrypted payload missing");
  const key = await deriveKey(password, fromBase64(payload.salt), payload.iterations);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(payload.iv) },
    key,
    fromBase64(payload.ciphertext),
  );
  return new TextDecoder().decode(plain);
};

const showDoc = (html) => {
  docFrame.srcdoc = html;
  docShell.hidden = false;
  authShell.hidden = true;
};

const clearSiteSession = () => {
  sessionStorage.removeItem(HOME_SESSION_KEY);
  sessionStorage.removeItem(SHARED_PASSPHRASE_KEY);
  if (typeof sessionStorage.length === "number" && typeof sessionStorage.key === "function") {
    for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = sessionStorage.key(index);
      if (key?.startsWith(DOC_SESSION_PREFIX)) sessionStorage.removeItem(key);
    }
  } else {
    sessionStorage.removeItem(PAGE_SESSION_KEY);
  }
};

const unlockWithPassword = async (password, { rememberPassword = false, silent = false } = {}) => {
  if (!silent) setMessage("正在解密…");
  const html = await decryptProtectedHtml(password);
  sessionStorage.setItem(PAGE_SESSION_KEY, html);
  if (rememberPassword) sessionStorage.setItem(SHARED_PASSPHRASE_KEY, password);
  showDoc(html);
};

unlockForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = passwordInput.value;
  if (!password) return;
  const submit = unlockForm.querySelector("button[type='submit']");
  submit.disabled = true;
  setMessage("正在解密…");
  try {
    await unlockWithPassword(password, { rememberPassword: true });
  } catch (error) {
    console.warn("Failed to unlock encrypted page", error);
    setMessage("密码不正确，或者页面密文已损坏。", "error");
    passwordInput.value = "";
    passwordInput.focus();
  } finally {
    submit.disabled = false;
  }
});

lockButton?.addEventListener("click", () => {
  clearSiteSession();
  location.reload();
});

const cachedHtml = sessionStorage.getItem(PAGE_SESSION_KEY);
if (cachedHtml) {
  showDoc(cachedHtml);
} else {
  const savedPassword = sessionStorage.getItem(SHARED_PASSPHRASE_KEY);
  if (savedPassword) {
    setMessage("正在自动解锁…");
    unlockWithPassword(savedPassword, { silent: true }).catch((error) => {
      console.warn("Failed to restore encrypted page", error);
      sessionStorage.removeItem(SHARED_PASSPHRASE_KEY);
      setMessage("需要重新输入访问密码。", "muted");
    });
  }
}
