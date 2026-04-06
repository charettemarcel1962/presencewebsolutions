/**
 * Cerabec CRM Demo — scénario client Restaurant La Piazza (démo vente)
 */
import { normalizeDisplayText } from "./utils/normalizeDisplayText.js";

(function () {
  const NAV_ITEMS = [
    { id: "presentation", icon: "📍", label: "Présentation" },
    { id: "cockpit-strategique", icon: "🎛️", label: "Cockpit stratégique" },
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "entrees", icon: "📥", label: "Entrées" },
    { id: "clients", icon: "👥", label: "Clients" },
    { id: "soumissions", icon: "📄", label: "Soumissions" },
    { id: "opportunites", icon: "🎯", label: "Opportunités" },
    { id: "planification", icon: "📅", label: "Planification" },
    { id: "installations", icon: "📱", label: "Installations" },
    { id: "facturation", icon: "💳", label: "Facturation" },
    { id: "suivi", icon: "🤝", label: "Suivi client" },
    { id: "marcel_ia", icon: "🧠", label: "Analyse intelligente (Marcel_IA)" },
    { id: "marche", icon: "📈", label: "Marché / Comparables" },
    { id: "conclusion", icon: "✨", label: "Conclusion" },
    { id: "process-manual", icon: "📘", label: "Manuel des processus" },
    { id: "espace-karine", icon: "🔒", label: "Espace Karine", navClass: "nav-item--private" },
  ];

  /** Clé historique : uniquement pour purge (plus d’état « déverrouillé » persistant). */
  const KARINE_STORAGE_KEY = "cerabec_karine_unlock_v1";
  const KARINE_PASSWORD = "2905";

  /** Déverrouillage Karine : mémoire de la page seulement (BT autolock — pas de session durable). */
  let karineUnlockedForSession = false;

  function lockKarineAccess() {
    karineUnlockedForSession = false;
    try {
      localStorage.removeItem(KARINE_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  function unlockKarineAccess() {
    karineUnlockedForSession = true;
  }

  const mainEl = document.getElementById("mainContent");
  const navEl = document.getElementById("sidebarNav");
  const clockEl = document.getElementById("headerClock");

  let activePage = "presentation";

  function syncMainViewTitle(pageId) {
    const el = document.getElementById("mainViewTitle");
    if (!el) return;
    const item = NAV_ITEMS.find((i) => i.id === pageId);
    el.textContent = item ? item.label : "CRM Céra-Bec";
  }

  function formatClock() {
    const d = new Date();
    const opts = {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    };
    return d.toLocaleString("fr-FR", opts);
  }

  function tickClock() {
    if (!clockEl) return;
    clockEl.textContent = formatClock();
    clockEl.setAttribute("datetime", new Date().toISOString());
  }

  /** Texte métier : normalise les entités puis échappe (voir sections.js escapeHtml / escapeDisplayText). */
  function escapeDisplayText(s) {
    const d = document.createElement("div");
    d.textContent = normalizeDisplayText(s);
    return d.innerHTML;
  }

  /**
   * Bloc « Rôle du module » (format riche type Entrées).
   * @param {string} title
   * @param {string[]} marketList — colonne 1
   * @param {string[]} natcoreList — colonne 2
   * @param {{ col1Title?: string, col2Title?: string, col3Title?: string, col3Items?: string[] }} [extra] — titres de colonnes + 3e colonne « Impact » (optionnel)
   */
  function moduleIntro(title, marketList, natcoreList, extra) {
    const col1Title = extra?.col1Title ?? "Marché (fonctionnement actuel)";
    const col2Title = extra?.col2Title ?? "NatCORE + Marcel_IA";
    const col3Title = extra?.col3Title;
    const col3Items = extra?.col3Items;
    const hasThird = col3Title != null && Array.isArray(col3Items);

    const m = (marketList || []).map((item) => `<li>${escapeDisplayText(item)}</li>`).join("");
    const n = (natcoreList || []).map((item) => `<li>${escapeDisplayText(item)}</li>`).join("");
    const p = hasThird ? col3Items.map((item) => `<li>${escapeDisplayText(item)}</li>`).join("") : "";

    const gridClass = hasThird ? "module-intro-grid module-intro-grid--3" : "module-intro-grid";
    const col3Block = hasThird
      ? `
          <div class="module-intro-col impact">
            <h3 class="module-intro-col-title">${escapeDisplayText(col3Title)}</h3>
            <ul>${p}</ul>
          </div>`
      : "";

    return `
      <div class="module-intro">
        <div class="module-intro-header">
          <h2 class="module-intro-heading">🎯 Rôle du module — ${escapeDisplayText(title)}</h2>
          <p class="module-subtitle">
            Comment cette étape fonctionne généralement dans les entreprises similaires
          </p>
        </div>
        <div class="${gridClass}">
          <div class="module-intro-col market">
            <h3 class="module-intro-col-title">${escapeDisplayText(col1Title)}</h3>
            <ul>${m}</ul>
          </div>
          <div class="module-intro-col natcore">
            <h3 class="module-intro-col-title">${escapeDisplayText(col2Title)}</h3>
            <ul>${n}</ul>
          </div>${col3Block}
        </div>
      </div>
    `;
  }

  function clientSpotlightLaPiazza() {
    return `
      <section class="scenario-client" aria-label="Dossier client démo">
        <div class="scenario-client-top">
          <span class="scenario-badge">Commercial</span>
          <span class="scenario-value">18&nbsp;000&nbsp;$</span>
        </div>
        <h3 class="scenario-name">Restaurant La Piazza</h3>
        <p class="scenario-project">Remplacement plancher céramique — salle principale</p>
      </section>
    `;
  }

  function storyFlowHint() {
    return `<p class="story-flow-hint">Marché → Problème → NatCORE → Marcel_IA → Action</p>`;
  }

  function storyProblem(items) {
    return `
      <div class="story-problem">
        <div class="story-problem-title">⚠️ Problème</div>
        <ul>${items.map((x) => `<li>${escapeDisplayText(x)}</li>`).join("")}</ul>
      </div>
    `;
  }

  function marcelIaTip(lines, icon) {
    const head = icon === "bulb" ? "💡 Marcel_IA" : "🧠 Marcel_IA";
    const body = Array.isArray(lines)
      ? `<ul>${lines.map((x) => `<li>${escapeDisplayText(x)}</li>`).join("")}</ul>`
      : `<p>${escapeDisplayText(lines)}</p>`;
    return `
      <div class="marcel-ia-tip">
        <div class="marcel-ia-tip-title">${head}</div>
        ${body}
      </div>
    `;
  }

  function actionStrip(items) {
    return `
      <div class="action-strip">
        <span class="action-strip-label">🎯 Action</span>
        <ul>${items.map((x) => `<li>${escapeDisplayText(x)}</li>`).join("")}</ul>
      </div>
    `;
  }

  /** Bloc simulation mise à jour terrain (mobile) — La Piazza, équipe 2 */
  function mobileTerrainSection(opts) {
    const explain =
      opts.explain ||
      "Les équipes peuvent mettre à jour leur journée directement sur leur téléphone, en moins de 30 secondes.";
    const marcelIaText =
      opts.marcel_ia ||
      "Risque de retard détecté sur ce projet. Réorganisation recommandée pour éviter un décalage global.";
    const timeNote = opts.timeNote || "Ajouté par : Équipe 2 — aujourd’hui 16:42";
    return `
      <p class="mobile-explain">${escapeDisplayText(explain)}</p>
      <div class="mobile-update">
        <h3 class="mobile-update-title">📱 Mise à jour terrain (équipe)</h3>
        <div class="mobile-card">
          <div class="mobile-header">Projet : Restaurant La Piazza</div>
          <ul>
            <li>Avancement : 60&nbsp;%</li>
            <li>Statut : En cours</li>
            <li>Problème : Retard livraison matériaux</li>
            <li>Temps restant : 1 jour</li>
          </ul>
          <div class="mobile-note">${escapeDisplayText(timeNote)}</div>
        </div>
      </div>
      <div class="marcel-ia-tip marcel-ia-tip--field-sync">
        <h4 class="marcel-ia-field-heading">🧠 Marcel_IA</h4>
        <p class="marcel-ia-field-text">${escapeDisplayText(marcelIaText)}</p>
      </div>
    `;
  }

  function triPanels(pageId, custom) {
    const m = custom?.marche || [
      "Signaux marché démo : présence digitale, concurrence locale.",
      "Tendances sectorielles stables ; fenêtre d’action sur 90 jours.",
    ];
    const n = custom?.natcore || [
      "Modules NatCORE recommandés : structuration, capture, mémoire d’entreprise — complétés par Marcel_IA.",
      "Score potentiel et plan d’exécution alignés sur les signaux observés.",
    ];
    const i = custom?.marcel_ia || [
      "Synthèse factuelle à partir des données affichées (mode démo).",
      "Prioriser les actions à fort levier avant industrialisation.",
    ];
    return `
      <div class="tri-grid">
        <div class="panel panel-market">
          <h3>Marché</h3>
          <ul>${m.map((x) => `<li>${escapeDisplayText(x)}</li>`).join("")}</ul>
        </div>
        <div class="panel">
          <h3>🚀 NatCORE + Marcel_IA</h3>
          <ul>${n.map((x) => `<li>${escapeDisplayText(x)}</li>`).join("")}</ul>
        </div>
        <div class="panel panel-marcel-ia">
          <h3>Marcel_IA — Insights</h3>
          <ul>${i.map((x) => `<li>${escapeDisplayText(x)}</li>`).join("")}</ul>
        </div>
      </div>
    `;
  }

  function pagePresentation() {
    return `
      <div class="presentation">
        <section
          class="narration-block presentation-hero"
          data-narration-section="hero"
          data-narration-title="Introduction"
        >
          <h1 class="presentation-title narration-block-heading">Et si Cerabec ne perdait plus aucune opportunité&nbsp;?</h1>
          <p class="presentation-lead">
            Aujourd’hui, une grande partie de l’information est dispersée,
            et plusieurs décisions reposent encore sur l’expérience et la mémoire.
            <br /><br />
            Et si un système pouvait vous donner une vision claire,
            et vous guider dans vos décisions au quotidien&nbsp;?
          </p>
          <div class="presentation-badge">Propulsé par NatCORE + Marcel_IA</div>
        </section>

        <div class="presentation-grid">
          <section
            class="narration-block presentation-card presentation-card--red"
            data-narration-section="today"
            data-narration-title="Aujourd’hui"
          >
            <h2 class="presentation-card-title narration-block-heading">Aujourd’hui</h2>
            <ul>
              <li>Informations réparties entre plusieurs personnes et outils</li>
              <li>Suivis manuels difficiles à maintenir</li>
              <li>Opportunités parfois oubliées</li>
              <li>Décisions prises sans toute l’information</li>
            </ul>
          </section>
          <section
            class="narration-block presentation-card presentation-card--blue"
            data-narration-section="natcore"
            data-narration-title="Demain avec NatCORE"
          >
            <h2 class="presentation-card-title narration-block-heading">Demain avec NatCORE</h2>
            <ul>
              <li>Vue complète des clients et projets</li>
              <li>Processus structuré de A à Z</li>
              <li>Aucune opportunité oubliée</li>
              <li>Décisions basées sur des données réelles</li>
            </ul>
          </section>
          <section
            class="narration-block presentation-card presentation-card--green"
            data-narration-section="marcel_ia"
            data-narration-title="Marcel_IA"
          >
            <h2 class="presentation-card-title narration-block-heading">🧠 Marcel_IA</h2>
            <ul>
              <li>Analyse les projets et soumissions</li>
              <li>Détecte les opportunités cachées</li>
              <li>Identifie les risques</li>
              <li>Suggère des actions concrètes</li>
            </ul>
          </section>
        </div>

        <section
          class="narration-block presentation-impact"
          data-narration-section="impact"
          data-narration-title="Impact pour Cerabec"
        >
          <h2 class="presentation-impact-title narration-block-heading">Impact pour Cerabec</h2>
          <ul>
            <li>Plus d’opportunités concrétisées</li>
            <li>Moins d’erreurs et d’oublis</li>
            <li>Meilleur contrôle des projets</li>
            <li>Support réel pour les équipes</li>
          </ul>
        </section>

        <section
          class="narration-block presentation-cta-wrap"
          data-narration-section="transition"
          data-narration-title="Transition"
        >
          <p class="presentation-transition-lead narration-block-heading">Lorsque vous serez prêt, passez à la démonstration interactive du dossier client.</p>
          <button type="button" class="presentation-cta" data-goto-page="dashboard">
            Commencer la démonstration →
          </button>
        </section>
      </div>
    `;
  }

  function pageCockpitStrategique() {
    return `
      <div class="cockpit-page">
        <header class="cockpit-hero">
          <h1 class="cockpit-title">Cockpit stratégique</h1>
          <p class="cockpit-lead">
            Pilotage direction — état d’ensemble, risques et leviers. Données démo (V1), pas d’IA.
          </p>
        </header>

        <section class="cockpit-panel cockpit-panel--health" data-cockpit-section="sante" aria-labelledby="cockpit-health-h">
          <div class="cockpit-panel-head cockpit-panel-head--red">
            <span class="cockpit-panel-icon" aria-hidden="true">🟥</span>
            <h2 id="cockpit-health-h" class="cockpit-panel-title">Barre de santé</h2>
          </div>
          <div class="cockpit-kpi-row">
            <div class="cockpit-kpi cockpit-kpi--good">
              <span class="cockpit-kpi-label">Revenus du mois</span>
              <span class="cockpit-kpi-value">124&nbsp;500&nbsp;$</span>
              <span class="cockpit-kpi-trend cockpit-kpi-trend--up" title="Variation vs mois précédent">↑ 12&nbsp;%</span>
            </div>
            <div class="cockpit-kpi cockpit-kpi--good">
              <span class="cockpit-kpi-label">Soumissions envoyées</span>
              <span class="cockpit-kpi-value">8</span>
              <span class="cockpit-kpi-trend cockpit-kpi-trend--up">↑ 2</span>
            </div>
            <div class="cockpit-kpi cockpit-kpi--warn">
              <span class="cockpit-kpi-label">Taux de closing</span>
              <span class="cockpit-kpi-value">34&nbsp;%</span>
              <span class="cockpit-kpi-trend cockpit-kpi-trend--down">↓ 4 pts</span>
            </div>
            <div class="cockpit-kpi cockpit-kpi--good">
              <span class="cockpit-kpi-label">Pipeline total</span>
              <span class="cockpit-kpi-value">287&nbsp;000&nbsp;$</span>
              <span class="cockpit-kpi-trend cockpit-kpi-trend--up">↑ 9&nbsp;%</span>
            </div>
            <div class="cockpit-kpi cockpit-kpi--bad">
              <span class="cockpit-kpi-label">Alertes critiques</span>
              <span class="cockpit-kpi-value">3</span>
              <span class="cockpit-kpi-trend cockpit-kpi-trend--up">↑ 1</span>
            </div>
          </div>
        </section>

        <section class="cockpit-panel" data-cockpit-section="attention" aria-labelledby="cockpit-attention-h">
          <div class="cockpit-panel-head cockpit-panel-head--orange">
            <span class="cockpit-panel-icon" aria-hidden="true">🟧</span>
            <h2 id="cockpit-attention-h" class="cockpit-panel-title">Attention immédiate</h2>
          </div>
          <ul class="cockpit-alert-list">
            <li class="cockpit-alert">
              <div class="cockpit-alert-main">
                <strong class="cockpit-alert-client">Bistro du Port</strong>
                <span class="cockpit-alert-amount">42&nbsp;000&nbsp;$</span>
              </div>
              <p class="cockpit-alert-problem">Client en attente de réponse depuis plus de 48&nbsp;h.</p>
              <p class="cockpit-alert-action"><span class="cockpit-action-label">Action</span> Appeler le gérant avant midi.</p>
            </li>
            <li class="cockpit-alert">
              <div class="cockpit-alert-main">
                <strong class="cockpit-alert-client">Restaurant La Piazza</strong>
                <span class="cockpit-alert-amount">18&nbsp;000&nbsp;$</span>
              </div>
              <p class="cockpit-alert-problem">Soumission chaude sans suivi planifié.</p>
              <p class="cockpit-alert-action"><span class="cockpit-action-label">Action</span> Bloquer 15&nbsp;min pour qualifier la prochaine étape aujourd’hui.</p>
            </li>
            <li class="cockpit-alert">
              <div class="cockpit-alert-main">
                <strong class="cockpit-alert-client">Résidence Cartier</strong>
                <span class="cockpit-alert-amount">96&nbsp;000&nbsp;$</span>
              </div>
              <p class="cockpit-alert-problem">Projet à risque : matériel en retard, fenêtre de pose tendue.</p>
              <p class="cockpit-alert-action"><span class="cockpit-action-label">Action</span> Arbitrer équipe B ou renégocier le créneau avec le client.</p>
            </li>
            <li class="cockpit-alert">
              <div class="cockpit-alert-main">
                <strong class="cockpit-alert-client">Clinique Santé‑Nord</strong>
                <span class="cockpit-alert-amount">31&nbsp;500&nbsp;$</span>
              </div>
              <p class="cockpit-alert-problem">Opportunité proche de fermeture — concurrent actif.</p>
              <p class="cockpit-alert-action"><span class="cockpit-action-label">Action</span> Envoyer proposition finale avec délai de réponse 48&nbsp;h.</p>
            </li>
          </ul>
        </section>

        <div class="cockpit-grid-2">
          <section class="cockpit-panel" data-cockpit-section="opportunites" aria-labelledby="cockpit-opp-h">
            <div class="cockpit-panel-head cockpit-panel-head--yellow">
              <span class="cockpit-panel-icon" aria-hidden="true">🟨</span>
              <h2 id="cockpit-opp-h" class="cockpit-panel-title">Opportunités</h2>
            </div>
            <div class="cockpit-opp-summary">
              <div class="cockpit-opp-stat">
                <span class="cockpit-opp-stat-label">Estimation récupérable</span>
                <span class="cockpit-opp-stat-value cockpit-stat-accent">≈ 156&nbsp;000&nbsp;$</span>
              </div>
              <div class="cockpit-opp-stat">
                <span class="cockpit-opp-stat-label">Fiches actives</span>
                <span class="cockpit-opp-stat-value">11</span>
              </div>
            </div>
            <ul class="cockpit-bullets">
              <li><strong>Clients à relancer</strong> — 5 dossiers avec dernier contact &gt; 10&nbsp;jours</li>
              <li><strong>Upsell possibles</strong> — 2 projets : finitions premium + extension surface</li>
              <li><strong>Soumissions à fort potentiel</strong> — 4 en attente de décision cette semaine</li>
            </ul>
          </section>

          <section class="cockpit-panel" data-cockpit-section="projection" aria-labelledby="cockpit-proj-h">
            <div class="cockpit-panel-head cockpit-panel-head--blue">
              <span class="cockpit-panel-icon" aria-hidden="true">🟦</span>
              <h2 id="cockpit-proj-h" class="cockpit-panel-title">Projection</h2>
            </div>
            <ul class="cockpit-proj-list">
              <li>
                <span class="cockpit-proj-label">Revenus prévus (30&nbsp;jours)</span>
                <span class="cockpit-proj-value cockpit-stat-good">198&nbsp;000&nbsp;$</span>
              </li>
              <li>
                <span class="cockpit-proj-label">Charge équipe</span>
                <span class="cockpit-proj-value cockpit-stat-warn">78&nbsp;%</span>
                <span class="cockpit-proj-hint">↑ risque de saturation installateurs nord</span>
              </li>
              <li>
                <span class="cockpit-proj-label">Risques détectés</span>
                <span class="cockpit-proj-value">2 chantiers météo + 1 dépendance fournisseur céramique</span>
              </li>
            </ul>
          </section>
        </div>

        <section class="cockpit-panel" data-cockpit-section="recommandations" aria-labelledby="cockpit-rec-h">
          <div class="cockpit-panel-head cockpit-panel-head--violet">
            <span class="cockpit-panel-icon" aria-hidden="true">🟪</span>
            <h2 id="cockpit-rec-h" class="cockpit-panel-title">Recommandations</h2>
            <span class="cockpit-badge">V1 simulé</span>
          </div>
          <ul class="cockpit-rec-list">
            <li>Relancer <strong>3 clients</strong> aujourd’hui (liste prioritaire dans le CRM).</li>
            <li>Prioriser la soumission <strong>La Piazza</strong> avant les autres relances PM.</li>
            <li>Attention <strong>surcharge installateur</strong> — étaler ou sous-traiter 1 pose semaine 3.</li>
            <li>Verrouiller date livraison céramique <strong>Résidence Cartier</strong> avec le fournisseur.</li>
          </ul>
        </section>

        <section class="cockpit-panel cockpit-panel--vision" data-cockpit-section="vision" aria-labelledby="cockpit-vision-h">
          <div class="cockpit-panel-head cockpit-panel-head--neutral">
            <span class="cockpit-panel-icon" aria-hidden="true">⚫</span>
            <h2 id="cockpit-vision-h" class="cockpit-panel-title">Vision entreprise</h2>
          </div>
          <div class="cockpit-vision-grid">
            <div class="cockpit-vision-item">
              <div class="cockpit-vision-top">
                <span class="cockpit-vision-label">Dépendance au dirigeant</span>
                <span class="cockpit-vision-score cockpit-stat-warn">62 / 100</span>
              </div>
              <div class="cockpit-meter" role="presentation"><div class="cockpit-meter-fill cockpit-meter-fill--warn" style="width:62%"></div></div>
              <p class="cockpit-vision-hint">Plus le score est élevé, plus les arbitrages critiques dépendent du dirigeant.</p>
            </div>
            <div class="cockpit-vision-item">
              <div class="cockpit-vision-top">
                <span class="cockpit-vision-label">Niveau de structuration</span>
                <span class="cockpit-vision-score cockpit-stat-good">71&nbsp;%</span>
              </div>
              <div class="cockpit-meter" role="presentation"><div class="cockpit-meter-fill cockpit-meter-fill--good" style="width:71%"></div></div>
            </div>
            <div class="cockpit-vision-item">
              <div class="cockpit-vision-top">
                <span class="cockpit-vision-label">Utilisation des processus</span>
                <span class="cockpit-vision-score">58&nbsp;%</span>
              </div>
              <div class="cockpit-meter" role="presentation"><div class="cockpit-meter-fill" style="width:58%"></div></div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function karineIsUnlocked() {
    return karineUnlockedForSession;
  }

  function renderKarineGateHtml() {
    return `
      <div class="karine-gate" data-karine-state="locked">
        <div class="karine-gate-card">
          <p class="karine-gate-badge" aria-hidden="true">🔒</p>
          <h1 class="karine-gate-title">Espace Karine</h1>
          <p class="karine-gate-lead">Accès protégé — mot de passe requis.</p>
          <p class="karine-gate-sub">Espace confidentiel : saisissez le code d’accès pour consulter le document.</p>
          <form class="karine-gate-form" id="karine-gate-form" autocomplete="off">
            <label class="karine-gate-label" for="karine-gate-input">Code d’accès</label>
            <input
              class="karine-gate-input"
              type="password"
              id="karine-gate-input"
              name="karine_code"
              inputmode="numeric"
              maxlength="12"
              required
              aria-describedby="karine-gate-msg"
            />
            <p class="karine-gate-msg" id="karine-gate-msg" role="status" aria-live="polite"></p>
            <button type="submit" class="karine-gate-submit">Valider</button>
          </form>
        </div>
      </div>
    `;
  }

  function renderKarineProtectedHtml() {
    return `
      <article class="karine-doc karine-doc--transmission" data-karine-state="unlocked" data-karine-protected-content="1">
        <header class="karine-doc-header">
          <p class="karine-doc-eyebrow">Confidentiel · transmission</p>
          <h1 class="karine-doc-title">Espace Karine</h1>
          <p class="karine-doc-subtitle">Transmission — Système Cérabec</p>
        </header>

        <section class="karine-doc-section karine-doc-section--letter" aria-labelledby="karine-open">
          <h2 id="karine-open" class="karine-doc-h2 karine-doc-h2--soft">À toi</h2>
          <p class="karine-doc-p karine-doc-p--salutation">Karine,</p>
          <p class="karine-doc-p">Ce que tu vois ici, ce n’est pas juste un outil.<br />Ce n’est pas juste un projet.</p>
          <p class="karine-doc-p">
            C’est quelque chose que j’ai construit avec l’idée qu’un jour,<br />quelqu’un pourrait s’appuyer dessus pour aller plus loin.
          </p>
          <p class="karine-doc-p karine-doc-p--emph">Et cette personne, c’est toi.</p>
        </section>

        <section class="karine-doc-section" aria-labelledby="karine-b2">
          <h2 id="karine-b2" class="karine-doc-h2">Ce que représente ce système</h2>
          <p class="karine-doc-p">
            Avec le temps, on a accumulé de l’expérience, des façons de faire,<br />des erreurs, des réussites, des décisions prises dans le feu de l’action.
          </p>
          <p class="karine-doc-p">
            Tout ça, souvent, ça reste dans la tête des gens.<br />Et quand ça disparaît, l’entreprise recule.
          </p>
          <p class="karine-doc-p karine-doc-pull"><span class="karine-doc-finger" aria-hidden="true">👉</span> Ce système, c’est l’inverse.</p>
          <p class="karine-doc-p karine-doc-pull">
            <span class="karine-doc-finger" aria-hidden="true">👉</span> C’est une façon de <strong>garder la mémoire de Cérabec</strong>,<br />de la structurer, de la rendre utile, et de la faire évoluer.
          </p>
        </section>

        <section class="karine-doc-section" aria-labelledby="karine-b3">
          <h2 id="karine-b3" class="karine-doc-h2">Ce qu’il contient vraiment</h2>
          <p class="karine-doc-p">Derrière les écrans, il y a :</p>
          <ul class="karine-doc-ul">
            <li>notre façon de gérer les clients</li>
            <li>notre façon de faire les soumissions</li>
            <li>notre façon d’organiser le travail</li>
            <li>notre façon de prendre des décisions</li>
            <li>notre façon de voir l’entreprise</li>
          </ul>
          <p class="karine-doc-p karine-doc-pull"><span class="karine-doc-finger" aria-hidden="true">👉</span> C’est notre savoir-faire… mis en structure.</p>
        </section>

        <section class="karine-doc-section" aria-labelledby="karine-b4">
          <h2 id="karine-b4" class="karine-doc-h2">Ton rôle</h2>
          <p class="karine-doc-p">Tu n’es pas là pour utiliser un système.</p>
          <p class="karine-doc-p karine-doc-pull"><span class="karine-doc-finger" aria-hidden="true">👉</span> Tu es là pour le faire vivre.</p>
          <p class="karine-doc-p">Ça veut dire :</p>
          <ul class="karine-doc-ul">
            <li>t’assurer qu’il est utilisé comme il faut</li>
            <li>voir ce qui ne fonctionne pas</li>
            <li>l’améliorer avec le temps</li>
            <li>adapter les processus à la réalité</li>
            <li>garder ce qui fonctionne</li>
            <li>corriger ce qui dérape</li>
          </ul>
          <p class="karine-doc-p karine-doc-pull"><span class="karine-doc-finger" aria-hidden="true">👉</span> Tu deviens le lien entre l’entreprise et sa structure.</p>
        </section>

        <section class="karine-doc-section" aria-labelledby="karine-b5">
          <h2 id="karine-b5" class="karine-doc-h2">Ce que ça implique</h2>
          <p class="karine-doc-p">Ce système va évoluer.</p>
          <p class="karine-doc-p">
            Avec le temps, il va intégrer plus d’intelligence,<br />plus d’automatisation, plus de clarté.
          </p>
          <p class="karine-doc-p karine-doc-pull"><span class="karine-doc-finger" aria-hidden="true">👉</span> Et toi, tu vas être au centre de ça.</p>
          <p class="karine-doc-p">
            Pas comme une exécutante,<br />mais comme quelqu’un qui comprend comment ça fonctionne…<br />et comment ça peut devenir meilleur.
          </p>
        </section>

        <section class="karine-doc-section" aria-labelledby="karine-b6">
          <h2 id="karine-b6" class="karine-doc-h2">La valeur de ce qui a été construit</h2>
          <p class="karine-doc-p">Ce système représente aujourd’hui un actif réel pour l’entreprise.</p>
          <p class="karine-doc-p">Il inclut :</p>
          <ul class="karine-doc-ul">
            <li>CRM structuré</li>
            <li>Processus (7 modules)</li>
            <li>Gestion opérationnelle</li>
            <li>Cockpit stratégique</li>
            <li>Base pour intelligence (<span class="karine-doc-ia">Cerabec_IA</span>)</li>
          </ul>
          <p class="karine-doc-pull karine-doc-pull--spaced"><span class="karine-doc-finger" aria-hidden="true">👉</span> Valeur estimée sur le marché :</p>
          <p class="karine-doc-figure">80 000 $ à 120 000 $</p>
        </section>

        <section class="karine-doc-section" aria-labelledby="karine-b7">
          <h2 id="karine-b7" class="karine-doc-h2">Comprendre sa valeur en étapes</h2>
          <ul class="karine-doc-steps karine-doc-steps--plain">
            <li><span class="karine-step-label">Fondation</span> <span class="karine-step-price">10 000 $</span></li>
            <li><span class="karine-step-label">CRM</span> <span class="karine-step-price">20 000 $</span></li>
            <li><span class="karine-step-label">Processus</span> <span class="karine-step-price">15 000 $</span></li>
            <li><span class="karine-step-label">Opérations</span> <span class="karine-step-price">15 000 $</span></li>
            <li><span class="karine-step-label">Cockpit</span> <span class="karine-step-price">10 000 $</span></li>
            <li><span class="karine-step-label">Intelligence (Cerabec_IA)</span> <span class="karine-step-price">20 000 $</span></li>
          </ul>
          <p class="karine-doc-pull karine-doc-pull--spaced"><span class="karine-doc-finger" aria-hidden="true">👉</span> Valeur structurée :</p>
          <p class="karine-doc-figure karine-doc-figure--secondary">≈ 90 000 $</p>
        </section>

        <section class="karine-doc-section" aria-labelledby="karine-b8">
          <h2 id="karine-b8" class="karine-doc-h2">Reconnaissance du projet</h2>
          <p class="karine-doc-p">Ce qui a été construit ici dépasse un simple outil.</p>
          <p class="karine-doc-p">C’est une transformation de la façon dont l’entreprise fonctionne.</p>
          <p class="karine-doc-pull karine-doc-pull--spaced"><span class="karine-doc-finger" aria-hidden="true">👉</span> Valeur reconnue pour la réalisation :</p>
          <p class="karine-doc-figure">50 000 $ à 80 000 $</p>
        </section>

        <section class="karine-doc-section" aria-labelledby="karine-b9">
          <h2 id="karine-b9" class="karine-doc-h2">Ta place dans la suite</h2>
          <p class="karine-doc-p">Ton rôle a une valeur réelle dans le temps.</p>
          <p class="karine-doc-p">Parce que :</p>
          <p class="karine-doc-p karine-doc-pull"><span class="karine-doc-finger" aria-hidden="true">👉</span> ce n’est pas le système qui crée de la valeur seul</p>
          <p class="karine-doc-p karine-doc-pull"><span class="karine-doc-finger" aria-hidden="true">👉</span> c’est la façon dont il est utilisé, maintenu et amélioré</p>
        </section>

        <section class="karine-doc-section" aria-labelledby="karine-b10">
          <h2 id="karine-b10" class="karine-doc-h2">Ta reconnaissance</h2>
          <p class="karine-doc-p">Plusieurs façons peuvent reconnaître ce que tu vas apporter :</p>
          <div class="karine-options">
            <div class="karine-option-block">
              <h3 class="karine-doc-h3">Option 1 — stabilité</h3>
              <p class="karine-doc-option-amount">500 $ à 2 000 $ / mois</p>
            </div>
            <div class="karine-option-block">
              <h3 class="karine-doc-h3">Option 2 — performance</h3>
              <p class="karine-doc-option-amount">2 % à 5 % de la croissance liée au système</p>
            </div>
            <div class="karine-option-block">
              <h3 class="karine-doc-h3">Option 3 — reconnaissance annuelle</h3>
              <p class="karine-doc-p karine-doc-p--tight">Bonus basé sur les résultats réels</p>
            </div>
          </div>
          <p class="karine-doc-pull karine-doc-pull--spaced"><span class="karine-doc-finger" aria-hidden="true">👉</span> L’idée est simple :</p>
          <p class="karine-doc-p karine-doc-p--emph">
            Tu ne fais pas juste utiliser le système,<br />tu participes à sa valeur dans le temps.
          </p>
        </section>

        <section class="karine-doc-section" aria-labelledby="karine-b11">
          <h2 id="karine-b11" class="karine-doc-h2">Vision</h2>
          <p class="karine-doc-p">Ce système est une base.</p>
          <p class="karine-doc-p">Il permet :</p>
          <ul class="karine-doc-ul">
            <li>de structurer l’entreprise</li>
            <li>d’améliorer les décisions</li>
            <li>de réduire les erreurs</li>
            <li>d’augmenter les résultats</li>
            <li>d’évoluer vers une intelligence propre à Cérabec</li>
          </ul>
          <p class="karine-doc-ia-closing" aria-label="Cerabec_IA"><span class="karine-doc-ia">Cerabec_IA</span></p>
        </section>

        <section class="karine-doc-section karine-doc-section--letter" aria-labelledby="karine-b12">
          <h2 id="karine-b12" class="karine-doc-h2 karine-doc-h2--soft">Ce que je te laisse</h2>
          <p class="karine-doc-p">Je ne te laisse pas juste un outil.</p>
          <ul class="karine-doc-leave-list">
            <li><span class="karine-doc-finger" aria-hidden="true">👉</span> Je te laisse une structure</li>
            <li><span class="karine-doc-finger" aria-hidden="true">👉</span> Je te laisse une façon de voir</li>
            <li><span class="karine-doc-finger" aria-hidden="true">👉</span> Je te laisse quelque chose que tu peux faire évoluer</li>
          </ul>
        </section>

        <section class="karine-doc-section" aria-labelledby="karine-b13">
          <h2 id="karine-b13" class="karine-doc-h2">Important</h2>
          <p class="karine-doc-p karine-doc-pull"><span class="karine-doc-finger" aria-hidden="true">👉</span> Ce document est à toi.</p>
          <p class="karine-doc-p">Il représente :</p>
          <ul class="karine-doc-ul">
            <li>une confiance</li>
            <li>une vision</li>
            <li>et une responsabilité</li>
          </ul>
        </section>

        <section class="karine-doc-section karine-doc-section--closing" aria-labelledby="karine-b14">
          <h2 id="karine-b14" class="karine-doc-h2 karine-doc-h2--soft">Dernière chose</h2>
          <p class="karine-doc-p karine-doc-p--emph">
            Prends ce système, comprends-le,<br />et fais-en quelque chose qui te ressemble.
          </p>
        </section>

        <footer class="karine-doc-footer">
          <button type="button" class="karine-logout-btn" data-karine-logout>Quitter cet espace (verrouiller)</button>
        </footer>
      </article>
    `;
  }

  function pageEspaceKarine() {
    if (!karineIsUnlocked()) {
      return renderKarineGateHtml();
    }
    return renderKarineProtectedHtml();
  }

  function pageDashboard() {
    return `
      ${moduleIntro(
        "Dashboard",
        [
          "Indicateurs de performance dispersés",
          "Suivi des projets manuel",
          "Peu de priorisation",
          "Manque de visibilité globale",
        ],
        [
          "Vue centralisée en temps réel",
          "Détection automatique des problèmes",
          "Priorisation intelligente",
          "Recommandations immédiates",
        ]
      )}
      <section class="hero-dashboard" aria-labelledby="hero-title">
        <h2 id="hero-title" class="hero-title">Système de gestion intelligent</h2>
        <p class="hero-lead">
          Scénario démo : suivez le dossier <strong>Restaurant La Piazza</strong> de la première entrée à la facturation —
          NatCORE + Marcel_IA au service de Céra-Bec (céramique commerciale, pose clé en main).
        </p>
        <ul class="hero-ctx">
          <li>Lead → Soumission → Opportunité → Planification → Facturation</li>
          <li>Même client partout : La Piazza</li>
          <li>Actions concrètes à chaque étape</li>
        </ul>
      </section>
      <h2 class="page-title">Dashboard</h2>
      <div class="recent-project" role="status">
        <span class="recent-project-icon" aria-hidden="true">📋</span>
        <div class="recent-project-body">
          <div class="recent-project-label">Projet en cours</div>
          <div class="recent-project-text">Restaurant La Piazza — 18&nbsp;000&nbsp;$</div>
        </div>
      </div>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Opportunités détectées</div>
          <div class="kpi-value accent">3</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Valeur dossier vedette</div>
          <div class="kpi-value success">18&nbsp;000&nbsp;$</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Projets actifs</div>
          <div class="kpi-value">5</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Alertes (La Piazza)</div>
          <div class="kpi-value warning">2</div>
        </div>
      </div>
      <section class="marcel-ia-band" aria-labelledby="marcel-ia-jour">
        <h2 id="marcel-ia-jour">🧠 Marcel_IA — Analyse du jour</h2>
        <ul>
          <li>3 opportunités détectées dans le pipeline (dont La Piazza en phase critique prix / marge).</li>
          <li>1 client à relancer : <strong>Restaurant La Piazza</strong> — réponse attendue sur la soumission.</li>
          <li>Marge projet <strong>La Piazza</strong> sous la moyenne Céra-Bec de <strong>8&nbsp;%</strong> — ajuster avant engagement final.</li>
        </ul>
      </section>
      ${storyFlowHint()}
      ${triPanels("dashboard", {
        marche: [
          "Restauration commerciale : forte usure salle principale ; céramique grand format demandée (comparables régionaux).",
          "Problème : votre devis La Piazza est légèrement sous le panier moyen marché — risque de manger la marge.",
        ],
        natcore: [
          "NatCORE relie entrée, soumission, opportunité, planning et facture sur une seule fiche La Piazza.",
          "Historique des versions de devis et jalons d’équipe synchronisés (équipe 2, 3 jours planifiés).",
        ],
        marcel_ia: [
          "Priorité : sécuriser marge et prix avant signature — scénario perte estimée ~1&nbsp;400&nbsp;$ si inchangé.",
          "Action : relance La Piazza aujourd’hui + proposer variante matériau ou révision prix (voir module Soumissions).",
        ],
      })}
    `;
  }

  function pageEntrees() {
    return `
      ${moduleIntro(
        "Entrées",
        [
          "Demandes clients non structurées",
          "Perte de leads fréquente",
          "Suivi manuel",
          "Priorisation difficile",
        ],
        [
          "Capture centralisée des demandes",
          "Qualification intelligente",
          "Priorisation automatique",
          "Suivi structuré",
        ]
      )}
      <h2 class="page-title">Entrées</h2>
      ${clientSpotlightLaPiazza()}
      <div class="story-detail">
        <strong>Entrée enregistrée</strong> — Restaurant La Piazza<br />
        Canal : <strong>appel téléphonique</strong> + <strong>demande d’estimation</strong> (visite photos salle principale).
      </div>
      ${marcelIaTip(["Lead chaud détecté — probabilité de conversion estimée à 78 % (démo scoring)."], "bulb")}
      ${storyFlowHint()}
      ${triPanels("entrees", {
        marche: [
          "Secteur restauration : décideurs pressés ; fenêtre courte entre estimation et ouverture saisonnière.",
          "Signal faiblesse : concurrence 2 poseurs locaux cités par le client au téléphone.",
        ],
        natcore: [
          "Fiche La Piazza créée : source téléphone + demande estimation, pièces jointes photos classées.",
          "Routage NatCORE vers qualification commerciale et gabarit soumission céramique commerciale.",
        ],
        marcel_ia: [
          "Marcel_IA : scorer 78&nbsp;% — proposer rappel sous 24&nbsp;h et créneau visite technique express.",
          "Éviter la dérive : verrouiller périmètre pi² et niveau de finition dès la prochaine interaction.",
        ],
      })}
      ${actionStrip(["Qualifier surface exacte (validation sur place) avant chiffrage final.", "Assigner le dossier à l’estimateur céramique commercial."])}
    `;
  }

  function pageSoumissions() {
    return `
      ${moduleIntro(
        "Soumissions",
        [
          "Calculs manuels",
          "Dépend de l’expérience",
          "Risque d’erreur de prix",
          "Peu de validation",
        ],
        [
          "Validation automatique des prix",
          "Comparaison avec le marché",
          "Détection de pertes",
          "Ajustements suggérés",
        ]
      )}
      <h2 class="page-title">Soumissions</h2>
      ${clientSpotlightLaPiazza()}
      <div class="story-detail">
        <strong>Projet :</strong> Restaurant La Piazza<br />
        <strong>Surface :</strong> 1&nbsp;200&nbsp;pi² — salle principale<br />
        <strong>Type :</strong> céramique commerciale (trafic élevé, finition antidérapante)
      </div>
      ${storyProblem(["Marge faible sur la ligne principale du devis.", "Prix global légèrement sous le comparatif marché (céramique pro)."])}
      ${marcelIaTip([
        "Prix environ 8 % sous la moyenne des soumissions équivalentes (démo).",
        "Potentiel de perte sur marge si acceptation telle quelle : ~1 400 $.",
      ])}
      ${actionStrip(["Ajuster le prix (lignes main-d’œuvre ou marge matériau).", "Proposer un upgrade matériau (durabilité / image) pour justifier l’écart."])}
      ${storyFlowHint()}
      ${triPanels("soumissions", {
        marche: [
          "Benchmark : fournisseurs céramique pro — votre position est agressive sur le prix, pas sur la valeur perçue.",
          "Problème : sous-marché = bon taux de signature mais marge Céra-Bec en tension.",
        ],
        natcore: [
          "Devis La Piazza v2 en NatCORE : lignes surface, colle, nivelage, délais équipe 2 verrouillés.",
          "Comparaison automatique avec marge cible famille « céramique commerciale ».",
        ],
        marcel_ia: [
          "Marcel_IA : deux leviers — remonter prix 4–6&nbsp;% ou basculer vers gamme supérieure argumentée.",
          "Simuler impact : récupérer ~800–1&nbsp;200&nbsp;$ de marge sans sortir du spectre marché.",
        ],
      })}
      <section class="module-ctx module-ctx--compact" aria-label="Autres familles de revêtements">
        <h3 class="module-ctx-title">Autres familles (catalogue Céra-Bec)</h3>
        <p class="module-ctx-inline">Céramique · Vinyle · Bois franc · Tapis — ici le dossier est <strong>100&nbsp;% La Piazza / céramique</strong>.</p>
      </section>
    `;
  }

  function pageOpportunites() {
    return `
      ${moduleIntro(
        "Opportunités",
        [
          "Suivi manuel",
          "Relances oubliées",
          "Manque de visibilité",
          "Peu de structure",
        ],
        [
          "Suivi automatisé",
          "Rappels intelligents",
          "Priorisation des ventes",
          "Vision claire du pipeline",
        ]
      )}
      <h2 class="page-title">Opportunités</h2>
      ${clientSpotlightLaPiazza()}
      <p class="story-detail"><strong>Pipeline — Restaurant La Piazza</strong></p>
      <ul class="pipeline-steps" aria-label="Étapes pipeline">
        <li>Soumission envoyée</li>
        <li class="is-current">En attente de réponse</li>
      </ul>
      ${marcelIaTip(["Client prêt à acheter — relance recommandée aujourd’hui (fenêtre décision courte)."])}
      ${storyFlowHint()}
      ${triPanels("opportunites", {
        marche: [
          "Comportement d’achat restauration : validation souvent en 1 appel si le créneau installation est proposé.",
          "Problème : silence 48&nbsp;h = risque de glissement vers un concurrent déjà cité au lead.",
        ],
        natcore: [
          "Étape NatCORE : « Soumission envoyée » → tâche relance J+0 avec script et trace horodatée.",
          "Lien direct vers planification équipe 2 (3 jours) dès accord verbal enregistré.",
        ],
        marcel_ia: [
          "Marcel_IA : fenêtre optimale de contact entre 10&nbsp;h et 11&nbsp;h — taux de réponse démo +22&nbsp;%.",
          "Action : appel + envoi récap 3 bullets (prix révisé optionnel, dates équipe 2, garantie pose).",
        ],
      })}
      ${actionStrip(["Appeler le gérant de La Piazza aujourd’hui.", "Proposer créneau de signature ou contre-proposition encadrée."])}
    `;
  }

  function pagePlanification() {
    return `
      ${moduleIntro(
        "Planification",
        [
          "Planification manuelle",
          "Conflits fréquents",
          "Ajustements tardifs",
          "Peu d’optimisation",
        ],
        [
          "Optimisation automatique",
          "Détection des conflits",
          "Ajustements suggérés",
          "Meilleure utilisation des équipes",
        ]
      )}
      <h2 class="page-title">Planification</h2>
      ${clientSpotlightLaPiazza()}
      <div class="story-detail">
        <strong>Installation prévue — La Piazza</strong><br />
        <strong>Équipe :</strong> équipe 2 · <strong>Durée :</strong> 3 jours (démo calendrier)<br />
        Fenêtre : après acceptation soumission et réception matériau.
      </div>
      ${marcelIaTip([
        "Conflit détecté avec un autre chantier (chevauchement partiel équipe 2 — démo).",
        "Optimisation possible : réorganiser le mardi — +1 journée gagnée sur la semaine sans surcharger la crew.",
      ])}
      ${mobileTerrainSection({
        explain:
          "Les remontées terrain sur mobile alimentent ce calendrier en temps réel : visibilité sans appeler l’équipe, meilleure planification, moins de surprises.",
        marcel_ia:
          "Marcel_IA croise la mise à jour équipe 2 avec le Gantt La Piazza : si le retard matériaux se confirme, proposer un glissement contrôlé d’une demi-journée et prévenir le client automatiquement dans NatCORE.",
        timeNote: "Synchronisé depuis mobile — Équipe 2 — aujourd’hui 16:42",
      })}
      ${storyFlowHint()}
      ${triPanels("planification", {
        marche: [
          "Charge secteur commercial : pics avant saison — mieux vaut verrouiller équipes tôt sur La Piazza.",
          "Problème : chevauchement léger = risque retard perception client restauration.",
        ],
        natcore: [
          "NatCORE affiche Gantt simplifié : équipe 2, 3 jours, dépendances livraison céramique.",
          "Alerte auto si autre projet consomme les mêmes ressources le même créneau.",
        ],
        marcel_ia: [
          "Marcel_IA : décaler chantier secondaire d’une demi-journée libère La Piazza sans OT.",
          "Action : valider avec chef d’équipe 2 et notifier le client d’un créneau plus tôt possible.",
        ],
      })}
      ${actionStrip(["Appliquer la permutation suggérée (mardi) pour dégager le conflit.", "Confirmer date au client La Piazza par message traceable."])}
    `;
  }

  function pageFacturation() {
    return `
      ${moduleIntro(
        "Facturation",
        [
          "Suivi financier après coup",
          "Erreurs possibles",
          "Peu d’analyse",
          "Manque de visibilité",
        ],
        [
          "Suivi en temps réel",
          "Analyse de rentabilité",
          "Alertes automatiques",
          "Meilleur contrôle financier",
        ]
      )}
      <h2 class="page-title">Facturation</h2>
      ${clientSpotlightLaPiazza()}
      <div class="story-detail">
        <strong>Facture (démo)</strong> — Restaurant La Piazza<br />
        Montant : <strong>18&nbsp;000&nbsp;$</strong> TTC selon hypothèses devis actuel.
      </div>
      ${storyProblem(["Marge faible sur ce montant — cohérent avec l’alerte soumission (prix serré)."])}
      ${marcelIaTip([
        "Projet moins rentable que la moyenne du portefeuille Céra-Bec sur la même famille de revêtements.",
        "Ajustement recommandé sur les prochains extras ou contrats récurrents avec ce client.",
      ])}
      ${storyFlowHint()}
      ${triPanels("facturation", {
        marche: [
          "DSO cible restauration : court si relation de confiance ; veiller aux acomptes matériau lourds.",
          "Problème : marge réalisée sous le standard interne — impact EBITDA du dossier visible en fin de mois.",
        ],
        natcore: [
          "Facture La Piazza générée depuis bon de fin de chantier + lignes devis approuvées.",
          "Export comptable et lien vers marge réalisée vs marge prévue (écart coloré).",
        ],
        marcel_ia: [
          "Marcel_IA : flag « marge basse » — alimenter le playbook négociation sur le prochain projet du même groupe.",
          "Action : bilan interne rapide (1 page) avant de répliquer le modèle prix sur un autre resto.",
        ],
      })}
      ${actionStrip(["Documenter l’écart marge pour la revue commerciale.", "Ajuster grille prix « céramique pro » si le pattern se répète."])}
    `;
  }

  function pageSuivi() {
    return `
      ${moduleIntro(
        "Suivi client",
        [
          "Peu structuré",
          "Relances oubliées",
          "Opportunités perdues",
          "Peu automatisé",
        ],
        [
          "Suivi automatisé",
          "Détection d’opportunités futures",
          "Gestion des références",
          "Relation client améliorée",
        ]
      )}
      <h2 class="page-title">Suivi client</h2>
      ${clientSpotlightLaPiazza()}
      <div class="story-detail">
        <strong>Statut — Restaurant La Piazza</strong>
        <ul>
          <li>Projet (démo) : <strong>terminé</strong> — pose livrée, reprises mineures closes.</li>
          <li>Satisfaction : <strong>inconnue</strong> — aucun NPS ni commentaire enregistré à ce jour.</li>
        </ul>
      </div>
      ${marcelIaTip([
        "Demander un feedback structuré (2 questions + note) pendant que le souvenir du chantier est frais.",
        "Potentiel de référence élevé : resto visible, fort bouche-à-oreille local si satisfait.",
      ])}
      ${storyFlowHint()}
      ${triPanels("suivi", {
        marche: [
          "La Piazza peut influencer d’autres commerces du même pôle — la preuve sociale locale compte double.",
          "Problème : sans mesure satisfaction, vous ne savez pas si le risque marge a été « oublié » côté client.",
        ],
        natcore: [
          "Campagne suivi NatCORE : enquête 48&nbsp;h post-chantier + rappel J+7 si pas de réponse.",
          "Fiche client enrichie : photos finales, garantie, contacts pour entretien.",
        ],
        marcel_ia: [
          "Marcel_IA : proposer texto court + lien sondage 30&nbsp;s — taux de réponse démo supérieur aux longs courriels.",
          "Si note ≥ 9/10 : déclencher demande d’avis Google / référence écrite.",
        ],
      })}
      ${actionStrip(["Envoyer l’enquête satisfaction La Piazza.", "Si retour positif : demande de témoignage ou référence nommée."])}
    `;
  }

  function pageClients() {
    return `
      ${moduleIntro(
        "Clients",
        ["Relation client souvent fragmentée", "Informations dispersées", "Suivi difficile"],
        ["Centralisation du dossier client", "Vision complète du projet", "Continuité entre étapes"],
        {
          col1Title: "Marché",
          col2Title: "NatCORE + Marcel_IA",
          col3Title: "Impact",
          col3Items: ["Meilleur suivi", "Meilleure compréhension", "Meilleure conversion"],
        }
      )}
      <h2 class="page-title">Clients</h2>
      ${clientSpotlightLaPiazza()}
      <div class="story-detail">
        <strong>Fiche active — Restaurant La Piazza</strong><br />
        Contact décisionnel : gérant · Secteur : restauration · Dossier ouvert depuis l’entrée téléphonique + demande d’estimation.<br />
        Prochain jalon : <strong>réponse soumission</strong> puis verrouillage <strong>équipe 2 · 3 jours</strong>.
      </div>
      ${storyFlowHint()}
      ${triPanels("clients", {
        marche: [
          "Compte stratégique : vitrine commerciale — une belle salle = photos portfolio Céra-Bec.",
          "Problème : sensibilité prix élevée ; la marge doit être protégée par la valeur (durée, garantie, matériau).",
        ],
        natcore: [
          "Vue 360° NatCORE : entrées, devis, opportunité, planning, facture et suivi sur une timeline La Piazza.",
          "Documents centralisés : plans simplifiés, photos avant, versions de soumission.",
        ],
        marcel_ia: [
          "Marcel_IA : maintenir une communication pro-active jusqu’à feedback post-chantier.",
          "Action : une fois La Piazza clos : basculer le contact en « ambassadeur potentiel » avec suivi léger trimestriel.",
        ],
      })}
    `;
  }

  function pageInstallations() {
    return `
      ${moduleIntro(
        "Installations",
        [
          "Communication difficile terrain/bureau",
          "Informations tardives",
          "Suivi imprécis",
          "Problèmes détectés trop tard",
        ],
        [
          "Mise à jour terrain en temps réel",
          "Suivi précis des chantiers",
          "Détection automatique des retards",
          "Analyse immédiate",
        ]
      )}
      <h2 class="page-title">📱 Installations</h2>
      ${clientSpotlightLaPiazza()}
      ${mobileTerrainSection({
        explain:
          "Les équipes peuvent mettre à jour leur journée directement sur leur téléphone, en moins de 30 secondes. L’information remonte dans Cerabec, et Marcel_IA l’analyse en temps réel : fin des surprises, communication simplifiée.",
        marcel_ia:
          "Risque de retard détecté sur ce projet. Réorganisation recommandée pour éviter un décalage global.",
      })}
      ${storyFlowHint()}
      ${triPanels("installations", {
        marche: [
          "Chantier La Piazza : accès salle hors heures d’ouverture — coordination livraisons céramique critique.",
          "Problème : toute casse grand format retarde l’équipe 2 sur ses 3 jours planifiés.",
        ],
        natcore: [
          "Checklist NatCORE pré-chantier : sous-couche, humidité, température, protection mobilier.",
          "Remontées mobile horodatées : avancement, statut, incidents — même fiche que le bureau (démo).",
          "Bon de fin de travaux lié à la facture 18&nbsp;000&nbsp;$ (démo).",
        ],
        marcel_ia: [
          "Marcel_IA : photo journalière recommandée pour preuve d’avancement et réduction litiges.",
          "Action : valider créneaux nocturnes avec le client avant J-3.",
        ],
      })}
      ${actionStrip([
        "Accuser réception de la remontée équipe 2 et prioriser la livraison céramique.",
        "Notifier le client La Piazza si le créneau J+3 doit être ajusté.",
      ])}
    `;
  }

  const PROCESS_KEYS = [
    "entree",
    "soumission",
    "opportunites",
    "planification",
    "installation",
    "facturation",
    "suivi",
  ];

  const PROCESS_LABELS = {
    entree: "Entrée",
    soumission: "Soumission",
    opportunites: "Opportunités",
    planification: "Planification",
    installation: "Installation",
    facturation: "Facturation",
    suivi: "Suivi",
  };

  function pmGlobalFlow() {
    return `
      <div class="pm-flow">
        <h2 class="pm-flow-title">🔄 Processus global</h2>
        <div class="pm-flow-line" aria-label="Chaîne de processus">
          <span>Entrée</span>
          <span class="pm-flow-arrow" aria-hidden="true">→</span>
          <span>Soumission</span>
          <span class="pm-flow-arrow" aria-hidden="true">→</span>
          <span>Opportunité</span>
          <span class="pm-flow-arrow" aria-hidden="true">→</span>
          <span>Planification</span>
          <span class="pm-flow-arrow" aria-hidden="true">→</span>
          <span>Installation</span>
          <span class="pm-flow-arrow" aria-hidden="true">→</span>
          <span>Facturation</span>
          <span class="pm-flow-arrow" aria-hidden="true">→</span>
          <span>Suivi</span>
        </div>
      </div>
    `;
  }

  function pmTabs(activeKey = "entree") {
    return `
      <div class="pm-tabs" role="tablist" aria-label="Processus Cerabec">
        ${PROCESS_KEYS.map(
          (key) => `
        <button
          type="button"
          class="pm-tab${key === activeKey ? " active" : ""}"
          data-process="${key}"
          role="tab"
          aria-selected="${key === activeKey ? "true" : "false"}"
        >
          ${escapeDisplayText(PROCESS_LABELS[key] || key)}
        </button>`
        ).join("")}
      </div>
    `;
  }

  function pmSectionCard(title, bodyHtml, featured) {
    return `
        <section class="pm-section-card${featured ? " pm-section-card--featured" : ""}">
          <h3>${title}</h3>
          <div class="pm-section-body">${bodyHtml}</div>
        </section>`;
  }

  function renderProcessSpec(spec) {
    const kicker = spec.kicker || "Manuel opérationnel";
    const shellClass = spec.shellClass || "";
    const cards = spec.sections.map((s) => pmSectionCard(s.title, s.html, s.featured)).join("");
    return `
    <div class="pm-process-shell${shellClass ? " " + shellClass : ""}">
      <div class="pm-process-header">
        <div class="pm-process-kicker">${escapeDisplayText(kicker)}</div>
        <h2>${escapeDisplayText(spec.h2)}</h2>
        <p class="pm-process-intro">${spec.intro}</p>
      </div>
      <div class="pm-process-grid">${cards}</div>
    </div>`;
  }

  function getProcessManualSpec(processKey) {
    const L = PROCESS_LABELS[processKey] || "Processus";
    const specs = {
      entree: {
        h2: `Processus — ${PROCESS_LABELS.entree}`,
        intro:
          "Qualifier rapidement toute demande entrante et décider si elle mérite une soumission — référence opérationnelle pour vente et accueil.",
        sections: [
          {
            title: "🎯 Objectif du processus",
            html: "<p>Qualifier rapidement toute demande entrante et décider si elle mérite une soumission.</p>",
          },
          {
            title: "📍 Portée et contexte",
            html: `<p><strong>Sources d’entrée</strong></p>
<ul class="pm-ul">
<li>Appel client</li>
<li>Email</li>
<li>Référence interne</li>
<li>Visite en salle de montre</li>
<li>Formulaire web</li>
</ul>`,
          },
          {
            title: "🚀 Déclencheur et entrées",
            html: "<p>Toute nouvelle demande client ou piste non encore enregistrée dans le CRM. Priorité : ne rien perdre, tout tracer.</p>",
          },
          {
            title: "🔁 Étapes détaillées",
            featured: true,
            html: `<p class="pm-step-label"><strong>🎯 Objectif</strong></p>
<p>Créer un point d’entrée structuré pour tout nouveau prospect, projet ou demande client afin de :</p>
<ul class="pm-ul">
<li>capter l’information minimale utile</li>
<li>qualifier rapidement l’opportunité</li>
<li>éviter les pertes de temps sur les dossiers non pertinents</li>
<li>orienter le dossier vers la bonne suite opérationnelle</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🔔 1. Déclencheurs d’entrée</strong></p>
<p>Une entrée peut être créée à partir de :</p>
<ul class="pm-ul">
<li>appel téléphonique entrant</li>
<li>visite en salle de montre</li>
<li>formulaire web</li>
<li>référence d’un client</li>
<li>message texte / courriel</li>
<li>visite terrain</li>
<li>demande interne d’un vendeur</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🧾 2. Informations minimales obligatoires à capter</strong></p>
<p class="pm-step-label"><strong>Identité du client</strong></p>
<ul class="pm-ul">
<li>nom complet</li>
<li>nom de l’entreprise (si applicable)</li>
<li>numéro de téléphone principal</li>
<li>courriel</li>
<li>mode de contact préféré</li>
</ul>
<p class="pm-step-label"><strong>Contexte du projet</strong></p>
<ul class="pm-ul">
<li>type de projet
  <ul class="pm-ul pm-ul-nested">
    <li>résidentiel</li>
    <li>commercial</li>
    <li>rénovation</li>
    <li>construction neuve</li>
  </ul>
</li>
<li>catégorie de zone
  <ul class="pm-ul pm-ul-nested">
    <li>plancher</li>
    <li>mur</li>
    <li>salle de bain</li>
    <li>douche</li>
    <li>cuisine</li>
    <li>extérieur</li>
    <li>autre</li>
  </ul>
</li>
<li>localisation du projet
  <ul class="pm-ul pm-ul-nested">
    <li>adresse complète ou secteur</li>
    <li>ville</li>
    <li>code postal si disponible</li>
  </ul>
</li>
</ul>
<p class="pm-step-label"><strong>Portée initiale</strong></p>
<ul class="pm-ul">
<li>description courte du besoin</li>
<li>surface approximative si connue</li>
<li>matériaux visés si déjà mentionnés</li>
<li>présence ou non d’installateur</li>
<li>besoin produit seulement ou produit + installation</li>
</ul>
<p class="pm-step-label"><strong>Données de faisabilité</strong></p>
<ul class="pm-ul">
<li>budget approximatif</li>
<li>échéancier souhaité</li>
<li>date cible de début</li>
<li>niveau d’urgence</li>
<li>source du lead
  <ul class="pm-ul pm-ul-nested">
    <li>publicité</li>
    <li>référence</li>
    <li>client existant</li>
    <li>web</li>
    <li>autre</li>
  </ul>
</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>⚡ 3. Qualification rapide</strong></p>
<p class="pm-step-label"><strong>Évaluation du sérieux</strong></p>
<ul class="pm-ul">
<li>client en exploration générale</li>
<li>client en comparaison active</li>
<li>client prêt à avancer rapidement</li>
<li>client prêt à acheter / signer</li>
</ul>
<p class="pm-step-label"><strong>Évaluation de compatibilité Cerabec</strong></p>
<ul class="pm-ul">
<li>type de projet compatible avec l’offre</li>
<li>budget potentiellement réaliste</li>
<li>territoire desservi</li>
<li>complexité compatible avec les ressources disponibles</li>
<li>type de matériau ou service offert par Cerabec</li>
</ul>
<p class="pm-step-label"><strong>Évaluation du délai</strong></p>
<ul class="pm-ul">
<li>immédiat</li>
<li>court terme (0–30 jours)</li>
<li>moyen terme (1–3 mois)</li>
<li>long terme / non planifié</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📊 4. Données structurées à enregistrer</strong></p>
<p>Champs principaux recommandés :</p>
<ul class="pm-ul">
<li>entry_id</li>
<li>created_at</li>
<li>created_by</li>
<li>assigned_to</li>
<li>client_name</li>
<li>company_name</li>
<li>phone</li>
<li>email</li>
<li>preferred_contact_method</li>
<li>project_type</li>
<li>project_zone</li>
<li>project_address</li>
<li>project_city</li>
<li>project_postal_code</li>
<li>project_scope_summary</li>
<li>estimated_surface_value</li>
<li>estimated_surface_unit</li>
<li>needs_installation</li>
<li>has_installer</li>
<li>desired_materials</li>
<li>approximate_budget</li>
<li>budget_confidence_level</li>
<li>desired_start_date</li>
<li>desired_completion_window</li>
<li>urgency_level</li>
<li>lead_source</li>
<li>seriousness_level</li>
<li>fit_with_cerabec</li>
<li>qualification_status</li>
<li>missing_information</li>
<li>internal_notes</li>
<li>next_action</li>
<li>next_action_due_at</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>⚖️ 5. Logique de classification</strong></p>
<p class="pm-step-label"><strong>🔴 Non pertinent</strong></p>
<ul class="pm-ul">
<li>projet hors territoire</li>
<li>budget incompatible</li>
<li>demande hors services</li>
<li>client non sérieux</li>
</ul>
<p><strong>Action :</strong></p>
<ul class="pm-ul">
<li>statut = rejeté</li>
<li>raison obligatoire</li>
<li>aucune suite</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.16);margin:0.85rem 0" />
<p class="pm-step-label"><strong>🟡 À suivre</strong></p>
<ul class="pm-ul">
<li>informations insuffisantes</li>
<li>budget inconnu</li>
<li>décision non prise</li>
</ul>
<p><strong>Action :</strong></p>
<ul class="pm-ul">
<li>statut = à suivre</li>
<li>rappel planifié</li>
<li>responsable assigné</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.16);margin:0.85rem 0" />
<p class="pm-step-label"><strong>🟢 Qualifié</strong></p>
<ul class="pm-ul">
<li>besoin clair</li>
<li>projet compatible</li>
<li>client engagé</li>
<li>informations suffisantes</li>
</ul>
<p><strong>Action :</strong></p>
<ul class="pm-ul">
<li>statut = qualifié</li>
<li>responsable assigné</li>
<li>passage à la soumission</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📏 6. Règles métier</strong></p>
<ul class="pm-ul">
<li>une entrée doit contenir un contact valide</li>
<li>une entrée qualifiée doit avoir un responsable</li>
<li>une entrée à suivre doit avoir une prochaine action</li>
<li>une entrée rejetée doit avoir une raison</li>
<li>aucune double saisie pour passer en soumission</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🧑‍💼 7. Actions utilisateur</strong></p>
<p class="pm-step-label"><strong>À la création</strong></p>
<ul class="pm-ul">
<li>créer fiche</li>
<li>sauvegarder brouillon</li>
<li>assigner responsable</li>
<li>ajouter note</li>
</ul>
<p class="pm-step-label"><strong>Après création</strong></p>
<ul class="pm-ul">
<li>modifier</li>
<li>changer statut</li>
<li>ajouter documents</li>
<li>planifier rappel</li>
<li>convertir en soumission</li>
<li>rejeter</li>
<li>transférer</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📤 8. Outputs attendus</strong></p>
<p class="pm-step-label"><strong>Immédiat</strong></p>
<ul class="pm-ul">
<li>fiche créée</li>
<li>statut assigné</li>
<li>responsable assigné</li>
<li>date enregistrée</li>
</ul>
<p class="pm-step-label"><strong>Opérationnel</strong></p>
<ul class="pm-ul">
<li>entrée visible dans pipeline</li>
<li>prochaine action définie</li>
<li>qualification claire</li>
<li>conversion possible</li>
</ul>
<p class="pm-step-label"><strong>Analytique</strong></p>
<ul class="pm-ul">
<li>taux de qualification</li>
<li>taux de rejet</li>
<li>délai moyen</li>
<li>performance par source</li>
<li>performance par responsable</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🔄 9. Cycle de vie</strong></p>
<ul class="pm-ul">
<li>new</li>
<li>in_review</li>
<li>follow_up</li>
<li>qualified</li>
<li>rejected</li>
<li>converted_to_quote</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🖥️ 10. Vue UI</strong></p>
<p class="pm-step-label"><strong>Liste</strong></p>
<ul class="pm-ul">
<li>nom client</li>
<li>projet</li>
<li>ville</li>
<li>budget</li>
<li>statut</li>
<li>responsable</li>
<li>prochaine action</li>
</ul>
<p class="pm-step-label"><strong>Fiche</strong></p>
<ul class="pm-ul">
<li>infos client</li>
<li>projet</li>
<li>qualification</li>
<li>notes</li>
<li>historique</li>
<li>actions</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>✅ 11. Critères de succès</strong></p>
<ul class="pm-ul">
<li>capture rapide et complète</li>
<li>filtrage efficace des mauvais dossiers</li>
<li>progression fluide des bons dossiers</li>
<li>aucune perte d’information</li>
<li>transition simple vers soumission</li>
</ul>`,
          },
          {
            title: "📏 Règles métier",
            html: `<ul class="pm-ul">
<li>La classification 🟢 est requise avant d’ouvrir une soumission formelle.</li>
<li>Aucune entrée ne reste sans statut ni responsable plus de 1 jour ouvré.</li>
</ul>`,
          },
          {
            title: "👥 Rôles et responsabilités",
            html: `<ul class="pm-ul">
<li><strong>Réception / accueil</strong> : capture minimale et orientation.</li>
<li><strong>Vente / estimation</strong> : qualification et classification.</li>
<li><strong>Direction</strong> : arbitrage sur cas limites (🟡 prolongé).</li>
</ul>`,
          },
          {
            title: "📊 KPI et contrôle",
            html: `<ul class="pm-ul">
<li>Taux de conversion Entrée → Soumission</li>
<li>Délai moyen de première qualification</li>
<li>% d’entrées classées sous 24&nbsp;h</li>
</ul>`,
          },
          {
            title: "🧠 NatCORE + Marcel_IA",
            html: `<p>Fiche entrée unique, champs normalisés, scoring de propension (ex. lead chaud), rappels automatiques si information manquante. Base pour relances et priorisation commerciale.</p>`,
          },
        ],
      },
      soumission: {
        h2: `Processus — ${PROCESS_LABELS.soumission}`,
        intro:
          "Produire une offre claire et chiffrée à partir d’une entrée qualifiée — même logique de fiche que l’entrée : terrain, données CRM, classification, reporting.",
        sections: [
          {
            title: "🎯 Objectif du processus",
            html: "<p>Créer une soumission complète, claire et réalisable à partir d’un dossier qualifié.</p>",
          },
          {
            title: "📍 Portée et contexte",
            html: `<p>Devis et propositions pour projets résidentiels et commerciaux (céramique, revêtements, pose) — marges, délais et disponibilité matériaux maîtrisés.</p>`,
          },
          {
            title: "🚀 Déclencheur et entrées",
            html: "<p>Point de départ : entrée au statut <strong>qualifié</strong> ou demande de prix structurée ; le dossier client et l’entrée de référence doivent être identifiables dans le CRM.</p>",
          },
          {
            title: "🔁 Étapes détaillées",
            featured: true,
            html: `<p class="pm-step-label"><strong>🎯 Objectif</strong></p>
<p>Créer une soumission complète, claire et réalisable à partir d’un dossier qualifié.</p>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🔔 1. Déclencheurs d’entrée</strong></p>
<ul class="pm-ul">
<li>entrée qualifiée</li>
<li>demande de prix client</li>
<li>visite en salle de montre</li>
<li>analyse terminée</li>
<li>besoin de soumission identifié</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🧾 2. Informations minimales obligatoires à capter</strong></p>
<p class="pm-step-label"><strong>Client</strong></p>
<ul class="pm-ul">
<li>nom</li>
<li>coordonnées</li>
<li>référence entrée</li>
</ul>
<p class="pm-step-label"><strong>Projet</strong></p>
<ul class="pm-ul">
<li>type de surface</li>
<li>dimensions</li>
<li>complexité</li>
</ul>
<p class="pm-step-label"><strong>Produits</strong></p>
<ul class="pm-ul">
<li>matériaux choisis</li>
<li>formats</li>
<li>couleurs</li>
</ul>
<p class="pm-step-label"><strong>Données techniques</strong></p>
<ul class="pm-ul">
<li>surface calculée</li>
<li>pertes estimées</li>
<li>contraintes chantier</li>
</ul>
<p class="pm-step-label"><strong>Données financières</strong></p>
<ul class="pm-ul">
<li>prix matériaux</li>
<li>main-d’œuvre</li>
<li>extras</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>⚡ 3. Qualification rapide</strong></p>
<ul class="pm-ul">
<li>soumission simple</li>
<li>soumission complexe</li>
<li>soumission urgente</li>
<li>soumission à clarifier</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📊 4. Données structurées à enregistrer</strong></p>
<p>Champs principaux recommandés :</p>
<ul class="pm-ul pm-ul--fields">
<li>quote_id</li>
<li>entry_id</li>
<li>client_id</li>
<li>created_at</li>
<li>created_by</li>
<li>assigned_to</li>
<li>project_type</li>
<li>surface_value</li>
<li>surface_unit</li>
<li>materials_selected</li>
<li>waste_factor</li>
<li>labor_required</li>
<li>installation_included</li>
<li>material_availability</li>
<li>quote_amount</li>
<li>taxes</li>
<li>total_amount</li>
<li>quote_status</li>
<li>valid_until</li>
<li>internal_notes</li>
<li>next_action</li>
<li>next_action_due_at</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>⚖️ 5. Logique de classification</strong></p>
<p class="pm-step-label"><strong>🔴 Invalide</strong></p>
<ul class="pm-ul">
<li>données insuffisantes</li>
<li>mesures incertaines</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.16);margin:0.85rem 0" />
<p class="pm-step-label"><strong>🟡 À compléter</strong></p>
<ul class="pm-ul">
<li>infos manquantes</li>
<li>produits non validés</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.16);margin:0.85rem 0" />
<p class="pm-step-label"><strong>🟢 Valide</strong></p>
<ul class="pm-ul">
<li>soumission complète</li>
<li>prête à envoyer</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📏 6. Règles métier</strong></p>
<ul class="pm-ul">
<li>une soumission doit être liée à une entrée</li>
<li>une soumission doit contenir quantités et matériaux</li>
<li>aucune soumission sans validation minimale</li>
<li>une soumission envoyée ne doit pas être vide</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🧑‍💼 7. Actions utilisateur</strong></p>
<ul class="pm-ul">
<li>créer soumission</li>
<li>modifier</li>
<li>valider</li>
<li>envoyer</li>
<li>dupliquer</li>
<li>annuler</li>
<li>convertir en projet</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📤 8. Outputs attendus</strong></p>
<p class="pm-step-label"><strong>Immédiat</strong></p>
<ul class="pm-ul">
<li>soumission créée</li>
<li>statut assigné</li>
</ul>
<p class="pm-step-label"><strong>Opérationnel</strong></p>
<ul class="pm-ul">
<li>document client prêt</li>
<li>lien vers opportunité</li>
</ul>
<p class="pm-step-label"><strong>Analytique</strong></p>
<ul class="pm-ul">
<li>taux conversion</li>
<li>valeur moyenne</li>
<li>temps création</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🔄 9. Cycle de vie</strong></p>
<ul class="pm-ul">
<li>draft</li>
<li>in_review</li>
<li>ready</li>
<li>sent</li>
<li>accepted</li>
<li>rejected</li>
<li>expired</li>
<li>converted</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🖥️ 10. Vue UI</strong></p>
<p class="pm-step-label"><strong>Liste</strong></p>
<ul class="pm-ul">
<li>client</li>
<li>montant</li>
<li>statut</li>
<li>validité</li>
<li>responsable</li>
</ul>
<p class="pm-step-label"><strong>Fiche</strong></p>
<ul class="pm-ul">
<li>détails</li>
<li>matériaux</li>
<li>calculs</li>
<li>notes</li>
<li>actions</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>✅ 11. Critères de succès</strong></p>
<ul class="pm-ul">
<li>soumission complète</li>
<li>aucune erreur majeure</li>
<li>client comprend</li>
<li>prête à exécuter</li>
</ul>`,
          },
          {
            title: "📏 Règles métier",
            html: `<ul class="pm-ul">
<li>Une soumission doit être liée à une entrée et contenir quantités + matériaux.</li>
<li>Aucune soumission sans validation minimale ; rien d’envoyé si le document est vide ou incomplet.</li>
</ul>`,
          },
          {
            title: "👥 Rôles et responsabilités",
            html: `<ul class="pm-ul">
<li><strong>Estimateur / vente</strong> : mesures, choix produits, chiffrage, validation avant envoi.</li>
<li><strong>Approvisionnement</strong> (si besoin) : disponibilité matériaux, délais.</li>
<li><strong>Direction</strong> : exceptions marge ou conditions particulières.</li>
</ul>`,
          },
          {
            title: "📊 KPI et contrôle",
            html: `<ul class="pm-ul">
<li>Délai moyen Entrée qualifiée → soumission envoyée</li>
<li>Taux d’erreurs ou de versions corrigées post-envoi</li>
<li>Taux de conversion soumission → acceptation</li>
</ul>`,
          },
          {
            title: "🧠 NatCORE + Marcel_IA",
            html: `<p>Lignes de devis structurées, historique des versions, alertes marge ou écarts. Marcel_IA : comparaison avec dossiers similaires, suggestions d’options ou d’ajustement, résumé pour relecture rapide.</p>`,
          },
        ],
      },
      opportunites: {
        h2: `Processus — ${PROCESS_LABELS.opportunites}`,
        intro:
          "Transformer les soumissions et pistes en ventes — même schéma que l’entrée : fiche unique, étapes détaillées regroupées, KPI et apports Marcel_IA.",
        sections: [
          {
            title: "🎯 Objectif du processus",
            html: "<p>Suivre et convertir les opportunités en ventes concrètes.</p>",
          },
          {
            title: "📍 Portée et contexte",
            html: `<p>Dossiers après envoi de soumission ou lead commercial chaud jusqu’à décision (gagné, perdu, en sommeil documenté).</p>`,
          },
          {
            title: "🚀 Déclencheur et entrées",
            html: "<p>Création ou mise à jour d’opportunité lorsqu’une soumission part, qu’un client réagit ou qu’un lead entre dans le pipeline.</p>",
          },
          {
            title: "🔁 Étapes détaillées",
            featured: true,
            html: `<p class="pm-step-label"><strong>🎯 Objectif</strong></p>
<p>Suivre et convertir les opportunités en ventes concrètes.</p>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🔔 1. Déclencheurs d’entrée</strong></p>
<ul class="pm-ul">
<li>soumission envoyée</li>
<li>client intéressé</li>
<li>lead entrant</li>
<li>demande de suivi</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🧾 2. Informations minimales obligatoires à capter</strong></p>
<p class="pm-step-label"><strong>Client</strong></p>
<ul class="pm-ul">
<li>nom</li>
<li>coordonnées</li>
</ul>
<p class="pm-step-label"><strong>Projet</strong></p>
<ul class="pm-ul">
<li>valeur estimée</li>
<li>type projet</li>
</ul>
<p class="pm-step-label"><strong>Suivi</strong></p>
<ul class="pm-ul">
<li>dernière interaction</li>
<li>prochaine action</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>⚡ 3. Qualification rapide</strong></p>
<ul class="pm-ul">
<li>chaud</li>
<li>tiède</li>
<li>froid</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📊 4. Données structurées à enregistrer</strong></p>
<p>Champs principaux recommandés :</p>
<ul class="pm-ul pm-ul--fields">
<li>opportunity_id</li>
<li>client_id</li>
<li>quote_id</li>
<li>created_at</li>
<li>assigned_to</li>
<li>stage</li>
<li>priority_level</li>
<li>estimated_value</li>
<li>closing_probability</li>
<li>last_contact_date</li>
<li>next_follow_up_date</li>
<li>notes</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>⚖️ 5. Logique de classification</strong></p>
<p class="pm-step-label"><strong>🔴 Perdu</strong></p>
<ul class="pm-ul">
<li>refus client</li>
<li>pas de budget</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.16);margin:0.85rem 0" />
<p class="pm-step-label"><strong>🟡 En cours</strong></p>
<ul class="pm-ul">
<li>en discussion</li>
<li>à suivre</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.16);margin:0.85rem 0" />
<p class="pm-step-label"><strong>🟢 Gagné</strong></p>
<ul class="pm-ul">
<li>accepté</li>
<li>converti</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📏 6. Règles métier</strong></p>
<ul class="pm-ul">
<li>une opportunité doit être assignée</li>
<li>une opportunité doit avoir un suivi</li>
<li>aucune opportunité inactive</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🧑‍💼 7. Actions utilisateur</strong></p>
<ul class="pm-ul">
<li>changer statut</li>
<li>ajouter note</li>
<li>planifier suivi</li>
<li>convertir</li>
<li>fermer</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📤 8. Outputs attendus</strong></p>
<p class="pm-step-label"><strong>Opérationnel</strong></p>
<ul class="pm-ul">
<li>pipeline actif</li>
<li>suivis planifiés</li>
<li>conversion</li>
</ul>
<p class="pm-step-label"><strong>Analytique</strong></p>
<ul class="pm-ul">
<li>taux conversion</li>
<li>pipeline valeur</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🔄 9. Cycle de vie</strong></p>
<ul class="pm-ul">
<li>new</li>
<li>contacted</li>
<li>qualified</li>
<li>negotiation</li>
<li>won</li>
<li>lost</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🖥️ 10. Vue UI</strong></p>
<ul class="pm-ul">
<li>pipeline</li>
<li>liste</li>
<li>fiche détaillée</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>✅ 11. Critères de succès</strong></p>
<ul class="pm-ul">
<li>aucun client oublié</li>
<li>suivi actif</li>
<li>pipeline clair</li>
</ul>`,
          },
          {
            title: "📏 Règles métier",
            html: `<ul class="pm-ul">
