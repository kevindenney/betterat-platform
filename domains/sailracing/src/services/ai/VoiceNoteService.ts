// @ts-nocheck
interface TranscriptionResult {
  text: string;
  timestamp: number;
}

export class VoiceNoteService {
  async transcribe(_audio: ArrayBuffer | Blob): Promise<TranscriptionResult> {
    console.warn('VoiceNoteService: Stub');
    return { text: '', timestamp: Date.now() };
  }
}

export const voiceNoteService = new VoiceNoteService();
