# Galaxia Three

A TypeScript/Three.js port of the Unity Galaxia Runtime library for creating stunning galaxy visualizations in web applications.

## Features

- 🌌 Multiple galaxy distribution algorithms (Density Wave, Gaussian, Image-based)
- ⚡ GPU-accelerated particle rendering with custom shaders
- 🎨 Customizable particle properties (color, size, rotation)
- 🌀 Real-time orbital animation system
- 📊 Texture atlas support for multiple particle types
- 🔧 TypeScript support with full type definitions

## Installation

```bash
npm install galaxia-three three
```

## Quick Start

```typescript
import { 
  Galaxy, 
  GalaxyConfig, 
  ParticlesConfig, 
  DensityWaveDistributor 
} from 'galaxia-three';
import * as THREE from 'three';

// Create galaxy configuration
const galaxyConfig = new GalaxyConfig();
galaxyConfig.size = 100;
galaxyConfig.heightOffset = 10;

// Set up density wave distributor for spiral galaxy
const distributor = new DensityWaveDistributor();
galaxyConfig.setDistributor(distributor);

// Configure particles
const particlesConfig = new ParticlesConfig();
particlesConfig.count = 100000;
particlesConfig.size = 0.1;
galaxyConfig.add(particlesConfig);

// Create galaxy
const galaxy = new Galaxy({ galaxyConfig });

// Add to Three.js scene
scene.add(galaxy);

// Animation loop
function animate(deltaTime: number) {
  galaxy.updateParticles(deltaTime, camera);
}
```

## Distribution Algorithms

### Density Wave Distributor
Creates realistic spiral galaxies using orbital mechanics and density wave theory.

```typescript
const distributor = new DensityWaveDistributor();
distributor.periapsisDistance = 0.08;
distributor.angleOffset = 8;
```

### Gaussian Distributor
Creates star clusters with Gaussian (normal) distribution.

```typescript
const distributor = new GaussianDistributor();
distributor.variation = 1.0;
```

### Image Distributor
Creates particle distributions based on image data.

```typescript
const distributor = new ImageDistributor();
const imageData = await ImageDistributor.loadImageAsImageData('path/to/image.png');
distributor.setDistributionMap(imageData);
```

## API Reference

### Galaxy Class

The main class for creating and managing galaxy visualizations.

```typescript
const galaxy = new Galaxy({
  galaxyConfig: GalaxyConfig,
  autoGenerate?: boolean,
  animationSpeed?: number
});
```

### GalaxyConfig

Configuration object for galaxy properties.

```typescript
const config = new GalaxyConfig();
config.size = 100;              // Galaxy size
config.heightOffset = 10;       // Vertical spread
config.setDistributor(distributor);
config.add(particlesConfig);
```

### ParticlesConfig

Configuration for particle appearance and behavior.

```typescript
const particles = new ParticlesConfig();
particles.count = 100000;       // Number of particles
particles.size = 0.1;           // Base particle size
particles.texture = texture;    // Particle texture
particles.colorGradient = [...] // Color gradient
```

## Performance Tips

1. **Particle Count**: Start with lower particle counts and increase gradually
2. **Screen Size Limiting**: Use `maxScreenSize` to prevent overdraw
3. **Texture Atlas**: Use texture atlases for multiple particle types
4. **LOD**: Implement level-of-detail for distant galaxies

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL 2.0 support.

## License

MIT License - See LICENSE file for details

## Credits

Ported from the original Unity Galaxia Runtime by Simeon Radivoev.