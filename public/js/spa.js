(function () {
  AOS.init({ once: true, duration: 600, easing: "ease-out" });

  function toast(msg, type = "info") {
    const id = "t" + Math.random().toString(16).slice(2);
    const $t = $(`
      <div id="${id}" class="rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur px-4 py-3 shadow-xl">
        <div class="text-sm">${msg}</div>
      </div>
    `);
    $("#toastWrap").append($t);
    setTimeout(() => $t.css("transform", "translateY(-2px)"), 20);
    setTimeout(() => $t.fadeOut(250, () => $t.remove()), 2600);
  }
  window.toast = toast;

  function isSpaEligible(url) {
    return url.startsWith("/") && !url.startsWith("/admin");
  }

  async function spaLoad(url, push = true) {
    try {
      $("#app").addClass("opacity-70");
      const html = await $.get(url, { _partial: 1 });
      const $tmp = $("<div>").html(html);
      const $newApp = $tmp.find("#app").length ? $tmp.find("#app").html() : $tmp.html();
      $("#app").html($newApp);
      $("#app").removeClass("opacity-70");

      if (push) history.pushState({ url }, "", url);

      // re-init animations & hooks
      AOS.refreshHard();
      window.__pageInit && window.__pageInit(url);

      // small GSAP pop
      if (window.gsap) gsap.fromTo("#app", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35 });
    } catch (e) {
      location.href = url;
    }
  }

  $(document).on("click", "a.spa-link", function (e) {
    const href = $(this).attr("href");
    if (!href) return;
    if (!isSpaEligible(href)) return;

    e.preventDefault();
    spaLoad(href, true);
  });

  window.addEventListener("popstate", (ev) => {
    const url = (ev.state && ev.state.url) ? ev.state.url : location.pathname + location.search;
    spaLoad(url, false);
  });

  // optional partial render: kalau ada query _partial, server masih render full.
  // Untuk simple: kita biarkan saja, karena kita ambil #app dari HTML.

})();
