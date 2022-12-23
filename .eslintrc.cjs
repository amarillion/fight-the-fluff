module.exports = {
	env: {
		'browser': true,
		'es6': true,
		'node' : true,
		'jest': true
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
		'import'
	],
	parserOptions: {
		'sourceType': 'module',
		'ecmaVersion': 2020
	},
	rules: {
		'indent': [ 'error', 'tab', { 'SwitchCase': 1 , 'ignoredNodes': ['TemplateLiteral > *'] } ],
		'quotes': [ 'error', 'single', { 'allowTemplateLiterals': true } ],
		'semi': [ 'error', 'always' ],
		'no-console': [ 'off' ],
		'eqeqeq': [ 'error', 'always' ],
		'camelcase': [ 'error' ],
		'no-shadow': [ 'error' ],
		'brace-style': [ 'error', 'stroustrup', { 'allowSingleLine': true } ],
		'no-var': [ 'error' ],
		'no-fallthrough': [ 'error' ],
		'eol-last': ['error', 'always'],
		'@typescript-eslint/explicit-module-boundary-types': ['off'],
		'@typescript-eslint/no-empty-function': ['off'],
		'import/extensions': ['error', 'always'],
	},
};
