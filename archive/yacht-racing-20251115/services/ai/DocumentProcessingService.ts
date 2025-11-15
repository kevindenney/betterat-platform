import type { ProcessDocumentsParams, SourceDocument } from '@/types/raceEvents';

interface ProcessedDocument {
  text: string;
  metadata: Record<string, unknown>;
}

interface UploadResult {
  documentClass: string;
  summary: string;
  [key: string]: unknown;
}

interface ExtractRaceCourseResult {
  marks: Array<{ lat: number; lng: number; name?: string }>;
  courseLayout: {
    type: string;
    description: string;
    confidence: number;
  };
  startLine: { lat: number; lng: number };
}

export class DocumentProcessingService {
  async processDocument(_file: File | Blob): Promise<ProcessedDocument> {
    console.warn('DocumentProcessingService: Stub');
    return { text: '', metadata: {} };
  }

  async uploadDocument(_file: File | Blob): Promise<UploadResult> {
    console.warn('DocumentProcessingService.uploadDocument: Stub');
    return { documentClass: 'unknown', summary: '' };
  }

  async extractRaceCourse(_params: ProcessDocumentsParams): Promise<ExtractRaceCourseResult> {
    console.warn('DocumentProcessingService.extractRaceCourse: Stub');
    return {
      marks: [],
      courseLayout: {
        type: 'windward-leeward',
        description: 'Stubbed course layout',
        confidence: 0.5,
      },
      startLine: { lat: 0, lng: 0 },
    };
  }
}
