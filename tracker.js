/* Alvyna Analytics - tracker first-party, sem cookies de terceiros. */
(function () {
  'use strict';
  var w = window, d = document, L = location, nav = navigator, sc = d.currentScript, mem = {};
  var EP = (sc && sc.getAttribute('data-endpoint')) || (sc && new URL(sc.src).origin + '/collect');
  function get(k) { try { return w.localStorage.getItem(k); } catch (e) { return mem[k] || null; } }
  function set(k, v) { try { w.localStorage.setItem(k, v); } catch (e) { mem[k] = v; } }
  function del(k) { try { w.localStorage.removeItem(k); } catch (e) { delete mem[k]; } }
  var q = new URLSearchParams(L.search);
  if (q.get('alvyna_ignore') === '1') set('alvyna_ignore', '1');   // ignora suas próprias visitas
  if (q.get('alvyna_ignore') === '0') del('alvyna_ignore');
  if (get('alvyna_ignore') === '1' || !EP) return;

  function rid(n) {
    var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', b = new Uint8Array(n), o = '', i;
    if (w.crypto && w.crypto.getRandomValues) w.crypto.getRandomValues(b); else for (i = 0; i < n; i++) b[i] = Math.random() * 256;
    for (i = 0; i < n; i++) o += a[b[i] % 32]; return o;
  }
  var PK = { 'com.instagram.android': ['instagram', 'social'], 'com.facebook.katana': ['facebook', 'social'], 'com.whatsapp': ['whatsapp', 'social'], 'com.google.android.gm': ['gmail', 'email'], 'com.google.android.googlequicksearchbox': ['google', 'organic'], 'com.linkedin.android': ['linkedin', 'social'], 'com.zhiliaoapp.musically': ['tiktok', 'social'], 'com.twitter.android': ['twitter', 'social'] };
  var RH = [[/mail\.google|outlook\.|mail\.yahoo/, 'email', 'email'], [/(^|\.)google\./, 'google', 'organic'], [/bing\.com/, 'bing', 'organic'], [/duckduckgo/, 'duckduckgo', 'organic'], [/yahoo\./, 'yahoo', 'organic'], [/ecosia/, 'ecosia', 'organic'],
    [/instagram\.com/, 'instagram', 'social'], [/facebook\.com|fb\.me|fb\.com/, 'facebook', 'social'], [/(^|\.)t\.co$|twitter\.com|(^|\.)x\.com$/, 'twitter', 'social'], [/linkedin\.com|lnkd\.in/, 'linkedin', 'social'],
    [/youtube\.com|youtu\.be/, 'youtube', 'social'], [/tiktok\.com/, 'tiktok', 'social'], [/pinterest\./, 'pinterest', 'social'], [/whatsapp\.com|wa\.me/, 'whatsapp', 'social'], [/t\.me|telegram/, 'telegram', 'social'], [/reddit\.com/, 'reddit', 'social']];

  function attribution() {
    var c = function (k) { return q.get(k) || ''; }, a = { src: c('utm_source'), med: c('utm_medium'), cmp: c('utm_campaign'), cnt: c('utm_content'), trm: c('utm_term'), cid: '', camp: false };
    var r = d.referrer, h = '', ua = nav.userAgent, i, m;
    if (a.src) a.camp = true;
    else if (c('gclid') || c('gbraid') || c('wbraid')) { a.src = 'google'; a.med = 'cpc'; a.cid = 'gclid'; a.camp = true; }
    else if (c('fbclid')) { a.src = 'facebook'; a.med = 'social'; a.cid = 'fbclid'; a.camp = true; }
    else if (c('ttclid')) { a.src = 'tiktok'; a.med = 'cpc'; a.cid = 'ttclid'; a.camp = true; }
    else if (c('msclkid')) { a.src = 'bing'; a.med = 'cpc'; a.cid = 'msclkid'; a.camp = true; }
    else {
      if (r && (m = r.match(/^android-app:\/\/([^\/]+)/)) && PK[m[1]]) { a.src = PK[m[1]][0]; a.med = PK[m[1]][1]; }
      else if (r) {
        try { h = new URL(r).hostname.replace(/^www\./, ''); } catch (e) { }
        if (h === L.hostname.replace(/^www\./, '')) return null;     // navegação interna
        for (i = 0; i < RH.length; i++) if (RH[i][0].test(h)) { a.src = RH[i][1]; a.med = RH[i][2]; break; }
        if (!a.src && h) { a.src = h; a.med = 'referral'; }
      } else if (/Instagram/.test(ua)) { a.src = 'instagram'; a.med = 'social'; }
      else if (/FBAN|FBAV|FB_IAB/.test(ua)) { a.src = 'facebook'; a.med = 'social'; }
      else if (/musical_ly|TikTok|Bytedance/.test(ua)) { a.src = 'tiktok'; a.med = 'social'; }
    }
    if (!a.src) { a.src = 'direct'; a.med = 'none'; }
    if (!a.med) a.med = 'none';
    return a;
  }

  var now = Date.now(), S = null, V = get('alvyna_v'), nv = !V, FT = null, CH = {}, first = true;
  try { S = JSON.parse(get('alvyna_s')); } catch (e) { }
  if (!V) { V = rid(16); set('alvyna_v', V); }
  var a = attribution();
  if (!S || now - S.t > 1800000 || (a && a.camp && (a.src !== S.a.src || a.cmp !== S.a.cmp))) S = { id: rid(10), t: now, a: a || { src: 'direct', med: 'none', cmp: '', cnt: '', trm: '', cid: '' } };
  try { FT = JSON.parse(get('alvyna_ft')); } catch (e) { }
  if (!FT) { FT = { src: S.a.src, med: S.a.med, cmp: S.a.cmp }; set('alvyna_ft', JSON.stringify(FT)); }

  function send(t, o) {
    S.t = Date.now(); set('alvyna_s', JSON.stringify(S));
    var b = { t: t, vid: V, sid: S.id, nv: first && nv ? 1 : 0, p: L.pathname, r: d.referrer.slice(0, 200), src: S.a.src, med: S.a.med, cmp: S.a.cmp, cnt: S.a.cnt, trm: S.a.trm, cid: S.a.cid, fs: FT.src, fm: FT.med, fc: FT.cmp, ch: CH, touch: nav.maxTouchPoints || 0, sw: screen.width, sh: screen.height, lang: nav.language, tz: '' };
    try { b.tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { }
    for (var k in o) b[k] = o[k];
    var j = JSON.stringify(b);
    if (nav.sendBeacon && nav.sendBeacon(EP, new Blob([j], { type: 'text/plain' }))) return;
    try { fetch(EP, { method: 'POST', body: j, keepalive: true, headers: { 'Content-Type': 'text/plain' } }); } catch (e) { }
  }

  function start() {
    send('pageview'); first = false;
    var sec = d.querySelectorAll('section[id]'), seen = {};
    if ('IntersectionObserver' in w) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !seen[e.target.id]) { seen[e.target.id] = 1; send('section', { n: e.target.id }); } }); }, { threshold: 0.35 });
      for (var i = 0; i < sec.length; i++) io.observe(sec[i]);
    }
    var sent = {}, tick = false;
    w.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      w.requestAnimationFrame(function () {
        tick = false; var h = d.documentElement, p = Math.round((w.scrollY + w.innerHeight) / h.scrollHeight * 100);
        [25, 50, 75, 100].forEach(function (m) { if (p >= m - 1 && !sent[m]) { sent[m] = 1; send('scroll', { n: String(m) }); } });
      });
    }, { passive: true });
    var vis = d.visibilityState === 'visible' ? Date.now() : 0, acc = 0;
    d.addEventListener('visibilitychange', function () {
      if (d.visibilityState === 'hidden') { if (vis) acc += Date.now() - vis; vis = 0; send('leave', { v: Math.round(acc / 1000) }); }
      else vis = Date.now();
    });
  }

  d.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a,button'); if (!el) return;
    var href = el.getAttribute('href') || '', n = el.getAttribute('data-track');
    if (!n) n = /asaas\.com/.test(href) ? 'checkout' : /wa\.me|whatsapp\.com/.test(href) ? 'whatsapp' : /app\.alvyna/.test(href) ? 'entrar' : href.charAt(0) === '#' ? 'nav_' + href.slice(1) : (el.tagName || '').toLowerCase();
    var sec = el.closest('section[id]'), s = sec ? sec.id : el.closest('header') ? 'header' : el.closest('footer') ? 'footer' : '';
    if (/wa\.me|api\.whatsapp\.com/.test(href)) {      // código da visita dentro da mensagem do WhatsApp
      try { var u = new URL(el.href); u.searchParams.set('text', (u.searchParams.get('text') || 'Olá! Vim pelo site da Alvyna.') + ' (cód. ' + S.id.slice(0, 6) + ')'); el.href = u.href; } catch (x) { }
    }
    send('click', { n: n, l: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80), h: el.href || href, s: s });
  }, true);

  w.alvyna = { track: function (name, extra) { var o = { n: String(name) }; for (var k in extra) o[k] = extra[k]; send('event', o); } };

  var uad = nav.userAgentData;      // Windows 11, versão do Android e modelo do aparelho
  if (uad && uad.getHighEntropyValues) {
    var done = false, go = function () { if (!done) { done = true; start(); } };
    uad.getHighEntropyValues(['platformVersion', 'model']).then(function (v) { CH = { pf: uad.platform, pv: v.platformVersion, model: v.model }; go(); }, go);
    setTimeout(go, 500);
  } else start();
})();
