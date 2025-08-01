import { Vector3, Material } from 'three';
import { ParticleDistributor, ProcessContext } from './ParticleDistributor';
import { ParticlesConfig } from '../core/ParticlesConfig';
import { FastRandom } from '../utils/FastRandom';

/**
 * Density Wave Distributor - creates spiral galaxy structures using orbital mechanics
 * Based on density wave theory and Kepler's laws
 */
export class DensityWaveDistributor extends ParticleDistributor {
  // Orbital parameters
  public periapsisDistance: number = 0.08;
  public apsisDistance: number = 0.01;
  public centerMass: number = 830000;
  public starMass: number = 80;
  public focalPoint: number = -1;
  public angleOffset: number = 8;
  
  // Visual parameters
  public heightVariance: number = 1;
  public galaxyHeightMultiplyCurve: (t: number) => number;
  
  private random: FastRandom;

  constructor(seed?: number) {
    super();
    this.random = new FastRandom(seed);
    
    // Default galaxy height multiply curve - peaks in middle, falls off at edges
    this.galaxyHeightMultiplyCurve = (t: number) => {
      // Default curve similar to Unity's default
      if (t <= 0.2) return t * 5;
      if (t <= 0.8) return 1;
      return 1 - ((t - 0.8) * 5);
    };
  }

  process(context: ProcessContext): void {
    const particle = context.particle;
    const galaxy = context.galaxy;
    const particles = context.particles;
    
    const particleCount = particles.count;
    const particleIndex = context.index;
    const time = context.time;
    
    // Calculate star index multiplier for orbital distance variation
    const starIndexMultiplier = (particleIndex / particleCount) * galaxy.size;
    
    // Semi-major and semi-minor axes
    const a = this.periapsisDistance + starIndexMultiplier;
    const b = this.apsisDistance + starIndexMultiplier;
    
    // Eccentricity calculation
    const minAxis = Math.min(b, a);
    const maxAxis = Math.max(b, a);
    const e = Math.sqrt(1 - (minAxis * minAxis) / (maxAxis * maxAxis));
    
    // Gravitational parameter
    const GP = ParticleDistributor.G * (this.centerMass + this.starMass);
    
    // Orbital period (Kepler's 3rd law)
    const T = 2 * Math.PI * Math.sqrt((a * a * a) / GP);
    
    // Random focal point variation
    const focalPointVariation = this.focalPoint < 0 
      ? (this.random.nextDouble() > 0.5 ? -1 : 1)
      : this.focalPoint;
    
    // Ellipse center offset
    const centerX = (a * e) * focalPointVariation;
    
    // Spiral arm angle
    const angle = (this.angleOffset / particleCount) * particleIndex;
    
    // Random starting time for orbital phase
    particle.startingTime = this.random.nextDouble() * Math.PI * 2;
    
    // Calculate position on elliptical orbit
    const ellipseRotation = ((time + particle.startingTime) / T) * Math.PI * 2;
    const x = (a * Math.cos(ellipseRotation)) + centerX;
    const z = (b * Math.sin(ellipseRotation));
    
    // Apply spiral rotation
    const cosB = Math.cos(angle);
    const sinB = Math.sin(angle);
    
    // Calculate final position
    const posX = ((x * cosB) + (z * sinB)) * galaxy.size;
    const posZ = ((x * sinB) - (z * cosB)) * galaxy.size;
    
    // Calculate height with Gaussian distribution
    const height = this.nextGaussianDouble(this.heightVariance) * galaxy.heightOffset;
    
    // Apply height modulation based on distance
    const distance = Math.sqrt(posX * posX + posZ * posZ);
    const heightMultiplier = this.galaxyHeightMultiplyCurve(distance / galaxy.size);
    const posY = height * heightMultiplier;
    
    // Set particle position
    particle.position = new Vector3(posX, posY, posZ);
    
    // Store focal point for animation
    particle.focalPoint = focalPointVariation;
    
    // Process additional properties (color, size, rotation)
    this.processProperties(context, particle.position, angle);
  }

  canProcess(_particles: ParticlesConfig): boolean {
    // This distributor can process any particle configuration
    return true;
  }

  updateMaterial(material: Material): void {
    // Update shader uniforms if needed
    const uniforms = (material as any).uniforms;
    if (uniforms) {
      // Add any specific uniforms for density wave rendering
    }
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

  /**
   * Create a predefined height multiply curve
   */
  static createDefaultHeightCurve(): (t: number) => number {
    const keyframes = [
      { time: 0, value: 0 },
      { time: 0.2, value: 1 },
      { time: 0.8, value: 1 },
      { time: 1, value: 0 }
    ];
    
    return (t: number): number => {
      if (t <= keyframes[0].time) return keyframes[0].value;
      if (t >= keyframes[keyframes.length - 1].time) return keyframes[keyframes.length - 1].value;
      
      for (let i = 1; i < keyframes.length; i++) {
        if (t <= keyframes[i].time) {
          const prev = keyframes[i - 1];
          const curr = keyframes[i];
          const factor = (t - prev.time) / (curr.time - prev.time);
          return prev.value + (curr.value - prev.value) * factor;
        }
      }
      
      return keyframes[keyframes.length - 1].value;
    };
  }
}