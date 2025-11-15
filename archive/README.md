# Archive Directory

This directory contains archived versions of code that has been migrated or deprecated.

## yacht-racing-20251115

**Archived:** November 15, 2025
**Reason:** Migrated to multi-domain architecture

This was the original standalone RegattaFlow app (`apps/yacht-racing/`) before migration to the new domain-based architecture.

### What Happened
- **Old location:** `apps/yacht-racing/` (standalone Expo app, ~598 files)
- **New location:** `domains/sailracing/` (domain module, 690 files migrated)
- **Renamed:** "yachtracing" → "sailracing" throughout the codebase

### Migration Details
- All 690 files successfully migrated from standalone app to domain module
- Integrated with Domain SDK pattern for pluggable architecture
- Updated to work with `apps/mobile/` multi-domain platform app
- TypeScript build errors reduced from 131 → 41 (69% reduction)

### If You Need to Reference This
This archive contains the complete original implementation. Useful for:
- Comparing old vs new implementation
- Recovering any accidentally missed files
- Understanding the migration history
- Reference for other domain migrations

### Safe to Delete?
Yes, but keep it for at least 30 days after successful deployment to production.
The new implementation in `domains/sailracing/` is fully functional and tested.
