(function () {
  "use strict";

  initCarousel();
  initDownload();
  initChangelog();

  function initCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) return;

    var viewport = carousel.querySelector(".carousel-viewport");
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
    var status = carousel.querySelector("[data-carousel-status]");
    var previous = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    var index = 0;
    var timer = null;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var active = slideIndex === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });
      dots.forEach(function (dot, dotIndex) {
        var active = dotIndex === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", String(active));
      });
      if (status) status.textContent = String(index + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0");
    }

    function stopTimer() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function startTimer() {
      stopTimer();
      if (!reduceMotion) {
        timer = window.setInterval(function () {
          setSlide(index + 1);
        }, 6500);
      }
    }

    previous.addEventListener("click", function () {
      setSlide(index - 1);
      startTimer();
    });

    next.addEventListener("click", function () {
      setSlide(index + 1);
      startTimer();
    });

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setSlide(Number(dot.getAttribute("data-carousel-dot")));
        startTimer();
      });
    });

    viewport.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setSlide(index - 1);
        startTimer();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setSlide(index + 1);
        startTimer();
      }
    });

    viewport.addEventListener("mouseenter", stopTimer);
    viewport.addEventListener("mouseleave", startTimer);
    viewport.addEventListener("focusin", stopTimer);
    viewport.addEventListener("focusout", startTimer);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stopTimer();
      else startTimer();
    });

    setSlide(0);
    startTimer();
  }

  function initDownload() {
    var button = document.querySelector("#download-button");
    if (!button) return;
    var status = document.querySelector("[data-download-status]");

    loadText("download_link.yaml")
      .then(function (source) {
        var config = parseKeyValueYaml(source);
        var url = config.download_url;
        if (!isSafeDownloadUrl(url)) throw new Error("Invalid download URL");

        button.href = url;
        button.removeAttribute("aria-disabled");
        button.removeAttribute("aria-busy");
        button.classList.remove("is-loading", "is-disabled");
        var version = document.querySelector("[data-download-version]");
        if (version && config.version) version.textContent = "v" + config.version;
        if (status) status.hidden = true;
      })
      .catch(function () {
        button.setAttribute("aria-disabled", "true");
        button.removeAttribute("aria-busy");
        button.classList.remove("is-loading");
        button.classList.add("is-disabled");
        var label = button.querySelector(".button-label");
        if (label) label.textContent = "Download unavailable";
        if (status) {
          status.textContent = "The download link could not be loaded";
          status.hidden = false;
        }
      });

    button.addEventListener("click", function (event) {
      if (button.getAttribute("aria-disabled") === "true") event.preventDefault();
    });
  }

  function initChangelog() {
    var list = document.querySelector("#release-list");
    if (!list) return;

    var loading = document.querySelector("[data-release-loading]");
    var error = document.querySelector("[data-release-error]");

    loadText("changelog.yaml")
      .then(function (source) {
        var data = parseChangelogYaml(source);
        list.innerHTML = data.releases.map(renderRelease).join("");
        list.hidden = false;
        if (loading) loading.hidden = true;
      })
      .catch(function () {
        if (loading) loading.hidden = true;
        if (error) error.hidden = false;
      });
  }

  function loadText(path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("Could not load " + path);
      return response.text();
    });
  }

  function parseKeyValueYaml(source) {
    return source.split(/\r?\n/).reduce(function (result, line) {
      var match = line.match(/^\s*([a-zA-Z0-9_-]+):\s*(.*?)\s*$/);
      if (match) result[match[1]] = parseYamlScalar(match[2]);
      return result;
    }, {});
  }

  function parseChangelogYaml(source) {
    var releases = [];
    var current = null;
    var readingChanges = false;

    source.split(/\r?\n/).forEach(function (line) {
      var releaseMatch = line.match(/^\s*-\s+version:\s*(.+?)\s*$/);
      if (releaseMatch) {
        current = { version: parseYamlScalar(releaseMatch[1]), date: "", changes: [] };
        releases.push(current);
        readingChanges = false;
        return;
      }

      if (!current) return;
      var dateMatch = line.match(/^\s+date:\s*(.+?)\s*$/);
      if (dateMatch) {
        current.date = parseYamlScalar(dateMatch[1]);
        return;
      }

      if (/^\s+changes:\s*\[\]\s*$/.test(line)) {
        readingChanges = false;
        return;
      }

      if (/^\s+changes:\s*$/.test(line)) {
        readingChanges = true;
        return;
      }

      var changeMatch = line.match(/^\s+-\s+(.+?)\s*$/);
      if (readingChanges && changeMatch) current.changes.push(parseYamlScalar(changeMatch[1]));
    });

    return { releases: releases };
  }

  function parseYamlScalar(raw) {
    var value = String(raw || "").trim();
    if (value.length > 1 && value[0] === '"' && value[value.length - 1] === '"') {
      try {
        return JSON.parse(value);
      } catch {
        return value.slice(1, -1);
      }
    }
    if (value.length > 1 && value[0] === "'" && value[value.length - 1] === "'") return value.slice(1, -1);
    return value;
  }

  function renderRelease(release) {
    var version = escapeHtml(release.version || "");
    var date = escapeHtml(formatDate(release.date));
    var changes = release.changes || [];
    var isInitial = changes.length === 0;
    var changeMarkup = changes.length
      ? "<ul class=\"release-change-list\">" + changes.map(function (change) {
          return "<li>" + escapeHtml(change) + "</li>";
        }).join("") + "</ul>"
      : "<p class=\"release-initial-note\">The first public release of Fovelle.</p>";

    return (
      "<article class=\"release-entry" + (isInitial ? " release-entry--initial" : "") + "\">" +
        "<div class=\"release-meta\"><span class=\"release-version\">v" + version + "</span><time class=\"release-date\" datetime=\"" + escapeHtml(release.date) + "\">" + date + "</time></div>" +
        "<div class=\"release-content\"><h2>Release notes</h2>" + changeMarkup + "</div>" +
      "</article>"
    );
  }

  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value + "T12:00:00Z");
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(date);
  }

  function isSafeDownloadUrl(value) {
    if (!value) return false;
    try {
      var url = new URL(value, window.location.href);
      return url.protocol === "https:";
    } catch {
      return false;
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }
})();
