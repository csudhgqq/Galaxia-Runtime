// Optimized Particle Points Fragment Shader

// Uniforms
uniform sampler2D mainTexture;
uniform vec4 overlayColor;
uniform float textureSheetPower;

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
  vec4 texColor = texture2D(mainTexture, atlasUv);
  
  // Apply particle color and overlay
  vec4 finalColor = texColor * vColor * overlayColor;
  
  // Alpha test
  if (finalColor.a < 0.022) {
    discard;
  }
  
  gl_FragColor = finalColor;
}