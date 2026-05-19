# Plateforme ONG Foresterie — Structure & TODO

## 1) Structure des pages

### Page 1 — Connexion
Fichier : frontend/public/index.html
- Logo ONG + carte de connexion centrée
- Champs : email, mot de passe
- Validation simulée
- Redirection vers dashboard

### Page 2 — Dashboard
Fichier : frontend/public/dashboard.html
- Barre supérieure + navigation latérale fixe
- Cartes statistiques (mock)
- Activité récente (mock)
- Accès rapide vers les modules

### Page 3 — Dépôt de fichiers
Fichier : frontend/public/depot.html
- Zone drag & drop
- Sélection de fichier
- Métadonnées (titre, catégorie)
- Historique local des dépôts

### Page 4 — Bibliothèque
Fichier : frontend/public/bibliotheque.html
- Recherche texte
- Filtres : catégorie, date, utilisateur
- Tableau documents (mock)
- Actions simulées : voir / télécharger / supprimer

### Page 5 — Paiements (interne)
Fichier : frontend/public/paiements.html
- Génération de lien de paiement avec montant libre
- Consultation des paiements
- Recherche + filtres (statut, date, utilisateur)

### Page client — Paiement par lien
Fichier : frontend/public/paiement-lien.html
- Pas d’accès au menu interne
- Formulaire de checkout simulé
- Résumé paiement (objet, montant, référence)

### Page 6 — Automatisation
Fichier : frontend/public/automation.html
- État des automatisations (cartes)
- Logs des événements
- Export Excel / CSV simulé
- Règles d’automatisation configurables

---

## 2) Fichiers clés

- HTML pages : frontend/public/
- Styles globaux : frontend/src/css/style.css
- Logique front-end : frontend/src/js/app.js
- Documentation : docs/

---

## 3) Ce qu’il reste à faire (prochaines étapes)

### Priorité haute
1. Persistance locale
- Sauvegarder bibliothèques/paiements/dépôts dans localStorage
- Recharger automatiquement les données au refresh

2. Navigation sans rechargement (SPA légère)
- Intercepter les liens internes
- Charger le contenu dynamiquement
- Conserver l’état des filtres

3. Validation UX
- Messages inline homogènes
- États de boutons (loading/disabled)
- Gestion d’erreurs simulées plus réaliste

### Priorité moyenne
4. Accessibilité
- Vérifier contrastes, focus clavier, ARIA
- Améliorer navigation clavier sur tous les composants

5. Internationalisation
- Préparer les textes pour FR/EN

6. Nettoyage code
- Factoriser fonctions utilitaires (formatDate, formatAmount, validation)
- Isoler chaque module page dans des fichiers JS séparés

7. Page Automatisation
- Vérifier le rendu des cartes, logs et règles
- Ajouter persistance plus robuste des logs si nécessaire

### Priorité basse
7. Passage backend réel (phase 2)
- API auth + gestion documents + paiements
- Base de données
- Historique réel et rôles utilisateurs

---

## 4) État actuel

Prototype UI opérationnel, cohérent visuellement, responsive, avec données simulées et navigation interne multi-pages.

## 5) Règle d'accès

- Les pages applicatives (connexion, dashboard, dépôt, bibliothèque, paiements) sont bloquées sur petit écran.
- La page client de paiement par lien reste accessible sur mobile.

## 6) Automatisation

- Page ajoutée et liée au dashboard + menu latéral.
- Logs et règles simulés stockés côté front.
- Exports simulés disponibles (console / téléchargement fictif).
