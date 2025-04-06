/**
 * Below are the colors that are used in the app.
 */

// Original theme colors
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const ExpoColors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// CartMate theme colors
export default {
  // Primary Colors
  primary: '#4CAF50', // Green
  secondary: '#FFEB3B', // Yellow
  
  // Neutral Colors
  white: '#FFFFFF', // White
  lightGray: '#F5F5F5', // Light Gray
  darkGray: '#212121', // Dark Gray
  mediumGray: '#757575', // Medium Gray
  
  // Feedback Colors
  error: '#F44336', // Red
  warning: '#FF9800', // Orange
  success: '#8BC34A', // Light Green
};
