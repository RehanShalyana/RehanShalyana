/* ==========================================================
   Muhammad Rehan - Portfolio interactions
   ========================================================== */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  /* ---------- footer year ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- mobile menu ---------- */
  const toggle = $('.nav__toggle');
  const menu = $('#menu');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- nav state, scroll progress, timeline fill ---------- */
  const nav = $('#nav');
  const bar = $('.progress');
  const timeline = $('#timeline');
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle('is-scrolled', y > 30);
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    if (timeline) {
      const r = timeline.getBoundingClientRect();
      const start = window.innerHeight * 0.65;
      const fill = (start - r.top) / r.height;
      timeline.style.setProperty('--fill', Math.min(1, Math.max(0, fill)).toFixed(3));
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- active nav link ---------- */
  const links = $$('.nav__menu a[href^="#"]:not(.btn)');
  const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
        // clear the stagger delay afterwards so hover effects stay instant
        setTimeout(() => { entry.target.style.transitionDelay = ''; }, 1400);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    // small stagger for items that share a parent grid/list
    reveals.forEach((el) => {
      const group = el.parentElement;
      const index = [...group.children].filter((c) => c.classList.contains('reveal')).indexOf(el);
      el.style.transitionDelay = `${Math.min(index, 5) * 90}ms`;
      io.observe(el);
    });
  }

  /* ---------- count-up numbers ---------- */
  const counters = $$('[data-count]');
  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    const duration = 1400;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        co.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach((c) => { c.textContent = c.dataset.count + (c.dataset.suffix || ''); });
  }

  /* ---------- portrait tilt (desktop pointer only) ---------- */
  const portrait = $('#portrait');
  if (portrait && finePointer && !reduceMotion) {
    const hero = portrait.closest('.hero');
    hero.addEventListener('pointermove', (e) => {
      const r = portrait.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      portrait.style.setProperty('--ry', `${(x * 16).toFixed(2)}deg`);
      portrait.style.setProperty('--rx', `${(-y * 12).toFixed(2)}deg`);
    });
    hero.addEventListener('pointerleave', () => {
      portrait.style.setProperty('--ry', '0deg');
      portrait.style.setProperty('--rx', '0deg');
    });
  }
  /* ---------- cursor spotlight on cards ---------- */
  if (finePointer && !reduceMotion) {
    $$('.spot').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }
})();
