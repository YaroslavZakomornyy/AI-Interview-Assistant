import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

import reactRefresh from 'eslint-plugin-react-refresh'

export default [
    { ignores: ['dist'] },
    {
        files: ['**/*.{js,jsx}'],
        env: {
            "node": true
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        settings: {
            react: { version: '18.3' },
            "import/resolver": {
                alias: {
                    map: [
                        ['@', './src'],
                        ['@utils', './src/utils'],
                        ['@routes', './src/routes'],
                        ['@controllers', './src/controllers/*']
                    ],
                    extensions: ['.js', '.jsx', '.json'],
                },
            },
        },
        extens: [
            'eslint:recommended',
            'plugin:import/errors',
            'plugin:import/warnings',
        ],
        plugins: [
            react,
            'react-hooks',
            'react-refresh',
            'import',
        ],
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            'react/jsx-no-target-blank': 'off',
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
        },
    },
]
