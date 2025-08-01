import { Vector3, Material } from 'three';
import { ParticleDistributor, ProcessContext } from './ParticleDistributor';
import { ParticlesConfig } from '../core/ParticlesConfig';
import { FastRandom } from '../utils/FastRandom';

/**
 * The Gaussian Distribution algorithm.
 * This distributor creates a star cluster using 3D Gaussian distribution.
 */
export class GaussianDistributor extends ParticleDistributor {
  public variation: number = 1;
  private random: FastRandom;

  constructor(seed?: number) {
    super();
    this.random = new FastRandom(seed);
  }

  process(context: ProcessContext): void {
    const galaxy = context.galaxy;
    
    // Generate position using Gaussian distribution in 3D
    const pos = new Vector3(
      this.nextGaussianDouble(this.variation) * galaxy.size,
      this.nextGaussianDouble(this.variation) * galaxy.size,
      this.nextGaussianDouble(this.variation) * galaxy.size
    );
    
    // Process additional properties (color, size, rotation)
    this.processProperties(context, pos, 0);
    
    // Set particle position
    context.particle.position = pos;
  }

  canProcess(_particles: ParticlesConfig): boolean {
    // This distributor can process any particle configuration
    return true;
  }

  updateMaterial(_material: Material): void {
    // No specific material updates needed for Gaussian distribution
  }

  /**
   * Generate Gaussian distributed random number using Box-Muller transform
   */
  private nextGaussianDouble(variance: number): number {
    let u1 = 0;
    let u2 = 0;
    
    // Ensure we don't get 0 which would cause log(0)
    while (u1 === 0) {
      u1 = this.random.nextDouble();
    }
    while (u2 === 0) {
      u2 = this.random.nextDouble();
    }
    
    // Box-Muller transform
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    return z0 * variance;
  }
}