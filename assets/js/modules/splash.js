// ═══════════════════════════════════════════════
// SPLASH — PS5-style immersive loading screen
// ═══════════════════════════════════════════════

const AVATAR_COLORS = [
  '#7c3aed','#2563eb','#059669','#d97706',
  '#dc2626','#db2777','#0891b2','#65a30d',
];

// Particle colour palette: [centre colour, outer glow colour]
const PARTICLE_COLORS = [
  ['rgba(210,230,255,.95)', 'rgba(160,190,255,.25)'],   // cool blue-white
  ['rgba(235,210,255,.95)', 'rgba(190,140,255,.25)'],   // soft purple
  ['rgba(185,245,255,.92)', 'rgba(90,210,240,.22)'],    // cyan
  ['rgba(255,245,175,.90)', 'rgba(255,210,95,.20)'],    // warm gold
];

const CACHE_KEY             = 'fs-avatar-cache';
const EXIT_ANIMATION_MS     = 900;   // fallback safety timeout matching sp-zoom-out duration
const MIN_SHOW_MS           = 1950;  // minimum splash visibility before exit starts (+1 s)
const PARTICLES             = 65;

// Brownian / firefly motion constants
const BROWNIAN_FORCE     = 0.04;   // random nudge magnitude per frame
const DAMPING            = 0.96;   // velocity decay per frame
const BASE_MAX_SPEED     = 0.6;    // max px/frame at idle
const ACTIVE_SPEED_MUL   = 2.5;   // speed multiplier after avatar click

// Convergence constants
const CONVERGENCE_LERP     = 0.025;  // fraction of distance closed per frame (~78% in 1 s at 60 fps)
const CONVERGENCE_ARRIVE_R = 32;     // px from avatar centre — particle starts fading out

let _showTs       = 0;
let _clickResolve = null;
let _clickPromise = null;
let _particles    = [];
let _rafId        = null;
let _speedMul     = 1;
let _converging   = false;
let _avatarCX     = 0;
let _avatarCY     = 0;

// ── Avatar helpers (mirrors account.js logic) ──────────────

function _getInitials(name) {
  const parts = (name || '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0] || '?').slice(0, 2).toUpperCase();
}

function _avatarColor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ── Cache ───────────────────────────────────────────────────

/**
 * Call after successful auth to prime the cache for the next launch.
 * @param {object} user  supaUser object
 */
export function cacheAvatarFromUser(user) {
  if (!user) return;
  const meta      = user.user_metadata || {};
  const fullName  = meta.full_name || meta.name || '';
  const email     = user.email || '';
  const seed      = fullName || email;
  // avatar_url is a user-uploaded image data URL — not a credential or token.
  const avatarUrl = String(meta.avatar_url || '');
  // Build a non-sensitive display-only cache object (no auth tokens).
  const data = avatarUrl
    ? { type: 'photo', url: avatarUrl }
    : { type: 'initials', initials: _getInitials(seed || '?'), color: _avatarColor(seed || '?') };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch { /* storage full */ }
}

function _readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)); } catch { return null; }
}

// ── DOM builders ────────────────────────────────────────────

function _buildAvatar(cache) {
  const el = document.createElement('div');
  el.className = 'sp-avatar';

  if (cache?.type === 'photo' && cache.url) {
    const img = new Image();
    img.alt  = '';
    img.src  = cache.url;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;';
    el.appendChild(img);
  } else {
    el.style.background = (cache?.type === 'initials' && cache.color) ? cache.color : '#7c3aed';
    el.textContent      = (cache?.type === 'initials' && cache.initials) ? cache.initials : '?';
  }

  return el;
}

function _spawnParticles(container) {
  _particles = [];
  const frag = document.createDocumentFragment();
  for (let i = 0; i < PARTICLES; i++) {
    const p    = document.createElement('span');
    p.className = 'sp-particle';
    // Wider size range: small specks to larger glowing orbs
    const size  = 1.2 + Math.random() * 4.3;
    const col   = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
    p.style.cssText = `width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;` +
      `background:radial-gradient(circle,${col[0]} 0%,${col[1]} 100%);`;
    frag.appendChild(p);
    _particles.push({
      el:    p,
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      vx:    (Math.random() - 0.5) * 0.8,
      vy:    (Math.random() - 0.5) * 0.8,
      phase: Math.random() * Math.PI * 2,
      rate:  0.010 + Math.random() * 0.030,
      maxOp: 0.18  + Math.random() * 0.72,
    });
  }
  container.appendChild(frag);
}

