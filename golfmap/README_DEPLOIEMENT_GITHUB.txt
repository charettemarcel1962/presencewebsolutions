GolfMAP — démo statique (GitHub Pages)
============================================

Contenu : build exporté (index.html, static/, assets).

!!! URL OBLIGATOIRE (sinon 404 « Site not found ») !!!
L’app n’existe PAS à https://VOTRE_USER.github.io/login
Utiliser le CHEMIN COMPLET, par exemple :
https://charrettemarcel1962.github.io/presencewebsolutions/golfmap/
Puis Connexion : …/golfmap/login (voir aussi LISEZMOI_URL.txt dans ce dossier).

DÉPLOIEMENT RAPIDE
------------------
1. Ouvrir ce dossier GolfMAP_V1_GITHUB après un build réussi (yarn build:demo-github ou npm run build:demo-github dans /frontend).
2. Sur GitHub : dépôt cible > dossier presencewebsolutions/golfmap (ou équivalent) > Add file > Upload files.
3. Déposer TOUS les fichiers de ce dossier (y compris .nojekyll et 404.html).
4. GitHub > Settings > Pages : source = branche + dossier / racine du site selon votre structure.
5. Attendre la propagation ; ouvrir l’URL publique COMPLÈTE ci-dessus.

Option racine user.github.io : dossier delivery/GithubPages_UserSite_Root_Redirect (voir son README.txt).

NOTES
-----
- Aucun backend : données simulées (REACT_APP_GOLFMAP_DEMO_STATIC au build).
- 404.html = copie de index.html pour le routage SPA sur GitHub Pages (uniquement sous /presencewebsolutions/golfmap/).
- PUBLIC_URL + REACT_APP_GOLFMAP_GITHUB_BASE + REACT_APP_API_URL au build : préfixe /presencewebsolutions/golfmap (assets, basename, base API même origine ; trafic réel bloqué par adaptateur démo).

Généré par : frontend/scripts/copy-demo-delivery.cjs
