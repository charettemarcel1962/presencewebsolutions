/**
 * BT Phase 4 — Utilitaires d’affichage explicable (pas de logique métier).
 */
(function (global) {
  var PWS = global.PWS || (global.PWS = {});

  PWS.Explain = {
    escapeHtml: function (s) {
      if (s == null) return "";
      return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    },

    formatBreakdownLines: function (breakdown) {
      if (!breakdown || !breakdown.length) return "";
      return breakdown
        .map(function (b) {
          var sign = b.points >= 0 ? "+" : "";
          return sign + b.points + " — " + b.label + (b.detail ? " (" + b.detail + ")" : "");
        })
        .join("\n");
    },

    formatBreakdownHtml: function (breakdown) {
      if (!breakdown || !breakdown.length) return "<p class='explain-empty'>Aucun critère.</p>";
      var html = "<ul class='explain-breakdown'>";
      for (var i = 0; i < breakdown.length; i++) {
        var b = breakdown[i];
        var sign = b.points >= 0 ? "+" : "";
        html +=
          "<li><span class='explain-pts'>" +
          sign +
          b.points +
          "</span> <strong>" +
          PWS.Explain.escapeHtml(b.label) +
          "</strong>" +
          (b.detail ? " <span class='muted'>" + PWS.Explain.escapeHtml(b.detail) + "</span>" : "") +
          "</li>";
      }
      html += "</ul>";
      return html;
    }
  };
})(typeof window !== "undefined" ? window : this);
