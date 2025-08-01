/**
 * A fast random number generator for TypeScript
 * Based on xorshift RNG by George Marsaglia
 * Period: 2^128-1
 */
export class FastRandom {
  private static readonly REAL_UNIT_INT = 1.0 / (2147483647 + 1.0);
  private static readonly REAL_UNIT_UINT = 1.0 / (4294967295 + 1.0);
  private static readonly Y = 842502087;
  private static readonly Z = 3579807591;
  private static readonly W = 273326509;

  private x: number = 0;
  private y: number = 0;
  private z: number = 0;
  private w: number = 0;

  private bitBuffer: number = 0;
  private bitMask: number = 1;

  constructor(seed?: number) {
    if (seed !== undefined) {
      this.reinitialise(seed);
    } else {
      this.reinitialise(Date.now());
    }
  }

  /**
   * Reinitialises using an int value as a seed.
   */
  reinitialise(seed: number): void {
    this.x = seed >>> 0;
    this.y = FastRandom.Y;
    this.z = FastRandom.Z;
    this.w = FastRandom.W;
  }

  /**
   * Generates a random int over the range 0 to int.MaxValue-1.
   */
  next(): number {
    let t = (this.x ^ (this.x << 11)) >>> 0;
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = ((this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8))) >>> 0;

    const rtn = this.w & 0x7fffffff;
    if (rtn === 0x7fffffff) {
      return this.next();
    }
    return rtn;
  }

  /**
   * Generates a random int over the range 0 to upperBound-1.
   */
  nextInt(upperBound?: number): number {
    if (upperBound === undefined) {
      let t = (this.x ^ (this.x << 11)) >>> 0;
      this.x = this.y;
      this.y = this.z;
      this.z = this.w;
      this.w = ((this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8))) >>> 0;
      return (this.w & 0x7fffffff) | 0;
    }

    if (upperBound < 0) {
      throw new Error('upperBound must be >= 0');
    }

    let t = (this.x ^ (this.x << 11)) >>> 0;
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = ((this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8))) >>> 0;

    return Math.floor(FastRandom.REAL_UNIT_INT * (this.w & 0x7fffffff) * upperBound);
  }

  /**
   * Generates a random int over the range lowerBound to upperBound-1.
   */
  nextRange(lowerBound: number, upperBound: number): number {
    if (lowerBound > upperBound) {
      throw new Error('upperBound must be >= lowerBound');
    }

    let t = (this.x ^ (this.x << 11)) >>> 0;
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = ((this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8))) >>> 0;

    const range = upperBound - lowerBound;
    if (range < 0) {
      return lowerBound + Math.floor(FastRandom.REAL_UNIT_UINT * this.w * (upperBound - lowerBound));
    }

    return lowerBound + Math.floor(FastRandom.REAL_UNIT_INT * (this.w & 0x7fffffff) * range);
  }

  /**
   * Generates a random double. Values returned are from 0.0 up to but not including 1.0.
   */
  nextDouble(): number {
    let t = (this.x ^ (this.x << 11)) >>> 0;
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = ((this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8))) >>> 0;

    return FastRandom.REAL_UNIT_INT * (this.w & 0x7fffffff);
  }

  /**
   * Generates a uint. Values returned are over the full range of a uint.
   */
  nextUInt(): number {
    let t = (this.x ^ (this.x << 11)) >>> 0;
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = ((this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8))) >>> 0;
    return this.w >>> 0;
  }

  /**
   * Generates a single random bit.
   */
  nextBool(): boolean {
    if (this.bitMask === 1) {
      let t = (this.x ^ (this.x << 11)) >>> 0;
      this.x = this.y;
      this.y = this.z;
      this.z = this.w;
      this.bitBuffer = this.w = ((this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8))) >>> 0;
      this.bitMask = 0x80000000;
      return (this.bitBuffer & this.bitMask) === 0;
    }

    this.bitMask >>>= 1;
    return (this.bitBuffer & this.bitMask) === 0;
  }

  get seed(): number {
    return this.x | 0;
  }
}