<li>Chaque opportunité a un propriétaire et une prochaine action datée.</li>
<li>Aucun dossier laissé sans statut ni interaction planifiée.</li>
</ul>`,
          },
          {
            title: "👥 Rôles et responsabilités",
            html: `<ul class="pm-ul">
<li><strong>Commercial assigné</strong> : relances, notes, mise à jour du pipeline.</li>
<li><strong>Direction</strong> : arbitrage sur rabais ou stratégie gros comptes.</li>
</ul>`,
          },
          {
            title: "📊 KPI et contrôle",
            html: `<ul class="pm-ul">
<li>Taux de conversion Soumission → Vente</li>
<li>Durée moyenne du cycle opportunité</li>
<li>Respect des relances planifiées</li>
</ul>`,
          },
          {
            title: "🧠 NatCORE + Marcel_IA",
            html: `<p>Timeline des interactions, probabilités et valeurs agrégées pour le pilotage. Marcel_IA : rappels de relance, détection des dossiers refroidissants, idées de message selon l’historique.</p>`,
          },
        ],
      },
      planification: {
        h2: `Processus — ${PROCESS_LABELS.planification}`,
        intro:
          "Orchestrer équipes, matériaux et dates après vente — même gabarit que l’entrée : étapes détaillées centralisées, règles, rôles, KPI, Marcel_IA.",
        sections: [
          {
            title: "🎯 Objectif du processus",
            html: "<p>Organiser les projets acceptés pour une exécution efficace.</p>",
          },
          {
            title: "📍 Portée et contexte",
            html: `<p>Projets vendus : coordination livraisons matériaux, équipes de pose, accès chantier et communication des créneaux au client.</p>`,
          },
          {
            title: "🚀 Déclencheur et entrées",
            html: "<p>Ouverture du volet planification lorsque la soumission est <strong>acceptée</strong> ou le projet <strong>confirmé</strong> contractuellement.</p>",
          },
          {
            title: "🔁 Étapes détaillées",
            featured: true,
            html: `<p class="pm-step-label"><strong>🎯 Objectif</strong></p>
