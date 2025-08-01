import {
  BufferGeometry,
  BufferAttribute,
  Points,
  Camera,
  Group,
  AdditiveBlending
} from 'three';
import { Particle } from './Particle';
import { GalaxyConfig } from './GalaxyConfig';
import { ParticlesConfig } from './ParticlesConfig';
import { ProcessContext } from '../distributors/ParticleDistributor';
import { GalaxyMaterial } from '../rendering/GalaxyMaterial';

export interface GalaxyOptions {
  galaxyConfig: GalaxyConfig;
  autoGenerate?: boolean;
  animationSpeed?: number;
}

/**
 * Main Galaxy class that manages particle generation and rendering
 */
export class Galaxy extends Group {
  private galaxyConfig: GalaxyConfig;
  private particles: Map<ParticlesConfig, Particle[]> = new Map();
  private particleSystems: Map<ParticlesConfig, Points> = new Map();
  private time: number = 0;
  private animationSpeed: number;
  
  constructor(options: GalaxyOptions) {
    super();
    
    this.galaxyConfig = options.galaxyConfig;
    this.animationSpeed = options.animationSpeed || 1.0;
    
    if (options.autoGenerate !== false) {
      this.generateParticles();
    }
  }

  /**
   * Generate all particles based on configuration
   */
  generateParticles(): void {
    this.clearParticles();
    
    if (!this.galaxyConfig.distributor) {
      console.warn('No distributor set for galaxy');
      return;
    }
    
    // Generate particles for each configuration
    for (const particlesConfig of this.galaxyConfig.particleConfigs) {
      if (!particlesConfig.active) continue;
      
      if (!this.galaxyConfig.distributor.canProcess(particlesConfig)) {
        console.warn('Distributor cannot process particle configuration');
        continue;
      }
      
      this.generateParticlesForConfig(particlesConfig);
    }
  }

  /**
   * Generate particles for a specific configuration
   */
  private generateParticlesForConfig(particlesConfig: ParticlesConfig): void {
    const particles: Particle[] = [];
    const distributor = this.galaxyConfig.distributor!;
    
    // Generate particles
    for (let i = 0; i < particlesConfig.count; i++) {
      const particle = new Particle();
      particle.index = i;
      
      // Create process context
      const context: ProcessContext = {
        particle,
        galaxy: this.galaxyConfig,
        particles: particlesConfig,
        time: this.time,
        index: i
      };
      
      // Process particle through distributor
      distributor.process(context);
      
      particles.push(particle);
    }
    
    // Store particles
    this.particles.set(particlesConfig, particles);
    
    // Create particle system
    this.createParticleSystem(particlesConfig, particles);
  }

  /**
   * Create Three.js particle system from particles
   */
  private createParticleSystem(particlesConfig: ParticlesConfig, particles: Particle[]): void {
    const geometry = new BufferGeometry();
    
    // Create attribute arrays
    const positions = new Float32Array(particles.length * 3);
    const colors = new Float32Array(particles.length * 4);
    const sizes = new Float32Array(particles.length);
    const rotations = new Float32Array(particles.length);
    const sheetPositions = new Float32Array(particles.length);
    
    // Custom attributes for animation
    const focalPoints = new Float32Array(particles.length);
    const startingTimes = new Float32Array(particles.length);
    
    // Fill attribute arrays
    particles.forEach((particle, i) => {
      // Position
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
      
      // Color
      colors[i * 4] = particle.color.r;
      colors[i * 4 + 1] = particle.color.g;
      colors[i * 4 + 2] = particle.color.b;
      colors[i * 4 + 3] = 1.0; // Alpha will be modulated in shader
      
      // Properties
      sizes[i] = particle.size;
      rotations[i] = particle.rotation;
      sheetPositions[i] = particle.sheetPosition;
      
      // Animation data
      focalPoints[i] = particle.focalPoint;
      startingTimes[i] = particle.startingTime;
    });
    
    // Set attributes
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('particleColor', new BufferAttribute(colors, 4));
    geometry.setAttribute('particleSize', new BufferAttribute(sizes, 1));
    geometry.setAttribute('particleRotation', new BufferAttribute(rotations, 1));
    geometry.setAttribute('sheetPosition', new BufferAttribute(sheetPositions, 1));
    geometry.setAttribute('focalPoint', new BufferAttribute(focalPoints, 1));
    geometry.setAttribute('startingTime', new BufferAttribute(startingTimes, 1));
    
    // Create material
    // Note: Unity blend factors don't map directly to Three.js blending modes
    // Using AdditiveBlending for galaxy particles (common for particle effects)
    const material = new GalaxyMaterial({
      texture: particlesConfig.texture,
      textureSheetPower: particlesConfig.textureSheetPower,
      maxScreenSize: particlesConfig.maxScreenSize,
      overlayColor: particlesConfig.colorOverlay,
      blending: AdditiveBlending, // Use additive blending for galaxy particles
      usePoints: true
    });
    
    // Create points system
    const points = new Points(geometry, material);
    points.frustumCulled = false; // Disable frustum culling for large galaxies
    
    // Store and add to scene
    this.particleSystems.set(particlesConfig, points);
    this.add(points);
  }

