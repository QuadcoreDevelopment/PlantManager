import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";


export default defineConfig([
	{ files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
	{ files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
	{ files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.browser } },
	{
		"rules": {

			"no-unused-vars": ["warn", {
				"vars": "all",
				"args": "after-used",
				"caughtErrors": "all",
				"ignoreRestSiblings": false,
				"reportUsedIgnorePattern": false
			}],

			"no-use-before-define": ["error", {
				"functions": false,
				"classes": true,
				"variables": true,
				"allowNamedExports": false
			}]
		},
		languageOptions: { 
			globals: { ...globals.browser, ...globals.jquery }
		}
	}

]);