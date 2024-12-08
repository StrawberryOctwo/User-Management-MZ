// .i18next-parser.config.js
module.exports = {
    // Specify the locales you want to extract. Here, only English is configured.
    locales: ['en'],

    // The default namespace for your translations. Adjust as needed.
    defaultNamespace: 'common',

    // Define the output path for the localization files.
    output: 'en1.json',

    // Define the input files to scan for translation keys.
    input: [
        'src/**/*.{js,jsx,ts,tsx}', // Adjust this glob pattern based on your project structure
    ],

    // Disable key nesting to keep all keys flat in the JSON file.
    keySeparator: false,

    // Disable namespace separation in keys.
    nsSeparator: false,

    // Define the function names used for translations.
    func: {
        list: ['t', 'i18next.t', 'useTranslation().t'], // Add any other custom function names if necessary
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },

    // Set default values for missing translations. Here, the key itself is used as the default value.
    defaultValue: (lng, ns, key) => key,

    // Whether to remove unused keys from the JSON file.
    removeUnusedKeys: false,

    // Sort the keys alphabetically in the output file.
    sort: true,

    // Enable verbose logging for debugging purposes.
    verbose: false,

    // Ignore specific files or directories.
    ignore: ['**/node_modules/**', '**/vendor/**', '**/*.test.{js,jsx,ts,tsx}'],
};
