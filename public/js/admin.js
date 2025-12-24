(function () {
  function initAdminChart() {
    const canvas = document.getElementById("visitChart");
    if (!canvas || !window.Chart) return;
    const data = window.__visitChartData || [];
    const labels = data.map(x => x.dayKey);
    const values = data.map(x => Number(x.c || 0));

    new Chart(canvas, {
      type: "line",
      data: { labels, datasets: [{ label: "Visits", data: values, tension: 0.35 }] },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: {
          x: { ticks: { color: "#a1a1aa" }, grid: { color: "rgba(255,255,255,0.06)" } },
          y: { ticks: { color: "#a1a1aa" }, grid: { color: "rgba(255,255,255,0.06)" } }
        }
      }
    });
  }

  $(initAdminChart);
  window.__initAdminChart = initAdminChart;

  window.__pageInit = window.__pageInit || function(){};
  const old = window.__pageInit;
  window.__pageInit = function(url){
    old(url);
    initAdminChart();
  };
})();
