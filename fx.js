/* ============================================================
   fx.js — 모든 페이지 공통 "잔잔한 연출" (가벼운 버전 / 트래픽 0)
   · 천천히 떠다니는 입자   · 클릭하면 모양이 톡 터짐   · 카드 살짝 기울기
   · 프사 클릭 이스터에그(프사 톡)   · 생일 D-Day 계산 도우미(fxDday)
   · 페이지 전환 로딩화면 + 레이아웃 "커지는 등장"(이미지·색은 그 사람에 맞춰 자동)

   ★★ 사람마다 바꿀 곳은 아래 "설정" 4줄뿐입니다 ★★
   우히 = 하트(♡). 다른 사람은 별(★) · 토끼(🐰) · 음표(♪) · 물방울(💧) 등으로 교체.
   - 글자 모양(♡ ★ ♪ ✦ ☆)은 그 사람 메인색(--main)으로 칠해집니다.
   - 이모지(🐰 ⭐ 💧)는 색칠 대신 이모지 그대로 보입니다. (둘 다 OK)

   사용법: 각 페이지 </body> 바로 위에 한 줄
     · 메인(루트 index.html):  <script src="fx.js"></script>
     · 서브폴더 페이지:         <script src="../fx.js"></script>
   색은 페이지의 --main 변수를 그대로 써서 다크모드까지 자동 적용됩니다.
   ============================================================ */

/* ─────────── 설정 (이 사람에 맞게 바꾸세요) ─────────── */
/* ⚠️ 페이지에서 fx.js 보다 먼저 FX_* 를 지정했으면 그 값을 그대로 쓴다.
      (예전엔 여기서 무조건 덮어써서 페이지 설정이 전부 무시됐다 — 프사 입자가 ♡ 로만 나오던 원인) */
var FX_FLOAT = (typeof FX_FLOAT !== 'undefined' && FX_FLOAT) ? FX_FLOAT : ['♡','✦','♡','✧','♡','✦'];  // 떠다니는 입자 모양
var FX_CLICK = (typeof FX_CLICK !== 'undefined' && FX_CLICK) ? FX_CLICK : '♡';   // 클릭/프사톡 모양. 글자·이모지·이미지(data:/https:) 가능
var FX_COUNT = (typeof FX_COUNT !== 'undefined' && FX_COUNT !== null) ? FX_COUNT : 14;   // 떠다니는 입자 개수
var FX_TILT  = (typeof FX_TILT  !== 'undefined') ? FX_TILT  : true;              // 카드 마우스오버 살짝 기울기

/* ─ 로딩화면 + 페이지 전환(커지는 등장) — 보통 그대로 두세요 ─ */
var FX_LOADER      = true;   // 페이지 넘어갈 때 로딩화면 + 레이아웃 커지는 등장 (끄려면 false)
var FX_LOADER_IMG  = '';     // 로딩화면 가운데 이미지 URL. 비우면 자동: 마스코트(--char) → SOOP 프사 → 글자
var FX_LOADER_TEXT = '';     // 이미지 없을 때/이름표에 띄울 글자. 비우면 상단 로고 글자 자동
var FX_TRANS_MS    = 800;    // 커지는 등장 길이(ms). 더 느리게 = 숫자 ↑ / 더 빠르게 = 숫자 ↓

