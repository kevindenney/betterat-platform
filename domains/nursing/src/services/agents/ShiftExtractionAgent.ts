// @ts-nocheck
import { z } from 'zod';
import { BaseAgentService, AgentTool } from '@betterat/ai';

export interface ExtractedShiftData {
  name: string;
  unit: string;
  date: string;
  time: string;
  role?: string;
  staffing?: {
    rn?: number;
    lpn?: number;
    cna?: number;
    support?: number;
  };
  acuity?: string;
  notes?: string;
}

export class ShiftExtractionAgent extends BaseAgentService {
  constructor() {
    super({
      model: 'claude-3-5-haiku-latest',
      maxTokens: 2048,
      temperature: 0.2,
      systemPrompt: `You transform informal staffing documents into structured shift entries for BetterAt Nursing. Parse handoff reports, staffing grids, scheduling emails, or pdf text and pull:
- Shift name or label
- Unit/location
- Shift date (YYYY-MM-DD)
- Time block or start/end (HH:MM - HH:MM)
- Primary role (Charge RN, Float RN, etc.)
- Staffing counts (RN/LPN/CNA/support)
- Acuity or census notes
Return structured JSON even when the source is messy.`,
    });

    this.registerTool(this.createExtractionTool());
  }

  async extractShiftData(text: string) {
    const response = await this.run({
      userMessage: `Extract nursing shift details from the following text. When in doubt, make your best inference and list any missing required fields.\n\n${text}\n\nCall the extract_shift_data tool once you know the fields.`,
      maxIterations: 2,
    });

    if (!response.success) {
      return { success: false, error: response.error };
    }

    const toolResult = response.toolResults?.['extract_shift_data'];
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

    return { success: true, data: toolResult.data as ExtractedShiftData };
  }

  private createExtractionTool(): AgentTool {
    return {
      name: 'extract_shift_data',
      description: 'Return structured nursing shift details from text or urls.',
      input_schema: z.object({
        name: z.string().nullable(),
        unit: z.string().nullable(),
        date: z.string().nullable(),
        time: z.string().nullable(),
        role: z.string().nullable().optional(),
        staffing: z
          .object({
            rn: z.coerce.number().optional(),
            lpn: z.coerce.number().optional(),
            cna: z.coerce.number().optional(),
            support: z.coerce.number().optional(),
          })
          .optional(),
        acuity: z.string().optional(),
        notes: z.string().optional(),
      }),
      execute: async (input) => {
        const missingFields: string[] = [];
        if (!input.name) missingFields.push('shift name');
        if (!input.unit) missingFields.push('unit');
        if (!input.date) missingFields.push('date');
        if (!input.time) missingFields.push('time');

        if (missingFields.length > 0) {
          return {
            success: false,
            missingFields,
            message: `Missing: ${missingFields.join(', ')}. Provide shift name, unit, date, and time.`,
          };
        }

        return {
          success: true,
          data: {
            name: input.name!,
            unit: input.unit!,
            date: input.date!,
            time: input.time!,
            role: input.role ?? undefined,
            staffing: input.staffing,
            acuity: input.acuity,
            notes: input.notes,
          },
        };
      },
    };
  }
}
