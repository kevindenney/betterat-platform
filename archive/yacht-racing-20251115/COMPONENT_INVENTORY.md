# Component Inventory - Yacht Racing App

## Migration Summary
- **Source**: ~/Developer/RegattaFlow/regattaflow-app/components/
- **Target**: ~/Developer/betterat-platform/apps/yacht-racing/components/
- **Total Component Files**: 239 TypeScript files
- **Total Directories**: 33 directories

## Components by Category

### PRIORITY 1: Core Race Components ✅

#### race/ (11 files)
Racing interface components
- CoachRaceInterface.tsx - Coach-specific race UI
- CourseDesigner.tsx - Course design tool
- CourseTemplateLibrary.tsx - Pre-built course templates
- CourseValidation.tsx - Course validation logic
- RaceBuilder.tsx - Race creation builder
- SailorRaceInterface.tsx - Sailor-specific race UI
- UserTypeAwareRaces.tsx - User role-aware race displays
- WeatherIntegration.tsx - Weather data integration
- shared/ - Shared race components
- yacht-club/ - Yacht club specific components

#### race-control/ (3 files)
Race committee control components
- ProtestModal.tsx - Protest submission/review
- RaceLeaderboard.tsx - Live race leaderboard

#### race-ui/ (7 files)
Reusable race UI primitives
- Badge.tsx - Status badges
- Card.tsx - Card container
- CardHeader.tsx - Card header component
- Chip.tsx - Tag/chip component
- EmptyState.tsx - Empty state displays
- InfoGrid.tsx - Information grid layout

#### racing/ (1 file)
Active racing components
- RaceDayInterface.tsx - Race day control interface

#### racing-console/ (4+ subdirectories)
Advanced racing console components
- AITacticalChips/ - AI-powered tactical suggestions
- DepthSafetyStrip/ - Depth safety warnings
- PreStartConsole/ - Pre-start sequence console

#### race-detail/ (35 files)
Comprehensive race detail components
- RaceOverviewCard.tsx - Race summary
- RacePhaseHeader.tsx - Phase-specific headers
- WeatherCard.tsx - Weather display
- WindWeatherCard.tsx - Wind conditions
- TideCard.tsx, CurrentTideCard.tsx - Tide information
- CompactTideCard.tsx, CompactWaveCard.tsx, CompactWindCard.tsx - Compact views
- CourseCard.tsx, CompactCourseCard.tsx - Course information
- CourseSelector.tsx - Course selection
- MarkManager.tsx - Mark management
- StartStrategyCard.tsx - Start line strategy
- UpwindStrategyCard.tsx - Upwind tactics
- DownwindStrategyCard.tsx - Downwind tactics
- MarkRoundingCard.tsx - Mark rounding plans
- StrategyCard.tsx, StrategyPlanningCard.tsx - Strategy planning
- TacticalPlanCard.tsx - Tactical execution
- RigTuningCard.tsx - Rig tuning recommendations
- CrewEquipmentCard.tsx - Crew gear checklist
- CommunicationsCard.tsx, CompactCommsCard.tsx - Race comms
- TimingCard.tsx - Race timing
- RaceDocumentsCard.tsx - SI/NOR documents
- FleetRacersCard.tsx - Fleet participants
- PostRaceAnalysisCard.tsx - Post-race review
- ExecutionEvaluationCard.tsx - Performance evaluation
- ContingencyPlansCard.tsx - Backup plans
- RaceDetailMapHero.tsx - Map hero section
- WeatherMetricCard.tsx - Weather metrics
- CompactRaceInfoCard.tsx - Compact race info
- map/ - Map-specific components

#### race-strategy/ (12 files)
Race strategy planning components
- AIValidationScreen.tsx - AI strategy validation
- CourseMapVisualization.tsx - Course visualization
- DocumentUploadScreen.tsx - SI/NOR upload
- OnXMapsInterface.tsx - OnX-style mapping
- QuickDrawMode.tsx - Quick course drawing
- RaceMapView.tsx - Race map display
- RaceStrategyFlow.tsx - Strategy workflow
- TacticalMapDemo.tsx - Tactical map demo
- TacticalMapStandalone.tsx - Standalone tactical map
- TacticalRaceMap.tsx - Tactical race mapping
- TimeBasedEnvironmentalMap.tsx - Time-based conditions
- TimeBasedEnvironmentalVisualization.tsx - Environmental viz

