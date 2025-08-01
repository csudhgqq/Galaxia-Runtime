# Galaxia Three.js Test Suite

This directory contains test files to verify the Galaxia Three.js library is working correctly.

## Test Files

### 1. test-simple.html
Basic WebGL particle test with custom shaders. No external dependencies.
- 10,000 particles
- Simple circular particles
- Tests shader compilation and rendering

### 2. test-galaxy.html
Comprehensive galaxy rendering tests with multiple presets:
- Basic Points Test
- Spiral Galaxy (50,000 particles)
- Gaussian Cluster (30,000 particles)
- FPS counter and controls

### 3. test-galaxia-module.html
Tests the actual GalaxyMaterial shader code:
- 50,000 particles in spiral formation
- Texture loading and rendering
- All uniforms from GalaxyMaterial
- Error handling and debugging info

## Running the Tests

1. **Local File System**
   ```bash
   # Open directly in browser
   open test/test-simple.html
   ```

2. **Local Server (Recommended)**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server -p 8000
   
   # Then visit:
   # http://localhost:8000/test/test-simple.html
   ```

## What to Look For

✅ **Success Indicators:**
- Particles visible on screen
- Smooth rotation/animation
- No console errors
- FPS > 30

❌ **Failure Indicators:**
- Black screen
- WebGL errors in console
- Low FPS (< 10)
- Particles not visible

## Debugging Tips

1. **Start Simple**: Run test-simple.html first
2. **Check Console**: Look for shader compilation errors
3. **Reduce Particles**: Lower count if performance is poor
4. **Try Different Browsers**: Chrome usually works best

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 85+
- ✅ Edge 90+
- ⚠️ Safari 14+ (may have limitations)
- ⚠️ Mobile browsers (reduce particle count)