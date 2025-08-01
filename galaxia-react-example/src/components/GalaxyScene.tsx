import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { TextureLoader, CanvasTexture } from 'three';
import {
  Galaxy,
  GalaxyConfig,
  ParticlesConfig,
  DensityWaveDistributor,
  GaussianDistributor,
  ImageDistributor
} from 'galaxia-three';
import { GalaxyPreset } from '../utils/presets';

interface GalaxySceneProps {
  preset: GalaxyPreset;
}

function GalaxyScene({ preset }: GalaxySceneProps) {
  const galaxyRef = useRef<Galaxy>();
  const { camera } = useThree();
  
  // Create particle texture
  const particleTexture = useMemo(() => {
    const canvas = Galaxy.createDefaultParticleTexture(64);
    return new CanvasTexture(canvas);
  }, []);

  // Create galaxy configuration from preset
  const galaxyConfig = useMemo(() => {
    const config = new GalaxyConfig();
    
    // Set basic properties
    config.size = preset.size;
    config.heightOffset = preset.heightOffset;
    
    // Create distributor based on type
    let distributor;
    switch (preset.distributorType) {
      case 'density-wave':
        distributor = new DensityWaveDistributor(preset.seed);
        const dwDist = distributor as DensityWaveDistributor;
        dwDist.periapsisDistance = preset.densityWave?.periapsisDistance || 0.08;
        dwDist.apsisDistance = preset.densityWave?.apsisDistance || 0.01;
        dwDist.angleOffset = preset.densityWave?.angleOffset || 8;
        dwDist.heightVariance = preset.densityWave?.heightVariance || 1;
        break;
        
      case 'gaussian':
        distributor = new GaussianDistributor(preset.seed);
        const gDist = distributor as GaussianDistributor;
        gDist.variation = preset.gaussian?.variation || 1;
        break;
        
      case 'image':
        distributor = new ImageDistributor(preset.seed);
        // Image distributor would need image data to be loaded
        break;
        
      default:
        distributor = new DensityWaveDistributor(preset.seed);
    }
    
    config.setDistributor(distributor);
    
    // Create particle configuration
    const particlesConfig = new ParticlesConfig();
    particlesConfig.count = preset.particleCount;
    particlesConfig.size = preset.particleSize;
    particlesConfig.texture = particleTexture;
    particlesConfig.maxScreenSize = preset.maxScreenSize || 0.1;
    
    // Set color gradient
    if (preset.colorGradient) {
      particlesConfig.colorGradient = preset.colorGradient;
    }
    
    config.add(particlesConfig);
    
    return config;
  }, [preset, particleTexture]);

  // Create galaxy instance
  useEffect(() => {
    if (galaxyRef.current) {
      // Clean up previous galaxy
      galaxyRef.current.dispose();
      galaxyRef.current.removeFromParent();
    }
    
    // Create new galaxy
    const galaxy = new Galaxy({
      galaxyConfig,
      animationSpeed: preset.animationSpeed || 1.0
    });
    
    galaxyRef.current = galaxy;
    
    return () => {
      galaxy.dispose();
    };
  }, [galaxyConfig, preset.animationSpeed]);

  // Add galaxy to scene
  useFrame((state, delta) => {
    if (galaxyRef.current) {
      // Update galaxy animation
      galaxyRef.current.updateParticles(delta, camera);
      
      // Add to scene if not already added
      if (!galaxyRef.current.parent) {
        state.scene.add(galaxyRef.current);
      }
    }
  });

  // Display info
  useEffect(() => {
    if (galaxyRef.current) {
      const particleCount = galaxyRef.current.getTotalParticleCount();
      console.log(`Galaxy loaded with ${particleCount.toLocaleString()} particles`);
    }
  }, [galaxyConfig]);

  return (
    <>
      <ambientLight intensity={0.1} />
    </>
  );
}

export default GalaxyScene;