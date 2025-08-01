// Particle Billboard Fragment Shader

// Uniforms
uniform sampler2D mainTexture;
uniform vec4 overlayColor;
uniform float textureSheetPower;

// Varyings
varying vec2 vUv;
varying vec4 vColor;
varying float vSheetPosition;

void main() {
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
  vec4 texColor = texture2D(mainTexture, atlasUv);
  
  // Apply particle color and overlay
  vec4 finalColor = texColor * vColor * overlayColor;
  
  // Alpha test for performance
  if (finalColor.a < 0.022) {
    discard;
  }
  
  gl_FragColor = finalColor;
}