import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // --- Add this override ---
  {
    files: ["**/*.d.ts"], // Apply this configuration to all .d.ts files
    rules: {
      "@typescript-eslint/no-unused-vars": "off" // Turn off the rule for these files
    }
  }
];

export default eslintConfig;
