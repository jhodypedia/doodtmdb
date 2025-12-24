(function () {
  let page = 1;
  let loading = false;
  let ended = false;
  let query = "";

  function cardTemplate(m) {
    const poster = m.posterUrl || "https://placehold.co/400x600?text=Poster";
    return `
      <a href="/watch/${encodeURIComponent(m.slug)}" class="spa-link group relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition card-sheen"
         style="--x:20%;--y:20%;" data-aos="fade-up">
        <div class="aspect-[2/3] bg-zinc-900/40 overflow-hidden">
          <img src="${poster}" class="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300" loading="lazy"
               onerror="this.src='https://placehold.co/400x600?text=Poster'"/>
        </div>
        <div class="p-3">
          <div class="font-medium text-sm line-clamp-2">${escapeHtml(m.title || "")}</div>
          <div class="text-xs text-zinc-400 mt-1 flex items-center justify-between">
            <span>${escapeHtml(m.year || "—")}</span>
            <span class="opacity-80">👁️ ${m.views || 0}</span>
          </div>
        </div>
      </a>
    `;
  }

  function skelTemplate() {
    return `
      <div class="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
        <div class="aspect-[2/3] skel"></div>
        <div class="p-3 space-y-2">
          <div class="h-4 rounded skel"></div>
          <div class="h-3 w-2/3 rounded skel"></div>
        </div>
      </div>
    `;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  }

  async function loadMore() {
    if (loading || ended) return;
    loading = true;

    // skeleton batch
    const $grid = $("#grid");
    const sk = Array.from({ length: 10 }).map(() => skelTemplate()).join("");
    const $sk = $(`<div class="contents" data-skel="1">${sk}</div>`);
    $grid.append($sk);

    try {
      const res = await $.get("/api/movies", { page, limit: 15, q: query });
      const items = (res && res.items) ? res.items : [];

      $sk.remove();

      if (!items.length) {
        ended = true;
        $("#endState").removeClass("hidden");
        return;
      }

      const html = items.map(cardTemplate).join("");
      $grid.append(html);

      // hover sheen follow pointer
      $grid.find(".card-sheen").off("mousemove").on("mousemove", function (e) {
        const r = this.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        this.style.setProperty("--x", x + "%");
        this.style.setProperty("--y", y + "%");
      });

      page += 1;
      AOS.refresh();
    } catch (e) {
      $sk.remove();
      window.toast && window.toast("Gagal load data. Coba refresh.");
    } finally {
      loading = false;
    }
  }

  function resetAndReload() {
    page = 1;
    ended = false;
    $("#endState").addClass("hidden");
    $("#grid").empty();
    loadMore();
  }

  function initHome() {
    if (!$("#grid").length) return;

    // Search
    $("#globalSearch, #globalSearchMobile").off("input").on("input", function () {
      query = String($(this).val() || "").trim();
      clearTimeout(window.__qT);
      window.__qT = setTimeout(() => resetAndReload(), 350);
    });

    $("#btnRefresh").off("click").on("click", resetAndReload);

    // observer for infinite scroll
    const sentinel = document.getElementById("sentinel");
    if (!sentinel) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) loadMore();
      });
    }, { rootMargin: "900px 0px" });

    io.observe(sentinel);

    // first load
    if ($("#grid").children().length === 0) loadMore();
  }

  window.__pageInit = function (url) {
    // called by spa.js after ajax navigation
    initHome();
    initWatch();
    initAdminChart();
  };

  // first page load
  $(initHome);

  // export for watch.js to call
  window.__initHome = initHome;

  // placeholder
  function initWatch() {}
  function initAdminChart() {}
})();
