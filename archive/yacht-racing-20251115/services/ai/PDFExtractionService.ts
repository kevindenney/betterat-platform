// @ts-nocheck
export class PDFExtractionService {
  async extractText(pdf: any) {
    console.warn('PDFExtractionService: Stub');
    return { success: true, text: '', error: null };
  }
}

export const pdfExtractionService = new PDFExtractionService();
