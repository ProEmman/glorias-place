(function () {
  "use strict";

  // Buttons across the site link to the enquiry form with ?intent=visit or
  // ?intent=question so the right "What can I help with?" chip is
  // pre-selected. Without JS the fragment link still jumps to the form and
  // the default radio (checked in the HTML) is used instead.
  var params = new URLSearchParams(window.location.search);
  var intent = params.get("intent");
  if (!intent) return;

  var input = document.getElementById("intent-" + intent);
  if (input) {
    input.checked = true;
  }
})();

(function () {
  "use strict";

  // The mobile nav is a plain <details>/<summary> disclosure, so it works
  // with no JS at all. This just adds two enhancements: a visible close
  // button (there's no native way to close a <details> other than
  // re-clicking the summary) and a body-scroll lock while it's open.
  var navDisclosure = document.querySelector(".nav-disclosure");
  if (!navDisclosure) return;

  navDisclosure.addEventListener("toggle", function () {
    document.body.classList.toggle("nav-open", navDisclosure.open);
  });

  var navClose = navDisclosure.querySelector(".nav-panel__close");
  var navToggle = navDisclosure.querySelector(".nav-toggle");
  if (navClose) {
    navClose.addEventListener("click", function () {
      navDisclosure.open = false;
      if (navToggle) {
        navToggle.focus();
      }
    });
  }

  // Without this, tapping a link doesn't close the full-screen panel — the
  // page navigates/scrolls underneath, but the panel (position: fixed,
  // covering the whole screen) keeps covering it, so it looks like nothing
  // happened. Doesn't preventDefault, so the link's own navigation still
  // proceeds as normal; closing just lets it become visible.
  var navPanelLinks = navDisclosure.querySelectorAll(".nav-panel a");
  navPanelLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      navDisclosure.open = false;
    });
  });
})();
