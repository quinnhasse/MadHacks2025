import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Palette } from 'lucide-react';
import type { LayoutMode, ColorMode } from '../../types';
import { LayoutControls } from './LayoutControls';
import { ColorControls } from './ColorControls';
import { PANEL_STYLES, BUTTON_STYLES } from '../../utils/constants';

interface ControlsPanelProps {
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  colorMode: ColorMode;
  onColorModeChange: (mode: ColorMode) => void;
}

type TabType = 'layout' | 'color';

export function ControlsPanel({
  layoutMode,
  onLayoutModeChange,
  colorMode,
  onColorModeChange,
}: ControlsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('layout');

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'layout', label: 'Layout', icon: <Globe className="w-4 h-4" /> },
    { id: 'color', label: 'Colors', icon: <Palette className="w-4 h-4" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.2,
        ease: 'easeOut',
      }}
      style={{
        position: 'absolute',
        top: PANEL_STYLES.TOP,
        left: PANEL_STYLES.LEFT,
        zIndex: 10,
        minWidth: '280px',
        background: PANEL_STYLES.BG,
        border: `1px solid ${PANEL_STYLES.BORDER}`,
        borderRadius: PANEL_STYLES.BORDER_RADIUS,
        padding: PANEL_STYLES.PADDING,
      }}
    >
      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '2px',
        marginBottom: '12px',
        padding: '0',
        borderRadius: '0',
        background: 'transparent',
        borderBottom: `1px solid ${PANEL_STYLES.BORDER}`
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 12px',
              borderRadius: '0',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase' as const,
              transition: 'all 0.15s ease',
              position: 'relative',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #ffffff' : '2px solid transparent',
              background: activeTab === tab.id ? '#1a1a1a' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : '#666666',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '14px', display: 'inline-flex' }}>{tab.icon}</span>
              <span style={{ display: window.innerWidth >= 640 ? 'inline' : 'none' }}>{tab.label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'layout' && (
            <LayoutControls mode={layoutMode} onChange={onLayoutModeChange} />
          )}
          {activeTab === 'color' && (
            <ColorControls mode={colorMode} onChange={onColorModeChange} />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
