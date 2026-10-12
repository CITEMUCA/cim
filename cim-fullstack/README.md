# Portail Dynamique Cité de l'Innovation Marrakech (CIM) + Espace d'Administration

Projet complet **Node.js + Express + PostgreSQL** (avec mode de secours automatique) et **Panel d'Administration visuel** dédié aux gestionnaires et non-développeurs.

---

## 🌟 Fonctionnalités du Système

### 1. 🌐 Portail Public pour les Visiteurs
- **Diaporama automatique en arrière-plan** : Défilement fluide de haute qualité de vos 29 photos (ou plus) avec temps d'intervalle paramétrable.
- **Bandeau d'annonce en haut de page** : Affichage personnalisable (activer/désactiver, texte d'urgence/événement, lien et couleur).
- **Cartes de liens et réseaux sociaux dynamiques** : Titre, sous-titre, icônes (FontAwesome ou images téléversées), couleurs sur mesure, badges d'événements et mise en avant.
- **Identité officielle CIM** : Logo officiel, titre, université Cadi Ayyad et contact e-mail.

### 2. 🔐 Espace d'Administration (/admin)
Conçu spécifiquement pour être simple et visuel sans aucune compétence technique nécessaire :
- **Gestion des Liens & Réseaux Sociaux** :
  - Ajouter, modifier et supprimer des liens en 1 clic.
  - Réorganiser l'ordre d'affichage (boutons Monter ⬆️ / Descendre ⬇️).
  - Activer / Masquer un lien instantanément (interrupteur On/Off).
  - Palette visuelle de couleurs pour chaque bouton (Rouge CIM, Bleu, Instagram, LinkedIn, etc.) ou code couleur HEX libre.
  - Sélecteur d'icônes avec aperçu en temps réel + possibilité d'**importer vos propres fichiers d'icônes** (PNG, SVG, JPG).
  - Badges personnalisés (ex: "Hackathon 2026", "Nouveau", "Urgent").
  - Option "Mise en avant" (effet vedette avec bordure lumineuse).
- **Diaporama Photos** :
  - Glisser-déposer (Drag & Drop) de nouvelles photos pour les intégrer au diaporama.
  - Activer / Masquer une photo sans avoir à la supprimer.
  - Choix de la vitesse de transition (3s, 4s, 6s, 8s, 10s).
- **Bandeau d'Annonce** :
  - Interrupteur activer/désactiver.
  - Personnalisation du message, du lien et de la couleur avec aperçu direct.
- **Identité du Site** :
  - Modification du titre du portail, sous-titre et email de contact.
  - Téléversement d'un nouveau logo officiel en 1 clic.
- **Sécurité** :
  - Authentification par mot de passe et session sécurisée.
  - Formulaire de changement de mot de passe administrateur.

---

## 🚀 Démarrage Rapide

### 1. Installation des dépendances (déjà fait)
```bash
cd cim-fullstack
npm install
```

### 2. Configuration PostgreSQL
Le fichier `.env` est prêt à l'emploi. Vous pouvez y renseigner votre mot de passe PostgreSQL :
```env
PORT=3000
PG_USER=postgres
PG_PASSWORD=votre_mot_de_passe_postgres
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=cim_db

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

> **Astuce de résilience :** Si PostgreSQL n'a pas encore de mot de passe configuré ou n'est pas accessible immédiatement, l'application bascule automatiquement sur un mode SQLite local autonome. L'application et l'administration fonctionnent donc à 100% dans tous les cas !

### 3. Lancer l'application
```bash
npm start
```

Puis ouvrez votre navigateur :
- **Portail Public** : [http://localhost:3000](http://localhost:3000)
- **Espace Administration** : [http://localhost:3000/admin](http://localhost:3000/admin)

**Identifiants par défaut :**
- **Identifiant :** `admin`
- **Mot de passe :** `admin123` *(modifiable dans l'onglet Sécurité de l'admin)*
