const ASSET_IMG =
  "https://raw.githubusercontent.com/s-pro-v/os_pro/refs/heads/main/assets/images";

const HOME_LINKS_URL =
  "https://raw.githubusercontent.com/s-pro-v/json-lista/refs/heads/main/linki/home.json";

let LINKS = {
  home: [],
  form: [],
  folder: [],
  all: [],
};

const meta = {
  home: {
    title: "Home",
    subtitle: "Panel deweloperski",
    bg: "home",
    image: `${ASSET_IMG}/image02.png`,
  },
  form: {
    title: "Code Edit",
    subtitle: "Edytory kodu",
    bg: "form",
    image: `${ASSET_IMG}/image07.png`,
  },
  folder: {
    title: "Text Edit",
    subtitle: "Narzędzia i pliki",
    bg: "folder",
    image: `${ASSET_IMG}/image01.png`,
  },
  all: {
    title: "All",
    subtitle: "Wszystkie linki",
    bg: "all",
    image: `${ASSET_IMG}/image05.png`,
  },
  privacy: {
    title: "Polityka Prywatności",
    subtitle: "",
    bg: "privacy",
    image: `${ASSET_IMG}/image02.png`,
  },
};

const titleEl = document.getElementById("panel-title");
const subtitleEl = document.getElementById("panel-subtitle");
const imageEl = document.getElementById("panel-image");
const navPills = document.querySelector(".nav-pills");
const navPillButtons = document.querySelectorAll(
  ".nav-pill:not(.nav-pill--blocker)",
);
const sections = document.querySelectorAll(".section");
const bgLayers = document.querySelectorAll(".bg__layer");
const panelContent = document.querySelector(".panel__content");

const BG_IMAGES = [
  "https://raw.githubusercontent.com/s-pro-v/img/refs/heads/main/G%20img/g1.png",
  "https://raw.githubusercontent.com/s-pro-v/img/refs/heads/main/G%20img/g3.png",
  "https://raw.githubusercontent.com/s-pro-v/img/refs/heads/main/G%20img/g4.png",
  "https://raw.githubusercontent.com/s-pro-v/img/refs/heads/main/G%20img/g7.png",
  "https://raw.githubusercontent.com/s-pro-v/img/refs/heads/main/G%20img/g6.png",
];

let currentBg = "home";
let bgTransitionId = 0;

function preloadBackgrounds() {
  BG_IMAGES.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}

function setBackground(name) {
  if (name === currentBg) return;

  const prevLayer = document.querySelector(
    `.bg__layer[data-bg="${currentBg}"]`,
  );
  const nextLayer = document.querySelector(`.bg__layer[data-bg="${name}"]`);
  if (!nextLayer) return;

  const transitionId = ++bgTransitionId;

  bgLayers.forEach((layer) => {
    if (layer !== prevLayer && layer !== nextLayer) {
      layer.classList.remove("bg__layer--active", "bg__layer--entering");
    }
  });

  nextLayer.classList.add("bg__layer--active", "bg__layer--entering");

  let finished = false;
  const finish = () => {
    if (finished || transitionId !== bgTransitionId) return;
    finished = true;
    if (prevLayer && prevLayer !== nextLayer) {
      prevLayer.classList.remove("bg__layer--active", "bg__layer--entering");
    }
    nextLayer.classList.remove("bg__layer--entering");
    currentBg = name;
  };

  nextLayer.addEventListener("transitionend", finish, { once: true });
  setTimeout(finish, 700);
}

