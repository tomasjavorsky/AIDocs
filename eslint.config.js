// @ts-check
import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import importX from "eslint-plugin-import-x";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
    // A. Never lint build output or generated files
    globalIgnores(["**/dist/**", "**/coverage/**", "**/.turbo/**", "**/*.gen.ts"]),

    // B. Fail on stale `eslint-disable` comments
    { linterOptions: { reportUnusedDisableDirectives: "error" } },

    // C. Base rule sets
    js.configs.recommended,
    tseslint.configs.recommendedTypeChecked,

    // D. Give typescript-eslint access to the type checker
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
        },
    },

    // E. Plain JS files (like this one) aren't in any tsconfig
    {
        files: ["**/*.{js,mjs,cjs}"],
        extends: [tseslint.configs.disableTypeChecked],
        languageOptions: { globals: globals.node },
    },

    // F. Every import must be declared in the importing package's own package.json
    {
        plugins: { "import-x": importX },
        rules: {
            "import-x/no-extraneous-dependencies": [
                "error",
                { devDependencies: ["**/*.test.{ts,tsx}", "**/test/**", "**/*.config.{js,ts}"] },
            ],
        },
    },

    // G. React rules, only for the web app
    {
        files: ["apps/web/**/*.{ts,tsx}"],
        plugins: { "react-hooks": reactHooks },
        languageOptions: { globals: globals.browser },
        rules: {
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            "no-restricted-imports": ["error", {
                patterns: [
                    {
                        group: ["@aidocs/db", "@aidocs/db/*"],
                        message: "cant import '@aidocs/db' from the web app",
                    },
                ],
            }]
        }
    },

    {
        files: ["packages/mcp-server/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: [
                    {
                        group: ["@aidocs/db", "@aidocs/db/*"],
                        message: "cant import '@aidocs/db' from the mcp server"
                    },
                ],
            }]
        }
    },

    // H. Must be last: turn off every rule that conflicts with Prettier
    prettier,
);
