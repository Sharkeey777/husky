/* =========================================================
   Баскетбольный клуб «Хаски» — интерактив
   Ваниль, без зависимостей. Уважает prefers-reduced-motion.
   ========================================================= */
(() => {
  "use strict";

  document.documentElement.classList.add("js");
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

  /* ---------- Реальные фото клуба, разложенные по темам ---------- */
  const makePhotoSet = (prefix, description, count = 20) => Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      src: `./assets/photos/gallery/${prefix}-${number}.jpg`,
      alt: `${description}. Фото ${index + 1} из ${count}`,
    };
  });

  const PHOTO_CATEGORIES = {
    training: {
      label: "Тренировки",
      photos: makePhotoSet("training", "Тренировка баскетбольного клуба Хаски"),
    },
    tournament: {
      label: "Турниры",
      photos: makePhotoSet("tournament", "Турниры баскетбольного клуба Хаски"),
    },
    newyear: {
      label: "Новый год",
      photos: makePhotoSet("new-year", "Новогоднее мероприятие баскетбольного клуба Хаски"),
    },
    camp: {
      label: "Летний лагерь",
      photos: makePhotoSet("camp", "Жизнь команды Хаски в летнем лагере"),
    },
    portraits: {
      label: "Фотосессия",
      photos: makePhotoSet("portrait", "Игрок баскетбольного клуба Хаски на фотосессии"),
    },
    rbl: {
      label: "РБЛ",
      photos: makePhotoSet("rbl", "Игровые моменты баскетбольного клуба Хаски в РБЛ", 19),
    },
  };

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

  /* ---------- Тематическая фотогалерея + лайтбокс ---------- */
  const lifeMosaic = document.getElementById("life-mosaic");
  const galleryTabs = Array.from(document.querySelectorAll("[data-gallery-category]"));
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
  let activePhotos = PHOTO_CATEGORIES.training.photos;

  const renderGallery = (categoryKey, animate = true) => {
    const category = PHOTO_CATEGORIES[categoryKey];
    if (!category || !lifeMosaic) return;

    const update = () => {
      activePhotos = category.photos;
      lifeMosaic.replaceChildren();
      lifeMosaic.setAttribute("aria-label", `Фотографии: ${category.label}`);

      category.photos.forEach((photo, index) => {
      const item = document.createElement("button");
      item.type = "button";
        item.className = "life-photo";
      item.setAttribute("aria-label", `Открыть фото: ${photo.alt}`);
      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.alt;
      img.loading = "lazy";
      img.decoding = "async";
      item.appendChild(img);
        item.addEventListener("click", () => openLightbox(index));
        lifeMosaic.appendChild(item);
      });

      requestAnimationFrame(() => lifeMosaic.classList.remove("is-switching"));
    };

    if (animate && !reduceMotion) {
      lifeMosaic.classList.add("is-switching");
      window.setTimeout(update, 160);
    } else {
      update();
    }
  };

  if (lifeMosaic) renderGallery("training", false);

  galleryTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      const categoryKey = tab.dataset.galleryCategory;
      galleryTabs.forEach((button) => {
        const selected = button === tab;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-selected", String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      renderGallery(categoryKey, true);
    });

    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + galleryTabs.length) % galleryTabs.length;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % galleryTabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = galleryTabs.length - 1;
      galleryTabs[nextIndex].focus();
      galleryTabs[nextIndex].click();
    });
  });

  /* ---------- Лайтбокс ---------- */
  function openLightbox(index) {
    if (!lightbox || !lightboxImg) return;
    current = index;
    lightboxOpener = document.activeElement;
    const p = activePhotos[current];
    lightboxImg.src = p.src;
    lightboxImg.alt = p.alt;
    lightboxImg.removeAttribute("width");
    lightboxImg.removeAttribute("height");
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
    current = (current + dir + activePhotos.length) % activePhotos.length;
    const p = activePhotos[current];
    lightboxImg.src = p.src;
    lightboxImg.alt = p.alt;
    lightboxImg.removeAttribute("width");
    lightboxImg.removeAttribute("height");
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

  /* ---------- Мероприятия: линия и карточки появляются при прокрутке ---------- */
  const eventsTimeline = document.getElementById("events-timeline");
  if (eventsTimeline) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      eventsTimeline.classList.add("is-visible");
    } else {
      const eventsObserver = new IntersectionObserver(([entry], observer) => {
        if (!entry.isIntersecting) return;
        eventsTimeline.classList.add("is-visible");
        observer.disconnect();
      }, { rootMargin: "0px 0px -14%", threshold: 0.14 });
      eventsObserver.observe(eventsTimeline);
    }
  }

  /* ---------- Лагерь: лёгкая карусель, активна только когда видна ---------- */
  const campGallery = document.getElementById("camp-gallery");
  const campImage = document.getElementById("camp-image");
  const campCount = document.getElementById("camp-count");
  const campDots = document.getElementById("camp-dots");
  const campPhotos = PHOTO_CATEGORIES.camp.photos.slice(0, 6);
  let campIndex = 0;
  let campTimer = null;
  let campAutoSteps = campPhotos.length * 2;
  let campVisible = false;
  let campPaused = false;

  const updateCamp = (nextIndex, animate = true) => {
    if (!campGallery || !campImage || !campCount) return;
    campIndex = (nextIndex + campPhotos.length) % campPhotos.length;
    const photo = campPhotos[campIndex];
    const applyPhoto = () => {
      campImage.src = photo.src;
      campImage.alt = photo.alt;
      campImage.removeAttribute("width");
      campImage.removeAttribute("height");
      campCount.textContent = `${String(campIndex + 1).padStart(2, "0")} / ${String(campPhotos.length).padStart(2, "0")}`;
      campDots?.querySelectorAll(".camp-dot").forEach((dot, index) => {
        const active = index === campIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });
      requestAnimationFrame(() => campGallery.classList.remove("is-switching"));
    };

    if (animate && !reduceMotion) {
      campGallery.classList.add("is-switching");
      window.setTimeout(applyPhoto, 180);
    } else {
      applyPhoto();
    }
  };

  const stopCampAuto = () => {
    if (!campTimer) return;
    window.clearInterval(campTimer);
    campTimer = null;
  };

  const startCampAuto = () => {
    if (reduceMotion || !campVisible || campPaused || campTimer || campAutoSteps <= 0) return;
    campTimer = window.setInterval(() => {
      if (document.hidden || campPaused || !campVisible) return;
      updateCamp(campIndex + 1, true);
      campAutoSteps -= 1;
      if (campAutoSteps <= 0) stopCampAuto();
    }, 4500);
  };

  if (campGallery && campDots) {
    campPhotos.forEach((photo, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `camp-dot${index === 0 ? " is-active" : ""}`;
      dot.setAttribute("aria-label", `Показать фото ${index + 1}: ${photo.alt}`);
      dot.setAttribute("aria-current", index === 0 ? "true" : "false");
      dot.addEventListener("click", () => updateCamp(index, true));
      campDots.appendChild(dot);
    });

    campGallery.querySelector("[data-camp-prev]")?.addEventListener("click", () => updateCamp(campIndex - 1, true));
    campGallery.querySelector("[data-camp-next]")?.addEventListener("click", () => updateCamp(campIndex + 1, true));
    campGallery.addEventListener("pointerenter", () => { campPaused = true; stopCampAuto(); });
    campGallery.addEventListener("pointerleave", () => { campPaused = false; startCampAuto(); });
    campGallery.addEventListener("focusin", () => { campPaused = true; stopCampAuto(); });
    campGallery.addEventListener("focusout", (event) => {
      if (campGallery.contains(event.relatedTarget)) return;
      campPaused = false;
      startCampAuto();
    });

    if ("IntersectionObserver" in window) {
      const campObserver = new IntersectionObserver(([entry]) => {
        campVisible = entry.isIntersecting;
        if (campVisible) startCampAuto();
        else stopCampAuto();
      }, { threshold: 0.35 });
      campObserver.observe(campGallery);
    } else {
      campVisible = true;
      startCampAuto();
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopCampAuto();
      else startCampAuto();
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
