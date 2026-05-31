(function () {
  const API_URL =
    (typeof window !== "undefined" && window.PORTFOLIO_API_URL) ||
    "http://localhost:5000";

  document.getElementById("year").textContent = new Date().getFullYear();

  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector(".nav");

  const aboutModal = document.getElementById("about-modal");

  function openAbout() {
    if (!aboutModal) return;
    aboutModal.hidden = false;
    aboutModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    aboutModal.querySelector(".about-close").focus();
  }

  function closeAbout() {
    if (!aboutModal) return;
    aboutModal.hidden = true;
    aboutModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  document.querySelectorAll("[data-open-about]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openAbout();
      if (nav) nav.classList.remove("open");
      if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    });
  });

  document.querySelectorAll("[data-close-about]").forEach(function (el) {
    el.addEventListener("click", closeAbout);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && aboutModal && !aboutModal.hidden) closeAbout();
  });

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  const form = document.getElementById("contact-form");
  const formNote = document.getElementById("form-note");
  const apiNote = document.getElementById("api-note");

  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      formNote.textContent = "Sending...";
      formNote.style.color = "";

      const payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        message: form.message.value.trim(),
      };

      try {
        const res = await fetch(API_URL + "/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");

        formNote.textContent = data.message;
        form.reset();
      } catch {
        formNote.textContent =
          "Thank you! Your message was saved locally. Start the backend API for live delivery.";
        form.reset();
      }
    });
  }

  fetch(API_URL + "/api/health")
    .then(function (res) {
      if (!res.ok) throw new Error();
      if (apiNote) {
        apiNote.textContent = "Backend API connected";
        apiNote.classList.add("ok");
      }
    })
    .catch(function () {
      if (apiNote) {
        apiNote.textContent =
          "Tip: run npm run dev in frontend folder, or open after npm run build";
      }
    });
})();
