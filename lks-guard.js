(function () {
  var d = document,
    $ = function (i) {
      return d.getElementById(i);
    };

  function getBody() {
    return d.body;
  }
  if ($("L0")) return;
  var S = d.currentScript;
  if (!S)
    for (var T = d.getElementsByTagName("script"), i = T.length; i--; )
      if ((T[i].src || "").toLowerCase().indexOf("lks-guard") >= 0) {
        S = T[i];
        break;
      }
  var C = window.LKS_GUARD || {},
    H =
      C.HUB_URL ||
      (S && S.getAttribute("data-lks-hub")) ||
      "https://s-pro-v.github.io/guard/",
    SK =
      C.SESSION_KEY ||
      (S && S.getAttribute("data-lks-session-key")) ||
      "lks_vault_auth",
    SDK =
      C.SESSION_DATE_KEY ||
      (S && S.getAttribute("data-lks-session-date-key")) ||
      "lks_vault_auth_date",
    B64 =
      C.MASTER_KEY_B64 ||
      (S && S.getAttribute("data-lks-key-b64")) ||
      "YWRtaW4xMjM=",
    KEY;
  try {
    KEY = C.MASTER_KEY != null ? String(C.MASTER_KEY) : atob(B64);
  } catch (e) {
    KEY = "";
  }
  var css =
    "#L0{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:#111;font:10px monospace;color:#ccc}body *{visibility:hidden!important}#L0,#L0 *{visibility:visible!important}body.lks-guard-passed *{visibility:visible!important}#L0.d{opacity:0;visibility:hidden;pointer-events:none}#L1{max-width:92vw;padding:16px;border:1px solid #444;border-top:3px solid #f60;background:#222}#L2{margin:0 0 6px;font-weight:bold;letter-spacing:.15em;color:#f60}#L3{margin:0;color:#888}.L{display:flex;gap:6px;justify-content:center;margin:0 0 8px}.L b{width:8px;height:8px;background:#333;border-left:2px solid #f60;animation:w .75s infinite}.L b:nth-child(2){animation-delay:.1s}.L b:nth-child(3){animation-delay:.2s}.L b:nth-child(4){animation-delay:.3s}.L b:nth-child(5){animation-delay:.4s}@keyframes w{0%,100%{opacity:.35}50%{opacity:1}}#L1.ok{border-top-color:#284}#L1.ok #L2{color:#284}#L1.er{border-top-color:#a33}#L1.er #L2{color:#e55}#L1.er #L3{color:#eaa}#L1.er .L b{border-left-color:#a33;animation:none;opacity:.45}";
  function sty() {
    if ($("Z")) return;
    var s = d.createElement("style");
    s.id = "Z";
    s.textContent = css;
    (d.head || d.documentElement).appendChild(s);
  }
  function isLocalDev() {
    var h = location.hostname;
    return !h || h === "localhost" || h === "127.0.0.1" || h === "[::1]";
  }

  function saveSession() {
    localStorage.setItem(SK, "VALID");
    localStorage.setItem(SDK, new Date().toDateString());
  }
  function sessOk() {
    var t = new Date().toDateString(),
      x = localStorage.getItem(SK),
      y = localStorage.getItem(SDK);
    if (x === "VALID" && y !== t) {
      localStorage.removeItem(SK);
      localStorage.removeItem(SDK);
      return 0;
    }
    return x === "VALID" && y === t;
  }
  function setSt(x, w) {
    var p = $("L1"),
      a = $("L2"),
      s = $("L3");
    if (p) p.classList.remove("er");
    if (w) {
      if (p) p.classList.add("ok");
      if (a) a.textContent = "OK";
      if (s) s.textContent = x || "";
    } else if (s && x) s.textContent = x;
  }
  function hide() {
    var bodyEl = getBody();
    if (!bodyEl) return;
    bodyEl.classList.add("lks-guard-passed");
    bodyEl.classList.remove("lks-page-loading");
    var o = $("L0");
    if (o) o.classList.add("d");
  }
  function redir(e) {
    var o = $("L0"),
      p = $("L1"),
      a = $("L2"),
      s = $("L3"),
      bodyEl = getBody();
    if (o && bodyEl) {
      bodyEl.classList.remove("lks-guard-passed");
      bodyEl.classList.add("lks-page-loading");
      o.classList.remove("d");
    }
    if (p) {
      p.classList.remove("ok");
      p.classList.add("er");
    }
    if (a) a.textContent = "STOP";
    if (s) s.textContent = e ? "Sesja→hub" : "Brak→hub";
    var g = H || location.origin + "/",
      u = location.origin + location.pathname;
    setTimeout(function () {
      location.href =
        g +
        (g.indexOf("?") >= 0 ? "&" : "?") +
        "return_url=" +
        encodeURIComponent(u);
    }, 1400);
  }
  function watch() {
    if (isLocalDev() || C.DISABLE_WATCH) return;
    function k() {
      if (!d.hidden && !sessOk()) redir(1);
    }
    setInterval(k, 45e3);
    d.addEventListener("visibilitychange", function () {
      if (!d.hidden) k();
    });
  }
  function go() {
    setSt("", 1);
    setTimeout(function () {
      hide();
      watch();
    }, 650);
  }
  function run() {
    var q = new URLSearchParams(location.search);
    if (q.get("lks_logout") === "1") {
      localStorage.removeItem(SK);
      localStorage.removeItem(SDK);
      location.replace(H || location.origin + "/");
      return;
    }
    var v = btoa(KEY + "_" + new Date().getDate()),
      n = q.get("auth");
    if (n && n === v) {
      saveSession();
      history.replaceState({}, d.title, location.origin + location.pathname);
      go();
      return;
    }
    if (sessOk()) {
      go();
      return;
    }
    if (isLocalDev()) {
      saveSession();
      go();
      return;
    }
    redir(0);
  }
  function mount() {
    var bodyEl = getBody();
    if (!bodyEl) {
      d.addEventListener("DOMContentLoaded", mount, { once: true });
      return;
    }
    sty();
    bodyEl.classList.add("lks-page-loading");
    var o = d.createElement("div");
    o.id = "L0";
    o.innerHTML =
      '<div id="L1"><div class="L"><b></b><b></b><b></b><b></b><b></b></div><p id="L2">LKS</p><p id="L3">Czekaj…</p></div>';
    bodyEl.appendChild(o);
    run();
  }
  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
