import {
  ShaderMaterial,
  ShaderMaterialParameters,
  Color,
  Texture,
  AdditiveBlending,
  Vector3,
  Vector4,
  UniformsUtils,
  UniformsLib
} from 'three';

// Shader sources - in a real build, these would be imported from .glsl files
// For now, we'll include them as strings
const particlePointsVert = `
// Optimized Particle Points Vertex Shader
// Uses Three.js Points with custom attributes

// Attributes
attribute vec4 particleColor;
attribute float particleSize;
attribute float particleRotation;
attribute float sheetPosition;

// Uniforms
uniform float maxScreenSize;
uniform float time;

// Varyings
varying vec4 vColor;
varying float vRotation;
varying float vSheetPosition;

void main() {
  vColor = particleColor;
  vRotation = particleRotation;
  vSheetPosition = sheetPosition;
  
  // Transform position to view space
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
  // Calculate point size with proper scaling
  // Base size * viewport scaling * distance attenuation
  float screenDepth = -mvPosition.z;
  float size = particleSize * 10.0; // Base multiplier for visibility
  
  // Apply screen-space size limiting
  if (maxScreenSize > 0.0) {
    size = min(size, screenDepth * maxScreenSize);
  }
  
  // Final point size calculation
  gl_PointSize = size * (300.0 / screenDepth);
  gl_PointSize = max(gl_PointSize, 1.0); // Ensure minimum size
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

const particlePointsFrag = `
// Optimized Particle Points Fragment Shader

// Uniforms
uniform sampler2D mainTexture;
uniform vec4 overlayColor;
uniform float textureSheetPower;
uniform bool hasTexture;

// Varyings
varying vec4 vColor;
varying float vRotation;
varying float vSheetPosition;

// Rotation function
vec2 rotate2d(vec2 uv, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  vec2 centered = uv - 0.5;
  return vec2(
    c * centered.x - s * centered.y,
    s * centered.x + c * centered.y
  ) + 0.5;
}

void main() {
  // Get point coordinate (0-1 range)
  vec2 pointCoord = gl_PointCoord;
  
  // Apply rotation
  vec2 rotatedCoord = rotate2d(pointCoord, vRotation);
  
  vec4 texColor;
  
  if (hasTexture) {
    // Calculate texture atlas coordinates
    float atlasSize = 1.0 / textureSheetPower;
    float col = mod(vSheetPosition, textureSheetPower);
    float row = floor(vSheetPosition / textureSheetPower);
    
    // Calculate UV within the atlas tile
    vec2 atlasUv = vec2(
      col * atlasSize + rotatedCoord.x * atlasSize,
      1.0 - (row * atlasSize + rotatedCoord.y * atlasSize) // Flip Y for correct orientation
    );
    
    // Sample texture
    texColor = texture2D(mainTexture, atlasUv);
  } else {
    // Fallback: create circular particle
    vec2 center = pointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
    texColor = vec4(1.0, 1.0, 1.0, alpha);
  }
  
  // Apply particle color and overlay
  vec4 finalColor = texColor * vColor * overlayColor;
  
  // Alpha test
  if (finalColor.a < 0.01) {
    discard;
  }
  
  gl_FragColor = finalColor;
}
`;

const particleBillboardVert = `
// Particle Billboard Vertex Shader
// Converts Unity's geometry shader approach to Three.js instanced rendering

// Attributes
attribute vec3 offset; // Particle position offset
attribute vec4 particleColor;
attribute float particleSize;
attribute float particleRotation;
attribute float sheetPosition;

// Uniforms
uniform float maxScreenSize;
uniform float time;

// Varyings
varying vec2 vUv;
varying vec4 vColor;
varying float vSheetPosition;