<p>Organiser les projets acceptés pour exécution efficace.</p>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🔔 1. Déclencheurs d’entrée</strong></p>
<ul class="pm-ul">
<li>soumission acceptée</li>
<li>projet confirmé</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🧾 2. Informations minimales obligatoires à capter</strong></p>
<p class="pm-step-label"><strong>Projet</strong></p>
<ul class="pm-ul">
<li>type</li>
<li>complexité</li>
</ul>
<p class="pm-step-label"><strong>Ressources</strong></p>
<ul class="pm-ul">
<li>équipe</li>
<li>durée</li>
</ul>
<p class="pm-step-label"><strong>Matériaux</strong></p>
<ul class="pm-ul">
<li>disponibilité</li>
<li>livraison</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>⚡ 3. Qualification rapide</strong></p>
<ul class="pm-ul">
<li>prêt</li>
<li>à planifier</li>
<li>bloqué</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📊 4. Données structurées à enregistrer</strong></p>
<p>Champs principaux recommandés :</p>
<ul class="pm-ul pm-ul--fields">
<li>project_id</li>
<li>quote_id</li>
<li>client_id</li>
<li>assigned_team</li>
<li>start_date</li>
<li>estimated_duration</li>
<li>material_status</li>
<li>schedule_status</li>
<li>constraints</li>
<li>notes</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>⚖️ 5. Logique de classification</strong></p>
<p class="pm-step-label"><strong>🔴 Bloqué</strong></p>
<ul class="pm-ul">
<li>matériel manquant</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.16);margin:0.85rem 0" />
<p class="pm-step-label"><strong>🟡 En préparation</strong></p>
<ul class="pm-ul">
<li>en attente</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.16);margin:0.85rem 0" />
<p class="pm-step-label"><strong>🟢 Prêt</strong></p>
<ul class="pm-ul">
<li>planifié</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📏 6. Règles métier</strong></p>
<ul class="pm-ul">
<li>pas de chantier sans matériel</li>
<li>équipe assignée obligatoire</li>
<li>date validée</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🧑‍💼 7. Actions utilisateur</strong></p>
<ul class="pm-ul">
<li>planifier</li>
<li>modifier</li>
<li>assigner</li>
<li>replanifier</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📤 8. Outputs attendus</strong></p>
<ul class="pm-ul">
<li>calendrier</li>
<li>ordre de travail</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🔄 9. Cycle de vie</strong></p>
<ul class="pm-ul">
<li>pending</li>
<li>scheduled</li>
<li>ready</li>
<li>in_progress</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🖥️ 10. Vue UI</strong></p>
<ul class="pm-ul">
<li>calendrier</li>
<li>liste projets</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>✅ 11. Critères de succès</strong></p>
<ul class="pm-ul">
<li>chantier prêt</li>
<li>aucun blocage</li>
</ul>`,
          },
          {
            title: "📏 Règles métier",
            html: `<ul class="pm-ul">
