# Calendrier / Activités / Inscriptions

## Transformation Parties → Calendrier

Le module historique « Parties » (liste basée sur `matches`) est remplacé côté navigation par **Calendrier**. L’URL `/parties` redirige vers `/calendrier`. La fiche `/parties/:id` reste disponible pour les fiches legacy **avec** la permission `matches.read`.

## Vision produit

- **Mulligan** : vérité lecture des rondes synchronisées via **`rounds_v2`** (pas `matches`). Les rondes sans date métier exploitable sont **exclues** et journalisées (échantillon dans la réponse API `meta.mulligan_exclusions_sample`).
- **GolfMAP interne** : vérité des événements créés dans GolfMAP (collection `activity_events`). Aucune écriture vers Mulligan depuis ce flux.

## Modèles

- `activity_events` : champs id, source (`golfmap_internal`), type, titre, dates, lieu, inscription, statut, etc.
- `activity_registrations` : id, activity_event_id, player_id, response_status, unicité (event, player).

## Permissions

- `calendar.read` : voir le calendrier (défaut : rôle joueur + rôles avec `matches.read`).
- `calendar.rounds.create` : créer une partie interne depuis le calendrier (attribuée aux rôles qui ont `matches.create` au seed).
- `calendar.events.create` : créer un événement hors golf (même règle).

Les noms d’utilisateurs de confiance ne sont **pas** codés en dur dans le frontend : attribuer les permissions via **Rôles & permissions** (ou même logique que `matches.create`).

## Endpoints principaux

- `GET /api/calendar/capabilities`
- `GET /api/calendar/events?from=&to=`
- `GET /api/calendar/events/{id}`
- `POST /api/calendar/events/{id}/register` / `unregister`
- `POST /api/calendar/events/create-round` / `create-event`
- `GET /api/calendar/month-summary`

## Limites connues (ce BT)

- Pas de drag & drop, pas de récurrence, pas d’édition complète post-création.
- Inscription Mulligan : **non** simulée (lecture seule).
- Fiche match legacy `/parties/:id` reste séparée du panneau détail calendrier.
