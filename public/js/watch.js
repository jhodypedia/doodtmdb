(function () {
  function initWatch() {
    if (!$("#playerShell").length) return;

    const $frame = $("#doodFrame");
    const $fake = $("#fakeProg");
    let prog = 0;
    let t = setInterval(() => {
      prog = Math.min(92, prog + Math.random() * 6);
      $fake.css("width", prog + "%");
      if (prog >= 92) clearInterval(t);
    }, 700);

    $("#btnReload").off("click").on("click", () => {
      prog = 0; $fake.css("width","0%");
      $frame.attr("src", $frame.attr("src"));
      window.toast && window.toast("Reload player...");
    });

    $("#btnCopy").off("click").on("click", async () => {
      try {
        await navigator.clipboard.writeText(location.href);
        window.toast && window.toast("Link copied ✅");
      } catch {
        window.toast && window.toast("Copy gagal (izin browser).");
      }
    });

    $("#btnReport").off("click").on("click", () => {
      window.toast && window.toast("Report diterima (dummy).");
    });

    function enterTheater() {
      document.documentElement.classList.add("theater-mode");
      $("#btnCloseTheater").removeClass("hidden");
      window.toast && window.toast("Theater mode ON");
    }
    function exitTheater() {
      document.documentElement.classList.remove("theater-mode");
      $("#btnCloseTheater").addClass("hidden");
      window.toast && window.toast("Theater mode OFF");
    }

    $("#btnTheater").off("click").on("click", enterTheater);
    $("#btnCloseTheater").off("click").on("click", exitTheater);

    $("#btnFull").off("click").on("click", async () => {
      const el = document.getElementById("playerShell");
      if (!el) return;
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else await el.requestFullscreen();
      } catch {
        window.toast && window.toast("Fullscreen tidak didukung.");
      }
    });

    // nice entrance animation
    if (window.gsap) gsap.fromTo("#playerShell", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4 });
  }

  $(initWatch);
  window.__initWatch = initWatch;

  // make available for home.js combined init
  window.__pageInit = window.__pageInit || function(){};
  const old = window.__pageInit;
  window.__pageInit = function(url){
    old(url);
    initWatch();
  };
})();
