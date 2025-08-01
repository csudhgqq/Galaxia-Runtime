import { GalaxyPreset } from '../utils/presets';

interface PresetSelectorProps {
  presets: GalaxyPreset[];
  selectedPreset: GalaxyPreset;
  onPresetChange: (preset: GalaxyPreset) => void;
}

function PresetSelector({ presets, selectedPreset, onPresetChange }: PresetSelectorProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: 20,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        minWidth: '250px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>Galaxy Presets</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {presets.map(preset => (
          <button
            key={preset.id}
            onClick={() => onPresetChange(preset)}
            style={{
              padding: '10px 12px',
              background: selectedPreset.id === preset.id 
                ? 'rgba(100, 100, 255, 0.3)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: selectedPreset.id === preset.id
                ? '1px solid rgba(100, 100, 255, 0.6)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (selectedPreset.id !== preset.id) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPreset.id !== preset.id) {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{preset.name}</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>{preset.description}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '4px' }}>
              {preset.particleCount.toLocaleString()} particles
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default PresetSelector;