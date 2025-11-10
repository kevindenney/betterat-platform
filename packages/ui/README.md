# @betterat/ui

Shared UI components and theme system for the BetterAt platform

## Overview

A collection of production-ready React Native components with a cohesive design system. Built for cross-platform consistency and ease of use.

## Installation

```bash
npm install @betterat/ui
```

## Available Components

- **Button** - Primary, secondary, and outline button variants
- **Card** - Container component with shadow and optional press interaction
- **Input** - Text input with label, validation, and error states
- **Modal** - Full-screen modal with slide-up animation

## Theme System

The UI package includes a comprehensive theme with colors, typography, and spacing values.

### Using the Theme

```typescript
import { colors, fontSizes, fontWeights, spacing } from '@betterat/ui';

// Use in your styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    padding: spacing.md,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.gray900,
  },
});
```

### Theme Values

**Colors:**
- Primary: `primary`, `primaryLight`, `primaryDark`
- Semantic: `success`, `warning`, `error`, `info`
- Grays: `gray50` through `gray900`
- Domains: `yachtracing`, `nursing`, `drawing`, `chess`

**Typography:**
- Sizes: `xs`(12), `sm`(14), `base`(16), `lg`(18), `xl`(20), `xxl`(24), `xxxl`(32)
- Weights: `normal`, `medium`, `semibold`, `bold`

**Spacing:**
- `xs`(4), `sm`(8), `md`(16), `lg`(24), `xl`(32), `xxl`(48)

## Component Examples

### Button

```typescript
import { Button } from '@betterat/ui';

<Button
  title="Save"
  onPress={() => console.log('Pressed')}
  variant="primary"
/>

<Button
  title="Cancel"
  onPress={() => console.log('Cancel')}
  variant="outline"
/>

<Button
  title="Disabled"
  onPress={() => {}}
  disabled
/>
```

### Card

```typescript
import { Card } from '@betterat/ui';

<Card>
  <Text>Card content</Text>
</Card>

// Pressable card
<Card onPress={() => console.log('Tapped')}>
  <Text>Tap me!</Text>
</Card>
```

### Input

```typescript
import { Input } from '@betterat/ui';

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  type="email"
  placeholder="you@example.com"
/>

<Input
  label="Password"
  value={password}
  onChangeText={setPassword}
  type="password"
  error="Password must be at least 8 characters"
/>
```

### Modal

```typescript
import { Modal } from '@betterat/ui';

const [visible, setVisible] = useState(false);

<Modal
  visible={visible}
  onClose={() => setVisible(false)}
  title="Settings"
>
  <Text>Modal content here</Text>
</Modal>
```

## TypeScript Support

All components are fully typed with TypeScript for excellent IDE support and type safety.
