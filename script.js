// SLIDER SCRIPT

function initSlider(sliderId, interval = 4000) {
  const slider = document.getElementById(sliderId);
  if (!slider) return;

  const slides = slider.querySelectorAll(".slide");
  let index = 0;
  let timer;

  function showNext() {
    slides[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }

  function start() {
    timer = setInterval(showNext, interval);
  }

  function stop() {
    clearInterval(timer);
  }

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  start();
}

// COUNTER ANIMATION (runs when section comes into view)
function animateCounters() {
  const counters = document.querySelectorAll(".stat-number");

  counters.forEach(counter => {
    const target = Number(counter.dataset.target || 0);
    const suffix = counter.dataset.suffix || "";
    const duration = 1200;

    // Reset before starting
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

function initCounterOnView() {
  const aboutSection = document.querySelector(".about");
  if (!aboutSection) return;

  let isCounting = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isCounting) {
        isCounting = true;
        animateCounters();
      } else if (!entry.isIntersecting) {
        // When leaving view, allow it to run again next time
        isCounting = false;
      }
    });
  }, { threshold: 0.35 });

  observer.observe(aboutSection);
}
// Run after HTML loads
document.addEventListener("DOMContentLoaded", function () {
  initSlider("itSlider");
  initSlider("btSlider");
  initCounterOnView();
});
