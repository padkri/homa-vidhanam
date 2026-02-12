import { z } from 'zod';

// Schema for multi-language text strings
const MultiLangString = z.object({
  english: z.string().min(1, "English version is required"),
  telugu: z.string().min(1, "Telugu version is required"),
  hindi: z.string().min(1, "Hindi version is required"),
});

// Schema for Slokas/Mantras with script-specific keys
const SlokaSchema = z.object({
  english: z.string().describe("Roman transliteration"),
  telugu: z.string().describe("Telugu script"),
  devanagari: z.string().describe("Devanagari script for Hindi/Sanskrit"),
  swara_enabled: z.boolean().default(false).describe("Indicates if Vedic accents are present"),
});

// Deity-specific override slokas (for sections like Poornaahuti, Suddhaanna Bali)
const DeitySlokasSchema = z.object({
  english: z.string(),
  telugu: z.string(),
  devanagari: z.string(),
});

// A full inline section (no common_ref)
const FullSectionSchema = z.object({
  id: z.number().int().nonnegative(),
  type: z.enum(["common", "pradhana", "uttara"]).describe("Identifies if this is a shared or unique step"),
  title: MultiLangString,
  instructions: z.object({
    english: z.array(z.string()),
    telugu: z.array(z.string()),
    hindi: z.array(z.string()),
  }),
  slokas: SlokaSchema,
  diagram: z.string().optional().describe("Path to diagram image (SVG/PNG)"),
  diagram_placeholder: z.string().optional().describe("Text description when no diagram available"),
  voice_guidance_key: z.string().describe("Unique key for Android TTS triggers"),
});

// A referenced section that pulls content from common_parts.json
const RefSectionSchema = z.object({
  id: z.number().int().nonnegative(),
  type: z.enum(["common", "pradhana", "uttara"]).describe("Identifies if this is a shared or unique step"),
  common_ref: z.string().describe("Key into common_parts.json sections"),
  voice_guidance_key: z.string().describe("Unique key for Android TTS triggers"),
  deity_slokas: DeitySlokasSchema.optional().describe("Deity-specific sloka override for templates with {deity_invocation} or {deity_prefix}"),
});

// A section is either fully inline or a reference to common_parts
const SectionSchema = z.union([RefSectionSchema, FullSectionSchema]);

// The Root Manual Schema
export const HomamManualSchema = z.object({
  metadata: z.object({
    manual_id: z.string(),
    version: z.string(),
    last_validated: z.string().datetime(),
    source_pdf_hash: z.string().optional(),
  }),
  title: MultiLangString,
  author: MultiLangString,
  source: z.string().url().optional().describe("URL to the original source PDF"),
  sections: z.array(SectionSchema),
});

export type HomamManual = z.infer<typeof HomamManualSchema>;

// Re-export sub-schemas for granular validation
export { MultiLangString, SlokaSchema, FullSectionSchema, RefSectionSchema, SectionSchema, DeitySlokasSchema };