<li>Pas de date client promise sans matériel et équipe validés.</li>
<li>Tout décalage significatif est communiqué avant l’échéance précédente.</li>
</ul>`,
          },
          {
            title: "👥 Rôles et responsabilités",
            html: `<ul class="pm-ul">
<li><strong>Coordinateur planning</strong> : calendrier, conflits, matériaux.</li>
<li><strong>Chef d’équipe / pose</strong> : faisabilité terrain, durées réalistes.</li>
<li><strong>Vente</strong> : validation créneaux côté client.</li>
</ul>`,
          },
          {
            title: "📊 KPI et contrôle",
            html: `<ul class="pm-ul">
<li>Taux de respect des dates promise</li>
<li>Nombre de conflits équipe / matériel détectés à temps</li>
<li>Retards imputables à la planification vs externes</li>
</ul>`,
          },
          {
            title: "🧠 NatCORE + Marcel_IA",
            html: `<p>Vue calendrier partagée, statuts matériaux et alertes de chevauchement. Marcel_IA : suggestions de réaffectation, synthèse des risques de retard.</p>`,
          },
        ],
      },
      installation: {
        h2: `Processus — ${PROCESS_LABELS.installation}`,
        intro:
          "Exécuter la pose avec qualité et traçabilité — structure identique à l’entrée pour que terrain et CRM parlent le même langage.",
        sections: [
          {
            title: "🎯 Objectif du processus",
            html: "<p>Réaliser les travaux selon les standards.</p>",
          },
          {
            title: "📍 Portée et contexte",
            html: `<p>Chantiers résidentiels et commerciaux : préparation, pose, contrôle qualité, documentation photo et remontées terrain.</p>`,
          },
          {
            title: "🚀 Déclencheur et entrées",
            html: "<p>Démarrage lorsque le <strong>chantier est prêt</strong> (matériel, accès) et l’<strong>équipe est assignée</strong> dans le planning.</p>",
          },
          {
            title: "🔁 Étapes détaillées",
            featured: true,
            html: `<p class="pm-step-label"><strong>🎯 Objectif</strong></p>
