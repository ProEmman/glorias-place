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
