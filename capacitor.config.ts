import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.grainerp.mobile",
  appName: "Grain ERP",
  webDir: "dist",
  server: {
    androidScheme: "https"
  }
};

export default config;
