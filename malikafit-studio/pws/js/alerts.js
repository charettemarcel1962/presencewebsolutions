/**
 * BT Phase 4 — Alertes avec traçabilité (conditions = mêmes seuils que Phase 3).
 */
(function (global) {
  var PWS = global.PWS || (global.PWS = {});

  var INTERMEDIATE = ["Contacté", "Rendez-vous", "En réflexion"];
  var HAS_SIM = ["Simulation", "En réflexion", "Rendez-vous", "Signé"];

  PWS.Alerts = {
    /**
     * @param metrics {{ pipelineBlocked, sansSimulation, relancesRetard, noSeller, simThreshold, scoredCount }}
     */
    build: function (metrics) {
      var alerts = [];

      if (metrics.pipelineBlocked >= 5) {
        alerts.push({
          level: "DG",
          badge: "prio",
          message: "Pipeline bloqué sur " + metrics.pipelineBlocked + " dossiers",
          cause: "Stagnation >= 12 jours en phase intermediaire",
          explain: {
            ruleId: "pipeline_blocked",
            condition: "nombre de prospects en {Contacté, Rendez-vous, En réflexion} avec staleDays >= 12 >= 5",
            satisfied: true,
            metrics: {
              pipelineBlocked: metrics.pipelineBlocked,
              threshold: 5,
              staleDaysRule: ">= 12",
              statuses: INTERMEDIATE.slice()
            },
            detail:
              metrics.pipelineBlocked +
              " prospect(s) en phase intermédiaire sans mouvement depuis au moins 12 jours (date_modification / date_creation)."
          }
        });
      }

      if (metrics.sansSimulation >= metrics.simThreshold) {
        alerts.push({
          level: "Haute",
          badge: "prio",
          message: "Trop de prospects sans simulation (" + metrics.sansSimulation + ")",
          cause: "Risque de perte d'opportunites commerciales",
          explain: {
            ruleId: "sans_simulation_volume",
            condition: "sansSimulation >= max(4, ceil(35% * nb_prospects_vue))",
            satisfied: true,
            metrics: {
              sansSimulation: metrics.sansSimulation,
              simThreshold: metrics.simThreshold,
              scoredCount: metrics.scoredCount
            },
            detail:
              metrics.sansSimulation +
              " prospect(s) hors statuts Simulation / En réflexion / Rendez-vous / Signé (seuil " +
              metrics.simThreshold +
              ")."
          }
        });
      }

      if (metrics.relancesRetard >= 6) {
        alerts.push({
          level: "Moyenne",
          badge: "warn",
          message: "Relances en retard: " + metrics.relancesRetard,
          cause: "Derniere activite ancienne sur trop de dossiers",
          explain: {
            ruleId: "relances_retard",
            condition: "nombre de prospects avec staleDays >= 10 >= 6",
            satisfied: true,
            metrics: { relancesRetard: metrics.relancesRetard, threshold: 10, minCount: 6 },
            detail:
              metrics.relancesRetard +
              " prospect(s) sans activité récente depuis au moins 10 jours (basé sur date_modification ou date_creation)."
          }
        });
      }

      if (metrics.noSeller > 0) {
        alerts.push({
          level: "Moyenne",
          badge: "warn",
          message: "Prospects sans vendeur: " + metrics.noSeller,
          cause: "Affectation commerciale incomplete",
          explain: {
            ruleId: "no_seller",
            condition: "noSeller > 0",
            satisfied: true,
            metrics: { noSeller: metrics.noSeller },
            detail: metrics.noSeller + " prospect(s) avec vendeur_id absent dans la vue courante."
          }
        });
      }

      return alerts;
    },

    computeMetrics: function (scored) {
      var relancesRetard = scored.filter(function (p) {
        return p.intelligence.staleDays >= 10;
      }).length;
      var sansSimulation = scored.filter(function (p) {
        return HAS_SIM.indexOf(String(p.statut_pipeline || "")) === -1;
      }).length;
      var pipelineBlocked = scored.filter(function (p) {
        return (
          INTERMEDIATE.indexOf(String(p.statut_pipeline || "")) !== -1 && p.intelligence.staleDays >= 12
        );
      }).length;
      var noSeller = scored.filter(function (p) {
        return !p.vendeur_id;
      }).length;
      var simThreshold = Math.max(4, Math.ceil(scored.length * 0.35));

      return {
        relancesRetard: relancesRetard,
        sansSimulation: sansSimulation,
        pipelineBlocked: pipelineBlocked,
        noSeller: noSeller,
        simThreshold: simThreshold,
        scoredCount: scored.length
      };
    }
  };
})(typeof window !== "undefined" ? window : this);
