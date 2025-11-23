import { motion } from 'framer-motion';
import { Grid3x3, Circle, LayoutGrid, Globe } from 'lucide-react';
import type { LayoutMode } from '../../types';
import { getButtonStyle, COLORS } from '../../utils/constants';

interface LayoutControlsProps {
  mode: LayoutMode;
  onChange: (mode: LayoutMode) => void;
}

export function LayoutControls({ mode, onChange }: LayoutControlsProps) {
  const layouts: Array<{ value: LayoutMode; label: string; icon: React.ReactNode; description: string }> = [
    {
      value: 'cluster',
      label: 'Cluster',
      icon: <Grid3x3 style={{ width: '16px', height: '16px' }} />,
      description: 'Hierarchical grouped structure',
    },
    {
      value: 'circular',
      label: 'Circular',
      icon: <Circle style={{ width: '16px', height: '16px' }} />,
      description: 'Flat concentric rings',
    },
    {
      value: 'globe',
      label: 'Globe',
      icon: <Globe style={{ width: '16px', height: '16px' }} />,
      description: 'Spherical 3D surface',
    },
    {
      value: 'flat',
      label: 'Baseline',
      icon: <LayoutGrid style={{ width: '16px', height: '16px' }} />,
      description: 'Simple baseline layout',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ fontSize: '10px', color: '#666666', marginBottom: '6px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
        Layout Mode
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {layouts.map((layout) => {
          const isSelected = mode === layout.value;
          const buttonStyle = getButtonStyle(isSelected);

          return (
            <button
              key={layout.value}
              onClick={() => onChange(layout.value)}
              style={{
                ...buttonStyle,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px',
                textAlign: 'left',
              }}
            >
              <div style={{ color: isSelected ? '#000000' : '#ffffff' }}>
                {layout.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{layout.label}</div>
                <div style={{ fontSize: '10px', color: isSelected ? '#000000' : '#666666', marginTop: '2px' }}>{layout.description}</div>
              </div>
              {isSelected && (
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    background: '#000000',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
