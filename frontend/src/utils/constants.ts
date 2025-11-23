/**
 * Shared style constants for the Transparens AI visualization
 * Military-grade aesthetic: Black and white, minimal borders, tactical UI
 */

export const COLORS = {
  // Military monochrome palette
  PRIMARY: '#ffffff',
  SECONDARY: '#cccccc',
  TERTIARY: '#666666',

  // Base colors
  WHITE: '#ffffff',
  BLACK: '#000000',
  BACKGROUND: '#000000',
  SURFACE: '#0a0a0a',
};

export const BUTTON_STYLES = {
  // Selected state (active) - military inverted style
  SELECTED_BG: '#ffffff',
  SELECTED_BORDER: '#ffffff',
  SELECTED_TEXT: '#000000',

  // Unselected state (inactive)
  UNSELECTED_BG: 'transparent',
  UNSELECTED_BORDER: '#333333',
  UNSELECTED_TEXT: '#ffffff',

  // Hover state
  HOVER_BG: '#1a1a1a',
  HOVER_BORDER: '#666666',
};

export const PANEL_STYLES = {
  // Controls panel background - minimal, tactical
  BG: '#000000',
  BORDER: '#333333',
  BLUR: 'none',

  // Positioning
  TOP: '16px',
  LEFT: '16px',
  BORDER_RADIUS: '0px',
  PADDING: '12px',
};

/**
 * Helper function to create button styles based on selection state
 */
export const getButtonStyle = (isSelected: boolean) => ({
  background: isSelected ? BUTTON_STYLES.SELECTED_BG : BUTTON_STYLES.UNSELECTED_BG,
  border: `1px solid ${isSelected ? BUTTON_STYLES.SELECTED_BORDER : BUTTON_STYLES.UNSELECTED_BORDER}`,
  color: isSelected ? BUTTON_STYLES.SELECTED_TEXT : BUTTON_STYLES.UNSELECTED_TEXT,
  padding: '8px 12px',
  borderRadius: '0px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
});
