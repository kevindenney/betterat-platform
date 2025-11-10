# BetterAt Platform

**One platform for deliberate practice across any domain of expertise**

## Vision

BetterAt Platform provides a unified experience for deliberate practice across any field of expertise. Users maintain a single account and seamlessly switch between different domains—whether that's YachtRacing, Nursing, Piano, or any other area they want to master.

Each domain is a self-contained module that can be:
- Developed independently
- Published as a standalone package
- Dynamically loaded into the main platform
- Customized with domain-specific practice routines, assessments, and content

## Architecture

This is a TypeScript monorepo built with Turborepo, organized into three main directories:

### `apps/`
Main applications (mobile apps, web apps, admin dashboards)

### `packages/`
Shared libraries and utilities:
- `@betterat/core` - Core types, auth interfaces, and domain registry
- `@betterat/ui` - Shared React Native UI components
- `@betterat/domain-sdk` - SDK for building domain modules

### `domains/`
Domain-specific modules that plug into the platform:
- Each domain is independently developed
- Domains register themselves with the core platform
- Users can switch between domains seamlessly

## Getting Started

### Install Dependencies

```bash
npm install
```

### Build All Packages

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Other Commands

```bash
npm run lint    # Run linting across all packages
npm run test    # Run tests across all packages
npm run clean   # Clean build artifacts
```

## Technology Stack

- **Monorepo**: Turborepo
- **Language**: TypeScript
- **Mobile**: React Native
- **Package Manager**: npm workspaces