  /**
   * Update particles (for animation)
   */
  updateParticles(deltaTime: number, camera: Camera): void {
    this.time += deltaTime * this.animationSpeed;
    
    // Update each particle system
    this.particleSystems.forEach((points, config) => {
      const material = points.material as GalaxyMaterial;
      
      // Update uniforms
      material.updateTime(this.time);
      material.updateCameraPosition(camera.position);
      
      // If using density wave distributor, update particle positions
      if (this.galaxyConfig.distributor && this.isDynamicDistributor()) {
        this.updateDynamicParticles(config, points);
      }
    });
  }

  /**
   * Check if distributor requires dynamic updates
   */
  private isDynamicDistributor(): boolean {
    // Check if it's DensityWaveDistributor or similar
    const distributor = this.galaxyConfig.distributor;
    return distributor?.constructor.name === 'DensityWaveDistributor';
  }

  /**
   * Update dynamic particle positions
   */
  private updateDynamicParticles(config: ParticlesConfig, points: Points): void {
    const particles = this.particles.get(config);
    if (!particles) return;
    
    const positions = points.geometry.attributes.position as BufferAttribute;
    const distributor = this.galaxyConfig.distributor!;
    
    // Update each particle
    particles.forEach((particle, i) => {
      const context: ProcessContext = {
        particle,
        galaxy: this.galaxyConfig,
        particles: config,
        time: this.time,
        index: particle.index
      };
      
      // Reprocess particle for new position
      distributor.process(context);
      
      // Update position buffer
      positions.setXYZ(i, particle.position.x, particle.position.y, particle.position.z);
    });
    
    positions.needsUpdate = true;
  }

  /**
   * Clear all particles
   */
  clearParticles(): void {
    this.particleSystems.forEach((points) => {
      points.geometry.dispose();
      if (points.material instanceof GalaxyMaterial) {
        points.material.dispose();
      }
      this.remove(points);
    });
    
    this.particles.clear();
    this.particleSystems.clear();
  }

  /**
   * Set a new galaxy configuration
   */
  setGalaxyConfig(config: GalaxyConfig, regenerate: boolean = true): void {
    this.galaxyConfig = config;
    if (regenerate) {
      this.generateParticles();
    }
  }

  /**
   * Get current galaxy configuration
   */
  getGalaxyConfig(): GalaxyConfig {
    return this.galaxyConfig;
  }

  /**
   * Set animation speed
   */
  setAnimationSpeed(speed: number): void {
    this.animationSpeed = speed;
  }

  /**
   * Get total particle count
   */
  getTotalParticleCount(): number {
    let total = 0;
    this.particles.forEach((particles) => {
      total += particles.length;
    });
    return total;
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.clearParticles();
  }

  /**
   * Helper method to create default particle texture
   */
  static createDefaultParticleTexture(size: number = 64): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    return canvas;
  }
}