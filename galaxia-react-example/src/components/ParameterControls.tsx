import { useControls, folder } from 'leva';
import { useEffect } from 'react';
import { GalaxyPreset } from '../utils/presets';

interface ParameterControlsProps {
  preset: GalaxyPreset;
  onPresetUpdate: (preset: GalaxyPreset) => void;
}

function ParameterControls({ preset, onPresetUpdate }: ParameterControlsProps) {
  const [values, set] = useControls(() => ({
    'Galaxy Properties': folder({
      size: {
        value: preset.size,
        min: 10,
        max: 200,
        step: 1,
      },
      heightOffset: {
        value: preset.heightOffset,
        min: 0,
        max: 50,
        step: 0.5,
      },
      particleCount: {
        value: preset.particleCount,
        min: 1000,
        max: 500000,
        step: 1000,
      },
      particleSize: {
        value: preset.particleSize,
        min: 0.01,
        max: 0.5,
        step: 0.01,
      },
      animationSpeed: {
        value: preset.animationSpeed || 1,
        min: 0,
        max: 2,
        step: 0.1,
      },
    }),
    
    'Distribution': folder({
      distributorType: {
        value: preset.distributorType,
        options: ['density-wave', 'gaussian', 'image'],
      },
      seed: {
        value: preset.seed,
        min: 0,
        max: 999999,
        step: 1,
      },
    }),
    
    'Density Wave': folder({
      periapsisDistance: {
        value: preset.densityWave?.periapsisDistance || 0.08,
        min: 0.01,
        max: 0.5,
        step: 0.01,
      },
      apsisDistance: {
        value: preset.densityWave?.apsisDistance || 0.01,
        min: 0.001,
        max: 0.1,
        step: 0.001,
      },
      angleOffset: {
        value: preset.densityWave?.angleOffset || 8,
        min: 0,
        max: 20,
        step: 0.5,
      },
      heightVariance: {
        value: preset.densityWave?.heightVariance || 1,
        min: 0,
        max: 5,
        step: 0.1,
      },
    }, {
      collapsed: preset.distributorType !== 'density-wave',
      render: (get) => get('Distribution.distributorType') === 'density-wave',
    }),
    
    'Gaussian': folder({
      variation: {
        value: preset.gaussian?.variation || 1,
        min: 0.1,
        max: 3,
        step: 0.1,
      },
    }, {
      collapsed: preset.distributorType !== 'gaussian',
      render: (get) => get('Distribution.distributorType') === 'gaussian',
    }),
  }));

  // Update preset when controls change
  useEffect(() => {
    const updatedPreset: GalaxyPreset = {
      ...preset,
      size: values.size,
      heightOffset: values.heightOffset,
      particleCount: values.particleCount,
      particleSize: values.particleSize,
      animationSpeed: values.animationSpeed,
      distributorType: values.distributorType as any,
      seed: values.seed,
      densityWave: values.distributorType === 'density-wave' ? {
        periapsisDistance: values.periapsisDistance,
        apsisDistance: values.apsisDistance,
        angleOffset: values.angleOffset,
        heightVariance: values.heightVariance,
      } : preset.densityWave,
      gaussian: values.distributorType === 'gaussian' ? {
        variation: values.variation,
      } : preset.gaussian,
    };
    
    onPresetUpdate(updatedPreset);
  }, [values]);

  // Update controls when preset changes externally
  useEffect(() => {
    set({
      size: preset.size,
      heightOffset: preset.heightOffset,
      particleCount: preset.particleCount,
      particleSize: preset.particleSize,
      animationSpeed: preset.animationSpeed || 1,
      distributorType: preset.distributorType,
      seed: preset.seed,
      periapsisDistance: preset.densityWave?.periapsisDistance || 0.08,
      apsisDistance: preset.densityWave?.apsisDistance || 0.01,
      angleOffset: preset.densityWave?.angleOffset || 8,
      heightVariance: preset.densityWave?.heightVariance || 1,
      variation: preset.gaussian?.variation || 1,
    });
  }, [preset.id, set]);

  return null;
}

export default ParameterControls;