(() => {
  if (window.__attentionTollboothLoaded) return;
  window.__attentionTollboothLoaded = true;

  const proto = location.protocol;
  if (proto !== 'http:' && proto !== 'https:' && proto !== 'file:') return;

  const PALETTE = {
    dark: '#212529',
    blue: '#6c757d',
    teal: '#adb5bd',
    cyan: '#dee2e6',
    pink: '#f8f9fa'
  };

  const host = document.createElement('div');
  host.id = 'attention-tollbooth-host';
  host.style.cssText = 'all:initial;position:fixed;z-index:2147483647;top:0;left:0;width:0;height:0;';
  (document.body || document.documentElement).appendChild(host);
  const shadow = host.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = `
    :host, * { box-sizing: border-box; }
    .backdrop {
      position: fixed; inset: 0;
      background: rgba(20, 22, 25, 0.45);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      opacity: 0; pointer-events: none;
      transition: opacity .35s ease;
      z-index: 1;
    }
    .backdrop.show { opacity: 1; pointer-events: auto; }

    .toll {
      position: fixed;
      right: 20px; bottom: 20px;
      width: 340px;
      padding: 18px 18px 16px;
      border-radius: 16px;
      background: linear-gradient(160deg, rgba(33,37,41,.92), rgba(33,37,41,.78));
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(222,226,230,.20);
      box-shadow: 0 20px 60px rgba(0,0,0,.35), 0 0 0 1px rgba(173,181,189,.15) inset;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #f8f9fa;
      transform: translateY(30px) scale(.96);
      opacity: 0;
      transition: transform .35s cubic-bezier(.2,.9,.3,1.2), opacity .3s ease;
      z-index: 2;
    }
    .toll.show { transform: translateY(0) scale(1); opacity: 1; }
    .toll.hide { transform: translateY(30px) scale(.96); opacity: 0; }

    .header {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 10px;
    }
    .gate-icon {
      width: 28px; height: 28px; flex: 0 0 28px;
    }
    .headline {
      font-size: 13px; font-weight: 600; letter-spacing: .2px;
      color: ${PALETTE.cyan};
    }

    .time-display {
      text-align: center;
      margin: 6px 0 10px;
    }
    .time-num {
      font-size: 42px; font-weight: 700; line-height: 1;
      color: ${PALETTE.pink};
      display: inline-block;
      transition: transform .12s ease;
      font-variant-numeric: tabular-nums;
    }
    .time-num.bump { transform: scale(1.18); }
    .time-unit {
      font-size: 11px; letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(248,249,250,.75);
      margin-top: 2px;
    }

    .slider-row {
      display: flex; align-items: center; gap: 8px;
      margin: 4px 0 14px;
    }
    .slider-label {
      font-size: 10px; color: rgba(248,249,250,.6);
      font-variant-numeric: tabular-nums;
      min-width: 22px;
    }
    input[type=range] {
      -webkit-appearance: none; appearance: none;
      flex: 1; height: 6px; border-radius: 999px;
      background: ${PALETTE.dark};
      outline: none; margin: 0;
      background-image: linear-gradient(${PALETTE.blue}, ${PALETTE.blue});
      background-repeat: no-repeat;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none; appearance: none;
      width: 18px; height: 18px; border-radius: 50%;
      background: ${PALETTE.teal};
      border: 2px solid #f8f9fa;
      box-shadow: 0 0 0 4px rgba(173,181,189,.25), 0 0 12px rgba(222,226,230,.5);
      cursor: pointer;
      transition: transform .12s ease;
    }
    input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.1); }
    input[type=range]::-moz-range-thumb {
      width: 18px; height: 18px; border-radius: 50%;
      background: ${PALETTE.teal};
      border: 2px solid #f8f9fa;
      box-shadow: 0 0 12px rgba(222,226,230,.5);
      cursor: pointer;
    }

    .pay-btn {
      width: 100%;
      padding: 11px 14px;
      border-radius: 10px;
      border: none;
      background: ${PALETTE.blue};
      color: #212529;
      font-weight: 700; font-size: 13px; letter-spacing: 1px;
      text-transform: uppercase;
      cursor: pointer;
      transition: background .2s ease, transform .1s ease, box-shadow .2s ease;
      box-shadow: 0 6px 16px rgba(108,117,125,.4);
    }
    .pay-btn:hover { background: ${PALETTE.teal}; box-shadow: 0 8px 22px rgba(173,181,189,.45); }
    .pay-btn:active { transform: translateY(1px); }

    .countdown-track {
      height: 3px; width: 100%;
      background: rgba(222,226,230,.15);
      border-radius: 999px;
      margin-top: 10px; overflow: hidden;
    }
    .countdown-fill {
      height: 100%; width: 100%;
      background: linear-gradient(90deg, ${PALETTE.cyan}, ${PALETTE.pink});
      transform-origin: left center;
      transition: transform linear;
    }
    .countdown-hint {
      font-size: 10px; color: rgba(248,249,250,.55);
      text-align: center; margin-top: 6px; letter-spacing: .3px;
    }
    .countdown-hint b { color: ${PALETTE.cyan}; font-weight: 600; }

    /* Expiration UI */
    .expire-border {
      position: fixed; inset: 0; pointer-events: none;
      border: 2px solid ${PALETTE.pink};
      box-shadow: inset 0 0 0 0 rgba(248,249,250,.0);
      animation: pulseBorder 1.4s ease-in-out infinite;
      z-index: 2147483646;
      border-radius: 2px;
    }
    @keyframes pulseBorder {
      0%,100% { box-shadow: inset 0 0 0 0 rgba(248,249,250,.0); }
      50%     { box-shadow: inset 0 0 40px 0 rgba(248,249,250,.35); }
    }

    .toast {
      position: fixed; left: 20px; bottom: 20px;
      max-width: 320px;
      padding: 14px 16px;
      border-radius: 12px;
      background: linear-gradient(160deg, rgba(33,37,41,.95), rgba(33,37,41,.85));
      border: 1px solid rgba(248,249,250,.35);
      box-shadow: 0 20px 50px rgba(0,0,0,.4);
      color: #f8f9fa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      z-index: 3;
      transform: translateY(20px); opacity: 0;
      transition: transform .3s ease, opacity .3s ease;
    }
    .toast.show { transform: translateY(0); opacity: 1; }
    .toast-title { font-size: 13px; font-weight: 600; color: ${PALETTE.cyan}; margin-bottom: 4px; }
    .toast-msg   { font-size: 12px; color: rgba(248,249,250,.8); margin-bottom: 10px; line-height: 1.4; }
    .toast-actions { display: flex; gap: 8px; }
    .toast-btn {
      flex: 1; padding: 8px 10px; border-radius: 8px; border: none;
      font-size: 11px; font-weight: 700; letter-spacing: .5px;
      text-transform: uppercase; cursor: pointer;
      transition: transform .1s ease, filter .2s ease;
    }
    .toast-btn:hover { filter: brightness(1.1); }
    .toast-btn:active { transform: translateY(1px); }
    .toast-btn.close { background: ${PALETTE.pink}; color: #212529; }
    .toast-btn.extend { background: ${PALETTE.teal}; color: #212529; }

    .default-flash {
      position: fixed; right: 20px; bottom: 20px;
      padding: 10px 14px; border-radius: 10px;
      background: rgba(248,249,250,.9); color: #212529;
      font-family: -apple-system, sans-serif; font-size: 12px; font-weight: 600;
      box-shadow: 0 10px 30px rgba(248,249,250,.4);
      z-index: 3;
      animation: flashFade 2.2s ease forwards;
    }
    .countdown-bar {
      position: fixed; left: 50%; bottom: 14px;
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
      display: inline-flex; align-items: center; gap: 10px;
      padding: 8px 14px;
      border-radius: 999px;
      background: linear-gradient(160deg, rgba(33,37,41,.92), rgba(33,37,41,.78));
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(222,226,230,.20);
      box-shadow: 0 10px 30px rgba(0,0,0,.35);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #f8f9fa; font-size: 12px; letter-spacing: .4px;
      z-index: 2;
      transition: opacity .3s ease, transform .3s ease, border-color .3s ease, color .3s ease;
      font-variant-numeric: tabular-nums;
    }
    .countdown-bar.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    .countdown-bar .cb-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: ${PALETTE.teal};
      box-shadow: 0 0 8px rgba(173,181,189,.6);
    }
    .countdown-bar .cb-label {
      color: rgba(248,249,250,.6);
      text-transform: uppercase; font-size: 10px; letter-spacing: 1.2px;
    }
    .countdown-bar .cb-time { font-weight: 700; color: ${PALETTE.cyan}; font-size: 13px; }
    .countdown-bar.warn .cb-dot { background: ${PALETTE.cyan}; animation: cbPulse 1s ease-in-out infinite; }
    .countdown-bar.warn .cb-time { color: ${PALETTE.pink}; }
    .countdown-bar.expired { border-color: rgba(248,249,250,.4); }
    .countdown-bar.expired .cb-dot { background: ${PALETTE.pink}; animation: cbPulse .8s ease-in-out infinite; }
    .countdown-bar.expired .cb-time { color: ${PALETTE.pink}; }
    @keyframes cbPulse {
      0%,100% { transform: scale(1); opacity: 1; }
      50%     { transform: scale(1.4); opacity: .6; }
    }

    @keyframes flashFade {
      0% { opacity: 0; transform: translateY(10px); }
      15%,70% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-4px); }
    }
  `;
  shadow.appendChild(style);

  const gateSvg = `
    <svg class="gate-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="30" width="8" height="14" rx="1.5" fill="${PALETTE.blue}"/>
      <rect x="34" y="30" width="8" height="14" rx="1.5" fill="${PALETTE.blue}"/>
      <rect x="6" y="20" width="36" height="6" rx="1.5" fill="${PALETTE.teal}">
        <animateTransform attributeName="transform" type="rotate" from="0 24 23" to="-70 8 23" dur="1.6s" repeatCount="indefinite" values="0 8 23;-70 8 23;0 8 23" keyTimes="0;0.5;1"/>
      </rect>
      <circle cx="24" cy="12" r="4" fill="${PALETTE.cyan}"/>
    </svg>
  `;

  let tollEl = null;
  let backdropEl = null;
  let tollTimeout = null;
  let tollInterval = null;

  async function showToll() {
    const info = await chrome.runtime.sendMessage({ type: 'REQUEST_TOLL_INFO' });
    const decisionSeconds = info?.decisionSeconds ?? 10;
    const defaultMinutes = info?.defaultMinutes ?? 5;

    backdropEl = document.createElement('div');
    backdropEl.className = 'backdrop';
    shadow.appendChild(backdropEl);

    tollEl = document.createElement('div');
    tollEl.className = 'toll';
    tollEl.innerHTML = `
      <div class="header">
        ${gateSvg}
        <div class="headline">How much attention is this tab worth?</div>
      </div>
      <div class="time-display">
        <div class="time-num" id="timeNum">10</div>
        <div class="time-unit">Minutes</div>
      </div>
      <div class="slider-row">
        <span class="slider-label">1m</span>
        <input type="range" min="1" max="60" value="10" id="slider" />
        <span class="slider-label">60m</span>
      </div>
      <button class="pay-btn" id="payBtn">Pay Toll &amp; Enter</button>
      <div class="countdown-track"><div class="countdown-fill" id="cdFill"></div></div>
      <div class="countdown-hint">Deciding in <b id="cdText">${decisionSeconds}s</b> — otherwise default ${defaultMinutes}m applies</div>
    `;
    shadow.appendChild(tollEl);

    requestAnimationFrame(() => {
      backdropEl.classList.add('show');
      tollEl.classList.add('show');
    });

    const slider = tollEl.querySelector('#slider');
    const timeNum = tollEl.querySelector('#timeNum');
    const payBtn = tollEl.querySelector('#payBtn');
    const cdFill = tollEl.querySelector('#cdFill');
    const cdText = tollEl.querySelector('#cdText');

    const updateSliderBg = (v) => {
      const pct = ((v - 1) / (60 - 1)) * 100;
      slider.style.backgroundSize = `${pct}% 100%`;
    };
    updateSliderBg(slider.value);

    slider.addEventListener('input', () => {
      timeNum.textContent = slider.value;
      timeNum.classList.remove('bump');
      void timeNum.offsetWidth;
      timeNum.classList.add('bump');
      updateSliderBg(slider.value);
    });

    payBtn.addEventListener('click', async () => {
      const mins = parseInt(slider.value, 10);
      await chrome.runtime.sendMessage({ type: 'PAY_TOLL', minutes: mins });
      dismissToll();
      refreshCountdown();
    });

    cdFill.style.transition = `transform ${decisionSeconds}s linear`;
    requestAnimationFrame(() => { cdFill.style.transform = 'scaleX(0)'; });

    let remaining = decisionSeconds;
    tollInterval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        cdText.textContent = '0s';
        clearInterval(tollInterval); tollInterval = null;
      } else {
        cdText.textContent = `${remaining}s`;
      }
    }, 1000);

    tollTimeout = setTimeout(async () => {
      await chrome.runtime.sendMessage({ type: 'PAY_TOLL', minutes: defaultMinutes });
      dismissToll(true);
      refreshCountdown();
    }, decisionSeconds * 1000);
  }

  function dismissToll(showDefault = false) {
    if (tollTimeout) { clearTimeout(tollTimeout); tollTimeout = null; }
    if (tollInterval) { clearInterval(tollInterval); tollInterval = null; }
    if (tollEl) {
      tollEl.classList.remove('show');
      tollEl.classList.add('hide');
      backdropEl?.classList.remove('show');
      const t = tollEl, b = backdropEl;
      setTimeout(() => { t?.remove(); b?.remove(); }, 350);
      tollEl = null; backdropEl = null;
    }
    if (showDefault) {
      const flash = document.createElement('div');
      flash.className = 'default-flash';
      flash.textContent = 'Default toll applied: 5 minutes';
      shadow.appendChild(flash);
      setTimeout(() => flash.remove(), 2400);
    }
  }

  let borderEl = null;
  let toastEl = null;

  let countdownEl = null;
  let countdownTimer = null;
  let countdownExpiresAt = 0;

  function fmt(ms) {
    if (ms < 0) ms = 0;
    const total = Math.ceil(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function ensureCountdown() {
    if (countdownEl) return countdownEl;
    countdownEl = document.createElement('div');
    countdownEl.className = 'countdown-bar';
    countdownEl.innerHTML = `
      <span class="cb-dot"></span>
      <span class="cb-label">Time Left</span>
      <span class="cb-time" id="cbTime">--:--</span>
    `;
    shadow.appendChild(countdownEl);
    requestAnimationFrame(() => countdownEl.classList.add('show'));
    return countdownEl;
  }

  function hideCountdown() {
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    if (countdownEl) {
      const el = countdownEl;
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
      countdownEl = null;
    }
  }

  function tickCountdown() {
    if (!countdownEl) return;
    const timeEl = countdownEl.querySelector('#cbTime');
    const remaining = countdownExpiresAt - Date.now();
    if (remaining <= 0) {
      countdownEl.classList.remove('warn');
      countdownEl.classList.add('expired');
      timeEl.textContent = 'EXPIRED';
    } else {
      countdownEl.classList.remove('expired');
      countdownEl.classList.toggle('warn', remaining <= 60_000);
      timeEl.textContent = fmt(remaining);
    }
  }

  function startCountdown(expiresAt, expired = false) {
    ensureCountdown();
    countdownExpiresAt = expiresAt;
    if (expired) {
      countdownEl.classList.add('expired');
      countdownEl.querySelector('#cbTime').textContent = 'EXPIRED';
    }
    tickCountdown();
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(tickCountdown, 1000);
  }

  async function refreshCountdown() {
    try {
      const res = await chrome.runtime.sendMessage({ type: 'CHECK_TAB' });
      if (res?.tab) {
        startCountdown(res.tab.expiresAt, !!res.tab.expired);
      } else {
        hideCountdown();
      }
    } catch {}
  }


  function applyExpiration() {
    const html = document.documentElement;
    html.style.transition = 'filter 1.5s ease';
    html.style.filter = 'grayscale(0.8)';

    if (!borderEl) {
      borderEl = document.createElement('div');
      borderEl.className = 'expire-border';
      shadow.appendChild(borderEl);
    }

    if (countdownEl) {
      countdownEl.classList.add('expired');
      const t = countdownEl.querySelector('#cbTime');
      if (t) t.textContent = 'EXPIRED';
    }

    showToast();
  }

  function clearExpiration() {
    document.documentElement.style.filter = '';
    borderEl?.remove(); borderEl = null;
    if (toastEl) {
      toastEl.classList.remove('show');
      const t = toastEl;
      setTimeout(() => t.remove(), 300);
      toastEl = null;
    }
    if (countdownEl) countdownEl.classList.remove('expired');
    refreshCountdown();
  }


  function showToast() {
    if (toastEl) return;
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.innerHTML = `
      <div class="toast-title">Attention toll expired</div>
      <div class="toast-msg">This tab is now loitering on your focus. Evict it, or bribe the tollbooth for five more minutes.</div>
      <div class="toast-actions">
        <button class="toast-btn close" id="tClose">Evict Tab</button>
        <button class="toast-btn extend" id="tExtend">Bribe +5m</button>
      </div>
    `;
    shadow.appendChild(toastEl);
    requestAnimationFrame(() => toastEl.classList.add('show'));

    toastEl.querySelector('#tClose').addEventListener('click', async () => {
      await chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
    });
    toastEl.querySelector('#tExtend').addEventListener('click', async () => {
      await chrome.runtime.sendMessage({ type: 'EXTEND' });
    });
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'APPLY_EXPIRATION') { applyExpiration(); sendResponse({ ok: true }); }
    else if (msg.type === 'CLEAR_EXPIRATION') { clearExpiration(); sendResponse({ ok: true }); }
    return true;
  });

  (async () => {
    try {
      const res = await chrome.runtime.sendMessage({ type: 'CHECK_TAB' });
      if (res?.tab) {
        startCountdown(res.tab.expiresAt, !!res.tab.expired);
        if (res.tab.expired || res.now >= res.tab.expiresAt) {
          applyExpiration();
        }
      } else {
        showToll();
      }
    } catch (e) {
    }
  })();
})();
