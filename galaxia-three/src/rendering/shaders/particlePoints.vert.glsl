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