<p>Réaliser les travaux selon les standards.</p>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🔔 1. Déclencheurs d’entrée</strong></p>
<ul class="pm-ul">
<li>chantier prêt</li>
<li>équipe assignée</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🧾 2. Informations minimales obligatoires à capter</strong></p>
<ul class="pm-ul">
<li>chantier</li>
<li>équipe</li>
<li>matériaux</li>
<li>conditions</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>⚡ 3. Qualification rapide</strong></p>
<ul class="pm-ul">
<li>simple</li>
<li>complexe</li>
<li>à risque</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📊 4. Données structurées à enregistrer</strong></p>
<p>Champs principaux recommandés :</p>
<ul class="pm-ul pm-ul--fields">
<li>installation_id</li>
<li>project_id</li>
<li>team_id</li>
<li>start_time</li>
<li>end_time</li>
<li>issues</li>
<li>completion_status</li>
<li>quality_check</li>
<li>photos</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>⚖️ 5. Logique de classification</strong></p>
<p class="pm-step-label"><strong>🔴 problème</strong></p>
<ul class="pm-ul">
<li>défaut</li>
<li>retard</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.16);margin:0.85rem 0" />
<p class="pm-step-label"><strong>🟡 en cours</strong></p>
<p>Travaux en cours ; mise à jour régulière du statut.</p>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.16);margin:0.85rem 0" />
<p class="pm-step-label"><strong>🟢 complété</strong></p>
<p>Pose terminée ; contrôle qualité et documentation à finaliser.</p>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📏 6. Règles métier</strong></p>
<ul class="pm-ul">
<li>contrôle qualité obligatoire</li>
<li>documentation obligatoire</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🧑‍💼 7. Actions utilisateur</strong></p>
<ul class="pm-ul">
<li>démarrer</li>
<li>mettre à jour</li>
<li>terminer</li>
<li>valider</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📤 8. Outputs attendus</strong></p>
<ul class="pm-ul">
<li>chantier terminé</li>
<li>rapport</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🔄 9. Cycle de vie</strong></p>
<ul class="pm-ul">
<li>ready</li>
<li>in_progress</li>
<li>completed</li>
<li>validated</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🖥️ 10. Vue UI</strong></p>
<ul class="pm-ul">
<li>fiche chantier</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>✅ 11. Critères de succès</strong></p>
<ul class="pm-ul">
<li>travail conforme</li>
<li>client satisfait</li>
</ul>`,
          },
          {
            title: "📏 Règles métier",
            html: `<ul class="pm-ul">