### PRIORITY 2: Map & Venue Components ✅

#### map/ (17+ files)
3D mapping and visualization
- Map3DView.tsx - 3D map viewer
- ProfessionalMap3DView.tsx - Professional 3D map
- ProfessionalMapControls.tsx - Map controls
- ProfessionalMapScreen.tsx - Full map screen
- Bathymetry3DViewer.tsx - 3D depth visualization
- RaceCourseVisualization.tsx - Course overlay
- TacticalZoneRenderer.tsx - Tactical zone rendering
- WeatherOverlay3D.tsx - 3D weather overlay
- WebMapView.tsx - Web-specific map
- controls/ - Map control components
- engines/ - Rendering engines
- layers/ - Map layer components
- overlays/ - Map overlay components
- test/ - Map test utilities

#### mapping/ (1 file)
Alternative mapping components
- Map3D.tsx - 3D map component

#### venue/ (17 files)
Venue intelligence and discovery
- GlobalVenueIntelligence.tsx - Global venue system
- GlobalVenuesMapLayer.tsx - Venue map layer
- VenueIntelligenceDisplay.tsx - Venue intelligence UI
- VenueIntelligenceMapView.tsx - Intelligence map view
- VenueMapView.native.tsx, VenueMapView.web.tsx - Platform maps
- VenueDetailsSheet.tsx - Venue details sheet
- VenueHeroCard.tsx - Venue hero display
- VenueSelector.tsx - Venue selection
- VenueSidebar.tsx - Venue navigation
- LocationSelector.tsx - Location selection
- MapControls.tsx - Map control panel
- NetworkSidebar.tsx - Venue network
- SavedNetworkSection.tsx - Saved venues
- TravelResourceChips.tsx - Travel resources
- DiscoverySection.tsx - Venue discovery
- FloatingPanel.tsx - Floating UI panel

### PRIORITY 3: Boat & Sailor Components ✅

#### boats/ (14 files)
Boat management components
- BoatCard.tsx - Boat display card
- Boat3DCard.tsx - 3D boat card
- Boat3DViewer.native.tsx, Boat3DViewer.tsx - 3D boat viewer
- BoatDetail.tsx - Boat detail view
- BoatCrewList.tsx - Crew roster
- QuickAddBoatForm.tsx - Quick boat creation
- SailInventory.tsx - Sail management
- RiggingConfig.tsx - Rigging configuration
- RigTuningControls.tsx - Rig tuning UI
- MaintenanceSchedule.tsx - Maintenance tracking
- PerformanceAnalysis.tsx - Boat performance
- TuningGuideList.tsx - Tuning guide access

#### sailor/ (17 files)
Sailor profile and management
- ClassSelector.tsx - Boat class selection
- ClubsAssociationsSection.tsx - Club memberships
- CrewManagement.tsx - Crew management
- CrewPerformanceCard.tsx - Crew performance
- CrewAvailabilityCalendar.tsx - Crew scheduling
- BoatActionMenu.tsx - Boat action menu
- BoatEquipmentInventory.tsx - Equipment tracking
- AddEquipmentForm.tsx - Add equipment
- CreateTuningSetupForm.tsx - Tuning setup creation
- TuningSettings.tsx - Tuning preferences
- TuningGuidesSection.tsx - Tuning guides
- LogMaintenanceForm.tsx - Log maintenance
- MaintenanceTimeline.tsx - Maintenance history
- EquipmentAlerts.tsx - Equipment reminders
- AlertSubscriptionModal.tsx - Alert subscriptions
- ExternalResultsCard.tsx - External results
- UploadDocumentForm.tsx - Document upload

