import { Vector3, Material, Color as ThreeColor } from 'three';
import { ParticleDistributor, ProcessContext } from './ParticleDistributor';
import { ParticlesConfig } from '../core/ParticlesConfig';
import { FastRandom } from '../utils/FastRandom';

/**
 * Image Distribution Algorithm
 * Uses images to distribute stars based on grayscale values
 * Generates inverse integrals for probability distribution
 */
export class ImageDistributor extends ParticleDistributor {
  // Maps
  public distributionMap?: ImageData;
  public colorMap?: ImageData;
  public heightMap?: ImageData;
  
  // Height parameters
  public heightDistribution: (t: number) => number = (t) => t;
  public maxHeight: number = 10;
  public colorContribution: number = 1;
  
  // Downsampling for performance
  private distributionDownsample: number = 1;
  
  // Probability distribution curves
  private cy?: ((t: number) => number)[];
  private cx?: (t: number) => number;
  
  private random: FastRandom;

  constructor(seed?: number) {
    super();
    this.random = new FastRandom(seed);
  }

  process(context: ProcessContext): void {
    if (!this.distributionMap || !this.cy || !this.cx) return;
    
    const width = Math.floor(this.distributionMap.width / this.distributionDownsample);
    const height = Math.floor(this.distributionMap.height / this.distributionDownsample);
    
    // Sample from probability distributions
    const x = Math.min(Math.floor(this.cx(this.random.nextDouble())), this.cy.length - 1);
    const y = Math.floor(this.cy[Math.min(x, this.cy.length - 1)](this.random.nextDouble()));
    
    // Calculate position
    const xStepSize = 1.0 / width;
    const yStepSize = 1.0 / height;
    const xPos = x / width;
    const yPos = y / height;
    
    // Create position with random offset within pixel
    const pos = new Vector3(
      -0.5 + xPos + this.random.nextDouble() * xStepSize,
      0,
      -0.5 + yPos + this.random.nextDouble() * yStepSize
    );
    
    // Scale to galaxy size
    pos.multiplyScalar(context.galaxy.size * 2);
    
    // Calculate height
    pos.y = this.nextGaussianDouble(1) * this.maxHeight;
    
    // Apply height map if available
    if (this.heightMap) {
      const heightValue = this.getPixelBilinear(this.heightMap, xPos, yPos);
      pos.y *= heightValue.grayscale;
    }
    
    // Process standard properties
    this.processProperties(context, pos, 0);
    
    // Apply color map if available
    if (this.colorMap) {
      const mapColor = this.getPixelBilinear(this.colorMap, xPos, yPos);
      const threeMapColor = new ThreeColor(mapColor.r, mapColor.g, mapColor.b);
      context.particle.color.lerp(threeMapColor, this.colorContribution);
    }
    
    context.particle.position = pos;
  }

  canProcess(_particles: ParticlesConfig): boolean {
    if (!this.distributionMap) {
      console.warn('No distribution map set');
      return false;
    }
    return true;
  }

  updateMaterial(_material: Material): void {
    // No specific material updates needed
  }

  /**
   * Set the distribution map and analyze it
   */
  setDistributionMap(imageData: ImageData): void {
    this.distributionMap = imageData;
    this.analyzeImage();
  }

  /**
   * Set the color map
   */
  setColorMap(imageData: ImageData): void {
    this.colorMap = imageData;
  }

  /**
   * Set the height map
   */
  setHeightMap(imageData: ImageData): void {
    this.heightMap = imageData;
  }

