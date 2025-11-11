class TuningGuideExtractionService {
  async extractFromDocument(file: any) {
    console.warn('TuningGuideExtractionService.extractFromDocument: Stub response');
    return {
      success: true,
      insights: [],
      message: 'Extraction service not yet implemented.',
      fileName: file?.name ?? 'unknown.pdf',
    };
  }

  async extractContent(guideId: string, fileUrl: string, fileType: string) {
    console.warn('TuningGuideExtractionService.extractContent: Stub response', {
      guideId,
      fileUrl,
      fileType,
    });
    return {
      success: false,
      message: 'Content extraction not yet implemented.',
    };
  }
}

export const tuningGuideExtractionService = new TuningGuideExtractionService();
