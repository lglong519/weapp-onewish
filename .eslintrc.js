module.exports = {
	"root": true,
	"parserOptions": {
		"ecmaVersion": 6,
		"sourceType": "module",
	},
	"env": {
		"node": true,
		"es6": true
	},
	"globals": {
		wx: false,
		getApp: false,
		Page: false
	},
	"extends": "eslint:recommended",
	"rules": {
		"no-console": 0,
		"no-unused-vars": 1,
		"no-empty-function": 1,
		"no-magic-numbers": 0, // 含义不明确的数字
		"no-multi-spaces": 1,
		"no-empty": 1,
		"key-spacing": [
			1,
			{
				"beforeColon": false,
				"afterColon": true
			}
		],
		"indent": [
			"error",
			"tab"
		],
		"semi": [
			"error",
			"always"
		],
		"quotes": 0,
		"new-parens": 0,
		"eqeqeq": "warn",
		"newline-after-var": 0,
		"camelcase": 0,
		"one-var": 0,
		"eol-last": 1,
		"no-tabs": 0,
		"func-style": [
			0,
			"declaration"
		],
		"require-jsdoc": 0,
		"id-length": 0,
		"sort-keys": 0,
		"prefer-const": 0,
		"space-before-function-paren": [
			0,
			"always"
		],
		'space-infix-ops': 2, // 要求操作符周围有空格
		'space-in-parens': 2, // 强制在圆括号内使用一致的空格
		'space-unary-ops': 2, // 强制在一元操作符前后使用一致的空格
		'spaced-comment': 2, // 强制在注释中 // 或 /* 使用一致的空格
		'arrow-spacing': 2, // 强制箭头函数的箭头前后使用一致的空格 
		'space-before-blocks': 2, // 强制在块之前使用一致的空格
		// 'comma-dangle':2,//禁止行尾逗号
		"strict": 0
	}
};
