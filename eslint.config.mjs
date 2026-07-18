import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "out/**", "dist/**", "work/**", "outputs/**", "tmp/**", ".agents/**", ".codex/**", "import/incoming/**", "imports/incoming/**", "supplier-files/**"] },
  ...nextVitals,
  ...nextTs,
];

export default eslintConfig;
