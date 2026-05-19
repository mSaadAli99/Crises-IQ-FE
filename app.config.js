/** @type {import('expo/config').ExpoConfig} */
module.exports = () => {
  const appJson = require("./app.json");

  const siteUrl =
    process.env.EXPO_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:8081");

  const origin = siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`;

  return {
    expo: {
      ...appJson.expo,
      plugins: [
        ["expo-router", { origin }],
        "expo-font",
        "expo-web-browser",
      ],
    },
  };
};
