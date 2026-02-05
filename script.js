// -----------------------------
// slider (changes text every 4s)
// -----------------------------
function initSlider(sliderId, interval = 4000) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;

  const slides = slider.querySelectorAll(".slide");
  if (!slides.length) return;

  let index = 0;
  let timer = null;

  function showNext() {
    slides[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }

  function start() {
    // just to be safe, clear old timer before starting new one
    if (timer) clearInterval(timer);
    timer = setInterval(showNext, interval);
  }

  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  // pause when I hover on slider
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  start();
}

// -------------------------------------------
// reveal animation (slide-up on scroll)
// -------------------------------------------
function initRevealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        } else {
          // i want it to replay when i scroll back
          entry.target.classList.remove("active");
        }
      });
    },
    { threshold: 0.2 }
  );

  reveals.forEach((el) => observer.observe(el));
}

// -------------------------------------------
// counter animation (counts up the numbers)
// -------------------------------------------
function animateCounters() {
  const counters = document.querySelectorAll(".stat-number");
  if (!counters.length) return;

  counters.forEach((counter) => {
    const target = Number(counter.dataset.target || 0);
    const suffix = counter.dataset.suffix || "";
    const duration = 1200;

    // reset before each run
    counter.textContent = "0" + suffix;

    const startTime = performance.now();

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(progress * target);
      counter.textContent = value + suffix;

      if (progress < 1) requestAnimationFrame(update);
      else counter.textContent = target + suffix;
    }

    requestAnimationFrame(update);
  });
}

// ----------------------------------------------------
// counter trigger (runs every time about enters view)
// ----------------------------------------------------
function initCounterOnView() {
  const aboutSection = document.querySelector(".about");
  if (!aboutSection) return;

  let isCounting = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isCounting) {
          isCounting = true;
          animateCounters();
        } else if (!entry.isIntersecting) {
          // allow it to run again when i scroll back
          isCounting = false;
        }
      });
    },
    { threshold: 0.35 }
  );

  observer.observe(aboutSection);
}

// ----------------------------------------------------
// parallax effect inside about section
// (moves heading/text/stats at different speeds)
// ----------------------------------------------------
function initAboutParallax() {
  const about = document.getElementById("about");
  if (!about) return;

  const items = about.querySelectorAll(".parallax");
  if (!items.length) return;

  let isActive = false;

  function updateParallax() {
    if (!isActive) return;

    const rect = about.getBoundingClientRect();
    const vh = window.innerHeight;

    // how far the section is in the viewport (0 to 1)
    const progress = (vh - rect.top) / (vh + rect.height);
    const p = Math.max(0, Math.min(1, progress));

    // base movement in px (keep it subtle)
    const base = (0.5 - p) * 60;

    items.forEach((el) => {
      // speed comes from css variable --pSpeed
      const speed =
        parseFloat(getComputedStyle(el).getPropertyValue("--pSpeed")) || 0.3;
      el.style.setProperty("--py", `${base * speed}px`);
    });

    requestAnimationFrame(updateParallax);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isActive = true;
          requestAnimationFrame(updateParallax);
        } else {
          isActive = false;
          // reset when leaving view
          items.forEach((el) => el.style.setProperty("--py", "0px"));
        }
      });
    },
    { threshold: 0.15 }
  );

  observer.observe(about);
}

// ----------------------------------------------------
// work cards overlay + modal 
// ----------------------------------------------------
function initWorkCardsAndModal() {
  const cards = document.querySelectorAll(".work-card");
  if (!cards.length) return;

  const modal = document.getElementById("projectModal");
  const modalClose = document.getElementById("modalClose");

  const modalTitle = document.getElementById("modalTitle");
  const modalTags = document.getElementById("modalTags");
  const modalDesc = document.getElementById("modalDesc");
  const modalStack = document.getElementById("modalStack");
  const modalImg = document.getElementById("modalImg");

  // modal not on page? then just stop here
  if (!modal) return;

  function openModalFromCard(card) {
    modalTitle.textContent = card.dataset.title || "Project";
    modalTags.textContent = card.dataset.tags || "";
    modalDesc.textContent = card.dataset.desc || "";
    modalStack.textContent = card.dataset.stack || "";
    modalImg.src = card.dataset.img || card.querySelector("img")?.src || "";

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // only open modal when clicking view project
  cards.forEach((card) => {
    const btn = card.querySelector(".work-btn");

    if (btn) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openModalFromCard(card);
      });
    }

    // mobile support: tapping card once shows overlay
    // (because hover doesn't exist on touch devices)
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("work-btn")) return;

      // toggle active only on small screens
      if (window.matchMedia("(max-width: 900px)").matches) {
        cards.forEach((c) => c !== card && c.classList.remove("active"));
        card.classList.toggle("active");
      }
    });
  });

  // close modal buttons
  modalClose?.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });
}

// testimonials slider (only on mobile)

function initTestimonialsCarousel() {
  const track = document.getElementById("testimonialsTrack");
  const dotsWrap = document.getElementById("testimonialsDots");
  if (!track || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll(".testimonial-card"));
  if (!cards.length) return;

  let index = 0;
  let timer = null;

  // i only want slider behavior on small screens
  const mq = window.matchMedia("(max-width: 900px)");

  function buildDots() {
    dotsWrap.innerHTML = "";
    cards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });
  }

  function updateDots() {
    const dots = dotsWrap.querySelectorAll("button");
    dots.forEach((d, i) => d.classList.toggle("active", i === index));
  }

  function goTo(i) {
    index = (i + cards.length) % cards.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    updateDots();
  }

  function start() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => goTo(index + 1), 4000);
  }

  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  function enableMobileSlider() {
    buildDots();
    goTo(0);
    start();

    // pause if user is interacting
    track.addEventListener("mouseenter", stop);
    track.addEventListener("mouseleave", start);
    track.addEventListener("touchstart", stop, { passive: true });
    track.addEventListener("touchend", start);
  }

  function disableMobileSlider() {
    stop();
    track.style.transform = "translateX(0)";
    dotsWrap.innerHTML = "";
  }

  function setup() {
    if (mq.matches) enableMobileSlider();
    else disableMobileSlider();
  }

  mq.addEventListener("change", setup);
  setup();
}


// run everything after the page loads
document.addEventListener("DOMContentLoaded", function () {
  initSlider("itSlider");
  initSlider("btSlider");

  initRevealOnScroll();
  initCounterOnView();
  initAboutParallax();

  initWorkCardsAndModal();
  initTestimonialsCarousel();
});
