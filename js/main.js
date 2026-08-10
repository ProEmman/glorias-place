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
