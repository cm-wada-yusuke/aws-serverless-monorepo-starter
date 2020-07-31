module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    env: {
        node: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: ['node', '@typescript-eslint'],
    parserOptions: {
        sourceType: 'module',
    },
    rules: {
        semi: 'off',
        '@typescript-eslint/semi': ['error'],

        // `export` functions may be listed first.
        '@typescript-eslint/no-use-before-define': [
            'error',
            { functions: true, classes: false, variables: true },
        ],

        // To read environment variables.
        '@typescript-eslint/no-non-null-assertion': 'off',

        // Disable the eslint side because it conflicts with the prettier.
        '@typescript-eslint/indent': 'off',

        // Parameter functions return type is obvious and need not to be explicit.
        '@typescript-eslint/explicit-function-return-type': [
            'error',
            {
                allowExpressions: true,
                allowTypedFunctionExpressions: true,
                allowHigherOrderFunctions: true,
            },
        ],
    },
};
