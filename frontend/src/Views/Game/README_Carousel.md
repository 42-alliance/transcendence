# Carrousel 3D pour les Modes de Jeu

Ce carrousel 3D offre une interface moderne et interactive pour sélectionner les modes de jeu dans votre application Transcendence.

## Fonctionnalités

### ✨ Effets Visuels

- **Rotation 3D** : Les cartes sont disposées en cercle avec une rotation fluide
- **Perspective 3D** : Effet de profondeur avec mise en avant de la carte active
- **Animations fluides** : Transitions douces entre les cartes
- **Effets de survol** : Les cartes se soulèvent et s'agrandissent au survol
- **Design glassmorphism** : Arrière-plan flou avec transparence

### 🎮 Modes de Jeu Disponibles

1. **Random Adversaire** 🎮 - Jouer contre un adversaire aléatoire en ligne
2. **Local** 👥 - Défier un ami sur le même appareil
3. **Tournament** 🏆 - Participer à un tournoi en brackets
4. **IA** 🤖 - Jouer contre l'ordinateur

### 🎯 Navigation

- **Boutons de navigation** : Flèches gauche/droite
- **Indicateurs** : Points en bas pour navigation directe
- **Clavier** : Utilisation des flèches du clavier
- **Clic direct** : Cliquer sur une carte pour la sélectionner

### 📱 Responsive Design

- **Desktop** : Expérience complète avec toutes les animations
- **Tablet** : Adaptation des tailles et perspectives
- **Mobile** : Interface optimisée pour petits écrans

## Structure des Fichiers

```
src/Views/Game/
├── Game.html          # Template HTML avec le carrousel
├── Game.ts            # Logique TypeScript + CarouselManager
└── carousel.css       # Styles CSS dédiés (optionnel)
```

## Utilisation

### Initialisation Automatique

Le carrousel s'initialise automatiquement lors du chargement de la vue Game :

```typescript
// Dans executeViewScript()
this.initializeCarousel();
```

### Contrôle Programmatique

```typescript
// Accéder au carrousel
const carousel = this.getCarouselManager();

// Aller à un mode spécifique
this.goToGameMode(2); // Va au mode Tournament

// Ajouter un effet de pulsation
carousel?.addPulseToCard(0); // Random Adversaire pulse

// Supprimer l'effet de pulsation
carousel?.removePulseFromCard(0);

// Obtenir la carte active
const activeCard = carousel?.getActiveCard();
```

### Navigation

```typescript
// Navigation programmatique
carousel?.next(); // Carte suivante
carousel?.previous(); // Carte précédente
carousel?.goToSlide(1); // Aller à la carte Local (index 1)

// Obtenir l'index actuel
const currentIndex = carousel?.getCurrentIndex();
```

## Personnalisation

### Ajouter un Nouveau Mode de Jeu

1. **HTML** : Ajouter une nouvelle carte dans `Game.html`

```html
<div class="card" id="newModeButton" data-index="4">
  <div class="card-content">
    <h3 class="card-title">Nouveau Mode</h3>
    <p class="card-description">Description du nouveau mode</p>
    <div class="card-icon">🆕</div>
  </div>
</div>
```

2. **CSS** : Ajouter la position pour 5 cartes

```css
.card[data-index="4"] {
  transform: rotateY(288deg) translateZ(200px); /* 360/5 = 72deg */
}
```

3. **TypeScript** : Ajouter l'event listener

```typescript
document.getElementById("newModeButton")?.addEventListener("click", () => {
  console.log("New mode button clicked");
  // Logique pour le nouveau mode
});
```

### Modifier les Animations

```css
/* Changer la vitesse de transition */
.carousel {
  transition: transform 0.8s ease-in-out; /* Plus lent */
}

/* Modifier l'effet de survol */
.card:hover {
  transform: translateY(-15px) scale(1.1); /* Plus prononcé */
}
```

### Personnaliser les Couleurs

```css
/* Changer le thème des cartes */
.card {
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.9),
    /* Bleu */ rgba(147, 51, 234, 0.8) /* Violet */
  );
}

/* Changer les boutons de navigation */
.nav-btn:hover {
  background: rgba(34, 197, 94, 0.8); /* Vert */
}
```

## Events et Callbacks

Le carrousel émet des événements personnalisés que vous pouvez écouter :

```typescript
// Écouter les changements de carte
document.addEventListener("carousel-change", (event) => {
  const newIndex = event.detail.index;
  console.log(`Carte active : ${newIndex}`);
});
```

## Performance

- **Utilisation de `transform`** : Les animations utilisent `transform` pour des performances optimales
- **Hardware acceleration** : `transform3d` active l'accélération GPU
- **Debouncing** : Navigation limitée pour éviter les appels excessifs

## Compatibilité

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ⚠️ IE11 (support limité, sans certains effets)

## Debug

Pour déboguer le carrousel :

```typescript
// Activer les logs de debug
(window as any).carouselDebug = true;

// Vérifier l'état
console.log("Carousel state:", {
  currentIndex: carousel?.getCurrentIndex(),
  totalCards: carousel?.cards?.length,
  activeCard: carousel?.getActiveCard(),
});
```

## Améliorations Futures

- [ ] Support du glissement tactile (swipe)
- [ ] Carrousel infini (boucle continue)
- [ ] Transitions personnalisées par carte
- [ ] Support des gestes de la souris (drag)
- [ ] Mode auto-play avec pause au survol
- [ ] Lazy loading des contenus de cartes
- [ ] Accessibilité ARIA améliorée
