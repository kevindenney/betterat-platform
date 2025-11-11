module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo', 'nativewind/babel'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          alias: {
            '@': './',
            '@betterat/core': '../../packages/core/src',
            '@betterat/core/*': '../../packages/core/src/*',
            '@betterat/ui': '../../packages/ui/src',
            '@betterat/ui/*': '../../packages/ui/src/*',
            '@betterat/domain-sdk': '../../packages/domain-sdk/src',
            '@betterat/domain-sdk/*': '../../packages/domain-sdk/src/*',
            '@betterat/ai': '../../packages/ai/src',
            '@betterat/ai/*': '../../packages/ai/src/*'
          }
        }
      ]
    ]
  };
};
