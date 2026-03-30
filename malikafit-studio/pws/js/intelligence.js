/**
 * BT Phase 4 — Orchestration intelligence (scoring + alertes + reco) une seule vérité.
 */
(function (global) {
  var PWS = global.PWS || (global.PWS = {});

  PWS.Intelligence = {
    compute: function (data) {
      var scoreFn = PWS.Scoring.scoreProspect;
      var scored = (data.prospects || []).map(function (p) {
        var copy = Object.assign({}, p);
        copy.intelligence = scoreFn(p, data);
        return copy;
      });
      scored.sort(function (a, b) {
        return b.intelligence.score - a.intelligence.score;
      });

      var metrics = PWS.Alerts.computeMetrics(scored);
      var topPriorities = scored.slice(0, 6);
      var alerts = PWS.Alerts.build(metrics);
      var recommendations = PWS.Recommendations.build(metrics, topPriorities, data);

      return {
        scored: scored,
        topPriorities: topPriorities,
        alerts: alerts,
        recommendations: recommendations,
        metrics: metrics
      };
    }
  };
})(typeof window !== "undefined" ? window : this);
