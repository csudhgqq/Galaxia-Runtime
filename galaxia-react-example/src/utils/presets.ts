import { Color } from 'three';

export interface GalaxyPreset {
  id: string;
  name: string;
  description: string;
  
  // Basic properties
  size: number;
  heightOffset: number;
  particleCount: number;
  particleSize: number;
  maxScreenSize?: number;
  seed: number;
  animationSpeed?: number;
  
  // Distributor type
  distributorType: 'density-wave' | 'gaussian' | 'image';
  
  // Density wave specific
  densityWave?: {
    periapsisDistance: number;
    apsisDistance: number;
    angleOffset: number;
    heightVariance: number;
  };
  
  // Gaussian specific
  gaussian?: {
    variation: number;
  };
  
  // Color gradient
  colorGradient?: Array<{
    offset: number;
    color: Color;
  }>;
}

export const galaxyPresets: GalaxyPreset[] = [
  {
    id: 'spiral-galaxy',
    name: 'Spiral Galaxy',
    description: 'A classic spiral galaxy with density wave structure',
    size: 100,
    heightOffset: 10,
    particleCount: 100000,
    particleSize: 0.1,
    maxScreenSize: 0.05,
    seed: 42,
    animationSpeed: 0.5,
    distributorType: 'density-wave',
    densityWave: {
      periapsisDistance: 0.08,
      apsisDistance: 0.01,
      angleOffset: 8,
      heightVariance: 1
    },
    colorGradient: [
      { offset: 0, color: new Color(1, 0.6, 0.3) },
      { offset: 0.3, color: new Color(1, 0.9, 0.7) },
      { offset: 0.6, color: new Color(0.9, 0.9, 1) },
      { offset: 1, color: new Color(0.6, 0.7, 1) }
    ]
  },
  {
    id: 'star-cluster',
    name: 'Star Cluster',
    description: 'A dense globular cluster using Gaussian distribution',
    size: 50,
    heightOffset: 50,
    particleCount: 50000,
    particleSize: 0.08,
    maxScreenSize: 0.03,
    seed: 123,
    animationSpeed: 0,
    distributorType: 'gaussian',
    gaussian: {
      variation: 0.8
    },
    colorGradient: [
      { offset: 0, color: new Color(1, 0.9, 0.8) },
      { offset: 0.5, color: new Color(1, 1, 0.9) },
      { offset: 1, color: new Color(0.9, 0.95, 1) }
    ]
  },
  {
    id: 'barred-spiral',
    name: 'Barred Spiral Galaxy',
    description: 'A spiral galaxy with a central bar structure',
    size: 120,
    heightOffset: 8,
    particleCount: 150000,
    particleSize: 0.12,
    maxScreenSize: 0.06,
    seed: 789,
    animationSpeed: 0.3,
    distributorType: 'density-wave',
    densityWave: {
      periapsisDistance: 0.15,
      apsisDistance: 0.02,
      angleOffset: 5,
      heightVariance: 0.8
    },
    colorGradient: [
      { offset: 0, color: new Color(1, 0.4, 0.1) },
      { offset: 0.4, color: new Color(1, 0.8, 0.5) },
      { offset: 0.7, color: new Color(1, 1, 0.8) },
      { offset: 1, color: new Color(0.7, 0.8, 1) }
    ]
  },
  {
    id: 'elliptical-galaxy',
    name: 'Elliptical Galaxy',
    description: 'A smooth elliptical galaxy with no spiral structure',
    size: 80,
    heightOffset: 40,
    particleCount: 80000,
    particleSize: 0.1,
    maxScreenSize: 0.04,
    seed: 456,
    animationSpeed: 0.1,
    distributorType: 'gaussian',
    gaussian: {
      variation: 1.2
    },
    colorGradient: [
      { offset: 0, color: new Color(1, 0.7, 0.5) },
      { offset: 0.5, color: new Color(1, 0.9, 0.7) },
      { offset: 1, color: new Color(0.9, 0.9, 0.95) }
    ]
  },
  {
    id: 'dwarf-galaxy',
    name: 'Dwarf Galaxy',
    description: 'A small irregular dwarf galaxy',
    size: 40,
    heightOffset: 20,
    particleCount: 30000,
    particleSize: 0.08,
    maxScreenSize: 0.03,
    seed: 999,
    animationSpeed: 0.2,
    distributorType: 'gaussian',
    gaussian: {
      variation: 1.5
    },
    colorGradient: [
      { offset: 0, color: new Color(0.7, 0.8, 1) },
      { offset: 0.5, color: new Color(0.9, 0.9, 1) },
      { offset: 1, color: new Color(1, 1, 1) }
    ]
  }
];

export function getPresetById(id: string): GalaxyPreset | undefined {
  return galaxyPresets.find(preset => preset.id === id);
}