// Rotation matrix helper
mat2 rotate2d(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vColor = particleColor;
  vSheetPosition = sheetPosition;
  
  // Get particle world position
  vec3 particleWorldPos = offset;
  
  // Calculate distance to camera
  float distance = length(cameraPosition - particleWorldPos);
  
  // Apply screen-space size limiting
  float size = min(particleSize, particleSize * distance * maxScreenSize);
  
  // Billboard calculations in view space
  vec4 mvPosition = modelViewMatrix * vec4(particleWorldPos, 1.0);
  
  // Apply rotation to local quad position
  vec2 rotatedPosition = rotate2d(particleRotation) * position.xy;
  
  // Scale and offset the vertex position
  mvPosition.xy += rotatedPosition * size;
  
  // Pass through UV coordinates
  vUv = uv;
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

const particleBillboardFrag = `
// Particle Billboard Fragment Shader

// Uniforms
uniform sampler2D mainTexture;
uniform vec4 overlayColor;
uniform float textureSheetPower;
uniform bool hasTexture;

// Varyings
varying vec2 vUv;
varying vec4 vColor;
varying float vSheetPosition;

void main() {
  vec4 texColor;
  
  if (hasTexture) {
    // Calculate texture atlas coordinates
    float atlasSize = 1.0 / textureSheetPower;
    float col = mod(vSheetPosition, textureSheetPower);
    float row = floor(vSheetPosition / textureSheetPower);
    
    // Calculate UV within the atlas tile
    vec2 atlasUv = vec2(
      col * atlasSize + vUv.x * atlasSize,
      row * atlasSize + vUv.y * atlasSize
    );
    
    // Sample texture
    texColor = texture2D(mainTexture, atlasUv);
  } else {
    // Fallback: white texture
    texColor = vec4(1.0, 1.0, 1.0, 1.0);
  }
  
  // Apply particle color and overlay
  vec4 finalColor = texColor * vColor * overlayColor;
  
  // Alpha test for performance
  if (finalColor.a < 0.01) {
    discard;
  }
  
  gl_FragColor = finalColor;
}
`;

export interface GalaxyMaterialOptions {
  texture?: Texture;
  textureSheetPower?: number;
  maxScreenSize?: number;
  overlayColor?: Color;
  blending?: number;
  usePoints?: boolean;
}

/**
 * Custom material for galaxy particle rendering
 */
export class GalaxyMaterial extends ShaderMaterial {
  constructor(options: GalaxyMaterialOptions = {}) {
    const {
      texture,
      textureSheetPower = 1,
      maxScreenSize = 0.1,
      overlayColor = new Color(1, 1, 1),
      blending = AdditiveBlending,
      usePoints = true
    } = options;

    const uniforms = {
      mainTexture: { value: texture || null },
      textureSheetPower: { value: textureSheetPower },
      maxScreenSize: { value: maxScreenSize },
      overlayColor: { value: new Vector4(overlayColor.r, overlayColor.g, overlayColor.b, 1.0) },
      time: { value: 0 },
      hasTexture: { value: texture !== undefined && texture !== null }
    };

    const parameters: ShaderMaterialParameters = {
      uniforms: UniformsUtils.merge([
        uniforms,
        UniformsLib.fog // Add fog support if needed
      ]),
      vertexShader: usePoints ? particlePointsVert : particleBillboardVert,
      fragmentShader: usePoints ? particlePointsFrag : particleBillboardFrag,
      transparent: true,
      blending: blending as any,
      depthWrite: false,
      vertexColors: true
    };

    super(parameters);
  }

  /**
   * Update time uniform for animation
   */
  updateTime(time: number): void {
    this.uniforms.time.value = time;
  }

  /**
   * Update camera position for proper billboard orientation
   * Note: cameraPosition is a built-in uniform in Three.js, no need to update manually
   */
  updateCameraPosition(_position: Vector3): void {
    // Built-in uniform, automatically updated by Three.js
  }

  /**
   * Set the particle texture
   */
  setTexture(texture: Texture | null): void {
    this.uniforms.mainTexture.value = texture;
    this.uniforms.hasTexture.value = texture !== null;
  }

  /**
   * Set texture sheet power (e.g., 4 for 4x4 atlas)
   */
  setTextureSheetPower(power: number): void {
    this.uniforms.textureSheetPower.value = power;
  }

  /**
   * Set maximum screen size
   */
  setMaxScreenSize(size: number): void {
    this.uniforms.maxScreenSize.value = size;
  }

  /**
   * Set overlay color
   */
  setOverlayColor(color: Color): void {
    const v4 = this.uniforms.overlayColor.value as Vector4;
    v4.set(color.r, color.g, color.b, 1.0);
  }
}

// Export shader sources for custom implementations
export const ShaderSources = {
  particlePoints: {
    vertex: particlePointsVert,
    fragment: particlePointsFrag
  },
  particleBillboard: {
    vertex: particleBillboardVert,
    fragment: particleBillboardFrag
  }
};