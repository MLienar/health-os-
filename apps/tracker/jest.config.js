const preset = require("jest-expo/jest-preset");

// Packages shipped as untranspiled source that Jest must run through Babel, on top of jest-expo's
// own list (react-native, expo, @react-navigation, standard-navigation, …).
const EXTRA_TRANSFORMED = [
  "nativewind",
  "react-native-css-interop",
  "@rn-primitives",
  "react-native-svg",
];

const transformIgnorePatterns = preset.transformIgnorePatterns.map((pattern) =>
  pattern.includes("standard-navigation")
    ? pattern.replace(
        "standard-navigation",
        ["standard-navigation", ...EXTRA_TRANSFORMED].join("|"),
      )
    : pattern,
);

/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/e2e/", "/dist/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // Metro + NativeWind handle CSS in the app; in Jest a stylesheet import is a no-op.
    "\\.css$": "<rootDir>/jest.style-mock.js",
  },
  transformIgnorePatterns,
};
