import '@testing-library/jest-native/extend-expect';
import { mockColorScheme } from './test-utils/mockColorScheme';

// Default tests to light mode unless a case overrides it explicitly.
mockColorScheme('light');

// Vector icons rely on native modules; replace them with lightweight shims.
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  return new Proxy(
    {},
    {
      get: (_target, prop: string) => {
        return ({ children, ...rest }: { children?: React.ReactNode }) =>
          React.createElement('Icon', { name: prop, ...rest }, children);
      },
    },
  );
});
