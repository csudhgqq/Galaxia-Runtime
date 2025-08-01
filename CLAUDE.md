# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Galaxia Runtime is a Unity 3D library for generating and rendering galaxy visualizations with particle systems. It uses GPU-accelerated rendering and provides various distribution algorithms for creating realistic or artistic galaxy effects.

## Development Workflow

This is a Unity project without traditional build tools. Development workflow:
1. Open the project in Unity Editor (tested with Unity 2017.1.2f)
2. Test changes using Unity's Play mode
3. Build through Unity's Build Settings menu

## Architecture

### Core Components
- **Galaxy.cs**: Main component managing galaxy visualization and particle systems
- **Particles.cs**: Manages individual particle collections and rendering
- **GalaxyPrefab.cs/ParticlesPrefab.cs**: ScriptableObject configurations

### Particle Distribution System
- **ParticleDistributor.cs**: Abstract base class - extend this to create new distribution algorithms
- Implementations: DensityWaveDistributor (physics-based), GaussianDistributor, ImageDistributor

### Rendering Pipeline
- **GalaxyRenderer.cs**: Abstract base for rendering implementations
- Custom GPU shaders in Shaders/ directory using DirectX 11/OpenGL
- Particle data passed to GPU via ComputeBuffers

### Key Patterns
- Heavy use of ScriptableObjects for data persistence
- AnimationCurves for runtime parameter control
- Component-based architecture following Unity patterns
- Abstract base classes for extensibility

## Testing

No automated tests. Testing is done through example scenes:
- Examples/Galaxy/Galaxy.unity - Basic galaxy example
- Examples/VR Galaxy/Galaxy_vr.unity - VR implementation
- Examples/Galaxy Map/Galaxy_map.unity - Map visualization
- Examples/Image Galaxy/ImageGalaxyExample.unity - Image-based generation
- Examples/Galaxy Animation/GalaxyAnimation.unity - Animation features

## Performance Considerations

- Particle rendering is GPU-accelerated using custom shaders
- Use LOD (Level of Detail) for distant galaxies
- Particle count directly impacts performance
- Offscreen rendering available for texture generation

## Common Tasks

### Adding a New Particle Distributor
1. Create class inheriting from ParticleDistributor
2. Override Distribute() method
3. Use FastRandom for performance
4. Reference existing distributors for patterns

### Modifying Shaders
1. Shaders support both DirectX and OpenGL
2. Test on both platforms when making changes
3. ParticleBillboard.shader is the main rendering shader

### Creating New Galaxy Types
1. Create GalaxyPrefab ScriptableObject asset
2. Configure ParticlesPrefab instances
3. Assign distributors and materials
4. Test in example scenes