# @betterat/domain-sdk

SDK for creating BetterAt domain modules

## Overview

The Domain SDK provides a comprehensive type system and helper functions for building pluggable domain modules for the BetterAt platform. Each domain represents a specific area of expertise (e.g., YachtRacing, Nursing, Drawing) with its own activity types, metrics, AI coaches, and UI.

## Installation

```bash
npm install @betterat/domain-sdk
```

## Quick Example

```typescript
import { createDomain, createActivityType, createMetric, createAgent } from '@betterat/domain-sdk';
import { z } from 'zod';

// Define your domain
const yachtRacingDomain = createDomain({
  meta: {
    id: 'yachtracing',
    name: 'Yacht Racing',
    description: 'Improve your yacht racing skills',
    version: '1.0.0',
    primaryColor: '#0077BE',
  },

  activityTypes: [
    createActivityType({
      name: 'Race',
      metadataSchema: z.object({
        boatType: z.string(),
        windSpeed: z.number(),
        placement: z.number(),
        competitors: z.number(),
      }),
      displayComponent: RaceDisplay,
      loggerComponent: RaceLogger,
    }),
  ],

  metrics: [
    createMetric({
      name: 'Average Placement',
      calculator: (activities) => {
        const races = activities.filter(a => a.activityTypeId === 'race');
        return races.reduce((sum, r) => sum + r.metadata.placement, 0) / races.length;
      },
    }),
  ],

  agents: [
    createAgent({
      name: 'Racing Coach',
      systemPrompt: 'You are an expert yacht racing coach...',
      tools: [],
    }),
  ],
});
```

## Main Interfaces

### Core Types

- **DomainModule** - Complete domain configuration
- **DomainMeta** - Domain metadata (id, name, version, colors)

### Activity System

- **ActivityTypeDefinition** - Define custom activity types with Zod schemas
- **Activity** - Base activity data model
- **ActivityDisplayProps** / **ActivityLoggerProps** - Component prop types

### Metrics

- **MetricDefinition** - Define metrics with calculators and formatters
- **ProgressMetric** - Track progress over time

### AI Agents

- **AIAgentConfig** - Configure AI coaches with prompts and tools
- **AITool** - Define executable tools for agents
- **CoachingSession** - Track coaching conversations

### Platform Services

- **PlatformServices** - Access to user, data, AI, storage, analytics, navigation
- **UserService** / **DataService** / **AIService** - Typed service interfaces

## Helper Functions

- `createDomain(config)` - Create a domain module with defaults
- `createActivityType(config)` - Create an activity type with auto-generated ID
- `createMetric(config)` - Create a metric with default formatter
- `createAgent(config)` - Create an AI agent with sensible defaults
- `createTool(config)` - Create an AI tool

## TypeScript Support

All types are fully typed with TypeScript for excellent IDE support and type safety.
