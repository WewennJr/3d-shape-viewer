# Visualiseur 3D - Vynkor

Un visualiseur 3D interactif construit avec Three.js, permettant d'explorer différentes formes géométriques avec des matériaux PBR avancés, des environnements HDR, et des effets de post-processing.

## 🎮 Fonctionnalités

### Formes géométriques (14+)
- **Primitives** : Cube, Sphère, Tore, Cône, Cylindre, Anneau, Plan
- **Polyèdres** : Dodécaèdre, Icosaèdre, Octaèdre, Tétraèdre
- **Avancées** : Tore-Knot, Capsule, Lathe, Extrusion
- Grille de sélection visuelle avec boutons

### Matériaux
- **Standard PBR** : Roughness, Metalness, Clearcoat
- **Physical** : Transmission, Thickness, IOR (verre, liquides)
- **Toon/Cel-shaded** : Style cartoon avec gradient
- **Phong, Basic, Wireframe, Normal, MatCap**
- Sélecteur de couleur intégré (HEX + color picker)
- Émissif avec contrôle d'intensité

### Éclairage
- Lumière ambiante (intensité réglable)
- Lumière directionnelle principale (position, couleur, intensité)
- Lumière de remplissage (fill light)
- Lumière de contour (rim light)
- Ombres douces activables/désactivables
- Plan de sol recevant les ombres

### Environnements HDR (6)
- Studio, Coucher de soleil, Nuit, Entrepôt, Forêt, Appartement
- Chargement depuis Poly Haven (1k HDRIs)
- Option "Aucun" pour fond uni

### Post-processing
- **Tone Mapping** : None, Linear, Reinhard, Cineon, ACES Filmic
- **Exposition** : 0.1x - 3x
- **Bloom** : Force, seuil, rayon configurables
- **Vignette** : Intensité réglable
- **FXAA** : Anti-aliasing rapide

### Export
- 📸 Capture d'écran PNG (1x, 2x, 3x, 4x)
- 📦 Export GLTF (scène complète)
- 📋 Copie de la configuration JSON

### Interface
- Onglets organisés (Formes, Matériau, Éclairage, Post-proc, Export)
- Panneau de statistiques en temps réel (FPS, triangles, draw calls, mémoire)
- Raccourcis clavier : `Espace` (pause), `R` (reset caméra)
- Responsive, thème sombre moderne

## 🚀 Démarrage rapide

```bash
# Option 1: Serveur local simple
npx serve .

# Option 2: Python
python3 -m http.server 8000

# Option 3: VS Code Live Server
# Clic droit sur index.html > "Open with Live Server"
```

Puis ouvrir `http://localhost:8000` (ou le port indiqué).

> **Note** : Un serveur local est requis pour les modules ES et le chargement des HDRIs (CORS).

## 📁 Structure du projet

```
├── index.html          # HTML principal
├── styles.css          # Styles CSS
├── main.js             # Point d'entrée, orchestration
├── scene.js            # Scene, renderer, camera, controls
├── shapes.js           # Géométries et boutons de formes
├── materials.js        # Création et gestion des matériaux
├── lights.js           # Configuration des lumières
├── postprocessing.js   # Effets post-processing (bloom, FXAA, etc.)
├── environment.js      # Chargement des environnements HDR
├── particles.js        # Système de particules d'ambiance
├── stats.js            # Monitoring de performance
├── export.js           # Export PNG, GLTF, JSON
└── ui.js               # Gestion de l'interface utilisateur
```

## 🎹 Contrôles

| Action | Contrôle |
|--------|----------|
| Orbiter | Clic gauche + glisser |
| Zoom | Molette / Pinch |
| Panoramique | Clic droit + glisser / Shift + clic gauche |
| Pause animation | `Espace` ou bouton |
| Reset caméra | `R` ou bouton |

## 🔧 Personnalisation

### Ajouter une forme
Dans `shapes.js`, ajoutez une entrée dans l'objet `geometries` :
```js
maForme: new THREE.MaGeometry(...params),
```

### Ajouter un environnement HDR
Dans `environment.js`, ajoutez l'URL dans l'objet `environments` :
```js
monEnv: 'https://exemple.com/mon.hdr',
```

### Modifier le thème
Éditez les variables de couleur dans `styles.css` :
```css
:root {
  --primary: #4361ee;
  --bg: #1a1a2e;
  --text: #eee;
}
```

## 📦 Dépendances

- **Three.js** r165 (via unpkg CDN)
  - Core + OrbitControls + RGBELoader + EffectComposer + GLTFExporter

Aucune installation npm requise, tout est chargé via importmap CDN.

## 🌐 Compatibilité

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Nécessite WebGL 2

## 📄 Licence

MIT - Libre d'utilisation et de modification.

---

Créé avec ❤️ par [Vynkor](https://vynkor.fr)