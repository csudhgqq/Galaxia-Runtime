# Galaxia Three.js Debugging Guide

## Common Issues and Solutions

### Black Screen / No Particles Visible

If you're seeing a black screen with no particles:

1. **Check WebGL Errors**
   - Open browser console (F12)
   - Look for shader compilation errors
   - Common errors:
     - `Shader Error 0 - VALIDATE_STATUS false`
     - `uniform4fv: invalid size`
     - `Invalid blending: 204`

2. **Shader Issues Fixed**
   - **Built-in uniforms**: Three.js automatically provides `modelViewMatrix`, `projectionMatrix`, and `cameraPosition`. Don't redeclare them.
   - **Uniform size mismatch**: Use `Vector4` for `vec4` uniforms (e.g., overlayColor)
   - **Blending modes**: Unity blend factors don't map directly to Three.js. Use `AdditiveBlending` for galaxy particles.

3. **Particle Size Issues**
   - Particles might be too small to see
   - Check `particleSize` values (should be > 0.05)
   - The shader now includes a base multiplier (`* 10.0`) for visibility
   - Minimum size enforced: `gl_PointSize = max(gl_PointSize, 1.0)`

4. **Texture Loading**
   - The shader now handles missing textures gracefully
   - If no texture is provided, a circular fallback is rendered
   - Check that `Galaxy.createDefaultParticleTexture()` is being called

### Testing Your Setup

Use the provided test files to verify your setup:

1. **Basic Test** (`test/test-simple.html`)
   - Tests basic WebGL and shader functionality
   - Shows 10,000 particles in a simple spiral
   - No external dependencies

2. **Full Test** (`test/test-galaxy.html`)
   - Tests different galaxy types
   - Includes texture loading
   - Performance monitoring

3. **Module Test** (`test/test-galaxia-module.html`)
   - Tests the actual shader code from GalaxyMaterial
   - 50,000 particles with texture
   - Verifies all uniforms work correctly

### Debug Checklist

- [ ] Check browser console for errors
- [ ] Verify WebGL is enabled: `renderer.capabilities.isWebGL2`
- [ ] Check particle count is > 0
- [ ] Verify camera position isn't inside the galaxy
- [ ] Ensure texture is loading (or fallback is working)
- [ ] Check blending mode is set correctly
- [ ] Verify particle sizes are reasonable (> 0.05)
- [ ] Test with a simple material first (THREE.PointsMaterial)

### Performance Tips

1. **Particle Count**
   - Start with fewer particles (10,000) for testing
   - Increase gradually to find performance limits

2. **Texture Size**
   - Use power-of-two textures (64x64, 128x128)
   - Smaller textures load faster

3. **Screen Size Limiting**
   - `maxScreenSize` prevents particles from getting too large when close
   - Adjust based on your camera setup

### Shader Debugging

To debug shaders:

1. Add debug output to fragment shader:
   ```glsl
   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red particles
   ```

2. Check if vertices are being transformed:
   ```glsl
   gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 0.1, 1.0);
   ```

3. Verify attributes are being passed:
   ```glsl
   vColor = vec4(1.0, 1.0, 1.0, 1.0); // Force white
   ```

### Browser Compatibility

- Chrome/Edge: Best performance, full WebGL2 support
- Firefox: Good performance, full support
- Safari: May have performance limitations
- Mobile: Reduce particle count for better performance

### Useful Console Commands

```javascript
// Check WebGL support
console.log('WebGL2:', renderer.capabilities.isWebGL2);
console.log('Max Texture Size:', renderer.capabilities.maxTextureSize);
console.log('Max Attributes:', renderer.capabilities.maxAttributes);

// Check shader compilation
material.onBeforeCompile = (shader) => {
    console.log('Vertex Shader:', shader.vertexShader);
    console.log('Fragment Shader:', shader.fragmentShader);
};

// Monitor performance
renderer.info.render.calls // Draw calls
renderer.info.render.points // Point count
renderer.info.memory.geometries // Geometry count
```