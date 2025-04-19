// Define TypeScript interfaces based on the JSDoc types

interface ThemeColors {
  primary: string;
  secondary: string;
  panelBg: string;
  textPrimary: string;
  textSecondary: string;
  textHeader: string;
  bloodRed: string;
  border: string;
  inputBg: string;
  inputBorder: string;
  checkboxAccent: string;
  handleBg: string;
  shadow: string;
  textShadow: string;
  bloodShadowDark: string;
  bloodShadowMid: string;
  bloodShadowLight: string;
}

interface ThemeFonts {
  primary: string;
  header: string;
}

interface ThemeLayout {
  borderRadius: string;
  padding: string;
  controlBarHeight: string;
  panelShadow: string;
  buttonPadding: string;
}

interface ThemeBackground {
  image: string;
  size: string;
  position: string;
  attachment: string;
}

// Define the main Theme interface
export interface Theme {
  colors: ThemeColors;
  fonts: ThemeFonts;
  layout: ThemeLayout;
  background: ThemeBackground;
}

/**
 * Theme object defining the visual style of the application.
 */
export const theme: Theme = {
  colors: {
    primary: 'rgba(139, 69, 19, 0.8)', // SaddleBrown-ish, semi-transparent
    secondary: 'rgba(210, 180, 140, 0.85)', // Tan-ish, semi-transparent
    panelBg: 'rgba(57, 52, 43, 0.9)', // Dark Olive/Brown, semi-transparent
    textPrimary: '#FFF8DC', // Cornsilk
    textSecondary: '#5D3A1A', // Darker Brown for labels
    textHeader: '#A0522D', // Sienna (original)
    bloodRed: '#8b0000', // DarkRed
    border: 'rgba(139, 69, 19, 0.5)', // SaddleBrown-ish, more transparent
    inputBg: '#FFF8DC', // Cornsilk (approximates amber-50)
    inputBorder: '#8B4513', // SaddleBrown (approximates amber-700)
    checkboxAccent: '#8B4513', // SaddleBrown (approximates amber-700)
    handleBg: 'rgba(139, 69, 19, 0.3)', // SaddleBrown-ish, very transparent
    shadow: 'rgba(0,0,0,0.15)',
    textShadow: 'rgba(0,0,0,0.3)',
    // Colors for the blood drip text shadow effect
    bloodShadowDark: 'rgba(50, 0, 0, 0.8)',
    bloodShadowMid: 'rgba(100, 0, 0, 0.6)',
    bloodShadowLight: 'rgba(139, 0, 0, 0.4)',
  },
  fonts: {
    primary: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
    header: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
  },
  layout: {
    borderRadius: '0.75rem', // Corresponds to rounded-xl
    padding: '1rem', // Corresponds to p-4
    controlBarHeight: '60px',
    panelShadow: '0 8px 32px rgba(0,0,0,0.15)',
    buttonPadding: '0.5rem 1.5rem',
  },
  background: {
    image: 'url("/bg.png")',
    size: 'cover',
    position: 'center',
    attachment: 'fixed',
  },
};