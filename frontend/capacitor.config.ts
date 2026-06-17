import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cyvanta.affiliate.app',
  appName: 'AffiliateAPP',
  webDir: 'dist',
  server: {
    // Allow the Capacitor WebView to make requests to external APIs
    allowNavigation: ['cyvantacashback-3.onrender.com'],
    // Use http scheme so Android treats it like a normal web request
    androidScheme: 'https',
  },
  android: {
    // Allow mixed content (HTTP resources on HTTPS pages)
    allowMixedContent: true,
  }
};

export default config;
