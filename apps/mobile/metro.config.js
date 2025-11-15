const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

// Find the project and workspace directories
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// Get the default Expo Metro config
const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

// 4. Add path alias resolution for domain internal imports
// This allows sailracing domain's @/ imports to resolve correctly
config.resolver.extraNodeModules = {
  '@': path.resolve(monorepoRoot, 'domains/sailracing/src'),
};

// 5. Add custom resolver to handle @/ paths in any context
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // If the module starts with @/ and we're in the sailracing domain context
  if (moduleName.startsWith('@/')) {
    const relativePath = moduleName.slice(2); // Remove '@/'
    const basePath = path.resolve(monorepoRoot, 'domains/sailracing/src', relativePath);

    // Try to resolve with common extensions
    const extensions = ['', '.tsx', '.ts', '.js', '.jsx', '/index.tsx', '/index.ts', '/index.js'];

    for (const ext of extensions) {
      const fullPath = basePath + ext;
      if (fs.existsSync(fullPath)) {
        return {
          type: 'sourceFile',
          filePath: fullPath,
        };
      }
    }
  }

  // Fall back to default resolver
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
