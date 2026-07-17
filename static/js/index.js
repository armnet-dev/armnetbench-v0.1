(function () {
  "use strict";

  var items = document.querySelectorAll(".reveal");
  var mediaVideos = document.querySelectorAll(
    ".task video[data-src], .cell-screen video[data-src]"
  );
  var replayItems = document.querySelectorAll(
    ".metric-grid, .protocol-heading, .protocol-summary, .bar-chart, .corpus-stats"
  );
  var attentionPanels = document.querySelectorAll(".detail-panel.attention");
  var reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function animateCounts(container) {
    container.animationRun = (container.animationRun || 0) + 1;
    var run = container.animationRun;

    container.querySelectorAll("[data-count-to]").forEach(function (metric, index) {
      var target = Number(metric.dataset.countTo);

      window.setTimeout(function () {
        if (container.animationRun !== run) return;
        var startedAt;
        metric.textContent = "0";

        function update(timestamp) {
          if (container.animationRun !== run) return;
          if (!startedAt) startedAt = timestamp;
          var progress = Math.min((timestamp - startedAt) / 900, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          metric.textContent = Math.round(target * eased).toLocaleString("en-US");
          if (progress < 1) window.requestAnimationFrame(update);
        }

        window.requestAnimationFrame(update);
      }, index * 90);
    });
  }

  if (!("IntersectionObserver" in window) || reducedMotion) {
    items.forEach(function (item) {
      item.classList.add("visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    items.forEach(function (item) {
      revealObserver.observe(item);
    });
  }

  if ("IntersectionObserver" in window && !reducedMotion) {
    var animationObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("animating");
            if (entry.target.querySelector("[data-count-to]")) {
              animateCounts(entry.target);
            }
          } else {
            entry.target.classList.remove("animating");
            if (entry.target.querySelector("[data-count-to]")) {
              entry.target.animationRun = (entry.target.animationRun || 0) + 1;
            }
          }
        });
      },
      { threshold: 0.2 }
    );

    replayItems.forEach(function (item) {
      animationObserver.observe(item);
    });
  }

  attentionPanels.forEach(function (panel) {
    panel.querySelector("summary").addEventListener(
      "click",
      function () {
        panel.classList.add("acknowledged");
      },
      { once: true }
    );
  });

  function loadVideo(video) {
    if (!video.dataset.src) return;
    video.src = video.dataset.src;
    video.removeAttribute("data-src");
    video.load();
  }

  if (!("IntersectionObserver" in window)) {
    mediaVideos.forEach(function (video) {
      loadVideo(video);
      if (!reducedMotion) video.play().catch(function () {});
    });
    return;
  }

  var videoObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting) {
          loadVideo(video);
          if (!reducedMotion) video.play().catch(function () {});
        } else {
          video.pause();
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "240px 0px",
    }
  );

  mediaVideos.forEach(function (video) {
    videoObserver.observe(video);
  });
})();