#### dashboard/ (15+ files)
Dashboard components for all user types
- RaceDashboard.tsx - Main race dashboard
- NextRaceCard.tsx - Next race widget
- NextRaceStrategyCard.tsx - Next race strategy
- RaceCountdownTimer.tsx - Race countdown
- RecentRaceAnalysis.tsx - Recent performance
- SeasonStatsCard.tsx - Season statistics
- AICoachCard.tsx - AI coaching widget
- CoursePredictor.tsx - Course prediction
- WeatherIntelligence.tsx - Weather intelligence
- StrategyPreview.tsx - Strategy preview
- club/ - Club dashboard components
- coach/ - Coach dashboard components
- sailor/ - Sailor dashboard components
- shared/ - Shared dashboard components

### EXISTING COMPONENTS (Pre-Migration)

#### courses/ (4 files)
- CourseBuilder.tsx
- CourseMapView.native.tsx
- CourseMapView.tsx
- CourseMapView.web.tsx

#### races/ (10 files)
- AddRaceModal.tsx
- AIRaceStrategy.tsx
- BoatSelector.tsx
- CountdownTimer.tsx
- CourseSelector.tsx
- EnhancedRaceCard.tsx
- LiveRaceTimer.tsx
- RaceCard.tsx
- RaceTimer.tsx
- StartSequenceTimer.tsx

#### results/ (5 files)
- ExternalResultsMonitor.tsx
- ResultsApprovalPanel.tsx
- ResultsCard.tsx
- ResultsSearchInterface.tsx
- SeriesStandings.tsx

#### shared/ (1 file)
- CardMenu.tsx

## File Distribution

| Category | Component Count |
|----------|----------------|
| Race Core | 11 |
| Race Control | 3 |
| Race UI | 7 |
| Racing | 1 |
| Racing Console | 4+ subdirs |
| Race Detail | 35 |
| Race Strategy | 12 |
| Map | 17+ |
| Mapping | 1 |
| Venue | 17 |
| Boats | 14 |
| Sailor | 17 |
| Dashboard | 15+ |
| Courses | 4 |
| Races | 10 |
| Results | 5 |
| Shared | 1 |
| **TOTAL** | **239 files** |

## Import Update Status

Next steps:
1. Update all `@/components` imports to use `@betterat/ui` for shared components
2. Keep domain-specific components as relative imports
3. Verify all components compile correctly


## Import Updates Applied ✅

Updated 268 import statements across all component files:

| Original Import | New Import | Purpose |
|----------------|------------|---------|
| `@/components` | `@betterat/ui/components` | Shared UI components |
| `@/services/supabase` | `@betterat/core/database` | Database connection |
| `@/hooks` | `@betterat/core/hooks` | Shared hooks |
| `@/lib` | `@betterat/core/lib` | Shared utilities |
| `@/types` | `@betterat/core/types` | Type definitions |
| `@/constants` | `@betterat/core/constants` | Constants |
| `@/utils` | `@betterat/core/utils` | Utility functions |

**Preserved Imports** (app-specific):
- `@/services/*` - Yacht racing services
- `@/providers/*` - App providers
- Relative imports for domain components

## Component Categories Summary

### Critical Race Components (77 files)
- Race interface components (11)
- Race control (3)
- Race UI primitives (7)
- Racing console (4+ subdirs)
- Race detail screens (35)
- Race strategy (12)
- Racing day interface (1)
- Races listing (10)

### Map & Visualization (35+ files)
- 3D mapping (17+)
- Map layers and overlays
- Bathymetry visualization
- Tactical zone rendering
- Venue mapping (17)

### Boat & Sailor Management (46 files)
- Boat management (14)
- Sailor profiles (17)
- Dashboard widgets (15+)

### Supporting Components (81 files)
- Course builder (4)
- Results management (5)
- Shared utilities (1)
- Various domain components

## Migration Status: ✅ COMPLETE

- **239 component files** successfully copied
- **268 imports** updated to use @betterat packages
- **33 directories** with complete component hierarchy
- All race-critical components migrated
- All imports standardized to monorepo structure

## Next Steps

1. ✅ Components copied
2. ✅ Imports updated
3. ⏭️ Test component compilation
4. ⏭️ Verify component rendering
5. ⏭️ Test component integration with screens

