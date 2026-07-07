const MISSING_FAVICON_URL =
  "https://raw.githubusercontent.com/s-pro-v/img/refs/heads/main/G%20img/ico.png";

const GENERIC_ICON_HOSTS =
  /(?:^|\.)((?:t[0-9]\.)?gstatic\.com|google\.com|duckduckgo\.com|favicon\.yandex\.net)$/i;

function cleanDomain(url) {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
}

function getFaviconChain(href) {
  const domain = cleanDomain(href);
  const chain = [];

  if (domain.includes("carrd.co")) {
    chain.push(
      `https://${domain}/assets/images/favicon.png`,
      `https://${domain}/assets/images/apple-touch-icon.png`,
    );
  } else {
    chain.push(`https://${domain}/favicon.ico`);
  }

  chain.push(MISSING_FAVICON_URL);
  return chain;
}

function getFaviconUrl(url) {
  return getFaviconChain(url)[0];
}

function isFallbackIcon(src) {
  return src.includes("ico.png");
}

function isGenericServiceIcon(src) {
  try {
    const host = new URL(src, location.href).hostname;
    return GENERIC_ICON_HOSTS.test(host);
  } catch {
    return false;
  }
}

function applyFallbackStyle(imgElement, active) {
  imgElement.classList.toggle("glass-btn__favicon-img--missing", active);
}

function setFaviconSrc(imgElement, src, index) {
  imgElement.src = src;
  imgElement.dataset.attempt = String(index);
  applyFallbackStyle(imgElement, isFallbackIcon(src));
}

function showFaviconFallback(imgElement) {
  imgElement.onerror = null;
  setFaviconSrc(imgElement, MISSING_FAVICON_URL, -1);
}

function tryNextFavicon(imgElement, bookmark) {
  const chain = getFaviconChain(bookmark.href);
  const current = parseInt(imgElement.dataset.attempt, 10);
  const nextIndex = Number.isNaN(current) ? 0 : current + 1;

  if (nextIndex < chain.length) {
    setFaviconSrc(imgElement, chain[nextIndex], nextIndex);
    return true;
  }

  showFaviconFallback(imgElement);
  return false;
}

function handleFaviconError(imgElement, bookmark) {
  if (isFallbackIcon(imgElement.src)) return;
  tryNextFavicon(imgElement, bookmark);
}

function verifyFavicon(imgElement, bookmark) {
  if (isFallbackIcon(imgElement.src)) {
    applyFallbackStyle(imgElement, true);
    return;
  }

  if (isGenericServiceIcon(imgElement.src)) {
    tryNextFavicon(imgElement, bookmark);
  }
}

function bindFaviconHandlers(root) {
  const preload = new Image();
  preload.src = MISSING_FAVICON_URL;

  root.querySelectorAll(".glass-btn__favicon-img").forEach((img) => {
    const bookmark = { href: img.closest(".glass-btn")?.href || "" };
    const chain = getFaviconChain(bookmark.href);

    if (!img.dataset.attempt) {
      img.dataset.attempt = "0";
    }

    if (isGenericServiceIcon(img.src)) {
      setFaviconSrc(img, chain[0], 0);
    }

    img.addEventListener("error", () => handleFaviconError(img, bookmark));
    img.addEventListener("load", () => verifyFavicon(img, bookmark));

    if (img.complete) {
      verifyFavicon(img, bookmark);
    }
  });
}
