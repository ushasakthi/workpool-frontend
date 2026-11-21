/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    placeholder: '#9AA0A6',
    border: '#E3E4E8',
    primary: '#2E6B4F',
    primaryPressed: '#255A42',
    onPrimary: '#FFFFFF',
    primarySoft: '#E3F0E7',
    primarySoftText: '#2E6B4F',
    error: '#B3261E',
    errorSoft: '#FBE4E1',
    warning: '#8A6D1D',
    warningSoft: '#F5EBD3',
    // gold used for match scores and route markers
    accent: '#A87B26',
    accentSoft: '#F6ECD5',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    placeholder: '#7A7F87',
    border: '#2E3135',
    primary: '#3E8161',
    primaryPressed: '#4C9172',
    onPrimary: '#FFFFFF',
    primarySoft: '#1C3327',
    primarySoftText: '#8FC7A8',
    error: '#E5847C',
    errorSoft: '#3B211F',
    warning: '#D8B863',
    warningSoft: '#3A311C',
    accent: '#D8B863',
    accentSoft: '#3A311C',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
// Admin screens are for desktop, so allow wider content
export const AdminMaxContentWidth = 1280;
