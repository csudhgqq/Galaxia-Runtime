# Galaxia Runtime - TypeScript/Three.js Port

This directory contains a TypeScript/Three.js port of the Unity Galaxia Runtime library, along with a React example application.

## Project Structure

```
.
├── galaxia-three/           # Three.js library (TypeScript)
│   ├── src/
│   │   ├── core/           # Core galaxy classes
│   │   ├── distributors/   # Particle distribution algorithms
│   │   ├── rendering/      # Shaders and materials
│   │   └── utils/          # Utility classes
│   └── package.json
│
├── galaxia-react-example/   # React example app
│   ├── src/
│   │   ├── components/     # React components
│   │   └── utils/          # Presets and helpers
│   └── package.json
│
└── [Original Unity files]
```

## Features

### Galaxia Three Library
- ✅ Core particle system with GPU acceleration
- ✅ Three distribution algorithms (DensityWave, Gaussian, Image)
- ✅ Custom GLSL shaders for billboard rendering
- ✅ Texture atlas support
- ✅ Real-time orbital animation
- ✅ TypeScript with full type definitions

### React Example
- ✅ Interactive 3D visualization
- ✅ Multiple galaxy presets
- ✅ Real-time parameter controls (Leva)
- ✅ Camera orbit controls
- ✅ Performance monitoring

## Quick Start

### 1. Build the Three.js Library

```bash
cd galaxia-three
npm install
npm run build
```

### 2. Run the React Example

```bash
cd ../galaxia-react-example
npm install
npm start
```

Open [http://localhost:5173](http://localhost:5173) to see the galaxy visualization.

## Key Differences from Unity Version

### Architecture Changes
- **Particle System**: Uses Three.js Points/BufferGeometry instead of Unity's particle system
- **Shaders**: GLSL shaders instead of HLSL/Cg
- **Materials**: Three.js ShaderMaterial with custom uniforms
- **Animation**: RequestAnimationFrame loop instead of Unity's Update

### Performance Considerations
- **WebGL Limitations**: Browser GPU memory limits may require fewer particles
- **Shader Complexity**: Simplified shaders for better mobile performance
- **No Geometry Shaders**: Using point sprites instead

### API Differences
```typescript
// Unity
var galaxy = GetComponent<Galaxy>();
galaxy.GenerateParticles();

// Three.js
const galaxy = new Galaxy({ galaxyConfig });
scene.add(galaxy);
galaxy.updateParticles(deltaTime, camera);
```

## Browser Requirements
- WebGL 2.0 support
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+)

## Development

### Three.js Library Development
```bash
cd galaxia-three
npm run watch    # Watch mode for development
npm run build    # Production build
```

### Adding New Distributors
1. Create new class extending `ParticleDistributor`
2. Implement `process()` and `canProcess()` methods
3. Export from `distributors/index.ts`

### Custom Shaders
Shaders are embedded in `GalaxyMaterial.ts`. For external files:
1. Create `.glsl` files in `rendering/shaders/`
2. Configure build tool to import as strings
3. Update `GalaxyMaterial.ts` imports

## Performance Tips
- Start with 50k-100k particles for smooth performance
- Use `maxScreenSize` to limit particle size when zoomed
- Enable frustum culling for multiple galaxies
- Consider LOD system for distant galaxies

## Known Limitations
- No compute shader support (using vertex shaders)
- Limited to ~1M particles on most GPUs
- No instanced rendering for billboard quads (using points)
- Image distributor requires Canvas API

## Future Enhancements
- [ ] WebGPU support for better performance
- [ ] Instanced mesh rendering option
- [ ] More distribution algorithms
- [ ] Post-processing effects
- [ ] VR/AR support

## License
MIT License - Same as original Unity version

## Credits
- Original Unity version by Simeon Radivoev
- Three.js port demonstrates web-based galaxy visualization capabilities