/* ── 제목 타이핑 ── */
var FX_TYPE       = true;    // 제목·내용이 한 글자씩 찍히는 연출 (끄려면 false)
var FX_TYPE_SEL   = '.lh, .card-title, .ph-title';   // 제목 선택자
var FX_TYPE_BODY  = true;    // 카드 내용도 이어서 타이핑 (제목만 원하면 false)
var FX_TYPE_BODY_SEL = '.rl, .pf, .dcell, .lnk';     // 내용 선택자 (문단·프로필칸·요일칸·링크버튼)
var FX_TYPE_SPEED = 22;      // 제목 글자 간격(ms). 빠르게 = 숫자 ↓
var FX_TYPE_BODY_SPEED = 12; // 내용 글자 간격(ms). 내용은 길어서 제목보다 빠르게
var FX_TYPE_MAX   = 30;      // 제목이 이보다 길면 생략
var FX_TYPE_BODY_MAX = 260;  // 내용이 이보다 길면 생략(너무 오래 걸리는 문단 보호)
var FX_TYPE_GAP   = 45;      // 같은 박스 안에서 다음 줄로 넘어갈 때 쉬는 시간(ms)
var FX_TYPE_BOX_SEL  = '.letter, .card, .pagehero';  // "박스" 단위 — 박스끼리는 동시에 찍힌다
var FX_TYPE_WAIT_VIEW = true;   // 화면 밖 박스는 보일 때 시작(false = 처음부터 전부 동시에)
/* 예)  별 테마 :  FX_FLOAT=['★','✦','☆'];   FX_CLICK='★';
        토끼 테마:  FX_FLOAT=['🐰','✦','♡'];  FX_CLICK='🐰';
        음표 테마:  FX_FLOAT=['♪','♫','✦'];   FX_CLICK='♪';                 */
/* ────────────────────────────────────────────────────── */

