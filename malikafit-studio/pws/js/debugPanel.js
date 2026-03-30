/**
 * BT Phase 4 — Panneau debug NatCore (données réelles + dernier calcul intelligence).
 */
(function (global) {
  var PWS = global.PWS || (global.PWS = {});

  PWS.DebugPanel = {
    init: function (options) {
      var getSnapshot = options.getSnapshot;
      var toggleBtn = options.toggleBtn;
      var panel = options.panel;
      var pre = options.pre;
      if (!panel || !toggleBtn || !getSnapshot) return;

      var visible = false;

      function render() {
        var snap = getSnapshot();
        var payload = {
          mode: snap.mode,
          timestamp: new Date().toISOString(),
          counts: {
            prospects: (snap.rawData.prospects || []).length,
            listes: (snap.rawData.listes || []).length,
            vendeurs: (snap.rawData.vendeurs || []).length,
            assignations: (snap.rawData.assignations || []).length
          },
          rawData: snap.rawData,
          lastIntelligence: snap.lastIntelligence
        };
        pre.textContent = JSON.stringify(payload, null, 2);
      }

      function setVisible(v) {
        visible = v;
        panel.classList.toggle("debug-panel--open", v);
        panel.setAttribute("aria-hidden", v ? "false" : "true");
        if (toggleBtn) toggleBtn.setAttribute("aria-pressed", v ? "true" : "false");
        if (v) render();
      }

      toggleBtn.addEventListener("click", function () {
        setVisible(!visible);
      });

      return {
        refresh: function () {
          if (visible) render();
        },
        setVisible: setVisible
      };
    }
  };
})(typeof window !== "undefined" ? window : this);
