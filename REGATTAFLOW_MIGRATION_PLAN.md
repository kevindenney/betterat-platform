# RegattaFlow → BetterAt/YachtRacing Migration Plan

## 🎯 Goal
Extract RegattaFlow into the BetterAt platform as the yachtracing domain.

## 📋 Current RegattaFlow Features

### Core Features to Migrate:
- [ ] Boat management
- [ ] Race tracking
- [ ] Regatta creation
- [ ] Results/scoring
- [ ] Weather integration
- [ ] Venue database (147 locations)
- [ ] Race strategy planning
- [ ] Performance analytics

### AI Features:
- [ ] Sailing coach agent
- [ ] Race strategist agent
- [ ] Performance analyst agent
- [ ] Venue intelligence

### Data Models:
- [ ] Boats
- [ ] Races
- [ ] Regattas
- [ ] Marks/courses
- [ ] Weather conditions
- [ ] User profiles
- [ ] Race results

## 🏗️ Domain Structure
```
domains/yachtracing/
├── src/
│   ├── index.ts              # Domain definition
│   ├── types.ts              # Domain-specific types
│   ├── screens/              # All screens
│   ├── components/           # All components
│   ├── agents/               # AI agents
│   ├── utils/                # Calculations, scoring
│   └── hooks/                # Data hooks
├── assets/
└── package.json
```

## 📦 What Moves to Domain vs Core

### Move to Domain (yachtracing-specific):
- All sailing-specific screens
- Boat/race/regatta components
- VMG calculations
- Polar curves
- Wind analysis
- Race scoring logic
- Sailing-specific AI agents

### Stay in Core (platform-level):
- Auth
- User management
- Activity logging (base)
- AI engine (wrapper)
- Navigation
- Theme system

## 🗓️ Week 2 Schedule

### Monday-Tuesday: Structure
- Create domains/yachtracing package
- Set up domain module definition
- Migrate types

### Wednesday-Thursday: Components
- Move all screens
- Move all components
- Update imports

### Friday: Integration
- Test loading
- Fix issues
- Verify all features work

## ✅ Success Criteria
- [ ] All RegattaFlow features work
- [ ] No regressions
- [ ] Domain loads in platform
- [ ] Ready to add second domain

---

Next Week: Let's do this! 🚀
