import { Vector3, Material } from 'three';
import { Particle } from '../core/Particle';
import { GalaxyConfig } from '../core/GalaxyConfig';
import { ParticlesConfig } from '../core/ParticlesConfig';

/**
 * The context that holds all the data needed for particle distribution
 */
export interface ProcessContext {
  particle: Particle;
  galaxy: GalaxyConfig;
  particles: ParticlesConfig;
  time: number;
  index: number;
}

/**
 * The Particle Distributor is the base class for all Particle Distributors.
 * It is used to control the distribution of generated particles.
 */
export abstract class ParticleDistributor {
  /**
   * The Gravitational constant
   */
  public static readonly G = 6.67384;

  protected galaxyConfig?: GalaxyConfig;

  /**
   * Used by the Particle Generator to modify/distribute the particles to a desired shape.
   * This is where particles are processed one by one.
   */
  abstract process(context: ProcessContext): void;

  /**
   * Use to check if the given particle config can be processed
   */
  abstract canProcess(particles: ParticlesConfig): boolean;

  /**
   * Used to process any additional properties dependent on the position and angle of a particle
   */
  protected processProperties(context: ProcessContext, pos: Vector3, angle: number): void {
    const distance = pos.length();
    
    context.particle.color = context.particles.getColor(pos, distance, context.galaxy.size, angle, context.particle.index);
    context.particle.size = context.particles.getSize(pos, distance, context.galaxy.size, angle, context.particle.index);
    context.particle.rotation = context.particles.getRotation(pos, distance, context.galaxy.size, angle, context.particle.index);
  }

  /**
   * Updates all uniform variables in the given material
   */
  updateMaterial(_material: Material): void {
    // Override in subclasses if needed
  }

  /**
   * Used for recreating any predefined curves
   */
  recreateCurves(): void {
    // Override in subclasses if needed
  }

  /**
   * Set the galaxy configuration
   */
  setGalaxyConfig(galaxyConfig: GalaxyConfig): void {
    this.galaxyConfig = galaxyConfig;
  }

  /**
   * Get the galaxy configuration
   */
  getGalaxyConfig(): GalaxyConfig | undefined {
    return this.galaxyConfig;
  }

  /**
   * Helper function to create an integral curve from an animation curve
   */
  static integral(curve: (t: number) => number, steps: number): (t: number) => number {
    const values: { time: number; value: number }[] = [];
    const stepSize = 1.0 / steps;
    let area = 0;
    let maxArea = 0;

    for (let i = 0; i < steps; i++) {
      const pos = stepSize * i;
      area += curve(pos) * stepSize;

      if (maxArea < area) {
        maxArea = area;
      }

      values.push({ time: pos, value: area });
    }

    const normalizer = maxArea > 0 ? 1.0 / maxArea : 1;

    // Return interpolation function
    return (t: number): number => {
      if (t <= 0) return 0;
      if (t >= 1) return values[values.length - 1].value * normalizer;

      // Find surrounding points and interpolate
      for (let i = 1; i < values.length; i++) {
        if (t <= values[i].time) {
          const prev = values[i - 1];
          const curr = values[i];
          const factor = (t - prev.time) / (curr.time - prev.time);
          return (prev.value + (curr.value - prev.value) * factor) * normalizer;
        }
      }

      return values[values.length - 1].value * normalizer;
    };
  }

  /**
   * Helper function to create an inverse curve
   */
  static inverse(curve: (t: number) => number, samples: number = 100): (t: number) => number {
    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const value = curve(t);
      points.push({ x: value, y: t });
    }

    // Sort by x values
    points.sort((a, b) => a.x - b.x);

    // Return interpolation function
    return (value: number): number => {
      if (value <= points[0].x) return points[0].y;
      if (value >= points[points.length - 1].x) return points[points.length - 1].y;

      // Find surrounding points and interpolate
      for (let i = 1; i < points.length; i++) {
        if (value <= points[i].x) {
          const prev = points[i - 1];
          const curr = points[i];
          const factor = (value - prev.x) / (curr.x - prev.x);
          return prev.y + (curr.y - prev.y) * factor;
        }
      }

      return points[points.length - 1].y;
    };
  }
}