<li>Check-list qualité et photos avant clôture ; incident = trace horodatée.</li>
</ul>`,
          },
          {
            title: "👥 Rôles et responsabilités",
            html: `<ul class="pm-ul">
<li><strong>Équipe de pose</strong> : exécution, remontées terrain.</li>
<li><strong>Contremaître</strong> : qualité, sécurité, coordination.</li>
<li><strong>Bureau</strong> : support litiges matériaux ou devis.</li>
</ul>`,
          },
          {
            title: "📊 KPI et contrôle",
            html: `<ul class="pm-ul">
<li>Taux de chantiers sans réclamation à J+7</li>
<li>Retards signalés vs détectés tard</li>
<li>Complétude des preuves photo / rapport</li>
</ul>`,
          },
          {
            title: "🧠 NatCORE + Marcel_IA",
            html: `<p>Mise à jour mobile, % d’avancement et incidents structurés. Marcel_IA : alerte dérapage vs planning, rappel des points critiques du dossier.</p>`,
          },
        ],
      },
      facturation: {
        h2: `Processus — ${PROCESS_LABELS.facturation}`,
        intro:
          "Facturer ce qui a été vendu et posé — aligné sur l’entrée : détail opérationnel regroupé, puis règles, rôles, KPI et Marcel_IA.",
        sections: [
          {
            title: "🎯 Objectif du processus",
            html: "<p>Encaisser correctement les revenus.</p>",
          },
          {
            title: "📍 Portée et contexte",
            html: `<p>Acomptes, solde, extras chantier ; lien avec projet terminé et pièces justificatives.</p>`,
          },
          {
            title: "🚀 Déclencheur et entrées",
            html: "<p>Passage en facturation lorsque le <strong>chantier est complété</strong> (ou jalon contractuel atteint).</p>",
          },
          {
            title: "🔁 Étapes détaillées",
            featured: true,
            html: `<p class="pm-step-label"><strong>🎯 Objectif</strong></p>
<p>Encaisser correctement les revenus.</p>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🔔 1. Déclencheurs d’entrée</strong></p>
<ul class="pm-ul">
<li>chantier complété</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🧾 2. Informations minimales obligatoires à capter</strong></p>
<ul class="pm-ul">
<li>coûts</li>
<li>extras</li>
<li>client</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>⚡ 3. Qualification rapide</strong></p>
<ul class="pm-ul">
<li>prêt à facturer</li>
<li>à vérifier</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📊 4. Données structurées à enregistrer</strong></p>
<p>Champs principaux recommandés :</p>
<ul class="pm-ul pm-ul--fields">
<li>invoice_id</li>
<li>project_id</li>
<li>client_id</li>
<li>amount</li>
<li>taxes</li>
<li>payment_status</li>
<li>payment_date</li>
<li>balance</li>
<li>notes</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>⚖️ 5. Logique de classification</strong></p>
<p class="pm-step-label"><strong>🔴 problème</strong></p>
<ul class="pm-ul">
<li>erreur</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.16);margin:0.85rem 0" />
<p class="pm-step-label"><strong>🟡 en attente</strong></p>
<p>Facture envoyée ou en cours de validation.</p>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.16);margin:0.85rem 0" />
<p class="pm-step-label"><strong>🟢 payé</strong></p>
<p>Solde réglé ou encours conforme au contrat.</p>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📏 6. Règles métier</strong></p>
<ul class="pm-ul">
<li>facture obligatoire</li>
<li>extras inclus</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🧑‍💼 7. Actions utilisateur</strong></p>
<ul class="pm-ul">
<li>créer</li>
<li>envoyer</li>
<li>relancer</li>
<li>fermer</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📤 8. Outputs attendus</strong></p>
<ul class="pm-ul">
<li>facture</li>
<li>paiement</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🔄 9. Cycle de vie</strong></p>
<ul class="pm-ul">
<li>draft</li>
<li>sent</li>
<li>paid</li>
<li>overdue</li>
<li>closed</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🖥️ 10. Vue UI</strong></p>
<ul class="pm-ul">
<li>liste factures</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>✅ 11. Critères de succès</strong></p>
<ul class="pm-ul">
<li>paiement complet</li>
</ul>`,
          },
          {
            title: "📏 Règles métier",
            html: `<ul class="pm-ul">
<li>Aucun montant hors devis sans validation et trace (bon ou accord écrit).</li>
<li>Relances d’échéance conformes aux conditions convenues.</li>
</ul>`,
          },
          {
            title: "👥 Rôles et responsabilités",
            html: `<ul class="pm-ul">
<li><strong>Admin / comptabilité</strong> : émission, encaissements, relances.</li>
<li><strong>Vente</strong> : validation client sur extras.</li>
</ul>`,
          },
          {
            title: "📊 KPI et contrôle",
            html: `<ul class="pm-ul">
<li>DSO (délai de paiement)</li>
<li>Écart marge prévue vs réalisée</li>
<li>Taux de factures sans erreur</li>
</ul>`,
          },
          {
            title: "🧠 NatCORE + Marcel_IA",
            html: `<p>Liens facture ↔ projet ↔ chantier. Marcel_IA : alertes d’échéance, synthèse des impayés, projection simple de trésorerie.</p>`,
          },
        ],
      },
      suivi: {
        h2: `Processus — ${PROCESS_LABELS.suivi}`,
        intro:
          "Clôturer la boucle client après chantier — même structure que l’entrée : détail dans une carte unique, puis règles, rôles, KPI et Marcel_IA.",
        sections: [
          {
            title: "🎯 Objectif du processus",
            html: "<p>Maintenir la relation client et générer du futur.</p>",
          },
          {
            title: "📍 Portée et contexte",
            html: `<p>Post-installation : satisfaction, NPS ou équivalent, références, upsell / entretien.</p>`,
          },
          {
            title: "🚀 Déclencheur et entrées",
            html: "<p>Déclenché à la <strong>fin du chantier</strong> (ou à la livraison contractuelle).</p>",
          },
          {
            title: "🔁 Étapes détaillées",
            featured: true,
            html: `<p class="pm-step-label"><strong>🎯 Objectif</strong></p>
<p>Maintenir la relation client et générer du futur.</p>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🔔 1. Déclencheurs d’entrée</strong></p>
<ul class="pm-ul">
<li>fin chantier</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🧾 2. Informations minimales obligatoires à capter</strong></p>
<ul class="pm-ul">
<li>satisfaction</li>
<li>problèmes</li>
<li>opportunités</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>⚡ 3. Qualification rapide</strong></p>
<ul class="pm-ul">
<li>satisfait</li>
<li>neutre</li>
<li>insatisfait</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📊 4. Données structurées à enregistrer</strong></p>
<p>Champs principaux recommandés :</p>
<ul class="pm-ul pm-ul--fields">
<li>followup_id</li>
<li>client_id</li>
<li>project_id</li>
<li>satisfaction_score</li>
<li>issues</li>
<li>referral</li>
<li>next_opportunity</li>
<li>notes</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>⚖️ 5. Logique de classification</strong></p>
<p class="pm-step-label"><strong>🔴 problème</strong></p>
<p>Insatisfaction ou litige ; escalade et plan d’action.</p>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.16);margin:0.85rem 0" />
<p class="pm-step-label"><strong>🟡 neutre</strong></p>
<p>Suivi standard ; pas de référence immédiate.</p>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.16);margin:0.85rem 0" />
<p class="pm-step-label"><strong>🟢 satisfait</strong></p>
<p>Références ou opportunités futures identifiées.</p>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📏 6. Règles métier</strong></p>
<ul class="pm-ul">
<li>suivi obligatoire</li>
<li>problème traité</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🧑‍💼 7. Actions utilisateur</strong></p>
<ul class="pm-ul">
<li>contacter</li>
<li>noter</li>
<li>relancer</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>📤 8. Outputs attendus</strong></p>
<ul class="pm-ul">
<li>satisfaction</li>
<li>opportunités</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🔄 9. Cycle de vie</strong></p>
<ul class="pm-ul">
<li>pending</li>
<li>completed</li>
<li>issue_detected</li>
<li>resolved</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>🖥️ 10. Vue UI</strong></p>
<ul class="pm-ul">
<li>fiche suivi</li>
</ul>
<hr style="border:0;border-top:1px solid rgba(148,163,184,0.22);margin:1rem 0" />
<p class="pm-step-label"><strong>✅ 11. Critères de succès</strong></p>
<ul class="pm-ul">
<li>client satisfait</li>
<li>références obtenues</li>
</ul>`,
          },
          {
            title: "📏 Règles métier",
            html: `<ul class="pm-ul">
<li>Contact post-chantier dans un délai défini (ex. 7 jours).</li>
<li>Tout problème ouvre une fiche d’action avec responsable et échéance.</li>
</ul>`,
          },
          {
            title: "👥 Rôles et responsabilités",
            html: `<ul class="pm-ul">
<li><strong>Vente / service</strong> : appel ou visite, saisie satisfaction.</li>
<li><strong>Direction</strong> : escalade litiges majeurs.</li>
</ul>`,
          },
          {
            title: "📊 KPI et contrôle",
            html: `<ul class="pm-ul">
