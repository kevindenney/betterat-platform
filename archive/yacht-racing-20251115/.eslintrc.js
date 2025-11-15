module.exports = {
  root: true,
  extends: ['expo'],
  ignorePatterns: ['dist/**', 'build/**'],
  rules: {
    'react/no-unescaped-entities': 'off', // React Native renders text nodes, so escaping quotes is unnecessary and noisy.
  },
};
