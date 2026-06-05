const SESSION_KEY = "github_pages_site_unlocked_html_v1";
const SHARED_PASSPHRASE_KEY = "github_pages_site_passphrase_v1";
const DOC_SESSION_PREFIX = "github_pages_doc_unlocked:";

const CATEGORY_LABELS = {
  all: "全部页面",
  "setup-guides": "安装配置",
  "trading-wiki": "交易体系",
  "technical-docs": "技术文档",
  "research-reports": "研究报告",
  "meeting-notes": "会议纪要",
  "product-specs": "产品方案",
  "data-reports": "数据报告",
  articles: "文章长文",
  uncategorized: "未分类",
};

const authShell = document.querySelector("#authShell");
const unlockForm = document.querySelector("#unlockForm");
const passwordInput = document.querySelector("#passwordInput");
const authMessage = document.querySelector("#authMessage");
const protectedContent = document.querySelector("#protectedContent");

let pageDirectoryState = {
  pages: [],
  activeCategory: "all",
  query: "",
};

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

const normalizeCategory = (page) => page.category || inferCategory(page);
const categoryLabel = (category) => CATEGORY_LABELS[category] || category;

const inferCategory = (page) => {
  const haystack = `${page.id || ""} ${page.title || ""} ${page.description || ""} ${page.templateId || ""}`.toLowerCase();
  if (/windows|codex|安装|配置|setup|install|desktop/.test(haystack)) return "setup-guides";
  if (/wiki|交易|股票|复盘|watchlist|strategy|3l/.test(haystack)) return "trading-wiki";
  if (/meeting|会议|纪要|action/.test(haystack)) return "meeting-notes";
  if (/prd|产品|需求|spec/.test(haystack)) return "product-specs";
  if (/data|report|csv|指标|数据/.test(haystack)) return "data-reports";
  if (/research|调研|分析|报告|finance/.test(haystack)) return "research-reports";
  if (/docs|api|runbook|技术|文档/.test(haystack)) return "technical-docs";
  if (/article|blog|essay|长文|观点/.test(haystack)) return "articles";
  return "uncategorized";
};

const normalizePages = (pages) => pages.map((page) => {
  const category = normalizeCategory(page);
  return {
    ...page,
    category,
    categoryLabel: page.categoryLabel || categoryLabel(category),
    tags: Array.isArray(page.tags) ? page.tags : [],
  };
});

const updateText = (selector, text) => {
  const node = document.querySelector(selector);
  if (node) node.textContent = text;
};

const groupByCategory = (pages) => pages.reduce((groups, page) => {
  const key = page.category || "uncategorized";
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(page);
  return groups;
}, new Map());

const pageMatches = (page, query) => {
  if (!query) return true;
  const haystack = [page.title, page.description, page.categoryLabel, page.category, ...(page.tags || [])]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
};

const renderCategoryRail = () => {
  const mount = document.querySelector("[data-category-list]");
  if (!mount) return;
  const groups = groupByCategory(pageDirectoryState.pages);
  const categories = ["all", ...Array.from(groups.keys()).sort((a, b) => categoryLabel(a).localeCompare(categoryLabel(b), "zh-CN"))];
  mount.innerHTML = categories.map((category) => {
    const count = category === "all" ? pageDirectoryState.pages.length : groups.get(category)?.length || 0;
    const active = pageDirectoryState.activeCategory === category ? " is-active" : "";
    return `<button class="category-pill${active}" type="button" data-category="${escapeHtml(category)}">
      <span>${escapeHtml(categoryLabel(category))}</span>
      <small>${count}</small>
    </button>`;
  }).join("");
  for (const button of mount.querySelectorAll("[data-category]")) {
    button.addEventListener("click", () => {
      pageDirectoryState.activeCategory = button.dataset.category || "all";
      renderPageDirectory();
    });
  }
};

const visiblePages = () => pageDirectoryState.pages.filter((page) => {
  const inCategory = pageDirectoryState.activeCategory === "all" || page.category === pageDirectoryState.activeCategory;
  return inCategory && pageMatches(page, pageDirectoryState.query);
});

