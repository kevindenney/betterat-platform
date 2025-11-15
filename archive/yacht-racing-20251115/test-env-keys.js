require('dotenv').config();

console.log('\n=== Environment Variable Check ===\n');

const anthropicKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const stormglassKey = process.env.EXPO_PUBLIC_STORMGLASS_API_KEY;

console.log('EXPO_PUBLIC_ANTHROPIC_API_KEY:',
  anthropicKey
    ? `✓ Found (${anthropicKey.substring(0, 10)}...)`
    : '✗ NOT FOUND or empty'
);

console.log('EXPO_PUBLIC_STORMGLASS_API_KEY:',
  stormglassKey
    ? `✓ Found (${stormglassKey.substring(0, 10)}...)`
    : '✗ NOT FOUND or empty'
);

console.log('\nStatus:',
  (anthropicKey && anthropicKey !== 'sk-ant-your-anthropic-key-here' &&
   stormglassKey && stormglassKey !== 'your-stormglass-key-here')
    ? '✓ Both keys configured'
    : '⚠ Keys still using placeholder values - please update .env file'
);

console.log('\n=================================\n');
