import { Vector3, Color } from 'three';

/**
 * Main data storage class for particles.
 */
export class Particle {
  public position: Vector3;
  public color: Color;
  public size: number;
  public rotation: number;
  public focalPoint: number;
  public startingTime: number;
  public index: number;
  public sheetPosition: number;

  constructor() {
    this.position = new Vector3();
    this.color = new Color(1, 1, 1);
    this.size = 1.0;
    this.rotation = 0;
    this.focalPoint = 0;
    this.startingTime = 0;
    this.index = 0;
    this.sheetPosition = 0;
  }

  /**
   * Clone the particle
   */
  clone(): Particle {
    const p = new Particle();
    p.position.copy(this.position);
    p.color.copy(this.color);
    p.size = this.size;
    p.rotation = this.rotation;
    p.focalPoint = this.focalPoint;
    p.startingTime = this.startingTime;
    p.index = this.index;
    p.sheetPosition = this.sheetPosition;
    return p;
  }
}