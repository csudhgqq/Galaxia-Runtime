/**
 * Implementation of the Perlin simplex noise, an improved Perlin noise algorithm.
 * Based on SimplexNoise1234 by Stefan Gustavson
 */
export class SimplexNoise {
  private static perm: Uint8Array;

  static {
    // Initialize permutation table
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    // Shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = p[i];
      p[i] = p[j];
      p[j] = temp;
    }

    // Duplicate permutation table
    SimplexNoise.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      SimplexNoise.perm[i] = p[i & 255];
    }
  }

  private static fastFloor(x: number): number {
    return x > 0 ? Math.floor(x) : Math.floor(x) - 1;
  }

  private static grad(hash: number, x: number): number {
    const h = hash & 15;
    const grad = 1 + (h & 7);
    return (h & 8) ? -grad * x : grad * x;
  }

  private static grad2(hash: number, x: number, y: number): number {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
  }

  private static grad3d(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
  }

  /**
   * 1D simplex noise
   */
  static generate1D(x: number): number {
    const i0 = SimplexNoise.fastFloor(x);
    const i1 = i0 + 1;
    const x0 = x - i0;
    const x1 = x0 - 1.0;

    let t0 = 1.0 - x0 * x0;
    t0 *= t0;
    const n0 = t0 * t0 * SimplexNoise.grad(SimplexNoise.perm[i0 & 0xff], x0);

    let t1 = 1.0 - x1 * x1;
    t1 *= t1;
    const n1 = t1 * t1 * SimplexNoise.grad(SimplexNoise.perm[i1 & 0xff], x1);

    return 0.395 * (n0 + n1);
  }

  /**
   * 2D simplex noise
   */
  static generate2D(x: number, y: number): number {
    const F2 = 0.366025403; // F2 = 0.5*(sqrt(3.0)-1.0)
    const G2 = 0.211324865; // G2 = (3.0-Math.sqrt(3.0))/6.0

    const s = (x + y) * F2;
    const xs = x + s;
    const ys = y + s;
    const i = SimplexNoise.fastFloor(xs);
    const j = SimplexNoise.fastFloor(ys);

    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = x - X0;
    const y0 = y - Y0;

    let i1: number, j1: number;
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } else {
      i1 = 0;
      j1 = 1;
    }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    const ii = i & 0xff;
    const jj = j & 0xff;

    let n0 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * SimplexNoise.grad2(SimplexNoise.perm[ii + SimplexNoise.perm[jj]], x0, y0);
    }

    let n1 = 0;
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * SimplexNoise.grad2(SimplexNoise.perm[ii + i1 + SimplexNoise.perm[jj + j1]], x1, y1);
    }

    let n2 = 0;
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * SimplexNoise.grad2(SimplexNoise.perm[ii + 1 + SimplexNoise.perm[jj + 1]], x2, y2);
    }

    return 40.0 * (n0 + n1 + n2);
  }

  /**
   * 3D simplex noise
   */
  static generate3D(x: number, y: number, z: number): number {
    const F3 = 1.0 / 3.0;
    const G3 = 1.0 / 6.0;

    const s = (x + y + z) * F3;
    const xs = x + s;
    const ys = y + s;
    const zs = z + s;
    const i = SimplexNoise.fastFloor(xs);
    const j = SimplexNoise.fastFloor(ys);
    const k = SimplexNoise.fastFloor(zs);

    const t = (i + j + k) * G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = x - X0;
    const y0 = y - Y0;
    const z0 = z - Z0;

    let i1: number, j1: number, k1: number;
    let i2: number, j2: number, k2: number;

    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
      } else if (x0 >= z0) {
        i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
      } else {
        i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
      }
    } else {
      if (y0 < z0) {
        i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
      } else if (x0 < z0) {
        i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
      } else {
        i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
      }
    }

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0 * G3;
    const y2 = y0 - j2 + 2.0 * G3;
    const z2 = z0 - k2 + 2.0 * G3;
    const x3 = x0 - 1.0 + 3.0 * G3;
    const y3 = y0 - 1.0 + 3.0 * G3;
    const z3 = z0 - 1.0 + 3.0 * G3;

    const ii = i & 0xff;
    const jj = j & 0xff;
    const kk = k & 0xff;

    let n0 = 0;
    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 >= 0) {
      t0 *= t0;
      n0 = t0 * t0 * SimplexNoise.grad3d(SimplexNoise.perm[ii + SimplexNoise.perm[jj + SimplexNoise.perm[kk]]], x0, y0, z0);
    }

    let n1 = 0;
    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 >= 0) {
      t1 *= t1;
      n1 = t1 * t1 * SimplexNoise.grad3d(SimplexNoise.perm[ii + i1 + SimplexNoise.perm[jj + j1 + SimplexNoise.perm[kk + k1]]], x1, y1, z1);
    }

    let n2 = 0;
    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 >= 0) {
      t2 *= t2;
      n2 = t2 * t2 * SimplexNoise.grad3d(SimplexNoise.perm[ii + i2 + SimplexNoise.perm[jj + j2 + SimplexNoise.perm[kk + k2]]], x2, y2, z2);
    }

    let n3 = 0;
    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 >= 0) {
      t3 *= t3;
      n3 = t3 * t3 * SimplexNoise.grad3d(SimplexNoise.perm[ii + 1 + SimplexNoise.perm[jj + 1 + SimplexNoise.perm[kk + 1]]], x3, y3, z3);
    }

    return 32.0 * (n0 + n1 + n2 + n3);
  }

  /**
   * Helper function for backward compatibility
   */
  static generate(x: number, y?: number, z?: number): number {
    if (z !== undefined) {
      return SimplexNoise.generate3D(x, y!, z);
    } else if (y !== undefined) {
      return SimplexNoise.generate2D(x, y);
    } else {
      return SimplexNoise.generate1D(x);
    }
  }
}