<li>Taux de suivi réalisé</li>
<li>Score satisfaction moyen</li>
<li>Références générées / opportunités créées</li>
</ul>`,
          },
          {
            title: "🧠 NatCORE + Marcel_IA",
            html: `<p>Historique client unifié. Marcel_IA : rappels de suivi, synthèse des retours, suggestions d’upsell.</p>`,
          },
        ],
      },
    };

    return specs[processKey] || {
      h2: `Processus — ${L}`,
      intro: `Référence opérationnelle — processus ${L.toLowerCase()}.`,
      sections: [
        {
          title: "🎯 Objectif du processus",
          html: "<p>À documenter.</p>",
        },
        {
          title: "📍 Portée et contexte",
          html: "<p>À documenter.</p>",
        },
        {
          title: "🚀 Déclencheur et entrées",
          html: "<p>À documenter.</p>",
        },
        {
          title: "🔁 Étapes détaillées",
          featured: true,
          html: "<p>À documenter.</p>",
        },
        {
          title: "📏 Règles métier",
          html: "<p>À documenter.</p>",
        },
        {
          title: "👥 Rôles et responsabilités",
          html: "<p>À documenter.</p>",
        },
        {
          title: "📊 KPI et contrôle",
          html: "<p>À documenter.</p>",
        },
        {
          title: "🧠 NatCORE + Marcel_IA",
          html: "<p>À documenter.</p>",
        },
      ],
    };
  }

  function renderProcessContent(processKey = "entree") {
    const content = document.getElementById("pm-content");
    if (!content) return;
    content.innerHTML = renderProcessSpec(getProcessManualSpec(processKey));
  }

  function initProcessManualTabs(defaultKey = "entree") {
    const tabs = document.querySelectorAll(".pm-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const processKey = tab.dataset.process;
        if (!processKey) return;

        tabs.forEach((btn) => {
          btn.classList.remove("active");
          btn.setAttribute("aria-selected", "false");
        });

        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        renderProcessContent(processKey);
      });
    });

    renderProcessContent(defaultKey);
  }

  function initConclusionPage() {
    const root = document.getElementById("conclusionPage");
    if (!root || root.dataset.pathBound === "1") return;
    root.dataset.pathBound = "1";

    function closeAll() {
      root.querySelectorAll(".ccl-path-card").forEach((card) => {
        card.classList.remove("is-open");
        const t = card.querySelector("[data-ccl-path-toggle]");
        if (t) t.setAttribute("aria-expanded", "false");
        const pid = t?.getAttribute("aria-controls");
        const panel = pid ? document.getElementById(pid) : null;
        if (panel) {
          panel.setAttribute("aria-hidden", "true");
        }
      });
    }

    root.addEventListener("click", (e) => {
      const toggle = e.target.closest("[data-ccl-path-toggle]");
      if (!toggle || !root.contains(toggle)) return;
      const card = toggle.closest(".ccl-path-card");
      if (!card) return;
      const panelId = toggle.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;
      const wasOpen = card.classList.contains("is-open");

      closeAll();

      if (!wasOpen) {
        card.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
        if (panel) panel.setAttribute("aria-hidden", "false");
      }
    });

    root.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const toggle = e.target.closest("[data-ccl-path-toggle]");
      if (!toggle || !root.contains(toggle)) return;
      e.preventDefault();
      toggle.click();
    });
  }

  function pageConclusion() {
    return `
      <div class="conclusion-page" id="conclusionPage">
        <section class="ccl-hero" aria-labelledby="ccl-hero-title">
          <div class="ccl-hero-glow" aria-hidden="true"></div>
          <p class="ccl-hero-kicker">Projection Marcel_IA</p>
          <h1 id="ccl-hero-title" class="ccl-hero-title">Marcel IA — Ce que le système rend possible</h1>
          <div class="ccl-hero-lead ccl-hero-lead--rich">
            <p>Quand l’information est structurée dans NatCORE, Marcel IA transforme les données de l’entreprise en décisions concrètes.</p>
            <p>Il relie les clients, les soumissions, les chantiers et le suivi pour faire ressortir les priorités, les blocages et les prochaines actions utiles.</p>
            <p>Marcel IA devient puissant uniquement lorsque l’entreprise est organisée dans un système clair, fiable et connecté.</p>
          </div>
          <p class="ccl-hero-progress" aria-label="Progression du dispositif">
            <span class="ccl-hero-progress-item">Comprendre</span>
            <span class="ccl-hero-progress-arrow" aria-hidden="true">→</span>
            <span class="ccl-hero-progress-item">Structurer</span>
            <span class="ccl-hero-progress-arrow" aria-hidden="true">→</span>
            <span class="ccl-hero-progress-item">Opérer</span>
            <span class="ccl-hero-progress-arrow" aria-hidden="true">→</span>
            <span class="ccl-hero-progress-item">Décider</span>
          </p>
        </section>

        <section class="ccl-path-intro" aria-labelledby="ccl-path-intro-title">
          <h2 id="ccl-path-intro-title" class="ccl-section-title">Le chemin vers une entreprise assistée par l’IA</h2>
          <p class="ccl-section-sub ccl-path-intro-sub">
            Un système intelligent ne s’active pas en un clic. Il se construit en étapes claires, du terrain jusqu’à la décision.
          </p>
        </section>

        <div class="ccl-path-grid" role="list">
          <article class="ccl-path-card" role="listitem">
            <div class="ccl-path-card-head">
              <span class="ccl-path-step-badge" aria-hidden="true">1</span>
              <span class="ccl-path-icon" aria-hidden="true">📋</span>
              <h3 class="ccl-path-card-title">Inventaire</h3>
              <p class="ccl-path-summary">Comprendre ce qui existe réellement dans l’entreprise avant de vouloir l’améliorer.</p>
              <button
                type="button"
                class="ccl-path-toggle"
                data-ccl-path-toggle
                id="ccl-path-btn-1"
                aria-expanded="false"
                aria-controls="ccl-path-panel-1"
              >
                <span class="ccl-path-toggle-label">Voir le détail</span>
                <span class="ccl-path-toggle-chevron" aria-hidden="true"></span>
              </button>
            </div>
            <div
              class="ccl-path-panel-wrap"
              id="ccl-path-panel-1"
              role="region"
              aria-labelledby="ccl-path-btn-1"
              aria-hidden="true"
            >
              <div class="ccl-path-panel-inner">
                <div class="ccl-path-detail">
                  <p>Avant toute intelligence, il faut voir la réalité telle qu’elle est.</p>
                  <p>Cette étape sert à recenser les éléments déjà présents dans l’entreprise :</p>
                  <ul class="ccl-path-detail-ul">
                    <li>clients actifs et passés,</li>
                    <li>soumissions existantes,</li>
                    <li>projets et chantiers en cours,</li>
                    <li>matériaux et informations utiles,</li>
                    <li>façons de travailler des équipes,</li>
                    <li>suivis faits sur papier, Excel, messages ou en mémoire.</li>
                  </ul>
                  <p>L’objectif n’est pas encore d’optimiser. L’objectif est d’obtenir une vision honnête de l’existant.</p>
                </div>
              </div>
            </div>
          </article>

          <article class="ccl-path-card" role="listitem">
            <div class="ccl-path-card-head">
              <span class="ccl-path-step-badge" aria-hidden="true">2</span>
              <span class="ccl-path-icon" aria-hidden="true">🧱</span>
              <h3 class="ccl-path-card-title">Structuration NatCore</h3>
              <p class="ccl-path-summary">Transformer l’information dispersée en structure claire, cohérente et reliée.</p>
              <button
                type="button"
                class="ccl-path-toggle"
                data-ccl-path-toggle
                id="ccl-path-btn-2"
                aria-expanded="false"
                aria-controls="ccl-path-panel-2"
              >
                <span class="ccl-path-toggle-label">Voir le détail</span>
                <span class="ccl-path-toggle-chevron" aria-hidden="true"></span>
              </button>
            </div>
            <div
              class="ccl-path-panel-wrap"
              id="ccl-path-panel-2"
              role="region"
              aria-labelledby="ccl-path-btn-2"
              aria-hidden="true"
            >
              <div class="ccl-path-panel-inner">
                <div class="ccl-path-detail">
                  <p>NatCore apporte la structure logique qui permet d’organiser l’entreprise.</p>
                  <p>Les informations cessent d’être isolées et commencent à former un système relié : Client → Soumission → Chantier → Suivi.</p>
                  <p>Cette étape inclut :</p>
                  <ul class="ccl-path-detail-ul">
                    <li>des entités claires,</li>
                    <li>des étapes de travail définies,</li>
                    <li>des liens entre les modules,</li>
                    <li>une base compréhensible pour toute l’équipe.</li>
                  </ul>
                  <p>C’est ici que l’ordre remplace le chaos.</p>
                </div>
              </div>
            </div>
          </article>

          <article class="ccl-path-card" role="listitem">
            <div class="ccl-path-card-head">
              <span class="ccl-path-step-badge" aria-hidden="true">3</span>
              <span class="ccl-path-icon" aria-hidden="true">💼</span>
              <h3 class="ccl-path-card-title">CRM opérationnel</h3>
              <p class="ccl-path-summary">Mettre en place un outil simple et utile que l’équipe peut utiliser au quotidien.</p>
              <button
                type="button"
                class="ccl-path-toggle"
                data-ccl-path-toggle
                id="ccl-path-btn-3"
                aria-expanded="false"
                aria-controls="ccl-path-panel-3"
              >
                <span class="ccl-path-toggle-label">Voir le détail</span>
                <span class="ccl-path-toggle-chevron" aria-hidden="true"></span>
              </button>
            </div>
            <div
              class="ccl-path-panel-wrap"
              id="ccl-path-panel-3"
              role="region"
              aria-labelledby="ccl-path-btn-3"
              aria-hidden="true"
            >
              <div class="ccl-path-panel-inner">
                <div class="ccl-path-detail">
                  <p>Une fois la structure définie, elle doit vivre dans un CRM réellement utilisable.</p>
                  <p>Le CRM doit permettre de :</p>
                  <ul class="ccl-path-detail-ul">
                    <li>créer un client rapidement,</li>
                    <li>produire une soumission claire,</li>
                    <li>suivre l’état d’un dossier,</li>
                    <li>planifier un chantier,</li>
                    <li>gérer les informations sans perte ni doublon.</li>
                  </ul>
                  <p>Le but n’est pas d’avoir un écran «&nbsp;beau&nbsp;».</p>
                  <p>Le but est d’avoir un système qui soutient le travail réel sur le terrain.</p>
                </div>
              </div>
            </div>
          </article>

          <article class="ccl-path-card" role="listitem">
            <div class="ccl-path-card-head">
              <span class="ccl-path-step-badge" aria-hidden="true">4</span>
              <span class="ccl-path-icon" aria-hidden="true">◎</span>
              <h3 class="ccl-path-card-title">Données fiables</h3>
              <p class="ccl-path-summary">Stabiliser la qualité des données pour rendre le système crédible et exploitable.</p>
              <button
                type="button"
                class="ccl-path-toggle"
                data-ccl-path-toggle
                id="ccl-path-btn-4"
                aria-expanded="false"
                aria-controls="ccl-path-panel-4"
              >
                <span class="ccl-path-toggle-label">Voir le détail</span>
                <span class="ccl-path-toggle-chevron" aria-hidden="true"></span>
              </button>
            </div>
            <div
              class="ccl-path-panel-wrap"
              id="ccl-path-panel-4"
              role="region"
              aria-labelledby="ccl-path-btn-4"
              aria-hidden="true"
            >
              <div class="ccl-path-panel-inner">
                <div class="ccl-path-detail">
                  <p>L’intelligence dépend directement de la qualité des données.</p>
                  <p>Si l’information est incomplète, contradictoire ou obsolète, les décisions proposées deviennent faibles ou dangereuses.</p>
                  <p>Cette étape consiste à obtenir des données :</p>
                  <ul class="ccl-path-detail-ul">
                    <li>complètes,</li>
                    <li>à jour,</li>
                    <li>reliées,</li>
                    <li>utilisables par le système.</li>
                  </ul>
                  <p>Sans données fiables, il n’y a pas d’intelligence fiable.</p>
                </div>
              </div>
            </div>
          </article>

          <article class="ccl-path-card" role="listitem">
            <div class="ccl-path-card-head">
              <span class="ccl-path-step-badge" aria-hidden="true">5</span>
              <span class="ccl-path-icon" aria-hidden="true">✨</span>
              <h3 class="ccl-path-card-title">Activation Marcel IA</h3>
              <p class="ccl-path-summary">Appliquer l’intelligence sur une base solide pour assister la réflexion et l’action.</p>
              <button
                type="button"
                class="ccl-path-toggle"
                data-ccl-path-toggle
                id="ccl-path-btn-5"
                aria-expanded="false"
                aria-controls="ccl-path-panel-5"
              >
                <span class="ccl-path-toggle-label">Voir le détail</span>
                <span class="ccl-path-toggle-chevron" aria-hidden="true"></span>
              </button>
            </div>
            <div
              class="ccl-path-panel-wrap"
              id="ccl-path-panel-5"
              role="region"
              aria-labelledby="ccl-path-btn-5"
              aria-hidden="true"
            >
              <div class="ccl-path-panel-inner">
                <div class="ccl-path-detail">
                  <p>Lorsque le système est structuré et que les données sont fiables, Marcel IA peut enfin agir utilement.</p>
                  <p>Il peut alors :</p>
                  <ul class="ccl-path-detail-ul">
                    <li>comprendre un dossier dans son ensemble,</li>
                    <li>résumer rapidement une situation,</li>
                    <li>détecter des oublis ou des retards,</li>
                    <li>faire ressortir les urgences,</li>
                    <li>proposer les prochaines actions pertinentes.</li>
                  </ul>
                  <p>Marcel IA ne remplace pas l’humain.</p>
                  <p>Il amplifie sa capacité à comprendre, décider et agir.</p>
                </div>
              </div>
            </div>
          </article>

          <article class="ccl-path-card" role="listitem">
            <div class="ccl-path-card-head">
              <span class="ccl-path-step-badge" aria-hidden="true">6</span>
              <span class="ccl-path-icon" aria-hidden="true">📈</span>
              <h3 class="ccl-path-card-title">Résultats concrets</h3>
              <p class="ccl-path-summary">Transformer l’entreprise en organisation plus claire, plus rapide et mieux contrôlée.</p>
              <button
                type="button"
                class="ccl-path-toggle"
                data-ccl-path-toggle
                id="ccl-path-btn-6"
                aria-expanded="false"
                aria-controls="ccl-path-panel-6"
              >
                <span class="ccl-path-toggle-label">Voir le détail</span>
                <span class="ccl-path-toggle-chevron" aria-hidden="true"></span>
              </button>
            </div>
            <div
              class="ccl-path-panel-wrap"
              id="ccl-path-panel-6"
              role="region"
              aria-labelledby="ccl-path-btn-6"
              aria-hidden="true"
            >
              <div class="ccl-path-panel-inner">
                <div class="ccl-path-detail">
                  <p>Lorsque toutes les étapes précédentes sont en place, les gains deviennent visibles.</p>
                  <p>L’entreprise obtient :</p>
                  <ul class="ccl-path-detail-ul">
                    <li>une meilleure vision d’ensemble,</li>
                    <li>moins d’oublis,</li>
                    <li>des dossiers mieux suivis,</li>
                    <li>des décisions plus rapides,</li>
                    <li>une exécution plus fluide,</li>
                    <li>une capacité accrue à piloter les opérations.</li>
                  </ul>
                  <p>On passe d’une entreprise qui subit ses informations à une entreprise qui les utilise pour mieux décider.</p>
                </div>
              </div>
            </div>
          </article>
        </div>

        <footer class="ccl-footer-quote">
          <p class="ccl-quote">
            NatCORE structure le système. Marcel IA lui donne une capacité d’intelligence exploitable.
          </p>
          <p class="ccl-quote-alt">Marcel IA ne remplace pas l’humain. Il augmente sa capacité à comprendre, décider et agir.</p>
        </footer>
      </div>
    `;
  }

  function pageProcessManual() {
    return `
      ${moduleIntro(
        "Manuel des processus",
        [
          "Processus souvent informels ou dispersés sur plusieurs supports",
          "Montée en compétence longue pour les nouvelles recrues",
        ],
        [
          "Référence unique alignée sur ce que vit l’équipe dans NatCORE",
          "Chaîne claire de la vente à la production et au suivi client",
        ]
      )}
      <div class="process-manual">
        <div class="pm-hero">
          <h1>📘 Manuel des processus Cerabec</h1>
          <p>
            Une structure opérationnelle basée sur les meilleures pratiques du marché,
            permettant de standardiser, optimiser et améliorer les opérations.
          </p>
          <p class="pm-tagline">
            Ce que vous voyez dans le système = ces processus en action
          </p>
        </div>
        ${pmGlobalFlow()}
        ${pmTabs("entree")}
        <div id="pm-content" class="pm-content" role="tabpanel" aria-live="polite"></div>
      </div>
    `;
  }

  function genericPage(title, pageId, moduleIntroExtra) {
    const hints = {
      marcel_ia: {
        marche: [
          "Vue agrégée : La Piazza + 2 autres dossiers — seul La Piazza combine alerte marge + relance ouverte.",
          "Problème : dispersion des signaux si les modules ne sont pas consultés dans l’ordre du pipeline.",
        ],
        natcore: [
          "Orchestrateur Cerabec / NatCORE : mêmes règles de scoring sur toutes les entrées qualifiées.",
          "Traçabilité complète des suggestions IA (démo — pas d’appel LLM réel).",
        ],
        marcel_ia: [
          "Synthèse du jour : 3 opportunités, 1 relance La Piazza, écart marge −8&nbsp;% vs moyenne.",
          "Action : enchaîner Soumissions → Opportunités → Planification dans l’ordre pour la démo client.",
        ],
      },
      marche: {
        marche: [
          "Comparables céramique pro : fourchette prix au pi² au-dessus de votre ligne La Piazza actuelle.",
          "Problème : positionnement prix attractif mais fragile pour la rentabilité chantier.",
        ],
        natcore: [
          "Indexation des comparables dans NatCORE — mise à jour trimestrielle (données démo).",
        ],
        marcel_ia: [
          "Lecture Marcel_IA : ajuster le discours commercial vers la valeur pose + garantie, pas seulement le prix.",
        ],
      },
    };
    const h = hints[pageId] || {
      marche: ["Données de démonstration."],
      natcore: ["Intégration NatCORE (démo)."],
      marcel_ia: ["Insights Marcel_IA (démo)."],
    };
    const introBlock =
      moduleIntroExtra &&
      moduleIntro(title, moduleIntroExtra.col1, moduleIntroExtra.col2, {
        col1Title: moduleIntroExtra.col1Title,
        col2Title: moduleIntroExtra.col2Title,
        col3Title: moduleIntroExtra.col3Title,
        col3Items: moduleIntroExtra.col3,
      });
    return `
      ${introBlock || ""}
      <h2 class="page-title">${escapeDisplayText(title)}</h2>
      ${clientSpotlightLaPiazza()}
      ${storyFlowHint()}
      ${triPanels(pageId, h)}
    `;
  }

  /* —— Narration vocale (Web Speech API) —— */
  const narrationSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  let narrationQueue = [];
  let narrationIndex = 0;
  let narrationUtterance = null;
  let narrationState = "idle";
  let narrationGen = 0;

  let narrationEls = {};

  function setNarrationLiveState(title, text) {
    const panel = narrationEls.livePanel;
    const titleEl = narrationEls.liveTitle;
    const textEl = narrationEls.liveText;
    if (!panel || !titleEl || !textEl) return;
    titleEl.textContent = normalizeDisplayText(title || "");
    textEl.textContent = normalizeDisplayText(text || "");
    textEl.setAttribute("title", normalizeDisplayText(text || ""));
    panel.classList.remove("is-hidden");
    panel.setAttribute("aria-hidden", "false");
  }

  function clearNarrationLiveState() {
    const panel = narrationEls.livePanel;
    const titleEl = narrationEls.liveTitle;
    const textEl = narrationEls.liveText;
    if (titleEl) titleEl.textContent = "";
    if (textEl) {
      textEl.textContent = "";
      textEl.removeAttribute("title");
    }
    if (panel) {
      panel.classList.add("is-hidden");
      panel.setAttribute("aria-hidden", "true");
    }
  }

  function pickBestFrenchVoice() {
    if (!narrationSupported) return { voice: null, lang: "fr-CA" };
    const voices = window.speechSynthesis.getVoices();
    const frAll = voices.filter((v) => /^fr/i.test(v.lang || ""));
    const frCA = frAll.filter((v) => /^fr-ca/i.test(v.lang || ""));
    const frFR = frAll.filter((v) => /^fr-fr/i.test(v.lang || ""));
    const pool = frCA.length ? frCA : frFR.length ? frFR : frAll;
    if (!pool.length) return { voice: null, lang: "fr-FR" };
    const femaleHints =
      /hortense|julie|amélie|amelie|sophie|marie|virginie|céline|celine|nathalie|camille|léa|lea|anne|female|féminin|femme|woman|google\s*français/i;
    const sorted = [...pool].sort((a, b) => {
      const fa = femaleHints.test(a.name || "") ? 1 : 0;
      const fb = femaleHints.test(b.name || "") ? 1 : 0;
      return fb - fa;
    });
    const voice = sorted[0];
    const lang = voice.lang && /^fr/i.test(voice.lang) ? voice.lang : "fr-CA";
    return { voice, lang };
  }

  /**
   * Extrait titre (en-tête) et corps du bloc « Rôle du module » pour TTS et panneau live.
   * Le joint title + ". " + text reproduit l’ancienne chaîne parlée unique.
   */
  function extractModuleIntroParts(container) {
    if (!container) return { title: "", text: "" };
    const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
    const heading = container.querySelector(".module-intro-heading");
    const title = heading ? norm(heading.textContent) : "";
    const bodyParts = [];

    const sub = container.querySelector(".module-subtitle");
    if (sub) bodyParts.push(norm(sub.textContent));

    container.querySelectorAll(".module-intro-col").forEach((col) => {
      const t = col.querySelector(".module-intro-col-title");
      const titleText = t ? norm(t.textContent) : "";
      const items = [...col.querySelectorAll("li")]
        .map((li) => norm(li.textContent))
        .filter(Boolean);
      const segs = [titleText, ...items].filter(Boolean);
      if (segs.length) bodyParts.push(segs.join(". "));
    });

    const text = bodyParts.filter(Boolean).join(". ");
    return { title, text };
  }

  function getModuleIntroNarrationFromDom() {
    if (!mainEl) return null;
    const intro = mainEl.querySelector(".module-intro");
    if (!intro) return null;
    const { title, text } = extractModuleIntroParts(intro);
    if (!title && !text) return null;
    return [{ id: null, title, text }];
  }

  function readCurrentModuleRole() {
    playNarration();
  }

  function buildPresentationNarrationSequence() {
    return [
      {
        id: "hero",
        title: "Introduction",
        text:
          "Et si Cerabec ne perdait plus aucune opportunité ? Aujourd'hui, une grande partie de l'information est dispersée, et plusieurs décisions reposent encore sur l'expérience et la mémoire. Et si un système pouvait vous donner une vision claire, et vous guider dans vos décisions au quotidien ? Cette démonstration est propulsée par NatCORE et Marcel_IA.",
      },
      {
        id: "today",
        title: "Aujourd'hui",
        text:
          "Voici la situation actuelle. Les informations sont réparties entre plusieurs personnes et outils. Les suivis manuels sont difficiles à maintenir. Des opportunités passent parfois entre les mailles du filet. Certaines décisions sont prises sans toute l'information disponible.",
      },
      {
        id: "natcore",
        title: "Demain avec NatCORE",
        text:
          "Avec NatCORE, vous obtenez une vue complète des clients et des projets. Le processus est structuré de A à Z. Aucune opportunité n'est oubliée, et les décisions s'appuient sur des données réelles.",
      },
      {
        id: "marcel",
        title: "Marcel_IA",
        text:
          "Marcel_IA analyse les projets et les soumissions, détecte les opportunités cachées, identifie les risques et suggère des actions concrètes pour votre équipe Cerabec.",
      },
      {
        id: "impact",
        title: "Impact pour Cerabec",
        text:
          "L'impact attendu : plus d'opportunités concrétisées, moins d'erreurs et d'oublis, un meilleur contrôle des projets, et un support réel pour les équipes sur le terrain.",
      },
      {
        id: "transition",
        title: "Transition",
        text:
          "Lorsque vous serez prêt, passez à la démonstration interactive. Vous y suivrez un dossier client concret, du premier contact jusqu'à la facturation. Cliquez sur Commencer la démonstration pour continuer.",
      },
    ];
  }

  function getNarrationSequenceForPage(pageName) {
    if (pageName === "presentation") {
      return buildPresentationNarrationSequence();
    }
    return getModuleIntroNarrationFromDom();
  }

  function updateNarrationStatus(label) {
    const el = narrationEls.status;
    if (el) el.textContent = label;
  }

  function clearNarrationHighlights() {
    if (!mainEl) return;
    mainEl.querySelectorAll(".narration-block.is-speaking").forEach((el) => el.classList.remove("is-speaking"));
    mainEl
      .querySelectorAll(".narration-block-heading.is-speaking-text")
      .forEach((el) => el.classList.remove("is-speaking-text"));
  }

  function highlightNarrationBlock(blockId) {
    if (!mainEl || !blockId) return;
    clearNarrationHighlights();
    const block = mainEl.querySelector(`[data-narration-section="${blockId}"]`);
    if (block) {
      block.classList.add("is-speaking");
      const h = block.querySelector(".narration-block-heading");
      if (h) h.classList.add("is-speaking-text");
    }
  }

  function syncMarcelAssistantActive() {
    const el = narrationEls.marcelAssistant;
    if (!el) return;
    const on = narrationSupported && (narrationState === "playing" || narrationState === "paused");
    el.classList.toggle("marcel-active", on);
  }

  function syncNarrationButtonStates() {
    const { play, pause, resume, stop, readPres } = narrationEls;
    if (!play) {
      syncMarcelAssistantActive();
      return;
    }
    const seq = getNarrationSequenceForPage(activePage);
    const hasPage = Array.isArray(seq) && seq.length > 0;
    const syn = window.speechSynthesis;

    if (!narrationSupported) {
      play.disabled = true;
      pause.disabled = true;
      resume.disabled = true;
      stop.disabled = true;
      if (readPres) readPres.disabled = true;
      syncMarcelAssistantActive();
      return;
    }

    if (readPres) {
      readPres.disabled = !hasPage || narrationState === "playing" || narrationState === "paused";
    }

    stop.disabled =
      !narrationSupported ||
      (narrationState === "idle" && !syn.speaking && !syn.pending);

    play.disabled = !hasPage || narrationState === "playing" || narrationState === "paused";
    pause.disabled = !hasPage || narrationState !== "playing";
    resume.disabled = !hasPage || narrationState !== "paused";

    syncMarcelAssistantActive();
  }

  function syncNarrationUI() {
    if (!narrationEls.play) return;
    const seq = getNarrationSequenceForPage(activePage);
    const hasPage = Array.isArray(seq) && seq.length > 0;

    if (!narrationSupported) {
      updateNarrationStatus("Narration non disponible sur ce navigateur");
      syncNarrationButtonStates();
      return;
    }

    if (!hasPage && narrationState === "idle") {
      updateNarrationStatus("Narration non disponible sur cette page");
    }

    syncNarrationButtonStates();
  }

  function speakNextNarrationBlock() {
    if (!narrationSupported) return;
    const gen = narrationGen;
    if (narrationState !== "playing") return;

    if (narrationIndex >= narrationQueue.length) {
      narrationState = "idle";
      narrationQueue = [];
      narrationIndex = 0;
      narrationUtterance = null;
      clearNarrationHighlights();
      clearNarrationLiveState();
      updateNarrationStatus("Narration terminée");
      syncNarrationButtonStates();
      return;
    }

    const item = narrationQueue[narrationIndex];
    if (item.id) {
      highlightNarrationBlock(item.id);
    } else {
      clearNarrationHighlights();
    }

    const { voice, lang } = pickBestFrenchVoice();
    const line = [item.title, item.text].filter(Boolean).join(". ").trim();
    setNarrationLiveState(item.title || "", item.text || "");
    const utter = new SpeechSynthesisUtterance(line);
    narrationUtterance = utter;
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.volume = 1;
    utter.lang = lang;
    if (voice) utter.voice = voice;

    utter.onend = () => {
      if (gen !== narrationGen) return;
      if (narrationState !== "playing") return;
      narrationIndex += 1;
      speakNextNarrationBlock();
    };

    utter.onerror = () => {
      if (gen !== narrationGen) return;
      if (narrationState !== "playing") return;
      narrationIndex += 1;
      speakNextNarrationBlock();
    };

    window.speechSynthesis.speak(utter);
  }

  function playNarration() {
    if (!narrationSupported) return;
    const seq = getNarrationSequenceForPage(activePage);
    if (!seq || !seq.length) return;

    if (narrationState === "paused" && window.speechSynthesis.paused) {
      resumeNarration();
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch (_) {}
    narrationGen += 1;
    narrationQueue = seq.slice();
    narrationIndex = 0;
    narrationState = "playing";
    updateNarrationStatus("Lecture en cours");
    syncNarrationButtonStates();
    speakNextNarrationBlock();
  }

  function pauseNarration() {
    if (!narrationSupported) return;
    if (narrationState !== "playing") return;
    try {
      window.speechSynthesis.pause();
    } catch (_) {}
    narrationState = "paused";
    updateNarrationStatus("En pause");
    syncNarrationButtonStates();
  }

  function resumeNarration() {
    if (!narrationSupported) return;
    if (narrationState !== "paused") return;
    try {
      window.speechSynthesis.resume();
    } catch (_) {}
    narrationState = "playing";
    updateNarrationStatus("Lecture en cours");
    syncNarrationButtonStates();
  }

  function stopNarration() {
    narrationGen += 1;
    if (narrationSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    narrationUtterance = null;
    narrationState = "idle";
    narrationIndex = 0;
    narrationQueue = [];
    clearNarrationHighlights();
    clearNarrationLiveState();
    updateNarrationStatus("Narration prête");
    syncNarrationButtonStates();
  }

  function initNarration() {
    narrationEls = {
      play: document.getElementById("narration-play"),
      pause: document.getElementById("narration-pause"),
      resume: document.getElementById("narration-resume"),
      stop: document.getElementById("narration-stop"),
      readPres: document.getElementById("narration-read-presentation"),
      status: document.getElementById("narration-status"),
      livePanel: document.getElementById("narrationLivePanel"),
      liveTitle: document.getElementById("narrationLiveTitle"),
      liveText: document.getElementById("narrationLiveText"),
      marcelAssistant: document.getElementById("marcelIAAssistant"),
    };

    narrationEls.marcelAssistant?.addEventListener("click", () => readCurrentModuleRole());
    narrationEls.marcelAssistant?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        readCurrentModuleRole();
      }
    });

    narrationEls.play?.addEventListener("click", playNarration);
    narrationEls.pause?.addEventListener("click", pauseNarration);
    narrationEls.resume?.addEventListener("click", resumeNarration);
    narrationEls.stop?.addEventListener("click", stopNarration);
    narrationEls.readPres?.addEventListener("click", () => readCurrentModuleRole());

    if (narrationSupported) {
      const onVoices = () => syncNarrationUI();
      onVoices();
      window.speechSynthesis.onvoiceschanged = onVoices;
    }

    clearNarrationLiveState();
    syncNarrationUI();
  }

  const PAGES = {
    presentation: () => pagePresentation(),
    dashboard: () => pageDashboard(),
    entrees: () => pageEntrees(),
    clients: () => pageClients(),
    soumissions: () => pageSoumissions(),
    opportunites: () => pageOpportunites(),
    planification: () => pagePlanification(),
    installations: () => pageInstallations(),
    facturation: () => pageFacturation(),
    suivi: () => pageSuivi(),
    marcel_ia: () =>
      genericPage("Analyse intelligente (Marcel_IA)", "marcel_ia", {
        col1Title: "Situation",
        col2Title: "Marcel_IA",
        col3Title: "Impact",
        col1: ["Décisions basées sur intuition", "Manque de structure stratégique"],
        col2: ["Analyse des données disponibles", "Génération d’angles de réflexion", "Aide à la décision"],
        col3: ["Meilleur positionnement", "Décisions plus rapides", "Meilleure préparation client"],
      }),
    marche: () =>
      genericPage("Marché / Comparables", "marche", {
        col1Title: "Marché",
        col2Title: "Solution",
        col3Title: "Impact",
        col1: ["Difficulté à situer une offre", "Peu de références concrètes"],
        col2: ["Comparables structurés", "Références visuelles et prix"],
        col3: ["Crédibilité renforcée", "Argumentaire solide", "Meilleur positionnement"],
      }),
    conclusion: () => pageConclusion(),
    "process-manual": () => pageProcessManual(),
    "cockpit-strategique": () => pageCockpitStrategique(),
    "espace-karine": () => pageEspaceKarine(),
  };

  function render(pageId) {
    stopNarration();
    const leavingKarine = activePage === "espace-karine" && pageId !== "espace-karine";
    if (leavingKarine) {
      lockKarineAccess();
    }
    const fn = PAGES[pageId] || PAGES.dashboard;
    mainEl.innerHTML = fn();
    activePage = pageId;
    syncMainViewTitle(pageId);
    document.querySelectorAll(".nav-item").forEach((btn) => {
      const on = btn.dataset.page === pageId;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-current", on ? "page" : "false");
    });
    syncNarrationUI();
    if (pageId === "process-manual") {
      initProcessManualTabs("entree");
    }
    if (pageId === "conclusion") {
      initConclusionPage();
    }
  }

  function buildNav() {
    navEl.innerHTML = NAV_ITEMS.map(
      (item) => {
        const extraNav = item.navClass ? ` ${item.navClass}` : "";
        return `
      <button type="button" class="nav-item${extraNav}" data-page="${item.id}" aria-current="${item.id === activePage ? "page" : "false"}">
        <span class="nav-icon" aria-hidden="true">${item.icon}</span>
        <span>${escapeDisplayText(item.label)}</span>
      </button>
    `;
      }
    ).join("");

    navEl.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => render(btn.dataset.page));
    });
  }

  mainEl.addEventListener("submit", (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement) || form.id !== "karine-gate-form") return;
    e.preventDefault();
    const msg = mainEl.querySelector("#karine-gate-msg");
    const input = form.querySelector("#karine-gate-input");
    if (!input) return;
    if (msg) msg.textContent = "";
    if (input.value.trim() === KARINE_PASSWORD) {
      unlockKarineAccess();
      render("espace-karine");
    } else if (msg) {
      msg.textContent = "Accès refusé";
    }
  });

  mainEl.addEventListener("click", (e) => {
    const cta = e.target.closest(".presentation-cta");
    if (cta && cta.dataset.gotoPage) render(cta.dataset.gotoPage);
    if (e.target.closest("[data-karine-logout]")) {
      e.preventDefault();
      lockKarineAccess();
      render("espace-karine");
    }
  });

  lockKarineAccess();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (activePage === "espace-karine" && karineIsUnlocked()) {
        lockKarineAccess();
      }
      return;
    }
    if (activePage === "espace-karine") {
      render("espace-karine");
    }
  });

  buildNav();
  render("presentation");
  initNarration();
  tickClock();
  setInterval(tickClock, 30000);
})();
