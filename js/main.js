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

  // css/styles.css's body.nav-open{overflow:hidden} alone doesn't stop
  // touch-drag scrolling the page behind the full-screen panel on mobile
  // Safari/Chrome — overflow:hidden only blocks scrollbar/wheel scrolling,
  // not touchmove-driven scroll of the underlying document. Pinning body
  // with position:fixed removes it from the flow entirely (so there's
  // nothing left for the document to scroll), then restoring position and
  // scrolling back to the saved offset on close makes it invisible to the
  // user — the standard "body scroll lock" technique.
  var lockedScrollY = 0;

  navDisclosure.addEventListener("toggle", function () {
    var isOpen = navDisclosure.open;
    document.body.classList.toggle("nav-open", isOpen);

    if (isOpen) {
      lockedScrollY = window.scrollY || window.pageYOffset;
      document.body.style.position = "fixed";
      document.body.style.top = "-" + lockedScrollY + "px";
      document.body.style.left = "0";
      document.body.style.right = "0";
    } else {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, lockedScrollY);
    }
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

(function () {
  "use strict";

  // "Days & hours needed" is a day-chip + start/end time picker, but the
  // Supabase submission code and the enquiries.days_hours_needed column
  // both expect one plain string. This keeps a hidden #days-hours input
  // (same id the submission code already reads) in sync with whatever
  // days/times are picked, formatted like "Mon, Wed, Fri — 8:00 AM to 5:00 PM".
  var form = document.querySelector(".enquiry-form");
  if (!form) return;

  var dayInputs = form.querySelectorAll(".day-input");
  var startTime = form.querySelector("#start-time");
  var endTime = form.querySelector("#end-time");
  var hiddenField = form.querySelector("#days-hours");
  if (!dayInputs.length || !startTime || !endTime || !hiddenField) return;

  function formatTime(value) {
    if (!value) return "";
    var parts = value.split(":");
    var hours = parseInt(parts[0], 10);
    var minutes = parts[1];
    var period = hours >= 12 ? "PM" : "AM";
    var hours12 = hours % 12 || 12;
    return hours12 + ":" + minutes + " " + period;
  }

  function updateHiddenField() {
    var checkedDays = [];
    dayInputs.forEach(function (input) {
      if (input.checked) checkedDays.push(input.value);
    });
    var daysPart = checkedDays.join(", ");

    var startFormatted = formatTime(startTime.value);
    var endFormatted = formatTime(endTime.value);
    var timePart = (startFormatted && endFormatted) ? (startFormatted + " to " + endFormatted) : "";

    if (daysPart && timePart) {
      hiddenField.value = daysPart + " — " + timePart;
    } else {
      hiddenField.value = daysPart || timePart;
    }
  }

  dayInputs.forEach(function (input) {
    input.addEventListener("change", updateHiddenField);
  });
  startTime.addEventListener("change", updateHiddenField);
  endTime.addEventListener("change", updateHiddenField);
})();

(function () {
  "use strict";

  // "Arrange a visit" shows the full form; "Ask a question" hides the
  // fields that only make sense for booking a visit (child's age, days &
  // hours) and makes the message field required instead. Fields carrying
  // [data-visit-only] are hidden/shown together; required is toggled to
  // match so a hidden field never blocks submission, and visit-only values
  // are cleared when hiding so they can't be submitted unseen.
  var form = document.querySelector(".enquiry-form");
  if (!form) return;

  var intentInputs = form.querySelectorAll('input[name="intent"]');
  if (!intentInputs.length) return;

  var visitOnlyFields = form.querySelectorAll("[data-visit-only]");
  var childAgeSelect = form.querySelector("#child-age");
  var dayInputs = form.querySelectorAll(".day-input");
  var startTime = form.querySelector("#start-time");
  var endTime = form.querySelector("#end-time");
  var daysHoursHidden = form.querySelector("#days-hours");
  var messageField = form.querySelector("#message");
  var messageOptionalNote = form.querySelector("#message-optional");

  function applyIntent() {
    var checked = form.querySelector('input[name="intent"]:checked');
    var isVisit = !checked || checked.value === "visit";

    visitOnlyFields.forEach(function (field) {
      field.hidden = !isVisit;
    });

    if (childAgeSelect) {
      childAgeSelect.required = isVisit;
      if (!isVisit) childAgeSelect.value = "";
    }

    if (!isVisit) {
      dayInputs.forEach(function (input) {
        input.checked = false;
      });
      if (startTime) startTime.value = "";
      if (endTime) endTime.value = "";
      if (daysHoursHidden) daysHoursHidden.value = "";
    }

    if (messageField) messageField.required = !isVisit;
    if (messageOptionalNote) messageOptionalNote.hidden = !isVisit;
  }

  intentInputs.forEach(function (input) {
    input.addEventListener("change", applyIntent);
  });

  // Also covers the ?intent=visit/question preselection in the block above.
  applyIntent();
})();
