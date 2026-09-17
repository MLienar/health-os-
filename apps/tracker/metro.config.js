const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Expo's default config already handles pnpm monorepos (workspace root watchFolders and
// nodeModulesPaths) when node-linker=hoisted is set in .npmrc.
const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
