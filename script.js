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


// ----------------------------------------------------
// theme toggle (light / dark mode)
// ----------------------------------------------------
function initThemeToggle() {
  const toggleBtn = document.getElementById("themeToggle");
  if (!toggleBtn) return;

  const icon = toggleBtn.querySelector("i");
  const body = document.body;

  // 1. check for saved preference
  const savedTheme = localStorage.getItem("theme");

  // 2. check for system preference
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  function setTheme(theme) {
    if (theme === "dark") {
      body.classList.add("dark-mode");
      icon.classList.replace("fa-moon", "fa-sun");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark-mode");
      icon.classList.replace("fa-sun", "fa-moon");
      localStorage.setItem("theme", "light");
    }
  }

  // initial load
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (systemPrefersDark.matches) {
    setTheme("dark");
  }

  // toggle click
  toggleBtn.addEventListener("click", () => {
    const isDark = body.classList.contains("dark-mode");
    setTheme(isDark ? "light" : "dark");
  });
}

// run everything after the page loads
document.addEventListener("DOMContentLoaded", function () {
  initThemeToggle();
  initSlider("itSlider");
  initSlider("btSlider");

  initRevealOnScroll();
  initCounterOnView();
  initAboutParallax();

  initWorkCardsAndModal();
  initTestimonialsCarousel();
  initBiotech();
});


/* ---------------------------------------------------- */
/*                  BIOTECH PAGE LOGIC                  */
/* ---------------------------------------------------- */

function initBiotechHero() {
  const slides = document.querySelectorAll('.bt-carousel-slide');
  if (!slides.length) return;

  let index = 0;
  setInterval(() => {
    slides[index].classList.remove('active');
    index = (index + 1) % slides.length;
    slides[index].classList.add('active');
  }, 5000);
}

function initBiotechInfra() {
  const infraItems = document.querySelectorAll('.bt-infra-item');
  const infraSection = document.querySelector('.bt-infra-section');
  if (!infraItems.length || !infraSection) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      infraItems.forEach((item, idx) => {
        setTimeout(() => {
          item.classList.add('animate');
        }, idx * 150);
      });
      observer.unobserve(infraSection);
    }
  }, { threshold: 0.2 });

  observer.observe(infraSection);
}

function initBiotechReveal() {
  const reveals = document.querySelectorAll('.bt-reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));
}


function switchTab(tabId) {
  // 1. remove active from all buttons
  const buttons = document.querySelectorAll('.bt-tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  // 2. remove active from all panels
  const panels = document.querySelectorAll('.bt-tab-panel');
  panels.forEach(panel => panel.classList.remove('active'));

  // 3. activate correct button
  // (find button that targets this tabId ... or just event target if passed)
  // simplest way since i used inline onclick: find the button that was clicked
  // actually, let's just loop and check text or attribute. 
  // BETTER: logic assumes the onclick passes the ID.
  // To highlight the button, I can use the event object or querySelector based on logic.
  // Since I don't pass 'this', I'll just find the button that calls this ID? 
  // No, that's messy. Let's update the HTML to pass 'this' or use event listeners.
  // But since I already wrote HTML with onclick="switchTab('id')", 
  // I will rely on the fact that I can't easily get 'this' without passing it.

  // FIX: let's rewriting the HTML is expensive. 
  // Let's just use event delegation or querySelector to map buttons to IDs if possible.
  // Or, I can re-select the button based on the index? 
  // No.

  // SIMPLEST FIX: iterate buttons, see which one matches the intended logic?
  // Actually, I'll essentially re-implement the click handler in JS to be safe 
  // and remove the inline handlers if I could, but I already wrote them.

  // Alternative: passed argument is just ID.
  // I will assume the buttons are in order: Agri, Industry, Student.
  // And IDs are: agri, industry, student.

  // Let's try to match by some attribute or just pass 'event' in the HTML? I didn't.

  // OK, I will use a different approach. I will attach event listeners in initBiotechTabs
  // and ignore the inline onclicks (or remove them? no, they might error if function missing).
  // I MUST define the function `switchTab`.

  // To find the active button:
  const targetBtn = Array.from(buttons).find(btn =>
    btn.textContent.toLowerCase().includes(tabId === 'agri' ? 'agriculture' :
      tabId === 'industry' ? 'indus' : 'student')
  );

  if (targetBtn) targetBtn.classList.add('active');

  // 4. activate panel
  const targetPanel = document.getElementById(tabId);
  if (targetPanel) targetPanel.classList.add('active');
}

// better: attach listeners cleanly in JS and remove inline from HTML if I could, 
// but I'll stick to the function for now. 
// actually, let's make it robust.

function initBiotechTabs() {
  const buttons = document.querySelectorAll('.bt-tab-btn');
  const panels = document.querySelectorAll('.bt-tab-panel');

  if (!buttons.length || !panels.length) return;

  buttons.forEach(btn => {
    btn.onclick = function () { // override inline if any, or just handle click
      // get target from... text? or data attribute? 
      // i didn't add data attribute.
      // let's rely on the inline onclick that calls switchTab
      // but wait, I can just modify switchTab to handle the UI update
    };

    // Actually, I will just redefine the onclick behavior here cleanly 
    // and rely on the text or index to map to panels.
  });
}
// wait, I will implement switchTab globally
window.switchTab = function (tabId) {
  const allBtns = document.querySelectorAll('.bt-tab-btn');
  const allPanels = document.querySelectorAll('.bt-tab-panel');

  allBtns.forEach(b => b.classList.remove('active'));
  allPanels.forEach(p => p.classList.remove('active'));

  const targetPanel = document.getElementById(tabId);
  if (targetPanel) targetPanel.classList.add('active');

  // Highlight button
  // Helper to map id to button index
  let index = 0;
  if (tabId === 'industry') index = 1;
  if (tabId === 'student') index = 2;

  if (allBtns[index]) allBtns[index].classList.add('active');
}

function initBiotech() {
  if (document.body.classList.contains('bt-body')) {
    initBiotechHero();
    initBiotechInfra();
    initBiotechReveal();
    // Tabs are auto-handled by window.switchTab but let's init default state if needed?
    // default active is already in HTML.
  }
}


