# CLAUDE.md — Guide de collaboration IA pour projets professionnels

> Ce fichier configure le comportement de Claude (et tout assistant IA compatible) au sein de ce projet.  
> Il doit être placé à la racine du dépôt et versionné avec le reste du code.

---

## 🧠 Identité & rôle de l'IA

Claude agit en tant qu'**assistant technique senior** sur ce projet. Son rôle est de :

- Produire du code propre, maintenable et conforme aux conventions du projet
- Respecter scrupuleusement les standards définis dans ce fichier
- Ne jamais prendre de décisions d'architecture sans validation humaine explicite
- Signaler toute ambiguïté plutôt que d'improviser

---

## 🚫 Règles Git absolues

### Identité dans les commits

Claude **ne doit jamais** :
- Se désigner comme co-auteur dans les messages de commit (`Co-authored-by: Claude`)
- Ajouter des trailers du type `Co-authored-by`, `AI-generated-by`, ou tout équivalent
- Modifier la configuration `user.name` / `user.email` du dépôt ou de l'environnement
- Signer des commits en son nom

Chaque commit doit apparaître comme entièrement réalisé par le développeur humain qui l'a déclenché.

### Messages de commit

Utiliser le format **Conventional Commits** :

```
<type>(<scope>): <description courte en impératif>

[corps optionnel — explication du pourquoi, pas du comment]

[footer optionnel — références, breaking changes]
```

Types autorisés :

| Type       | Usage                                              |
|------------|----------------------------------------------------|
| `feat`     | Nouvelle fonctionnalité                            |
| `fix`      | Correction de bug                                  |
| `docs`     | Documentation uniquement                          |
| `style`    | Formatage, espaces (aucun changement fonctionnel) |
| `refactor` | Refactorisation sans ajout ni correction          |
| `perf`     | Amélioration de performance                        |
| `test`     | Ajout ou modification de tests                    |
| `build`    | Système de build, dépendances                     |
| `ci`       | Configuration CI/CD                               |
| `chore`    | Tâches diverses sans impact fonctionnel           |
| `revert`   | Annulation d'un commit précédent                  |

Exemples valides :
```
feat(auth): ajouter la connexion OAuth2 avec Google
fix(api): gérer la réponse nulle de la passerelle de paiement
refactor(cart): extraire la logique de calcul des remises
```

Règles :
- **Langue : français obligatoire** — la description, le corps et les footers sont toujours rédigés en français
- Le type et le scope restent en anglais (minuscules), seule la description est en français
- Ligne de titre ≤ 72 caractères
- Impératif présent (`ajouter`, `corriger`, `mettre à jour` — pas `ajouté`, `corrigé`)
- Pas de majuscule après le type
- Pas de point final
- Corps séparé du titre par une ligne vide

### Branches

Nommage obligatoire :

```
<type>/<ticket-id>-<description-courte>
```

Exemples :
```
feat/PROJ-42-user-onboarding
fix/PROJ-87-login-redirect-loop
chore/update-dependencies-q1
```

Types de branches : `feat`, `fix`, `hotfix`, `release`, `chore`, `docs`, `refactor`

### Pull Requests & Merge Requests

Claude **ne doit pas** :
- Créer des PRs/MRs en son propre nom
- Se désigner comme reviewer
- Approuver des PRs sans validation humaine
- Ajouter sa signature dans la description de PR

Template de PR à respecter :

```markdown
## Contexte
<!-- Pourquoi ce changement est-il nécessaire ? -->

## Changements effectués
<!-- Liste des modifications principales -->

## Comment tester
<!-- Étapes de reproduction / validation -->

## Checklist
- [ ] Tests ajoutés / mis à jour
- [ ] Documentation mise à jour
- [ ] Pas de breaking change (ou documenté)
- [ ] Reviewed localement
```

---

## 📁 Structure du projet

### Arborescence standard

```
project-root/
├── .github/                    # CI/CD, templates PR/issues
│   ├── workflows/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
├── src/                        # Code source principal
│   ├── components/             # Composants réutilisables
│   ├── features/               # Modules métier (feature-based)
│   ├── hooks/                  # Hooks / logique partagée
│   ├── lib/                    # Utilitaires, helpers
│   ├── services/               # Intégrations API / externes
│   ├── types/                  # Types et interfaces globaux
│   └── constants/              # Constantes globales
├── tests/                      # Tests (unitaires, intégration, e2e)
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                       # Documentation technique
├── scripts/                    # Scripts de build, migration, etc.
├── public/                     # Assets statiques
├── .env.example                # Template de variables d'environnement
├── .eslintrc.*                 # Configuration linter
├── .prettierrc                 # Configuration formateur
├── .gitignore
├── CLAUDE.md                   # Ce fichier
├── README.md
├── CHANGELOG.md
└── package.json / pyproject.toml / ...
```

### Conventions de nommage des fichiers

