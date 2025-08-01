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