  /**
   * Analyze the distribution map and create probability distributions
   */
  private analyzeImage(): void {
    if (!this.distributionMap) {
      this.cy = undefined;
      this.cx = undefined;
      return;
    }
    
    const width = Math.floor(this.distributionMap.width / Math.max(this.distributionDownsample, 1));
    const height = Math.floor(this.distributionMap.height / Math.max(this.distributionDownsample, 1));
    
    // Create 2D array of grayscale samples
    const samples: number[][] = Array(width).fill(0).map(() => Array(height).fill(0));
    
    // Sample the image
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height - 1; y++) {
        const pixel = this.getPixelBilinear(this.distributionMap, x / width, y / height);
        samples[x][y] = pixel.grayscale;
      }
    }
    
    // Create cumulative distribution in Y direction
    for (let x = 0; x < width; x++) {
      for (let y = 1; y < height; y++) {
        samples[x][y] += samples[x][y - 1];
      }
    }
    
    // Create cumulative distribution in X direction
    let max = Number.EPSILON;
    for (let x = 1; x < width; x++) {
      samples[x][height - 1] += samples[x - 1][height - 1];
      max = Math.max(max, samples[x][height - 1]);
    }
    
    // Create X distribution curve
    const xKeyframes: { value: number; output: number }[] = [];
    for (let x = 1; x < width; x++) {
      xKeyframes.push({
        value: samples[x][height - 1] / max,
        output: x
      });
    }
    this.cx = this.createCurveFromKeyframes(xKeyframes);
    
    // Create Y distribution curves
    this.cy = [];
    for (let x = 0; x < width; x++) {
      const yKeyframes: { value: number; output: number }[] = [];
      let yMax = Number.EPSILON;
      
      for (let y = 0; y < height; y++) {
        yMax = Math.max(yMax, samples[x][y]);
      }
      
      for (let y = 0; y < height - 1; y++) {
        yKeyframes.push({
          value: samples[x][y] / yMax,
          output: y
        });
      }
      
      this.cy[x] = this.createCurveFromKeyframes(yKeyframes);
    }
  }

  /**
   * Create interpolation function from keyframes
   */
  private createCurveFromKeyframes(keyframes: { value: number; output: number }[]): (t: number) => number {
    return (t: number): number => {
      if (keyframes.length === 0) return 0;
      if (t <= keyframes[0].value) return keyframes[0].output;
      if (t >= keyframes[keyframes.length - 1].value) return keyframes[keyframes.length - 1].output;
      
      // Binary search for faster lookup
      let left = 0;
      let right = keyframes.length - 1;
      
      while (left < right - 1) {
        const mid = Math.floor((left + right) / 2);
        if (keyframes[mid].value <= t) {
          left = mid;
        } else {
          right = mid;
        }
      }
      
      const prev = keyframes[left];
      const next = keyframes[right];
      const factor = (t - prev.value) / (next.value - prev.value);
      
      return prev.output + (next.output - prev.output) * factor;
    };
  }

  /**
   * Get pixel with bilinear interpolation
   */
  private getPixelBilinear(imageData: ImageData, u: number, v: number): { r: number; g: number; b: number; grayscale: number } {
    u = Math.max(0, Math.min(1, u));
    v = Math.max(0, Math.min(1, v));
    
    const x = u * (imageData.width - 1);
    const y = v * (imageData.height - 1);
    
    const x0 = Math.floor(x);
    const x1 = Math.min(x0 + 1, imageData.width - 1);
    const y0 = Math.floor(y);
    const y1 = Math.min(y0 + 1, imageData.height - 1);
    
    const fx = x - x0;
    const fy = y - y0;
    
    // Get four surrounding pixels
    const p00 = this.getPixel(imageData, x0, y0);
    const p10 = this.getPixel(imageData, x1, y0);
    const p01 = this.getPixel(imageData, x0, y1);
    const p11 = this.getPixel(imageData, x1, y1);
    
    // Bilinear interpolation
    const r = this.lerp(this.lerp(p00.r, p10.r, fx), this.lerp(p01.r, p11.r, fx), fy);
    const g = this.lerp(this.lerp(p00.g, p10.g, fx), this.lerp(p01.g, p11.g, fx), fy);
    const b = this.lerp(this.lerp(p00.b, p10.b, fx), this.lerp(p01.b, p11.b, fx), fy);
    
    return {
      r,
      g,
      b,
      grayscale: 0.299 * r + 0.587 * g + 0.114 * b
    };
  }

  /**
   * Get pixel from ImageData
   */
  private getPixel(imageData: ImageData, x: number, y: number): { r: number; g: number; b: number } {
    const index = (y * imageData.width + x) * 4;
    return {
      r: imageData.data[index] / 255,
      g: imageData.data[index + 1] / 255,
      b: imageData.data[index + 2] / 255
    };
  }

  private lerp(a: number, b: number, t: number): number {
    return a * (1 - t) + b * t;
  }

  /**
   * Generate Gaussian distributed random number
   */
  private nextGaussianDouble(variance: number): number {
    let u1 = 0;
    let u2 = 0;
    
    while (u1 === 0) {
      u1 = this.random.nextDouble();
    }
    while (u2 === 0) {
      u2 = this.random.nextDouble();
    }
    
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * variance;
  }

  /**
   * Helper method to load image and create ImageData
   */
  static async loadImageAsImageData(url: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get 2D context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        resolve(imageData);
      };
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      img.src = url;
    });
  }
}