const renderPageCard = (page) => {
  const title = escapeHtml(page.title || page.id || "Untitled");
  const description = escapeHtml(page.description || "");
  const createdAt = escapeHtml(page.createdAt || "");
  const path = escapeHtml(page.path || "#");
  const label = escapeHtml(page.categoryLabel || categoryLabel(page.category || "uncategorized"));
  const tags = (page.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  return `<article class="page-card library-page-card">
    <div class="page-card-main">
      <div class="page-meta-row">
        <span class="page-category">${label}</span>
        <span class="page-date">${createdAt}</span>
      </div>
      <h3>${title}</h3>
      <p>${description}</p>
      ${tags ? `<div class="tag-row">${tags}</div>` : ""}
    </div>
    <a class="button secondary" href="${path}">打开页面</a>
  </article>`;
};

const renderPageDirectory = () => {
  const mount = document.querySelector("[data-page-list]");
  if (!mount) return;
  renderCategoryRail();
  const pages = visiblePages();
  if (pages.length === 0) {
    mount.innerHTML = '<p class="empty-state">没有匹配的页面。换个关键词或切回“全部页面”。</p>';
    return;
  }
  if (pageDirectoryState.activeCategory !== "all" || pageDirectoryState.query) {
    mount.innerHTML = `<div class="category-section"><div class="category-section-title"><h3>${escapeHtml(categoryLabel(pageDirectoryState.activeCategory))}</h3><span>${pages.length} pages</span></div>${pages.map(renderPageCard).join("")}</div>`;
    return;
  }
  const groups = groupByCategory(pages);
  mount.innerHTML = Array.from(groups.entries())
    .sort(([a], [b]) => categoryLabel(a).localeCompare(categoryLabel(b), "zh-CN"))
    .map(([category, group]) => `<section class="category-section" data-category-section="${escapeHtml(category)}">
      <div class="category-section-title">
        <h3>${escapeHtml(categoryLabel(category))}</h3>
        <span>${group.length} pages</span>
      </div>
      ${group.map(renderPageCard).join("")}
    </section>`)
    .join("");
};

const attachDirectorySearch = () => {
  const input = document.querySelector("[data-page-search]");
  if (!input) return;
  input.addEventListener("input", () => {
    pageDirectoryState.query = input.value.trim();
    renderPageDirectory();
  });
};

const loadPageDirectory = async () => {
  const mount = document.querySelector("[data-page-list]");
  if (!mount) return;
  try {
    const response = await fetch("./manifest.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const pages = normalizePages(await response.json());
    if (!Array.isArray(pages) || pages.length === 0) {
      mount.innerHTML = '<p class="muted">还没有发布页面。</p>';
      return;
    }
    pageDirectoryState.pages = pages;
    const groups = groupByCategory(pages);
    updateText("[data-total-pages]", String(pages.length));
    updateText("[data-category-count]", String(groups.size));
    updateText("[data-latest-page]", pages[0]?.title || "暂无页面");
    updateText("[data-updated-at]", pages[0]?.createdAt ? `最近更新 ${pages[0].createdAt}` : "manifest.json");
    attachDirectorySearch();
    renderPageDirectory();
  } catch (error) {
    console.warn("Failed to load page directory", error);
    mount.innerHTML = '<p class="auth-message" data-tone="error">页面目录加载失败。</p>';
  }
};

const attachLockButtons = () => {
  for (const button of document.querySelectorAll("[data-lock-button]")) {
    button.addEventListener("click", () => {
      clearSiteSession();
      window.location.reload();
    });
  }
};

const clearSiteSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SHARED_PASSPHRASE_KEY);
  if (typeof sessionStorage.length !== "number" || typeof sessionStorage.key !== "function") return;
  for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = sessionStorage.key(index);
    if (key?.startsWith(DOC_SESSION_PREFIX)) sessionStorage.removeItem(key);
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

const unlockWithPassword = async (password, { rememberPassword = false, silent = false } = {}) => {
  if (!silent) setMessage("正在解密…");
  const html = await decryptProtectedHtml(password);
  sessionStorage.setItem(SESSION_KEY, html);
  if (rememberPassword) sessionStorage.setItem(SHARED_PASSPHRASE_KEY, password);
  showProtectedContent(html);
};

const restoreSession = async () => {
  const cachedHtml = sessionStorage.getItem(SESSION_KEY);
  if (cachedHtml) {
    showProtectedContent(cachedHtml);
    return;
  }

  const savedPassword = sessionStorage.getItem(SHARED_PASSPHRASE_KEY);
  if (!savedPassword) return;

  try {
    await unlockWithPassword(savedPassword, { silent: true });
  } catch (error) {
    console.warn("Failed to restore protected homepage", error);
    sessionStorage.removeItem(SHARED_PASSPHRASE_KEY);
  }
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
    console.warn("Failed to unlock protected page", error);
    setMessage("密码不正确，或者页面密文已损坏。", "error");
    passwordInput.value = "";
    passwordInput.focus();
  } finally {
    submit.disabled = false;
  }
});

restoreSession();