function _tickParticles() {
  const mul    = _speedMul;
  const ww     = window.innerWidth;
  const wh     = window.innerHeight;
  const maxSpd = BASE_MAX_SPEED * mul;

  for (const pt of _particles) {
    if (_converging) {
      // ── Convergence mode: lerp toward avatar centre with a touch of jitter ──
      pt.x += (_avatarCX - pt.x) * CONVERGENCE_LERP + (Math.random() - 0.5) * 0.4;
      pt.y += (_avatarCY - pt.y) * CONVERGENCE_LERP + (Math.random() - 0.5) * 0.4;

      pt.phase += pt.rate;
      const d    = Math.hypot(_avatarCX - pt.x, _avatarCY - pt.y);
      const fade = d < CONVERGENCE_ARRIVE_R ? d / CONVERGENCE_ARRIVE_R : 1;
      const op   = pt.maxOp * (0.55 + 0.45 * Math.sin(pt.phase)) * fade;

      pt.el.style.transform = `translate(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px)`;
      pt.el.style.opacity   = op.toFixed(3);
    } else {
      // ── Normal mode: Brownian firefly motion ──
      pt.vx += (Math.random() - 0.5) * BROWNIAN_FORCE * mul;
      pt.vy += (Math.random() - 0.5) * BROWNIAN_FORCE * mul;

      pt.vx *= DAMPING;
      pt.vy *= DAMPING;

      const spd = Math.hypot(pt.vx, pt.vy);
      if (spd > maxSpd) { const s = maxSpd / spd; pt.vx *= s; pt.vy *= s; }

      pt.x += pt.vx;
      pt.y += pt.vy;

      if (pt.x < 0)  pt.x += ww;
      if (pt.x > ww) pt.x -= ww;
      if (pt.y < 0)  pt.y += wh;
      if (pt.y > wh) pt.y -= wh;

      pt.phase += pt.rate * mul;
      const op = pt.maxOp * (0.55 + 0.45 * Math.sin(pt.phase));

      pt.el.style.transform = `translate(${pt.x.toFixed(1)}px,${pt.y.toFixed(1)}px)`;
      pt.el.style.opacity   = op.toFixed(3);
    }
  }

  _rafId = requestAnimationFrame(_tickParticles);
}

function _startParticles() {
  if (_rafId !== null) return;
  _tickParticles();
}

function _stopParticles() {
  if (_rafId !== null) { cancelAnimationFrame(_rafId); _rafId = null; }
  _particles  = [];
  _converging = false;
}

// ── Public API ───────────────────────────────────────────────

export function showSplash() {
  _showTs     = Date.now();
  _speedMul   = 1;
  _converging = false;

  // Gate that resolves only after the user clicks the avatar
  _clickPromise = new Promise(res => { _clickResolve = res; });

  const cache  = _readCache();
  const splash = document.createElement('div');
  splash.id    = 'splashScreen';
  splash.className = 'sp-screen';

  // Nebula accent layer (hidden until sp-active)
  const nebula = document.createElement('div');
  nebula.className = 'sp-nebula';
  splash.appendChild(nebula);

  // Avatar
  const avatar = _buildAvatar(cache);
  splash.appendChild(avatar);

  // Particles — Brownian firefly loop started after sp-idle is added
  _spawnParticles(splash);

  document.body.appendChild(splash);

  // Next frame so the browser registers initial state before animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      splash.classList.add('sp-idle');
      _startParticles();
    });
  });

  // Clicking the avatar triggers the immersive transition
  avatar.addEventListener('click', () => {
    const rect = avatar.getBoundingClientRect();
    _avatarCX  = rect.left + rect.width  / 2;
    _avatarCY  = rect.top  + rect.height / 2;
    _converging = true;
    splash.classList.remove('sp-idle');
    splash.classList.add('sp-active');
    _speedMul = ACTIVE_SPEED_MUL;          // speed up fireflies on click
    _showTs = Date.now(); // MIN_SHOW_MS countdown begins from the click
    if (_clickResolve) { _clickResolve(); _clickResolve = null; }
  }, { once: true });
}

export function hideSplash() {
  return new Promise(resolve => {
    // Wait for the user to click the avatar before starting the exit
    const gate = _clickPromise || Promise.resolve();
    gate.then(() => {
      const elapsed = Date.now() - _showTs;
      const wait    = Math.max(0, MIN_SHOW_MS - elapsed);

      setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (!splash) { _stopParticles(); resolve(); return; }

        splash.classList.add('sp-out');
        _stopParticles();

        const done = () => { splash.remove(); resolve(); };
        splash.addEventListener('animationend', done, { once: true });
        // Safety fallback if animationend doesn't fire
        setTimeout(done, EXIT_ANIMATION_MS);
      }, wait);
    });
  });
}