function setPanelImage(src) {
  if (!imageEl || !src) return;
  if (imageEl.dataset.src === src) return;

  imageEl.style.opacity = "0";
  const img = new Image();
  img.onload = () => {
    imageEl.src = src;
    imageEl.dataset.src = src;
    requestAnimationFrame(() => {
      imageEl.style.opacity = "1";
    });
  };
  img.src = src;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function normalizeRemoteLink(item) {
  const href = item?.url || item?.href || "";
  const label = item?.name || item?.label || href;
  if (!href || !label) return null;

  const desc =
    item?.desc ||
    (item?.type ? String(item.type).replace(/_/g, " ") : "") ||
    "";

  return {
    href,
    label,
    desc,
    favicon: item?.favicon || "",
  };
}

function splitIntoGroups(items, groupCount = 4) {
  const groups = Array.from({ length: groupCount }, () => []);
  if (!items.length) return groups;

  const base = Math.floor(items.length / groupCount);
  const rem = items.length % groupCount;
  let offset = 0;

  for (let i = 0; i < groupCount; i++) {
    const size = base + (i < rem ? 1 : 0);
    groups[i] = items.slice(offset, offset + size);
    offset += size;
  }

  return groups;
}

function buildLinksFromHome(items) {
  const links = (Array.isArray(items) ? items : [])
    .filter((item) => !item?.status || item.status === "ACTIVE")
    .map(normalizeRemoteLink)
    .filter(Boolean);

  const [home, form, folder, all] = splitIntoGroups(links, 4);

  return { home, form, folder, all };
}

async function loadLinks() {
  const response = await fetch(HOME_LINKS_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Nie udało się pobrać linków (${response.status})`);
  }

  const data = await response.json();
  LINKS = buildLinksFromHome(data);
  renderLinks();
}

function renderLinks() {
  document.querySelectorAll("[data-links]").forEach((list) => {
    const key = list.dataset.links;
    const links = LINKS[key] || [];

    list.innerHTML = links
      .map((link) => {
        const favicon = link.favicon || getFaviconUrl(link.href);
        return `
      <li>
        <div class="btn-bg">
          <a class="glass-btn" href="${escapeAttr(link.href)}" target="_blank" rel="noopener">
            <span class="glass-btn__favicon">
              <img
                class="glass-btn__favicon-img"
                src="${escapeAttr(favicon)}"
                alt=""
                loading="lazy"
                data-attempt="0"
              />
            </span>
            <span class="glass-btn__text">
              <span class="glass-btn__label">${escapeHtml(link.label)}</span>
              ${link.desc ? `<span class="glass-btn__desc">${escapeHtml(link.desc)}</span>` : ""}
            </span>
          </a>
        </div>
      </li>`;
      })
      .join("");

    bindFaviconHandlers(list);
  });
}

function showSection(name) {
  const info = meta[name] || meta.home;

  titleEl.textContent = info.title;
  subtitleEl.textContent = info.subtitle || "\u00a0";
  subtitleEl.classList.toggle("panel__subtitle--empty", !info.subtitle);
  setPanelImage(info.image);
  setBackground(info.bg);

  navPillButtons.forEach((pill) => {
    pill.classList.toggle("nav-pill--active", pill.dataset.section === name);
  });

  const isPrivacy = name === "privacy";
  const privacyBlock = document.querySelector(".panel__privacy");
  if (privacyBlock) {
    privacyBlock.classList.toggle("is-hidden", isPrivacy);
  }
  if (panelContent)
    panelContent.classList.toggle("panel__content--privacy", isPrivacy);

  sections.forEach((section) => {
    const active = section.dataset.section === name;
    section.hidden = !active;
    section.classList.toggle("section--active", active);
  });
}

document.querySelectorAll("[data-section]").forEach((el) => {
  el.addEventListener("click", () => {
    const name = el.dataset.section;
    if (name) showSection(name);
  });
});

navPillButtons.forEach((pill) => {
  pill.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;

    const rect = pill.getBoundingClientRect();
    pill.style.setProperty(
      "--ripple-x",
      `${((event.clientX - rect.left) / rect.width) * 100}%`,
    );
    pill.style.setProperty(
      "--ripple-y",
      `${((event.clientY - rect.top) / rect.height) * 100}%`,
    );
    pill.classList.remove("nav-pill--ripple");
    void pill.offsetWidth;
    pill.classList.add("nav-pill--ripple");
  });

  pill.addEventListener("animationend", (event) => {
    if (event.animationName !== "nav-pill-ripple") return;
    pill.classList.remove("nav-pill--ripple");
  });
});

document.addEventListener("mousedown", (event) => {
  if (event.button !== 0) return;

  const button = event.target.closest(".glass-btn");
  if (!button) return;

  button.querySelector(".btn-ripple")?.remove();

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const ripple = document.createElement("span");
  ripple.className = "btn-ripple";
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
  button.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove(), {
    once: true,
  });
});

preloadBackgrounds();
if (imageEl) imageEl.dataset.src = meta.home.image;
showSection("home");

loadLinks().catch((error) => {
  console.error(error);
  renderLinks();
});

// --- LKS GUARD: Zegar nawigacji & Weryfikacja sesji ---
function pad2(num) {
  return String(num).padStart(2, "0");
}

function updateNavClock() {
  const now = new Date();
  const dateStr = `${pad2(now.getDate())}.${pad2(now.getMonth() + 1)}.${now.getFullYear()}`;
  const timeStr = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;

  const dateEl = document.getElementById("lks-nav-date");
  const timeEl = document.getElementById("lks-nav-time");

  if (dateEl && dateEl.textContent !== dateStr) {
    dateEl.textContent = dateStr;
  }
  if (timeEl && timeEl.textContent !== timeStr) {
    timeEl.textContent = timeStr;
    timeEl.setAttribute("datetime", now.toISOString());
  }
}

function getSessionState() {
  if (
    window.LKS_GUARD_EXTERNAL &&
    typeof window.LKS_GUARD_EXTERNAL.sessOk === "function"
  ) {
    try {
      if (window.LKS_GUARD_EXTERNAL.sessOk()) return "ok";
    } catch (_) {}
  }

  const sk = sessionStorage.getItem("lks_vault_auth");
  const sdk = sessionStorage.getItem("lks_vault_auth_date");
  const today = new Date().toDateString();
  if (sk === "VALID" && sdk === today) {
    return "ok";
  }

  if (document.body && document.body.classList.contains("lks-guard-passed")) {
    return "ok";
  }

  if (localStorage.getItem("lks_render_auth_token")) {
    return "ok";
  }

  const l0 = document.getElementById("L0");
  if (l0 && !l0.classList.contains("d")) {
    return "wait";
  }

  const isLocal =
    location.protocol === "file:" ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";
  if (isLocal) {
    return "ok";
  }

  return "stop";
}

function updateNavStatus(state, label, status) {
  const container = document.getElementById("lks-nav-status");
  if (!container) return;

  const resolvedState = state || "ok";
  if (container.dataset.lksState !== resolvedState) {
    container.dataset.lksState = resolvedState;
  }

  const labelEl =
    document.getElementById("lks-nav-label") ||
    container.querySelector(".nav-pill__lks-label");
  const statusEl =
    document.getElementById("lks-nav-status-text") ||
    container.querySelector(".nav-pill__lks-status");

  let resolvedLabel = label;
  let resolvedStatus = status;

  if (resolvedState === "ok") {
    if (!resolvedLabel || resolvedLabel === "OK" || resolvedLabel === "LKS") {
      resolvedLabel = "SESJA";
    }
    if (!resolvedStatus || resolvedStatus === "SESJA") {
      resolvedStatus = "Aktywna";
    }
  } else if (resolvedState === "wait") {
    if (!resolvedLabel) resolvedLabel = "SESJA";
    if (!resolvedStatus || resolvedStatus.startsWith("CZEKAJ")) {
      resolvedStatus = "Sprawdzanie…";
    }
  } else {
    if (!resolvedLabel) resolvedLabel = "SESJA";
    if (!resolvedStatus) resolvedStatus = "Nieaktywna";
  }

  if (labelEl && labelEl.textContent !== resolvedLabel) {
    labelEl.textContent = resolvedLabel;
  }
  if (statusEl && statusEl.textContent !== resolvedStatus) {
    statusEl.textContent = resolvedStatus;
  }
}

function refreshSessionStatus() {
  const state = getSessionState();
  if (state === "ok") {
    updateNavStatus("ok", "SESJA", "Aktywna");
  } else if (state === "wait") {
    updateNavStatus("wait", "SESJA", "Sprawdzanie…");
  } else {
    updateNavStatus("stop", "SESJA", "Nieaktywna");
  }
}

let navClockTimer = null;
function startNavClock() {
  updateNavClock();
  refreshSessionStatus();

  if (!navClockTimer) {
    navClockTimer = setInterval(() => {
      updateNavClock();
      refreshSessionStatus();
    }, 1000);
  }
}

// Globalne API LKS_GUARD dla kompatybilności
window.LKS_GUARD = {
  startNavClock,
  updateNavClock,
  sessOk: () => getSessionState() === "ok",
  updateNavStatus,
  refreshSessionStatus,
  getSessionState,
};

startNavClock();

if (document.body) {
  try {
    const sessionObserver = new MutationObserver(() => {
      refreshSessionStatus();
    });
    sessionObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
      childList: true,
    });
  } catch (_) {}
}

window.addEventListener("storage", refreshSessionStatus);
window.addEventListener("focus", refreshSessionStatus);
window.addEventListener("message", (e) => {
  if (
    e.data &&
    (e.data.type === "LKS_SESSION_STATUS" ||
      e.data.type === "LKS_GUARD_LOGOUT" ||
      e.data.type === "LKS_GUARD_LOGIN")
  ) {
    refreshSessionStatus();
  }
});

// Add these to your existing script section
document.addEventListener("DOMContentLoaded", function () {
  // Remove draggable attribute from all elements
  document.querySelectorAll('[draggable="true"]').forEach((el) => {
    el.removeAttribute("draggable");
  });

  // Prevent dragstart event
  document.addEventListener("dragstart", function (e) {
    e.preventDefault();
    return false;
  });

  // Prevent drop event
  document.addEventListener("drop", function (e) {
    e.preventDefault();
    return false;
  });

  // Prevent dragover event
  document.addEventListener("dragover", function (e) {
    e.preventDefault();
    return false;
  });
});
