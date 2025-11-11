export class VoiceNoteService {
  async transcribe(audio: any) {
    console.warn('VoiceNoteService: Stub');
    return { text: '', timestamp: Date.now() };
  }
}

export const voiceNoteService = new VoiceNoteService();
