/* =========================================================
   Баскетбольный клуб «Хаски» — интерактив
   Ваниль, без зависимостей. Уважает prefers-reduced-motion.
   ========================================================= */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  const setPageInert = (enabled) => {
    document.querySelectorAll("body > header, body > main, body > footer").forEach((element) => {
      if (enabled) element.setAttribute("inert", "");
      else element.removeAttribute("inert");
    });
  };

  const trapFocus = (event, container) => {
    if (event.key !== "Tab") return;
    const focusable = Array.from(container.querySelectorAll(focusableSelector))
      .filter((element) => element.offsetParent !== null);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      event.preventDefault();
      container.focus();
      return;
    }

    const activeIndex = focusable.indexOf(document.activeElement);
    if (activeIndex === -1) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  /* ---------- Реальные фото галереи (из папок клуба) ---------- */
  const GALLERY = [
    { src: "./assets/gallery/team/team-02.jpg", alt: "Юная спортсменка клуба Хаски с мячом", w: 933, h: 1400 },
    { src: "./assets/gallery/training/training-01.jpg", alt: "Тренировка Хаски в зале", w: 1320, h: 880 },
    { src: "./assets/gallery/team/team-03.jpg", alt: "Игрок команды Хаски", w: 933, h: 1400 },
    { src: "./assets/gallery/events/event-01.jpg", alt: "Клубное событие Хаски", w: 1320, h: 880 },
    { src: "./assets/gallery/training/training-02.jpg", alt: "Игрок Хаски на тренировке с мячом", w: 933, h: 1400 },
    { src: "./assets/gallery/events/event-04.jpg", alt: "Команда Хаски на мероприятии", w: 1600, h: 1067 },
    { src: "./assets/gallery/team/team-04.jpg", alt: "Игроки команды Хаски", w: 933, h: 1400 },
    { src: "./assets/gallery/training/training-04.jpg", alt: "Светлый спортивный зал Хаски", w: 1450, h: 967 },
    { src: "./assets/gallery/events/event-02.jpg", alt: "Летние активности команды Хаски", w: 853, h: 1280 },
    { src: "./assets/gallery/training/training-03.jpg", alt: "Момент тренировки Хаски", w: 933, h: 1400 },
    { src: "./assets/gallery/events/event-03.jpg", alt: "Клубная энергия Хаски", w: 933, h: 1400 },
  ];

  /* ---------- Год в подвале ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Мобильное меню ---------- */
  const burger = document.querySelector(".burger");
  const mobileMenu = document.getElementById("mobile-menu");
  if (burger && mobileMenu) {
    const closeMenu = (restoreFocus = false) => {
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Открыть меню");
      mobileMenu.hidden = true;
      if (restoreFocus) burger.focus();
    };
    burger.addEventListener("click", () => {
      const open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      burger.setAttribute("aria-label", open ? "Открыть меню" : "Закрыть меню");
      mobileMenu.hidden = open;
      if (!open) mobileMenu.querySelector("a")?.focus();
    });
    mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => closeMenu(false)));
    document.addEventListener("keydown", (event) => {
      if (mobileMenu.hidden) return;
      if (event.key === "Escape") {
        closeMenu(true);
        return;
      }
      trapFocus(event, document.querySelector(".site-header"));
    });
  }

  /* ---------- Активный пункт навигации без scroll-listener ---------- */
  const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  if (navLinks.length && "IntersectionObserver" in window) {
    const sectionById = new Map(navLinks.map((link) => [link.hash.slice(1), link]));
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visible) return;

      navLinks.forEach((link) => {
        const isActive = link === sectionById.get(visible.target.id);
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-22% 0px -68% 0px", threshold: 0 });

    sectionById.forEach((link, id) => {
      const section = document.getElementById(id);
      if (section) navObserver.observe(section);
    });
  }

  /* ---------- Модалка контактов ---------- */
  const modal = document.getElementById("contact-modal");
  if (modal) {
    let lastFocus = null;
    const open = () => {
      lastFocus = document.activeElement;
      modal.hidden = false;
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-locked");
      setPageInert(true);
      const btn = modal.querySelector(".modal-close");
      if (btn) btn.focus();
    };
    const close = () => {
      modal.hidden = true;
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-locked");
      setPageInert(false);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    document.querySelectorAll("[data-open-contact]").forEach((b) =>
      b.addEventListener("click", (e) => {
        e.preventDefault();
        // если было открыто мобильное меню — закрыть
        if (mobileMenu && !mobileMenu.hidden && burger) {
          burger.setAttribute("aria-expanded", "false");
          mobileMenu.hidden = true;
        }
        open();
      })
    );
    modal.querySelectorAll("[data-close-contact]").forEach((b) => b.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (modal.hidden) return;
      if (e.key === "Escape") {
        close();
        return;
      }
      trapFocus(e, modal.querySelector(".modal-card"));
    });
  }

  /* ---------- Галерея (масонри) + лайтбокс ---------- */
  const grid = document.getElementById("gallery-grid");
  const lightbox = document.getElementById("lightbox");
  const lightboxFigure = document.getElementById("lightbox-figure");
  let lightboxImg = null;
  let lightboxOpener = null;
  if (lightboxFigure) {
    lightboxImg = document.createElement("img");
    lightboxImg.decoding = "async";
    lightboxFigure.appendChild(lightboxImg);
  }
  let current = 0;

  const ROW = 8; // px, соответствует grid-auto-rows
  const GAP = 20;
  const PAD = 9; // .gallery-item padding
  const CAPTION = 0;

  // Высота считается детерминированно из соотношения сторон и ширины колонки,
  // поэтому не зависит от момента загрузки изображений.
  const setSpan = (item) => {
    const ar = parseFloat(item.dataset.ar || "0"); // height / width
    if (!ar) return;
    const contentW = item.clientWidth - PAD * 2;
    if (contentW <= 0) return;
    const itemH = contentW * ar + PAD * 2 + CAPTION;
    const span = Math.max(1, Math.ceil((itemH + GAP) / (ROW + GAP)));
    item.style.setProperty("--span", String(span));
  };

  const relayout = () => {
    if (!grid) return;
    grid.querySelectorAll(".gallery-item").forEach(setSpan);
  };

  if (grid) {
    GALLERY.forEach((photo, i) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "gallery-item reveal";
      item.dataset.ar = String(photo.h / photo.w);
      item.setAttribute("aria-label", `Открыть фото: ${photo.alt}`);
      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.alt;
      img.width = photo.w;
      img.height = photo.h;
      img.loading = "lazy";
      img.decoding = "async";
      item.appendChild(img);
      item.addEventListener("click", () => openLightbox(i));
      grid.appendChild(item);

      item.classList.add("is-visible");

    });

    // Первый расчёт мозаики — как только применён layout.
    requestAnimationFrame(relayout);

    if ("ResizeObserver" in window) {
      let lastGridWidth = 0;
      const resizeObserver = new ResizeObserver(([entry]) => {
        const width = Math.round(entry.contentRect.width);
        if (width === lastGridWidth) return;
        lastGridWidth = width;
        requestAnimationFrame(relayout);
      });
      resizeObserver.observe(grid);
    }
    window.addEventListener("load", relayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  }

  /* ---------- Лайтбокс ---------- */
  function openLightbox(index) {
    if (!lightbox || !lightboxImg) return;
    current = index;
    lightboxOpener = document.activeElement;
    const p = GALLERY[current];
    lightboxImg.src = p.src;
    lightboxImg.alt = p.alt;
    lightboxImg.width = p.w;
    lightboxImg.height = p.h;
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    setPageInert(true);
    const closeBtn = lightbox.querySelector(".lightbox-close");
    if (closeBtn) closeBtn.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    setPageInert(false);
    if (lightboxOpener && lightboxOpener.focus) lightboxOpener.focus();
  }
  function step(dir) {
    current = (current + dir + GALLERY.length) % GALLERY.length;
    const p = GALLERY[current];
    lightboxImg.src = p.src;
    lightboxImg.alt = p.alt;
    lightboxImg.width = p.w;
    lightboxImg.height = p.h;
  }
  if (lightbox) {
    lightbox.querySelectorAll("[data-lightbox-close]").forEach((b) => b.addEventListener("click", closeLightbox));
    const prev = lightbox.querySelector("[data-lightbox-prev]");
    const next = lightbox.querySelector("[data-lightbox-next]");
    if (prev) prev.addEventListener("click", () => step(-1));
    if (next) next.addEventListener("click", () => step(1));
    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") {
        closeLightbox();
        return;
      }
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
      trapFocus(e, lightbox);
    });
  }

  /* ---------- Мяч → кольцо: одно попадание при входе в блок «О клубе». ---------- */
  const courtFx = document.getElementById("court-fx");
  const courtBall = document.getElementById("court-ball");
  const courtHoop = courtFx ? courtFx.querySelector(".court-hoop") : null;
  const aboutSection = document.getElementById("about");
  if (courtFx && courtBall && courtHoop && aboutSection && !reduceMotion && window.matchMedia("(min-width: 861px)").matches) {
    const doScore = (event) => {
      if (event.animationName !== "court-shot") return;
      courtFx.classList.add("is-scored");
      setTimeout(() => { courtFx.style.display = "none"; }, 1500);
    };
    courtBall.addEventListener("animationend", doScore, { once: true });

    const courtObserver = new IntersectionObserver(([entry], observer) => {
      if (!entry.isIntersecting) return;
      courtFx.classList.add("is-in-flight");
      observer.disconnect();
    }, { threshold: 0.08 });
    courtObserver.observe(aboutSection);
  } else if (courtFx) {
    courtFx.style.display = "none";
  }

})();
