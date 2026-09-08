(function () {
  "use strict";

  var TYPES = {
    a: { naam: "Type A · Parwa",       oppervlak: 68,  aantal: 16, kamers: "2 kamers, balkon" },
    b: { naam: "Type B · Mope",        oppervlak: 85,  aantal: 18, kamers: "3 kamers, hoekbalkon" },
    c: { naam: "Type C · Kankantrie",  oppervlak: 104, aantal: 6,  kamers: "3 kamers, dakterras" }
  };
  var VOLGORDE = ["a", "b", "c"];
  var plannen = {};

  function zetType(letter) {
    if (!TYPES[letter]) return;
    document.documentElement.dataset.type = letter;
    var t = TYPES[letter];
    var opp = document.getElementById("stat-oppervlak");
    if (opp) opp.textContent = t.oppervlak + " m²";
    var naam = document.getElementById("type-naam");
    if (naam) naam.textContent = t.naam;
    var paneel = document.getElementById("plan-paneel");
    if (paneel && plannen[letter]) paneel.innerHTML = plannen[letter];

    // Update aria-pressed state voor alle type-knoppen, ook als er meerdere
    // kiezers op de pagina staan (bijv. hero en woningsectie)
    VOLGORDE.forEach(function (l) {
      document.querySelectorAll('[data-type-knop="' + l + '"]').forEach(function (knop) {
        knop.setAttribute("aria-pressed", l === letter ? "true" : "false");
      });
    });

    document.dispatchEvent(new CustomEvent("type:gewijzigd", { detail: { type: letter } }));
  }
  window.zetType = zetType;

  // plattegronden eenmalig ophalen, daarna alleen nog wisselen
  VOLGORDE.forEach(function (l) {
    fetch("img/plan-" + l + ".svg")
      .then(function (r) { return r.ok ? r.text() : ""; })
      .then(function (svg) {
        plannen[l] = svg;
        if (document.documentElement.dataset.type === l) zetType(l);
      })
      .catch(function () { /* zonder plattegrond blijft het paneel leeg, niet stuk */ });
  });

  document.addEventListener("click", function (e) {
    var knop = e.target.closest("[data-type-knop]");
    if (knop) { zetType(knop.dataset.typeKnop); return; }
    var stap = e.target.closest("[data-type-stap]");
    if (stap) {
      var i = VOLGORDE.indexOf(document.documentElement.dataset.type || "b");
      var n = (i + Number(stap.dataset.typeStap) + VOLGORDE.length) % VOLGORDE.length;
      zetType(VOLGORDE[n]);
    }
  });

  zetType(document.documentElement.dataset.type || "b");

  document.addEventListener("type:gewijzigd", function (e) {
    var t = TYPES[e.detail.type];
    var zet = function (id, waarde) {
      var el = document.getElementById(id);
      if (el) el.textContent = waarde;
    };
    zet("woning-naam", t.naam);
    zet("woning-kamers", t.kamers);
    zet("woning-opp", t.oppervlak);
    zet("woning-aantal", t.aantal);
    var plan = document.getElementById("woning-plan");
    if (plan && plannen[e.detail.type]) plan.innerHTML = plannen[e.detail.type];
  });
})();
