import { ParticlesConfig } from './ParticlesConfig';
import { ParticleDistributor } from '../distributors/ParticleDistributor';

/**
 * Configuration for a galaxy
 */
export class GalaxyConfig {
  public particleConfigs: ParticlesConfig[] = [];
  public distributor?: ParticleDistributor;
  public size: number = 100;
  public heightOffset: number = 10;
  public galaxySpeed: (t: number) => number = (t) => t; // Linear by default

  /**
   * Add a particle configuration
   */
  add(particlesConfig: ParticlesConfig): void {
    particlesConfig.galaxyConfig = this;
    this.particleConfigs.push(particlesConfig);
  }

  /**
   * Remove a particle configuration
   */
  remove(particlesConfig: ParticlesConfig): boolean {
    const index = this.particleConfigs.indexOf(particlesConfig);
    if (index > -1) {
      this.particleConfigs.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get particle configuration at index
   */
  get(index: number): ParticlesConfig | undefined {
    return this.particleConfigs[index];
  }

  /**
   * Get count of particle configurations
   */
  get count(): number {
    return this.particleConfigs.length;
  }

  /**
   * Set the distributor and update reference
   */
  setDistributor(distributor: ParticleDistributor | undefined): void {
    this.distributor = distributor;
    if (this.distributor) {
      this.distributor.setGalaxyConfig(this);
    }
  }
}