// @ts-nocheck
import { z } from 'zod';
import { BaseAgentService, AgentTool } from '@betterat/ai';

export interface ExtractedSessionData {
  name: string;
  date: string;
  duration?: string;
  medium?: string;
  subject?: string;
  focus_areas?: string[];
  notes?: string;
}

export class SessionExtractionAgent extends BaseAgentService {
  constructor() {
    super({
      model: 'claude-3-5-haiku-latest',
      maxTokens: 2048,
      temperature: 0.2,
      systemPrompt: `You help BetterAt artists extract structured drawing session plans from messy inspiration docs.
Parse prompt libraries, studio notes, class agendas, or calendar invites. Detect:
- Session name (workshop title, exercise, study theme)
- Date (YYYY-MM-DD)
- Duration (minutes/hours)
- Medium or tools
- Subject/focus (figure, landscape, still life, etc.)
- Focus areas/skills (composition, gesture, color)
- Any notes/inspiration
Return structured JSON ready to pre-fill the session form.`,
    });

    this.registerTool(this.createExtractionTool());
  }

  async extractSessionData(text: string) {
    const response = await this.run({
      userMessage: `Extract drawing session details from the following text. Be specific and convert times + dates to ISO if possible.
\n${text}\n\nCall the extract_drawing_session tool with the structured data.`,
      maxIterations: 2,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    const toolResult = response.toolResults?.['extract_drawing_session'];
    if (!toolResult) {
      return { success: false, error: 'Agent did not call extraction tool.' };
    }

    if (!toolResult.success) {
      return {
        success: false,
        error: toolResult.message,
        missingFields: toolResult.missingFields,
      };
    }

    return { success: true, data: toolResult.data as ExtractedSessionData };
  }

  private createExtractionTool(): AgentTool {
    return {
      name: 'extract_drawing_session',
      description: 'Return structured drawing session details parsed from notes.',
      input_schema: z.object({
        name: z.string().nullable(),
        date: z.string().nullable(),
        duration: z.string().nullable().optional(),
        medium: z.string().nullable().optional(),
        subject: z.string().nullable().optional(),
        focus_areas: z.array(z.string()).nullable().optional(),
        notes: z.string().nullable().optional(),
      }),
      execute: async (input) => {
        const missingFields: string[] = [];
        if (!input.name) missingFields.push('session name');
        if (!input.date) missingFields.push('date');

        if (missingFields.length) {
          return {
            success: false,
            missingFields,
            message: `Missing: ${missingFields.join(', ')}. Provide at least a session name and date.`,
          };
        }

        return {
          success: true,
          data: {
            name: input.name!,
            date: input.date!,
            duration: input.duration ?? undefined,
            medium: input.medium ?? undefined,
            subject: input.subject ?? undefined,
            focus_areas: input.focus_areas?.filter(Boolean) ?? undefined,
            notes: input.notes ?? undefined,
          },
        };
      },
    };
  }
}
