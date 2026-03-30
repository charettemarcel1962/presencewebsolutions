/**
 * BT Phase 4 — Recommandations avec logique exposée (même règles que Phase 3).
 */
(function (global) {
  var PWS = global.PWS || (global.PWS = {});

  PWS.Recommendations = {
    /**
     * @param metrics from PWS.Alerts.computeMetrics + byRegion optional
     */
    build: function (metrics, topPriorities, data) {
      var list = [];

      if (topPriorities && topPriorities.length) {
        var first = topPriorities[0];
        list.push({
          text:
            "Traiter en priorite: " +
            (first.nom_entreprise || first.id) +
            " (" +
            first.intelligence.score +
            " pts)",
          explain: {
            ruleId: "top_priority",
            logic: "Prospect avec le score NatCore le plus élevé dans la vue (tri décroissant des contributions).",
            trigger: "Toujours si au moins un prospect dans la vue.",
            metrics: {
              prospectId: first.id,
              nom: first.nom_entreprise || first.id,
              score: first.intelligence.score,
              rank: 1
            }
          }
        });
      }

      if (metrics.relancesRetard > 0) {
        list.push({
          text: "Lancer une relance groupee sur " + metrics.relancesRetard + " dossiers en retard",
          explain: {
            ruleId: "relance_groupee",
            logic: "Compter les prospects dont la dernière activité (modification ou création) remonte à >= 10 jours.",
            trigger: "relancesRetard > 0",
            metrics: { relancesRetard: metrics.relancesRetard, staleThresholdDays: 10 }
          }
        });
      }

      if (metrics.noSeller > 0) {
        list.push({
          text: "Redistribuer " + metrics.noSeller + " prospects sans vendeur assigne",
          explain: {
            ruleId: "redistribuer_sans_vendeur",
            logic: "Compter les prospects sans vendeur_id dans la vue filtrée.",
            trigger: "noSeller > 0",
            metrics: { noSeller: metrics.noSeller }
          }
        });
      }

      var byRegion = {};
      (data.listes || []).forEach(function (l) {
        var reg = l.region || "Inconnu";
        byRegion[reg] = (byRegion[reg] || 0) + Number(l.nb_prospects || 0);
      });
      var entries = Object.keys(byRegion).map(function (k) {
        return [k, byRegion[k]];
      });
      entries.sort(function (a, b) {
        return b[1] - a[1];
      });
      var heavyRegion = entries[0];

      if (heavyRegion && heavyRegion[1] > 50) {
        list.push({
          text:
            "Territoire sous pression: " +
            heavyRegion[0] +
            " (" +
            heavyRegion[1] +
            " prospects) - renforcer la couverture",
          explain: {
            ruleId: "territoire_pression",
            logic: "Agréger nb_prospects par region des listes de la vue; prendre la région max.",
            trigger: "volume max par région > 50",
            metrics: { region: heavyRegion[0], volume: heavyRegion[1], threshold: 50 }
          }
        });
      }

      return list;
    }
  };
})(typeof window !== "undefined" ? window : this);
