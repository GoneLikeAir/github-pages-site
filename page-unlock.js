const PAGE_SESSION_KEY = `github_pages_doc_unlocked:${location.pathname}`;

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

unlockForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = passwordInput.value;
  if (!password) return;
  const submit = unlockForm.querySelector("button[type='submit']");
  submit.disabled = true;
  setMessage("正在解密…");
  try {
    const html = await decryptProtectedHtml(password);
    sessionStorage.setItem(PAGE_SESSION_KEY, html);
    showDoc(html);
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
  sessionStorage.removeItem(PAGE_SESSION_KEY);
  location.reload();
});

const cachedHtml = sessionStorage.getItem(PAGE_SESSION_KEY);
if (cachedHtml) showDoc(cachedHtml);
