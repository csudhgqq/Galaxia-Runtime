import { Color, Texture, SrcAlphaFactor, OneFactor } from 'three';
import { Vector3 } from 'three';
import { SimplexNoise } from '../utils/SimplexNoise';
import { GalaxyConfig } from './GalaxyConfig';

export enum DistributionType {
  Linear = 'linear',
  Distance = 'distance',
  Angle = 'angle',
  Random = 'random',
  Perlin = 'perlin'
}

export interface DistributionProperty {
  type: DistributionType;
  distributionCurve: (t: number) => number;
  variation: number;
  multiplier: number;
  frequency?: number;
  amplitude?: number;
}

/**
 * Configuration for particles in a galaxy
 */
export class ParticlesConfig {
  // Basic properties
  public active: boolean = true;
  public count: number = 100000;
  public seed: number = 0;
  public size: number = 0.1;
  public maxScreenSize: number = 0.1;
  
  // Position distribution
  public positionDistribution: (t: number) => number = (t) => t; // Linear
  
  // Property distributions
  public sizeDistribution: DistributionProperty = {
    type: DistributionType.Linear,
    distributionCurve: () => 1,
    variation: 0,
    multiplier: 1
  };
  
  public rotationDistribution: DistributionProperty = {
    type: DistributionType.Random,
    distributionCurve: () => 1,
    variation: 0,
    multiplier: 1
  };
  
  public alphaDistribution: DistributionProperty = {
    type: DistributionType.Linear,
    distributionCurve: (t) => Math.pow(1 - t, 2), // Default alpha curve
    variation: 0,
    multiplier: 1
  };
  
  public colorDistribution: DistributionProperty = {
    type: DistributionType.Linear,
    distributionCurve: () => 1,
    variation: 0,
    multiplier: 1
  };
  
  // Color gradient (simplified for Three.js)
  public colorGradient: { offset: number; color: Color }[] = [
    { offset: 0, color: new Color(1, 0.8, 0.6) },
    { offset: 0.5, color: new Color(1, 1, 0.8) },
    { offset: 1, color: new Color(0.8, 0.8, 1) }
  ];
  
  // Rendering properties
  public blendModeSrc: number = SrcAlphaFactor;
  public blendModeDst: number = OneFactor;
  public renderQueue: number = 0;
  public texture?: Texture;
  public textureSheetPower: number = 1;
  public downsample: number = 1;
  public colorOverlay: Color = new Color(1, 1, 1);
  
  // Internal
  public galaxyConfig?: GalaxyConfig;
  private random: () => number;

  constructor() {
    // Initialize random number generator based on seed
    let seed = this.seed;
    this.random = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
  }

  /**
   * Get color for a particle based on its properties
   */
  getColor(pos: Vector3, distance: number, galaxySize: number, angle: number, index: number): Color {
    const colorPos = this.getEvaluationPosition(this.colorDistribution, pos, distance, galaxySize, angle, index);
    const alphaPos = this.getEvaluationPosition(this.alphaDistribution, pos, distance, galaxySize, angle, index);
    
    const color = this.evaluateColorGradient(
      this.lerp(colorPos, this.random(), this.colorDistribution.variation)
    );
    
    const alphaValue = this.lerp(
      this.alphaDistribution.distributionCurve(alphaPos),
      this.random(),
      this.alphaDistribution.variation
    ) * this.alphaDistribution.multiplier * this.colorDistribution.distributionCurve(colorPos);
    
    const result = color.clone();
    result.multiplyScalar(this.colorDistribution.multiplier * alphaValue);
    return result;
  }

  /**
   * Get size for a particle
   */
  getSize(pos: Vector3, distance: number, galaxySize: number, angle: number, index: number): number {
    const sizePos = this.getEvaluationPosition(this.sizeDistribution, pos, distance, galaxySize, angle, index);
    const size = this.lerp(
      this.sizeDistribution.distributionCurve(sizePos),
      this.random(),
      this.sizeDistribution.variation
    ) * this.size;
    return size * this.sizeDistribution.multiplier;
  }

  /**
   * Get rotation for a particle
   */
  getRotation(pos: Vector3, distance: number, galaxySize: number, angle: number, index: number): number {
    const rotationPos = this.getEvaluationPosition(this.rotationDistribution, pos, distance, galaxySize, angle, index);
    const rotation = this.lerp(
      this.rotationDistribution.distributionCurve(rotationPos),
      this.random(),
      this.rotationDistribution.variation
    ) * Math.PI * 2;
    return rotation * this.rotationDistribution.multiplier;
  }

  private getEvaluationPosition(
    distributor: DistributionProperty,
    pos: Vector3,
    distance: number,
    galaxySize: number,
    angle: number,
    index: number
  ): number {
    switch (distributor.type) {
      case DistributionType.Angle:
        return (Math.cos(angle) + 1) / 2;
      case DistributionType.Distance:
        return distance / galaxySize;
      case DistributionType.Linear:
        return index / this.count;
      case DistributionType.Perlin:
        const freq = distributor.frequency || 1;
        const amp = distributor.amplitude || 1;
        return Math.pow(
          SimplexNoise.generate3D(pos.x * freq, pos.y * freq, pos.z * freq),
          amp
        );
      case DistributionType.Random:
      default:
        return this.random();
    }
  }

  private evaluateColorGradient(t: number): Color {
    t = Math.max(0, Math.min(1, t));
    
    // Find the two colors to interpolate between
    for (let i = 1; i < this.colorGradient.length; i++) {
      if (t <= this.colorGradient[i].offset) {
        const prev = this.colorGradient[i - 1];
        const curr = this.colorGradient[i];
        const factor = (t - prev.offset) / (curr.offset - prev.offset);
        
        return new Color().lerpColors(prev.color, curr.color, factor);
      }
    }
    
    return this.colorGradient[this.colorGradient.length - 1].color.clone();
  }

  private lerp(a: number, b: number, t: number): number {
    return a * (1 - t) + b * t;
  }
}