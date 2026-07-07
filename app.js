const meta = {
  home: {
    title: "Home",
    subtitle: "Panel deweloperski",
    bg: "home",
    image: "../assets/images/image02.png",
  },
  form: {
    title: "Code Edit",
    subtitle: "Edytory kodu",
    bg: "form",
    image: "../assets/images/image07.png",
  },
  folder: {
    title: "Text Edit",
    subtitle: "Narzędzia i pliki",
    bg: "folder",
    image: "../assets/images/image01.png",
  },
  all: {
    title: "All",
    subtitle: "Wszystkie linki",
    bg: "all",
    image: "../assets/images/image05.png",
  },
  privacy: {
    title: "Polityka Prywatności",
    subtitle: "",
    bg: "privacy",
    image: "../assets/images/image02.png",
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
const privacyLink = document.querySelector(".privacy-link");
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

function renderLinks() {
  document.querySelectorAll("[data-links]").forEach((list) => {
    const key = list.dataset.links;
    const links = LINKS[key] || [];

    list.innerHTML = links
      .map((link) => {
        const favicon = getFaviconUrl(link.href);
        return `
      <li>
        <a class="glass-btn" href="${link.href}" target="_blank" rel="noopener">
          <span class="glass-btn__favicon">
            <img
              class="glass-btn__favicon-img"
              src="${favicon}"
              alt=""
              loading="lazy"
              data-attempt="0"
            />
          </span>
          <span class="glass-btn__text">
            <span class="glass-btn__label">${link.label}</span>
            ${link.desc ? `<span class="glass-btn__desc">${link.desc}</span>` : ""}
          </span>
        </a>
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
  if (privacyLink) {
    privacyLink.classList.toggle("is-hidden", isPrivacy);
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
renderLinks();
if (imageEl) imageEl.dataset.src = meta.home.image;
showSection("home");

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
