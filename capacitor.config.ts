import type { CapacitorConfig } from "@capacitor/cli";

const liveServerUrl = process.env.CAPACITOR_SERVER_URL?.trim();

const config: CapacitorConfig = {
  appId: "com.finicstock.jamanchu",
  appName: "자만추",
  webDir: "dist/public",
  server: liveServerUrl
    ? {
        url: liveServerUrl,
        cleartext: false,
      }
    : {
        androidScheme: "https",
      },
};

export default config;
