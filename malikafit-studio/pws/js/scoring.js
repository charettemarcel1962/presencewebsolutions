/**
 * BT Phase 4 — Scoring explicable (même formule que Phase 3 + détail par critère).
 */
(function (global) {
  var PWS = global.PWS || (global.PWS = {});

  function daysBetween(isoDate) {
    if (!isoDate) return 999;
    var ms = Date.now() - new Date(isoDate).getTime();
    return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  }

  function pushLine(breakdown, id, label, points, detail) {
    if (points === 0) return;
    breakdown.push({ id: id, label: label, points: points, detail: detail || "" });
  }

  /**
   * @returns {{ score, level, css, staleDays, ageDays, status, breakdown }}
   */
  PWS.Scoring = {
    daysBetween: daysBetween,

    scoreProspect: function (p, data) {
      var status = String(p.statut_pipeline || "Nouveau");
      var ageDays = daysBetween(p.date_creation);
      var staleDays = daysBetween(p.date_modification || p.date_creation);
      var noSeller = !p.vendeur_id;
      var hasSimulation = ["Simulation", "En réflexion", "Rendez-vous", "Signé"].indexOf(status) !== -1;
      var hasNotes = String(p.notes || "").trim().length > 0;

      var breakdown = [];
      var score = 0;

      function add(id, label, pts, detail) {
        pushLine(breakdown, id, label, pts, detail);
        score += pts;
      }

      if (status === "Signé") add("statut_signe", "statut_pipeline = Signé", 10, status);
      if (status === "Simulation") add("statut_sim", "statut_pipeline = Simulation", 26, status);
      if (status === "Rendez-vous") add("statut_rdv", "statut_pipeline = Rendez-vous", 22, status);
      if (status === "Contacté") add("statut_contact", "statut_pipeline = Contacté", 16, status);
      if (status === "Nouveau") add("statut_nouveau", "statut_pipeline = Nouveau", 14, status);
      if (status === "En réflexion") add("statut_reflex", "statut_pipeline = En réflexion", 20, status);

      if (staleDays >= 7) add("stale_7", "Stagnation (>=7j depuis dernière activité)", 18, staleDays + " jours");
      if (staleDays >= 14) add("stale_14", "Stagnation prolongée (>=14j)", 12, staleDays + " jours");
      if (ageDays >= 10) add("age", "Ancienneté prospect (>=10j depuis création)", 8, ageDays + " jours");
      if (!hasSimulation) add("no_sim", "Pas encore en phase simulation avancée", 9, "hors Simulation/RDV/Réflexion/Signé");
      if (noSeller) add("no_vendeur", "Aucun vendeur assigné (vendeur_id vide)", 16, "assignation requise");
      if (!hasNotes) add("no_notes", "Notes vides", 6, "notes non renseignées");

      var vendeur = (data.vendeurs || []).find(function (v) {
        return v.id === p.vendeur_id;
      });
      if (vendeur && Number(vendeur.signatures || 0) < 2) {
        add("vendeur_faible", "Vendeur assigné avec peu de signatures (<2)", 6, (vendeur.nom_affichage || vendeur.prenom || "") + " : " + (vendeur.signatures || 0));
      }

      var level = score >= 58 ? "Haute priorité" : score >= 36 ? "Priorité moyenne" : "Faible priorité";
      var css = score >= 58 ? "score-high" : score >= 36 ? "score-mid" : "score-low";

      var sumCheck = breakdown.reduce(function (acc, b) {
        return acc + b.points;
      }, 0);
      if (sumCheck !== score) {
        console.error("PWS.Scoring: incohérence breakdown", sumCheck, score);
      }

      return {
        score: score,
        level: level,
        css: css,
        staleDays: staleDays,
        ageDays: ageDays,
        status: status,
        breakdown: breakdown
      };
    }
  };
})(typeof window !== "undefined" ? window : this);
