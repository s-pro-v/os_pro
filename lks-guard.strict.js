 (function () {
  if (customElements.get("lks-guard-vault")) return;

  class LksGuardVault extends HTMLElement {
    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "closed" });
    }

    static get observedAttributes() {
      return ["hub-url", "session-key", "session-date-key"];
    }

    connectedCallback() {
      this.render();
      this.initGuard();
      this.enforceSecurity();
      this.initDevToolsShield();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this.render();
      }
    }

    enforceSecurity() {
      var safetyStyle = document.createElement("style");
      safetyStyle.id = "lks-lock-style";
      safetyStyle.textContent = "body > *:not(lks-guard-vault) { visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }";
      document.head.appendChild(safetyStyle);

      var observer = new MutationObserver(function () {
        if (!document.querySelector("lks-guard-vault")) {
          document.body.innerHTML = "";
          location.reload();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    initDevToolsShield() {
      var C = (window.LKS_GUARD = window.LKS_GUARD || {});
      var H = this.getAttribute("hub-url") || C.HUB_URL || "https://s-pro-v.github.io/guard/";

      // 1. Blokada skrótów klawiszowych i menu kontekstowego
      window.addEventListener("keydown", function (e) {
        if (
          e.keyCode === 123 ||
          (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
          (e.ctrlKey && e.keyCode === 85)
        ) {
          e.preventDefault();
          e.stopPropagation();
          location.replace(H + (H.indexOf("?") >= 0 ? "&" : "?") + "return_url=" + encodeURIComponent(location.href));
          return false;
        }
      }, true);

      window.addEventListener("contextmenu", function (e) {
        e.preventDefault();
      });

      // 2. Wykrywanie wymiarów okna (DevTools docked)
      var threshold = 160;
      setInterval(function () {
        if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
          document.body.innerHTML = "<div style='background:#121212;color:#f36c00;height:100vh;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:14px;letter-spacing:0.2em;'>SECURITY_ALERT // DEVTOOLS_DETECTED</div>";
          setTimeout(function () {
            location.replace(H + (H.indexOf("?") >= 0 ? "&" : "?") + "return_url=" + encodeURIComponent(location.href));
          }, 1000);
        }
      }, 1000);

      // 3. Pułapka anty-debuggingowa (pętla debugger;)
      setInterval(function () {
        var t = Date.now();
        debugger;
        if (Date.now() - t > 100) {
          location.replace(H + (H.indexOf("?") >= 0 ? "&" : "?") + "return_url=" + encodeURIComponent(location.href));
        }
      }, 1500);
    }

    render() {
      var C = (window.LKS_GUARD = window.LKS_GUARD || {});
      var ICON_LOCK = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="10"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

      var leds = "";
      for (var k = 0; k < 24; k++) {
        leds += '<div class="btn-bg"><b class="btn"></b></div>';
      }

      this.shadow.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');

          :host {
            position: fixed;
            inset: 0;
            z-index: 2147483647;
            --shadow-drop: rgba(32, 32, 32, 0.4) 0px 0px 0px 2px, rgba(0, 0, 0, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
            --shadow-inset: inset 0px 0px 0px 2px rgba(32, 32, 32, 0.4), inset 0px 4px 6px -1px rgba(0, 0, 0, 0.65), inset 0px 1px 0px rgba(255, 255, 255, 0.08);
            --padding: 0.125rem;
            --gap: 0.125rem;
            --bg-tertiary: #2e2e2e;
            --border-color: #2a2a2a;
            --panel-bg: #2a2a2a;
            --card-bg: #1e1e1e;
            --text-muted: #858585;
            --text-color: #e0e0e0;
            --highlight-color: #f36c00;
            --accent-ok: #09b83e;
            --border-color-hover: #444444;
            --font-family: "JetBrains Mono", monaco, courier, monospace;
          }

          *, *::before, *::after {
            border-radius: 0 !important;
            box-sizing: border-box;
          }

          #L0 {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: var(--card-bg);
            background-image:
                linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
                linear-gradient(rgba(18, 18, 18, 0.76), rgba(18, 18, 18, 0.62)),
                url('https://raw.githubusercontent.com/s-pro-v/os_pro/refs/heads/main/assets/images/bg4.jpg');
            background-size: 24px 24px, 24px 24px, cover, cover;
            background-position: center;
            font-family: var(--font-family);
            user-select: none;
            -webkit-user-select: none;
            transition: opacity 0.3s ease, visibility 0.3s ease;
          }

          #L0.d {
            opacity: 0;
            visibility: hidden !important;
            pointer-events: none;
          }

          .btn-bg {
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: var(--shadow-inset);
            padding: var(--padding);
            gap: var(--gap);
            position: relative;
            overflow: hidden;
            width: fit-content;
            border: 1px solid var(--border-color);
            background: var(--card-bg);
          }

          .btn {
            box-shadow: var(--shadow-drop);
            border: 1px solid var(--border-color);
            background: var(--bg-tertiary);
            color: var(--text-muted);
            width: 100px;
            height: 30px;
            font-family: var(--font-family);
            font-weight: 700;
            display: flex;
            align-items: center;
            margin: 0;
          }

          .lks-outer-frame {
            padding: 0.25rem;
            background: #181818;
            border: 1px solid var(--border-color);
          }

          #L1 {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            width: 390px;
            max-width: 92vw;
            height: auto;
            padding: 0.375rem;
            gap: 0.25rem;
            background-color: var(--panel-bg);
            border: 1px solid var(--border-color);
            text-transform: uppercase;
          }

          .lks-row { display: flex; width: 100%; gap: var(--gap); }
          .lks-grow { flex: 1; width: 40%; height: fit-content; }
          .lks-full { width: 100%; }

          .lks-led-box { width: 28px; height: 26px; justify-content: center; background: var(--card-bg); }
          #L-led { display: block; width: 6px; height: 6px; background: var(--highlight-color); box-shadow: 0 0 6px var(--highlight-color); }

          .lks-telemetry { width: 100%; height: 26px; padding: 0 0.5rem; justify-content: space-between; font-size: 10px; letter-spacing: 0.06rem; background: var(--card-bg); }
          .t-ok { color: var(--highlight-color); font-weight: 800; }
          .t-ses { color: var(--text-color); opacity: 0.85; }
          .t-clock { color: var(--highlight-color); font-weight: 700; }

          .lks-tile { width: 100%; height: 54px; padding: 0 0.5rem 0 0.75rem; justify-content: space-between; background: linear-gradient(180deg, #323232 0%, #262626 100%); border: 1px solid var(--border-color); }
          .lks-tile-info { display: flex; flex-direction: column; justify-content: center; gap: 3px; text-align: left; }
          #L2 { margin: 0; font-size: 13px; font-weight: 800; letter-spacing: 0.08rem; color: var(--text-color); line-height: 1; }
          .lks-sub { font-size: 9px; font-weight: 700; letter-spacing: 0.06rem; color: var(--text-muted); opacity: 0.65; line-height: 1; }
          
          .lks-icon-slot { padding: var(--padding); background: var(--card-bg); }
          #L2-badge { width: 32px; height: 32px; justify-content: center; background: var(--bg-tertiary); color: var(--highlight-color); border: 1px solid var(--border-color); }

          #L3 { width: 100%; height: 28px; padding: 0 0.625rem; font-size: 10px; letter-spacing: 0.1rem; color: var(--text-muted); justify-content: flex-start; }
          #L3::before { content: "SYS_MSG // "; color: var(--highlight-color); opacity: 0.75; margin-right: 0.35rem; }

          .lks-row.L { justify-content: space-between; gap: 2px; }
          .L .btn-bg { flex: 1; padding: 2px; aspect-ratio: 1 / 1; max-width: 14px; }
          .L b.btn { width: 100%; height: 100%; min-width: 6px; min-height: 6px; aspect-ratio: 1 / 1; background: var(--bg-tertiary); border: 1px solid var(--border-color); animation: lks-scan 1.2s infinite steps(1); }

          @keyframes lks-scan {
              0%, 100% { background: var(--bg-tertiary); border-color: var(--border-color); }
              50% { background: var(--highlight-color); border-color: var(--border-color-hover); }
          }

          #L4 { width: 100%; height: 15px; padding: var(--padding); background: var(--card-bg); box-shadow: var(--shadow-inset); border: 1px solid var(--border-color); overflow: hidden; }
          #L5 { width: 0%; height: 100%; background: var(--highlight-color); border: 1px solid var(--border-color); box-shadow: var(--shadow-drop); }
          #L6 { width: 58px; height: 15px; justify-content: center; font-size: 10px; letter-spacing: 0.06rem; color: var(--highlight-color); }

          #L1.ok #L-led { background: var(--accent-ok); box-shadow: 0 0 6px var(--accent-ok); }
          #L1.ok .t-ok, #L1.ok .t-ses { color: var(--accent-ok); }
          #L1.ok #L2-badge { color: var(--accent-ok); }
          #L1.ok #L3, #L1.ok #L3::before { color: var(--accent-ok); }
          #L1.ok #L3:empty::after { content: "ACCESS_GRANTED // SESJA AKTYWNA"; color: var(--accent-ok); }
          #L1.ok #L5 { background: var(--accent-ok); animation: lks-load 2.65s linear forwards; }
          #L1.ok .L b.btn { background: var(--accent-ok); animation: srv-a .6s infinite steps(2, end); }

          #L1.er #L-led { background: var(--highlight-color); box-shadow: 0 0 8px var(--highlight-color); }
          #L1.er .t-ok, #L1.er .t-ses, #L1.er #L2, #L1.er #L3, #L1.er #L2-badge { color: var(--highlight-color); }
          #L1.er #L3::before { content: "ERR_CODE // "; }
          #L1.er .L b.btn { animation: none; background: var(--highlight-color); opacity: 0.45; }
          #L1.er #L5 { animation: none; width: 100%; background: var(--highlight-color); }

          @keyframes lks-load { 0% { width: 0%; } 100% { width: 100%; } }
          @keyframes srv-a { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
        </style>

        <div id="L0">
          <div class="btn-bg lks-outer-frame">
            <div id="L1" class="btn lks-chassis">
              <div class="lks-row lks-top-bar">
                <div class="btn-bg"><div class="btn lks-led-box"><i id="L-led"></i></div></div>
                <div class="btn-bg lks-grow">
                  <div class="btn lks-telemetry">
                    <span id="L-st-code" class="t-ok">WAIT</span>
                    <span id="L-st-lbl" class="t-ses">SESJA</span>
                    <span id="L-date" class="t-clock">--.--.----</span>
                    <span id="L-time" class="t-clock">--:--:--</span>
                  </div>
                </div>
              </div>
              <div class="btn-bg lks-full">
                <div class="btn lks-tile">
                  <div class="lks-tile-info">
                    <p id="L2">LKS_GUARD</p>
                    <span class="lks-sub">SECURITY GATE // EXTERNAL REPO</span>
                  </div>
                  <div class="btn-bg lks-icon-slot">
                    <span id="L2-badge" class="btn lks-icon-btn">${ICON_LOCK}</span>
                  </div>
                </div>
              </div>
              <div class="btn-bg lks-full"><p id="L3">Weryfikacja sesji…</p></div>
              <div class="lks-row L">${leds}</div>
              <div class="lks-row">
                <div class="btn-bg lks-grow"><div id="L4" class="btn lks-bar-slot"><div id="L5"></div></div></div>
                <div class="btn-bg"><div id="L6" class="btn lks-pct">0%</div></div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    initGuard() {
      var shadowDoc = this.shadow;
      var $ = function (i) { return shadowDoc.getElementById(i); };

      var C = (window.LKS_GUARD = window.LKS_GUARD || {});
      var H = this.getAttribute("hub-url") || C.HUB_URL || "https://s-pro-v.github.io/guard/";
      var SK = this.getAttribute("session-key") || C.SESSION_KEY || "lks_vault_auth";
      var SDK = this.getAttribute("session-date-key") || C.SESSION_DATE_KEY || "lks_vault_auth_date";
      var ALLOWED_HASHES = C.ALLOWED_HASHES || [
        "3cdf2dabfe18fb4d0e1f39fc86f836ed20ef0510d0f373b8071417906842bb93"
      ];

      var ICON_OK = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/><path d="M9 12l2 2 4-4"/></svg>';
      var ICON_ERR = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L2 20h20L12 2z"/><path d="M12 9v5"/><path d="M12 16h.01"/></svg>';

      function clearSess() {
        try {
          sessionStorage.removeItem(SK);
          sessionStorage.removeItem(SDK);
          localStorage.removeItem(SK);
          localStorage.removeItem(SDK);
        } catch (e) {}
      }

      function sessOk() {
        var t = new Date().toDateString(),
          x = sessionStorage.getItem(SK),
          y = sessionStorage.getItem(SDK);
        if (x === "VALID" && y !== t) { clearSess(); return 0; }
        return x === "VALID" && y === t;
      }

      function pad(n) { return (n < 10 ? "0" : "") + n; }

      function startNavClock() {
        setInterval(function () {
          var t = new Date();
          var dateStr = pad(t.getDate()) + "." + pad(t.getMonth() + 1) + "." + t.getFullYear();
          var timeStr = pad(t.getHours()) + ":" + pad(t.getMinutes()) + ":" + pad(t.getSeconds());
          if ($("L-date")) $("L-date").textContent = dateStr;
          if ($("L-time")) $("L-time").textContent = timeStr;
        }, 1000);
      }

      function setSt(x, w) {
        var p = $("L1"), a = $("L2"), bg = $("L2-badge"), s = $("L3");
        if (p) p.classList.remove("er");
        if (w) {
          if (p) p.classList.add("ok");
          if (a) a.textContent = "GUARD // OK";
          if (bg) bg.innerHTML = ICON_OK;
          if (s) s.textContent = x || "";
        } else if (s && x) s.textContent = x;
      }

      function hide() {
        var o = $("L0");
        if (o) o.classList.add("d");
        var lock = document.getElementById("lks-lock-style");
        if (lock) lock.remove();
      }

      var selfComponent = this;
      function dispatchSuccessEvent() {
        var successEvent = new CustomEvent("lks-auth-success", {
          bubbles: true,
          composed: true,
          detail: { timestamp: new Date().toISOString(), sessionKey: SK }
        });
        selfComponent.dispatchEvent(successEvent);
      }

      function redir(e) {
        clearSess();
        var o = $("L0"), p = $("L1"), a = $("L2"), bg = $("L2-badge"), s = $("L3");
        if (o) o.classList.remove("d");
        if (p) { p.classList.remove("ok"); p.classList.add("er"); }
        if (a) a.textContent = "GUARD // STOP";
        if (bg) bg.innerHTML = ICON_ERR;
        if (s) s.textContent = e ? "Sesja wygasła → Hub" : "Brak autoryzacji → Hub";
        setTimeout(function () {
          location.replace(H + (H.indexOf("?") >= 0 ? "&" : "?") + "return_url=" + encodeURIComponent(location.href));
        }, 1200);
      }

      function go() {
        setSt("", 1);
        var bar = $("L5"), pct = $("L6"), done = 0;
        function finish() {
          if (done) return;
          done = 1;
          if (pct) pct.textContent = "100%";
          hide();
          startNavClock();
          dispatchSuccessEvent();
        }
        setTimeout(finish, 2800);
      }

      async function sha256(t) {
        if (!t) return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        var buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
        return Array.from(new Uint8Array(buf)).map(function (x) { return x.toString(16).padStart(2, "0"); }).join("");
      }

      async function run() {
        var q = new URLSearchParams(location.search);
        var n = q.get("auth"), day = new Date().getDate();
        if (n) {
          for (var i = 0; i < ALLOWED_HASHES.length; i++) {
            var exp = await sha256(ALLOWED_HASHES[i] + "_" + day);
            if (n.toLowerCase() === exp.toLowerCase()) {
              sessionStorage.setItem(SK, "VALID");
              sessionStorage.setItem(SDK, new Date().toDateString());
              history.replaceState({}, document.title, location.pathname);
              go();
              return;
            }
          }
          clearSess();
          redir(0);
          return;
        }
        if (sessOk()) { go(); return; }
        clearSess();
        redir(0);
      }

      run();
    }
  }

  customElements.define("lks-guard-vault", LksGuardVault);
  if (!document.querySelector("lks-guard-vault")) {
    document.body.prepend(document.createElement("lks-guard-vault"));
  }
})();
