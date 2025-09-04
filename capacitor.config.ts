import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.767cd24f15cb4c00ac8a1597b12b8fb5',
  appName: 'minty-cash-tracker',
  webDir: 'dist',
  server: {
    url: 'https://767cd24f-15cb-4c00-ac8a-1597b12b8fb5.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#248F59',
      showSpinner: false
    }
  }
};

export default config;