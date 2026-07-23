// Deliberately not eslint-config-next: eslint-config-next@16.2.11's legacy
// FlatCompat bridge crashes ("Converting circular structure to JSON") in this
// monorepo due to duplicate eslint-plugin-react installs at different peer
// eslint versions (9.x here, 10.x pulled in elsewhere). This app has no pages
// that would trigger Next's page-router-specific rules anyway (API routes
// only), so plain typescript-eslint recommended rules cover what matters.
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["generated/**", ".next/**"] },
  ...tseslint.configs.recommended,
);