(function () {
  var mqReduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mqFine   = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;

  var css = `
    body::before{ display:none !important; }            /* 빽빽한 정적 배경무늬 끄기 */
    #fx{ position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
    .fx-p{ position:absolute; top:-26px; color:var(--main); opacity:0; will-change:transform,opacity; animation:fxFall linear infinite; }
    @keyframes fxFall{
      0%{ transform:translateY(-26px) translateX(0) rotate(0); opacity:0; }
      12%{ opacity:.5; } 88%{ opacity:.4; }
      100%{ transform:translateY(103vh) translateX(var(--drift,20px)) rotate(210deg); opacity:0; }
    }
    .container, .wrap{ perspective:1300px; }
    .card{ transition:transform .25s ease, box-shadow .25s ease; will-change:transform; }
    .fx-tilting{ box-shadow:var(--shadow-hover, 0 16px 36px rgba(31,60,90,.16)); }
    .fx-heart{ position:fixed; z-index:500; pointer-events:none; color:var(--main); transform:translate(-50%,-50%); animation:fxHeart .95s ease-out forwards; }
    @keyframes fxHeart{
      0%{ opacity:0; transform:translate(-50%,-50%) scale(.4); }
      18%{ opacity:.85; }
      100%{ opacity:0; transform:translate(calc(-50% + var(--hx,0px)), calc(-50% - 62px)) scale(1.05); }
    }
    @media (prefers-reduced-motion: reduce){ #fx{ display:none; } .card{ transition:none; } .fx-heart{ display:none; } }

    /* ── 프사 톡 ── */
    .fx-bounce{ animation:fxBounce .52s cubic-bezier(.28,1.5,.4,1) both; }
    @keyframes fxBounce{
      0%{ scale:1 }
      28%{ scale:1.16 }
      55%{ scale:.93 }
      78%{ scale:1.05 }
      100%{ scale:1 }
    }
    .fx-ringfast{ animation-duration:1.1s !important; }
    @media (prefers-reduced-motion: reduce){ .fx-bounce{ animation:none !important; } }

    /* ── 제목 타이핑 ── */
    .fx-typing{ white-space:pre-wrap; }
    .fx-caret{ display:inline-block; width:.06em; min-width:2px; font-style:normal;
      background:currentColor; opacity:.9; margin-left:.06em; vertical-align:-.08em;
      height:1em; animation:fxCaret .7s steps(1) infinite; }
    @keyframes fxCaret{ 0%,49%{ opacity:.9 } 50%,100%{ opacity:0 } }
    @media (prefers-reduced-motion: reduce){ .fx-caret{ display:none !important; } }

    /* ── 로딩화면 + 페이지 전환(커지는 등장) ── */
    #fxload{ position:fixed; inset:0; z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:18px; background:var(--bg); transition:opacity .34s ease; }
    #fxload.fx-hide{ opacity:0; pointer-events:none; }
    #fxload.fx-hide .fxload-av, #fxload.fx-hide .fxload-dots i{ animation-play-state:paused; }
    #fxload .fxload-av{ width:96px; height:96px; border-radius:50%; background:var(--main-light); background-size:cover; background-position:center; display:flex; align-items:center; justify-content:center; font-size:46px; font-weight:800; color:var(--main-dark); box-shadow:0 10px 28px rgba(0,0,0,.14); animation:fxBob 1.1s ease-in-out infinite; }
    #fxload .fxload-av.mascot{ width:150px; height:150px; border-radius:0; background-color:transparent; background-size:contain; background-repeat:no-repeat; box-shadow:none; filter:drop-shadow(0 12px 22px rgba(0,0,0,.16)); }
    @keyframes fxBob{ 0%,100%{ transform:translateY(0) scale(1); } 50%{ transform:translateY(-12px) scale(1.04); } }
    #fxload .fxload-name{ font-weight:800; font-size:18px; color:var(--main-dark); letter-spacing:.02em; }
    #fxload .fxload-dots{ display:flex; gap:7px; }
    #fxload .fxload-dots i{ width:9px; height:9px; border-radius:50%; background:var(--main); display:block; animation:fxDot 1s ease-in-out infinite; }
    #fxload .fxload-dots i:nth-child(2){ animation-delay:.15s; }
    #fxload .fxload-dots i:nth-child(3){ animation-delay:.3s; }
    @keyframes fxDot{ 0%,100%{ opacity:.3; transform:translateY(0); } 40%{ opacity:1; transform:translateY(-7px); } }
    .fx-enter{ animation:fxPop var(--fx-trans,.8s) cubic-bezier(.2,.72,.3,1) both; transform-origin:50% 0; }
    @keyframes fxPop{ from{ opacity:0; transform:scale(.93); } to{ opacity:1; transform:scale(1); } }
    @media (prefers-reduced-motion: reduce){ #fxload .fxload-av, #fxload .fxload-dots i{ animation:none !important; } .fx-enter{ animation:none !important; } }
  `;
  var st = document.createElement('style'); st.id = 'fx-style'; st.textContent = css; document.head.appendChild(st);

  /* ── 로딩화면 + 페이지 전환 ──
     · 진입: 로딩화면 잠깐 → 콘텐츠가 살짝 작았다가 커지며 등장
     · 이동: 내부 링크 클릭 시 커버가 덮인 뒤 실제 페이지로 이동(도착 페이지에서 다시 등장)
     이미지 자동 매칭: FX_LOADER_IMG → 마스코트(--char) → SOOP 프사(파비콘) → 글자  /  색은 --main·--bg */
  var loaderOn = FX_LOADER && !mqReduce;
  var fxLoadEl = null, shownAt = 0;
  document.documentElement.style.setProperty('--fx-trans', (FX_TRANS_MS || 800) + 'ms');

  function buildLoader() {
    if (!loaderOn || fxLoadEl || !document.body) return;
    var el = document.createElement('div'); el.id = 'fxload'; el.setAttribute('aria-hidden', 'true');
    var av = document.createElement('div'); av.className = 'fxload-av';
    var ch = (getComputedStyle(document.body).getPropertyValue('--char') || '').trim();
    var img = FX_LOADER_IMG;
    if (!img) {
      var ico = document.querySelector('link[rel~="icon"]');
      if (ico && ico.href && /\.(jpe?g|png|gif|webp)(\?|$)/i.test(ico.href)) img = ico.href;
    }
    var logoTxt = ((document.querySelector('.nav-logo') || {}).textContent || document.title || '').trim();
    if (FX_LOADER_IMG)            av.style.backgroundImage = 'url("' + FX_LOADER_IMG + '")';
    else if (ch && ch !== 'none') { av.style.backgroundImage = ch; av.classList.add('mascot'); }  /* --char = 누끼 마스코트 그대로 */
    else if (img)                av.style.backgroundImage = 'url("' + img + '")';
    else                         av.textContent = (FX_LOADER_TEXT || logoTxt || '✿').charAt(0) || '✿';
    var nm = document.createElement('div'); nm.className = 'fxload-name';
    nm.textContent = (FX_LOADER_TEXT || logoTxt || '');
    var dt = document.createElement('div'); dt.className = 'fxload-dots'; dt.innerHTML = '<i></i><i></i><i></i>';
    el.appendChild(av); if (nm.textContent) el.appendChild(nm); el.appendChild(dt);
    document.body.appendChild(el); fxLoadEl = el; shownAt = Date.now();
  }

  function revealPage() {
    if (!loaderOn) return;
    var wait = Math.max(0, 450 - (Date.now() - shownAt));   /* 너무 빨리 깜빡이지 않게 최소 표시 */
    setTimeout(function () {
      var w = document.querySelector('.wrap, .container, main');
      if (w) { w.classList.remove('fx-enter'); void w.offsetWidth; w.classList.add('fx-enter'); }
      if (fxLoadEl) fxLoadEl.classList.add('fx-hide');
    }, wait);
  }

  if (loaderOn) {
    if (document.body) buildLoader(); else document.addEventListener('DOMContentLoaded', buildLoader);
    if (document.readyState === 'complete') revealPage(); else window.addEventListener('load', revealPage);
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]'); if (!a) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      var href = a.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) return;
      var url; try { url = new URL(a.href, location.href); } catch (_) { return; }
      if (url.origin !== location.origin) return;                          /* 외부 링크 제외 */
      if (url.pathname === location.pathname && (url.hash || url.href === location.href)) return;
      e.preventDefault();
      if (!fxLoadEl) buildLoader();
      if (fxLoadEl) { fxLoadEl.classList.remove('fx-hide'); shownAt = Date.now(); }
      setTimeout(function () { location.href = a.href; }, 360);
    }, true);
  }


  function build() {
    buildTyper();
    /* 떠다니는 입자 */
    if (!mqReduce) {
      var fx = document.getElementById('fx');
      if (!fx) { fx = document.createElement('div'); fx.id = 'fx'; fx.setAttribute('aria-hidden','true'); document.body.appendChild(fx); }
      if (!fx.childElementCount) {
        for (var i = 0; i < FX_COUNT; i++) {
          var p = document.createElement('span'); p.className = 'fx-p';
          p.textContent = FX_FLOAT[(Math.random() * FX_FLOAT.length) | 0];
          var dur = 13 + Math.random() * 11;
          p.style.left = (Math.random() * 100).toFixed(2) + 'vw';
          p.style.fontSize = (9 + Math.random() * 7).toFixed(1) + 'px';
          p.style.animationDuration = dur.toFixed(1) + 's';
          p.style.animationDelay = (-Math.random() * dur).toFixed(1) + 's';
          p.style.setProperty('--drift', (Math.random() * 60 - 30).toFixed(0) + 'px');
          fx.appendChild(p);
        }
      }
    }
    /* 카드 살짝 기울기 (데스크톱 마우스에서만) */
    if (FX_TILT && mqFine && !mqReduce && !window.__fxTiltOn) {
      window.__fxTiltOn = true;
      var TILT_SEL = '.card, .item-card, .viewer-card, .notice-item, .up-item, .vod-ph';
      var TILT_DEG = 2.5;                                   /* 감도 (기존 5) */
      var _tiltEl = null;
      document.addEventListener('mousemove', function (e) {
        var card = e.target.closest ? e.target.closest(TILT_SEL) : null;
        if (_tiltEl && _tiltEl !== card) { _tiltEl.style.transform = ''; _tiltEl.classList.remove('fx-tilting'); _tiltEl = null; }
        if (!card) return;
        var r = card.getBoundingClientRect();
        var rx = (0.5 - (e.clientY - r.top) / r.height) * TILT_DEG;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * TILT_DEG;
        card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        card.classList.add('fx-tilting');
        _tiltEl = card;
      }, { passive: true });
      document.addEventListener('mouseleave', function () {
        if (_tiltEl) { _tiltEl.style.transform = ''; _tiltEl.classList.remove('fx-tilting'); _tiltEl = null; }
      });
    }
    /* 프사 톡(이스터에그): 누르면 통통 튀고 모양이 펑 — 페이지에 프사가 여러 개여도 전부 적용 */
    [].slice.call(document.querySelectorAll('.avatar-wrap, #avatarWrap, .avatar')).forEach(function (av) {
      if (av.dataset.fxPop) return;
      av.dataset.fxPop = '1';
      av.style.cursor = 'pointer';
      av.addEventListener('click', function (e) {
        var box = av.getBoundingClientRect();
        var cx = box.left + box.width / 2, cy = box.top + box.height / 2;

        /* 바운스 — transform 을 직접 쓰면 기울기/회전이 있는 요소에서 충돌하므로 scale 전용 애니로 */
        var target = av.querySelector('img') || av;
        target.classList.remove('fx-bounce');
        void target.offsetWidth;                 /* 연타해도 매번 다시 재생되게 리플로우 강제 */
        target.classList.add('fx-bounce');
        setTimeout(function () { target.classList.remove('fx-bounce'); }, 560);

        /* 회전 링이 있으면 잠깐 빨라졌다 돌아옴 */
        var ring = av.querySelector('.ring');
        if (ring) {
          ring.classList.add('fx-ringfast');
          setTimeout(function () { ring.classList.remove('fx-ringfast'); }, 900);
        }

        /* 입자는 프사 중앙에서 사방으로 */
        window.fxHearts(cx, cy, 14);
        setTimeout(function () { window.fxHearts(cx, cy, 6); }, 130);
      });
    });
  }

  /* 모양 뿌리기 (전역 공용) */
  window.fxHearts = function (x, y, n) {
    if (mqReduce) return;
    for (var i = 0; i < n; i++) {
      var h = document.createElement('span'); h.className = 'fx-heart';
      var _sz = (14 + Math.random() * 10);
      if (/^data:|^https?:\/\//i.test(FX_CLICK)) {           // 이미지(SVG/PNG/gif 등)면 배경이미지로
        h.style.width = _sz.toFixed(0) + 'px'; h.style.height = _sz.toFixed(0) + 'px';
        h.style.backgroundImage = 'url("' + FX_CLICK + '")';
        h.style.backgroundSize = 'contain'; h.style.backgroundRepeat = 'no-repeat'; h.style.backgroundPosition = 'center';
      } else { h.textContent = FX_CLICK; h.style.fontSize = _sz.toFixed(0) + 'px'; }  // 글자/이모지면 텍스트로
      h.style.left = x + 'px'; h.style.top = y + 'px';
      h.style.setProperty('--hx', (Math.random() * 64 - 32).toFixed(0) + 'px');
      h.style.animationDelay = (Math.random() * 0.12).toFixed(2) + 's';
      document.body.appendChild(h);
      (function (el) { setTimeout(function () { el.remove(); }, 1200); })(h);
    }
  };

  /* 생일 D-Day 도우미: fxDday('03-15') → 다음 생일까지 남은 일수(숫자). 오늘이면 0.
     사용 예) document.getElementById('dday').textContent = 'D-' + fxDday('03-15'); */
  window.fxDday = function (mmdd) {
    try {
      var t = String(mmdd).split(/[-./]/); var m = parseInt(t[0],10), d = parseInt(t[1],10);
      if (!m || !d) return null;
      var now = new Date(); now.setHours(0,0,0,0);
      var y = now.getFullYear(); var next = new Date(y, m-1, d);
      if (next < now) next = new Date(y+1, m-1, d);
      return Math.round((next - now) / 86400000);
    } catch (e) { return null; }
  };

  /* 아무 데나 클릭하면 모양 톡 (입력창·버튼·링크·프사 위에선 생략) */
  document.addEventListener('click', function (e) {
    if (e.target.closest('input, textarea, button, a, .iq-modal, .iq-ov, .avatar-wrap, #avatarWrap, .avatar')) return;
    window.fxHearts(e.clientX, e.clientY, 4);
  });

  /* ═══════════ 타이핑 (제목 → 내용, 위에서부터 순서대로) ═══════════
     · 문서 순서로 큐를 만들어 "한 번에 하나씩" 찍는다.
     · 아직 화면 밖이면 그 자리에서 대기 → 스크롤해서 보이는 순간 이어서 진행.
     · 내용은 통째로 지웠다 쓰면 <b>·<br> 같은 서식이 날아가므로 텍스트 노드 단위로 처리한다.
     ⚠️ DB 로더가 텍스트를 덮어쓰므로 반드시 그 뒤(body.ready)에 시작한다. */
  /* fx.js가 실행되는 즉시(=DOMContentLoaded 전) 타이핑 대상을 숨긴다.
     이걸 안 하면 첫 페인트에 글자가 보였다가 타이핑 시작할 때 지워지는 게 눈에 띈다.
     visibility:hidden 이라 자리(높이)는 그대로 유지되고, DB 로더가 값을 덮어써도 안 보인다. */
  var fxPreHidden = [];
  function fxUnhide(el) {
    el.style.visibility = '';
    if (!el.getAttribute('style')) el.removeAttribute('style');
  }
  function fxUnhideAll() {
    fxPreHidden.forEach(fxUnhide);
    fxPreHidden = [];
  }
  function fxPreHide() {
    if (!FX_TYPE || mqReduce || !document.body) return;
    try {
      var sel = FX_TYPE_SEL + (FX_TYPE_BODY ? ', ' + FX_TYPE_BODY_SEL : '');
      [].slice.call(document.querySelectorAll(sel)).forEach(function (el) {
        el.style.visibility = 'hidden';
        fxPreHidden.push(el);
      });
      setTimeout(fxUnhideAll, 5000);   /* 안전장치: 타이핑이 안 돌면 5초 뒤 그냥 보여준다 */
    } catch (e) { fxUnhideAll(); }
  }

  function buildTyper() {
    if (!FX_TYPE || mqReduce || !document.body) { fxUnhideAll(); return; }

    /* 요소 안의 글자 노드만 모은다(서식 태그는 그대로 두고 글자만 비웠다 채우기 위해) */
    function textNodes(el) {
      var out = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode())) {
        if (!n.nodeValue || !n.nodeValue.trim()) continue;   /* 공백 노드는 건드리지 않음(간격 유지) */
        out.push({ node: n, text: n.nodeValue });
      }
      return out;
    }
    function lenOf(nodes) { var t = 0; nodes.forEach(function (x) { t += x.text.length; }); return t; }
    function visible(el) {
      var r = el.getBoundingClientRect();
      if (!r.height && !r.width) return false;
      return r.top < (window.innerHeight || 0) * 0.95;
    }

    function start() {
      var sel = FX_TYPE_SEL + (FX_TYPE_BODY ? ', ' + FX_TYPE_BODY_SEL : '');
      var all = [].slice.call(document.querySelectorAll(sel));   /* 문서 순서 = 위 → 아래 */
      var items = [], groups = [], gmap = [];

      all.forEach(function (el) {
        if (el.getAttribute('data-fxtyped')) return;
        for (var i = 0; i < items.length; i++) if (items[i].el.contains(el)) return;  /* 중복 방지 */

        var isTitle = el.matches(FX_TYPE_SEL);
        var nodes = textNodes(el);
        if (!nodes.length) return;
        if (lenOf(nodes) > (isTitle ? FX_TYPE_MAX : FX_TYPE_BODY_MAX)) return;

        var r = el.getBoundingClientRect();
        if (!r.height && !r.width) return;                  /* 숨겨진 요소는 건드리지 않음 */

        el.setAttribute('data-fxtyped', '1');
        var item = { el: el, nodes: nodes, title: isTitle };
        items.push(item);

        /* ⭐ 박스(카드) 단위로 묶는다 — 박스끼리는 동시에, 박스 안에서는 위→아래 순서대로 */
        var box = el.closest(FX_TYPE_BOX_SEL) || el;
        var gi = gmap.indexOf(box);
        if (gi < 0) { gmap.push(box); groups.push({ box: box, list: [] }); gi = groups.length - 1; }
        groups[gi].list.push(item);
      });

      if (!items.length) { fxUnhideAll(); return; }

      /* 큐에 담긴 순간 바로 비운다(보였다가 지워지는 현상 방지) → 그다음 보이게 전환 */
      items.forEach(function (item) {
        var h = item.el.offsetHeight;
        if (h) item.el.style.minHeight = h + 'px';
        item.nodes.forEach(function (x) { x.node.nodeValue = ''; });
      });
      fxUnhideAll();

      function restore(item) {
        item.nodes.forEach(function (x) { x.node.nodeValue = x.text; });
        item.el.style.minHeight = '';
        if (!item.el.getAttribute('style')) item.el.removeAttribute('style');
        item.el.classList.remove('fx-typing');
      }

      function typeOne(item, g, done) {
        var el = item.el, nodes = item.nodes;   /* 글자는 이미 비워 둔 상태 */
        var speed = item.title ? FX_TYPE_SPEED : FX_TYPE_BODY_SPEED;
        el.classList.add('fx-typing');
        var caret = document.createElement('i');
        caret.className = 'fx-caret';

        var ni = 0, ci = 0;
        function placeCaret() {
          var n = nodes[ni] && nodes[ni].node;
          if (n && n.parentNode) n.parentNode.insertBefore(caret, n.nextSibling);
        }
        placeCaret();

        (function step() {
          if (ni >= nodes.length) {
            setTimeout(function () {
              if (caret.parentNode) caret.parentNode.removeChild(caret);
              el.style.minHeight = '';
              if (!el.getAttribute('style')) el.removeAttribute('style');
              el.classList.remove('fx-typing');
              done();
            }, 90);
            return;
          }
          var t = nodes[ni].text;
          if (ci >= t.length) { ni++; ci = 0; placeCaret(); setTimeout(step, speed); return; }
          nodes[ni].node.nodeValue += t.charAt(ci); ci++;
          g.act = Date.now();
          setTimeout(step, speed);
        })();
      }

      /* 박스 하나를 위에서 아래로 순서대로 */
      function runGroup(g) {
        g.i = 0; g.act = Date.now();
        (function pump() {
          if (g.i >= g.list.length) { clearInterval(g.guard); return; }
          typeOne(g.list[g.i], g, function () { g.i++; setTimeout(pump, FX_TYPE_GAP); });
        })();

        /* 안전장치: 6초간 진행이 없으면 남은 글자를 원문으로 되돌린다 */
        g.guard = setInterval(function () {
          if (g.i >= g.list.length) { clearInterval(g.guard); return; }
          if (Date.now() - g.act < 6000) return;
          clearInterval(g.guard);
          for (var k = g.i; k < g.list.length; k++) restore(g.list[k]);
          g.i = g.list.length;
        }, 2000);
      }

      /* 박스들을 동시에 출발. 화면 밖 박스는 보이는 순간 출발(스크롤 연출 유지) */
      groups.forEach(function (g) {
        if (!FX_TYPE_WAIT_VIEW || visible(g.box)) { runGroup(g); return; }
        if (typeof IntersectionObserver === 'function') {
          var io = new IntersectionObserver(function (ents) {
            ents.forEach(function (en) { if (en.isIntersecting) { io.disconnect(); runGroup(g); } });
          }, { threshold: 0.15 });
          io.observe(g.box);
        } else {
          var onScroll = function () {
            if (!visible(g.box)) return;
            window.removeEventListener('scroll', onScroll);
            runGroup(g);
          };
          window.addEventListener('scroll', onScroll, { passive: true });
        }
      });
    }

    /* body.ready(=DB 로딩 완료) 를 기다린다. 안 오면 2초 뒤 그냥 시작 */
    if (document.body.classList.contains('ready')) { start(); return; }
    var done = false;
    function go() { if (done) return; done = true; start(); }
    var mo = new MutationObserver(function () {
      if (document.body.classList.contains('ready')) { mo.disconnect(); go(); }
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    setTimeout(function () { try { mo.disconnect(); } catch (e) {} go(); }, 2000);
  }

  if (document.body) fxPreHide();
  else document.addEventListener('DOMContentLoaded', fxPreHide);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
