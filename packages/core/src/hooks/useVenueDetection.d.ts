import * as Location from 'expo-location';
import type { SailingVenue } from '../lib/types/global-venues';
interface VenueDetectionResult {
    currentVenue: SailingVenue | null;
    isDetecting: boolean;
    confidence: number;
    error: string | null;
    detectVenue: () => Promise<void>;
    permissionStatus: Location.PermissionStatus | null;
}
export declare function useVenueDetection(): VenueDetectionResult;
export {};
//# sourceMappingURL=useVenueDetection.d.ts.map