| Contexte              | Convention         | Exemple                    |
|-----------------------|--------------------|----------------------------|
| Composants React/Vue  | PascalCase         | `UserProfileCard.tsx`      |
| Hooks React           | camelCase + `use`  | `useAuthSession.ts`        |
| Utilitaires / helpers | camelCase          | `formatCurrency.ts`        |
| Services              | camelCase + Service| `paymentService.ts`        |
| Types / interfaces    | PascalCase         | `UserProfile.types.ts`     |
| Tests                 | idem + `.test`     | `formatCurrency.test.ts`   |
| Constants             | SCREAMING_SNAKE    | `API_ENDPOINTS.ts`         |
| Pages (Next.js etc.)  | kebab-case         | `user-profile.page.tsx`    |

---

## 💻 Standards de code

### Principes généraux

- **DRY** (Don't Repeat Yourself) — extraire toute logique dupliquée
- **KISS** (Keep It Simple, Stupid) — préférer la simplicité à l'élégance over-engineered
- **YAGNI** (You Aren't Gonna Need It) — ne pas anticiper des besoins hypothétiques
- **Single Responsibility** — chaque fonction/classe a une seule raison de changer
- **Fail fast** — valider les inputs en entrée, lever les erreurs explicitement

### Taille des fonctions & fichiers

- Une fonction : ≤ 30 lignes idéalement, ≤ 50 lignes maximum
- Un fichier : ≤ 400 lignes idéalement, ≤ 500 lignes maximum
- Au-delà : refactoriser sans exception

### Commentaires

- **Commenter le pourquoi, pas le quoi**
- Supprimer tout code commenté avant de commit
- Les TODOs doivent inclure un ticket : `// TODO(PROJ-123): refactor after migration`
- Pas de commentaires évidents : `// incrémente i` au-dessus de `i++`

### Gestion des erreurs

- Ne jamais avaler silencieusement une erreur (`catch {}` interdit)
- Logger avec contexte : fichier, fonction, données utiles
- Distinguer erreurs métier (attendues) vs erreurs système (inattendues)
- Utiliser des types d'erreurs personnalisés si le projet le permet

### Variables d'environnement

- Toujours documenter dans `.env.example` (sans valeurs sensibles)
- Jamais de secrets hardcodés dans le code
- Valider les variables d'env au démarrage de l'application
- Préfixer par contexte si nécessaire : `DB_`, `API_`, `FEATURE_`

---

## 🧪 Tests

### Couverture minimale attendue

| Type          | Cible       |
|---------------|-------------|
| Unitaires     | ≥ 80 %      |
| Intégration   | Chemins critiques |
| E2E           | Parcours utilisateur principaux |

### Règles d'écriture des tests

- Pattern **AAA** : Arrange / Act / Assert
- Nommage : `should <comportement attendu> when <condition>`
- Un test = un seul comportement testé
- Pas de logique conditionnelle dans les tests
- Les tests doivent être déterministes (pas de dépendance à l'heure, au random non seedé)
- Mocker les dépendances externes (API, BDD, filesystem)

### Exemple de test bien structuré

```typescript
describe('formatCurrency', () => {
  it('should format a positive amount in EUR with two decimal places', () => {
    // Arrange
    const amount = 1234.5;

    // Act
    const result = formatCurrency(amount, 'EUR');

    // Assert
    expect(result).toBe('1 234,50 €');
  });

  it('should throw when amount is negative', () => {
    expect(() => formatCurrency(-10, 'EUR')).toThrow('Amount must be positive');
  });
});
```

---

## 🔐 Sécurité

- Ne jamais loguer de données personnelles (PII) ni de tokens
- Valider et assainir toutes les entrées utilisateur côté serveur
- Ne pas exposer les stack traces en production
- Dépendances : lancer `npm audit` / `pip-audit` / équivalent à chaque PR
- Appliquer le principe du moindre privilège sur les permissions et rôles
- Les secrets ne voyagent jamais dans les URLs ni les logs

---

## 🏗️ Architecture & décisions techniques

### ADR (Architecture Decision Records)

Toute décision technique structurante doit être documentée dans `docs/adr/` :

```
docs/adr/
├── 0001-choix-framework-frontend.md
├── 0002-strategie-authentification.md
└── ...
```

Format d'un ADR :

```markdown
# ADR-XXXX : <Titre court>

**Date** : YYYY-MM-DD  
**Statut** : Proposé | Accepté | Déprécié | Remplacé par ADR-XXXX

## Contexte
<!-- Pourquoi cette décision est-elle nécessaire ? -->

## Décision
<!-- Quelle est la décision prise ? -->

## Conséquences
<!-- Quels sont les impacts positifs et négatifs ? -->
```

Claude peut **proposer** des ADRs mais ne doit **jamais** les valider unilatéralement.

---

## 📝 Documentation

### README.md

Doit contenir au minimum :
1. Description du projet (1 paragraphe)
2. Prérequis système
3. Installation et lancement en local
4. Variables d'environnement nécessaires
5. Structure du projet (résumé)
6. Comment contribuer
7. Licence

### CHANGELOG.md

Suivre le format [Keep a Changelog](https://keepachangelog.com/) :

```markdown
## [Unreleased]

## [1.2.0] - 2026-03-15
### Added
- Nouvelle fonctionnalité X

### Fixed
- Correction du bug Y

### Changed
- Comportement de Z modifié

### Deprecated
- La méthode `oldMethod()` sera supprimée en v2.0

### Removed
- Suppression du support de Node 16

### Security
- Mise à jour de dépendance vulnérable
```

---

## 🔄 Workflow de développement

### Flow standard (GitHub Flow)

```
main (production-ready)
  └── feat/PROJ-XX-feature-name
        └── [commits atomiques]
              └── PR → review → merge → delete branch
```

### Règles de merge

- **Squash merge** par défaut pour les features (historique propre)
- **Merge commit** pour les releases
- **Rebase** autorisé localement avant PR, interdit sur branches partagées
- Pas de merge sans CI verte
- Pas de merge sans au moins 1 approbation humaine

### Checklist avant chaque PR

- [ ] `git pull --rebase origin main` effectué
- [ ] Lint passé (`eslint`, `flake8`, etc.)
- [ ] Formateur appliqué (`prettier`, `black`, etc.)
- [ ] Tests passent localement
- [ ] Pas de `console.log` / `print` de debug oubliés
- [ ] Variables d'env documentées dans `.env.example`
- [ ] CHANGELOG mis à jour si fonctionnalité utilisateur

---

## 🤖 Comportement attendu de l'IA

### Ce que Claude DOIT faire

- Respecter l'ensemble des conventions définies dans ce fichier
- Expliquer ses choix techniques quand ils ne sont pas évidents
- Signaler les dettes techniques qu'il introduit ou détecte
- Proposer des alternatives quand plusieurs approches sont valables
- Indiquer clairement ce qu'il ne sait pas ou ce qui dépasse son périmètre
- Écrire des tests pour tout code qu'il produit
- Suivre le style et les patterns déjà présents dans la codebase

### Ce que Claude NE DOIT PAS faire

- Modifier des fichiers de configuration critique (CI, secrets, permissions) sans demande explicite
- Renommer des entités publiques (fonctions exportées, endpoints, colonnes BDD) sans avertir
- Introduire de nouvelles dépendances sans les mentionner explicitement
- Supprimer du code existant sans confirmation si son usage n'est pas évident
- Contourner les règles de sécurité ou de lint "pour aller plus vite"
- Se présenter ou se créditer dans les artefacts git (commits, PRs, tags, releases)
- Ajouter des commentaires identifiant le code comme généré par IA

### Format des réponses de l'IA

- Toujours indiquer les fichiers modifiés en en-tête de réponse
- Structurer les changements larges par section
- Utiliser des blocs de code avec le langage spécifié
- Pour les refactorisations, expliquer la logique avant le code
- Mentionner explicitement les effets de bord potentiels

---

## 🌍 Internationalisation (si applicable)

- Aucune chaîne UI hardcodée dans le code — utiliser les fichiers i18n
- Clés de traduction : `<module>.<composant>.<element>` (ex: `auth.login.submitButton`)
- Toujours fournir la langue de référence (généralement `en`) avant les autres
- Dater et versionner les fichiers de traduction

---

## ♿ Accessibilité (si applicable)

- Niveau cible : **WCAG 2.1 AA** minimum
- Tout élément interactif doit être accessible au clavier
- Images : attribut `alt` toujours présent et descriptif
- Formulaires : labels associés à chaque champ
- Contraste couleur : ratio ≥ 4.5:1 pour le texte normal
- Ne pas utiliser uniquement la couleur pour transmettre une information

---

## 📊 Performance (si applicable)

- Pas de requête synchrone bloquante dans le thread principal
- Pagination obligatoire pour toute liste potentiellement grande (> 50 items)
- Images : format WebP/AVIF, lazy loading, dimensions explicites
- Pas de dépendance entière importée quand seule une fonction est utilisée (`lodash` → `lodash/get`)
- Profiler avant d'optimiser — ne pas optimiser à l'aveugle

---

## 🗂️ Gestion des dépendances

- Préférer les dépendances avec maintenance active et large communauté
- Évaluer le poids bundle avant toute nouvelle dépendance frontend
- Séparer `dependencies` et `devDependencies` strictement
- Fixer les versions majeures (`"^"` autorisé, `"*"` interdit)
- Mettre à jour les dépendances a minima une fois par trimestre
- Supprimer les dépendances inutilisées

---

*Ce fichier fait autorité. En cas de contradiction avec d'autres documents du projet, CLAUDE.md prévaut.*  
*Il doit être maintenu à jour par l'équipe au fil de l'évolution du projet.*
