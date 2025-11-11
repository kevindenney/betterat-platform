export class DocumentProcessingService {
  async processDocument(file: any) {
    console.warn('DocumentProcessingService: Stub');
    return { text: '', metadata: {} };
  }

  async uploadDocument(file: any) {
    console.warn('DocumentProcessingService.uploadDocument: Stub');
    return { documentClass: 'unknown', summary: '', ...file };
  }

  async extractRaceCourse(params: any) {
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
