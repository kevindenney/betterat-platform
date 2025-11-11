# 🚀 BetterAt Platform

> One platform for deliberate practice across any domain of expertise.

[![Week 1 Complete](https://img.shields.io/badge/Week%201-Complete-success)]()
[![Architecture](https://img.shields.io/badge/Architecture-Validated-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)]()

## 🎯 Vision

BetterAt is a platform for deliberate practice across any domain. Users have ONE account and can switch between:

- ⛵ **Yacht Racing** - Race strategy, performance analysis, regatta management
- 🩺 **Nursing** - Clinical skills, simulation tracking, competency development
- 🎨 **Drawing** - Technique practice, portfolio building, skill progression
- ♟️ **Chess** - Game analysis, opening study, tactical training
- 👨‍🍳 **Cooking** - Recipe mastery, technique practice, flavor development
- And many more...

## 🏗️ Architecture

**Platform Approach:** Shared infrastructure + pluggable domain modules

```
betterat-platform/
├── apps/
│   └── mobile/              # React Native + Expo app
├── packages/
│   ├── core/                # Platform services (auth, registry, analytics)
│   ├── domain-sdk/          # SDK for creating domains
│   └── ui/                  # Shared UI components
└── domains/
    ├── test/                # Test domain (validation)
    ├── yachtracing/         # Yacht racing domain (Week 2)
    └── nursing/             # Nursing domain (Weeks 6-9)
```

Each domain is a self-contained module that plugs into the platform using the SDK. Domains can be:
- Developed independently
- Published as standalone packages
- Dynamically loaded into the platform
- Customized with domain-specific features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone repository
git clone [your-repo]
cd betterat-platform

# Install dependencies
npm install

# Build all packages
npm run build

# Run mobile app
cd apps/mobile
npm start
# Press 'w' for web
```

## 📦 Packages

### @betterat/core
Platform services including:
- Domain registry and loading
- Authentication (Supabase)
- AI engine integration
- Analytics

### @betterat/domain-sdk
SDK for creating domain modules:
- `createDomain()` - Define domain module
- `createActivityType()` - Define activity types
- `createMetric()` - Define metrics
- `createAgent()` - Configure AI agents

### @betterat/ui
Shared UI components:
- Theme system (colors, typography, spacing)
- Components (Button, Card, Input, Modal)
- Domain-specific colors

### @betterat/domains-test
Test domain for platform validation.

## 🎨 Creating a Domain

Domains use the SDK to plug into the platform:
```typescript
import { createDomain, createActivityType, createMetric, createAgent } from '@betterat/domain-sdk'
import { z } from 'zod'

export default createDomain({
  meta: {
    id: 'yachtracing',
    name: 'Yacht Racing',
    description: 'Master competitive sailing',
    icon: '⛵',
    primaryColor: '#0077BE',
    version: '1.0.0',
    minPlatformVersion: '1.0.0',
  },

  activityTypes: [
    createActivityType({
      id: 'race',
      name: 'Race',
      icon: '🏁',
      metadataSchema: z.object({
        boatId: z.string(),
        finishing_position: z.number(),
      }),
      displayComponent: RaceCard,
      loggerComponent: RaceLogger,
    }),
  ],

  metrics: [
    createMetric({
      id: 'vmg_improvement',
      name: 'VMG Improvement',
      unit: 'knots',
      calculator: (activities) => {
        // Calculate improvement
      },
      formatter: (value) => `${value.toFixed(1)} knots`,
    }),
  ],

  agents: {
    coach: createAgent({
      id: 'sailing-coach',
      name: 'Sailing Coach',
      model: 'claude-3.5-sonnet',
      systemPrompt: 'You are an expert sailing coach...',
    }),
  },

  routes: [
    { path: '/dashboard', component: Dashboard },
  ],

  components: {
    Dashboard: YachtRacingDashboard,
  },
})
```

## 📊 Development Status

### ✅ Week 1 (Nov 11-15): Foundation - COMPLETE
- [x] Monorepo infrastructure
- [x] Domain SDK with TypeScript
- [x] UI component library
- [x] Test domain validation
- [x] Architecture validated

### 🔄 Week 2-3 (Nov 18-29): RegattaFlow Extraction
- [ ] Create yachtracing domain
- [ ] Migrate all features
- [ ] Test thoroughly

### 📅 Week 5 (Dec 9-13): LAUNCH
- [ ] Platform launch
- [ ] Public announcement

### 📅 Weeks 6-9 (Dec 16-Jan 12): Nursing Domain
- [ ] Second domain proves scalability

## 🛠️ Tech Stack

- **Monorepo:** Turborepo
- **Language:** TypeScript (strict mode)
- **Mobile:** React Native + Expo
- **Backend:** Supabase
- **AI:** Anthropic Claude
- **Validation:** Zod

## 📖 Documentation

- [Week 1 Retrospective](./WEEK_1_RETROSPECTIVE.md)
- [Architecture Overview](./BETTERAT_PLATFORM_ARCHITECTURE.md)
- [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md)
- [Week 2 Plan](./WEEK_2_PLAN.md)

## 🤝 Contributing

Currently in active development by Kevin Rockey.

## 📜 License

Proprietary - All rights reserved

---

**Built by Kevin Rockey** | Hong Kong → World 🌍

*From sailing app to platform for human excellence.* 🚀
