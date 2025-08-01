import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { Leva } from 'leva';
import GalaxyScene from './components/GalaxyScene';
import ParameterControls from './components/ParameterControls';
import PresetSelector from './components/PresetSelector';
import { GalaxyPreset, galaxyPresets } from './utils/presets';

function App() {
  const [selectedPreset, setSelectedPreset] = useState<GalaxyPreset>(galaxyPresets[0]);
  const [showStats, setShowStats] = useState(true);

  return (
    <>
      <Canvas
        camera={{ position: [0, 50, 150], fov: 60 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#000000']} />
        
        <Suspense fallback={null}>
          <GalaxyScene preset={selectedPreset} />
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={0.5}
          panSpeed={0.5}
          rotateSpeed={0.5}
        />

        {showStats && <Stats />}
      </Canvas>

      <PresetSelector
        presets={galaxyPresets}
        selectedPreset={selectedPreset}
        onPresetChange={setSelectedPreset}
      />

      <ParameterControls
        preset={selectedPreset}
        onPresetUpdate={setSelectedPreset}
      />

      <div className="controls-hint">
        <div>Left Mouse: Rotate</div>
        <div>Right Mouse: Pan</div>
        <div>Scroll: Zoom</div>
      </div>

      <button
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: '#fff',
          borderRadius: 4,
          cursor: 'pointer'
        }}
        onClick={() => setShowStats(!showStats)}
      >
        {showStats ? 'Hide' : 'Show'} Stats
      </button>

      <div className="info">
        <div>Preset: {selectedPreset.name}</div>
        <div>Particles: {selectedPreset.particleCount.toLocaleString()}</div>
        <div>Type: {selectedPreset.distributorType}</div>
      </div>

      <Leva
        collapsed={false}
        oneLineLabels={false}
        flat={true}
        theme={{
          sizes: {
            titleBarHeight: '28px',
          },
          fontSizes: {
            root: '11px',
          },
        }}
      />
    </>
  );
}

export default App;