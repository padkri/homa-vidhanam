import * as fs from 'fs';
import * as path from 'path';

const filename = process.argv[2];
if (!filename) {
  console.error('Usage: npx tsx tests/migrateManual.ts <filename>');
  process.exit(1);
}

const DATA_DIR = path.resolve(__dirname, '../src/data');
const filePath = path.join(DATA_DIR, filename);
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

// Derive manual_id from filename
const manualId = filename.replace('.json', '');

// Section type classification based on title keywords
function classifySection(id: number, title: string, totalSections: number): "common" | "pradhana" | "uttara" {
  const t = title.toLowerCase();

  // Intro, preparation, purification, invocation, setup steps are "common"
  const commonKeywords = [
    'introduction', 'preparation', 'precaution', 'purification', 'sankalp',
    'aachamanam', 'achamana', 'pranayam', 'ganapathi', 'ganesha', 'ganesh',
    'vighneswara', 'anujnaa', 'anujna', 'water purif', 'agni pratishthaa',
    'dikpalaka', 'poorvaangam', 'purvaangam', 'pre-fire', 'lighting',
    'kalash', 'sipping'
  ];

  // Conclusion, meditation, winding up, ash, udvasana are "uttara"
  const uttaraKeywords = [
    'conclusion', 'meditation', 'poornahuti', 'purnahuti', 'poornaahuti',
    'uttaraangam', 'uttarangam', 'winding', 'protection ash', 'udvaasana',
    'udvasana', 'final offering', 'punah pooja', 'stream of excellence',
    'pure rice', 'vasordhara'
  ];

  for (const kw of commonKeywords) {
    if (t.includes(kw)) return 'common';
  }
  for (const kw of uttaraKeywords) {
    if (t.includes(kw)) return 'uttara';
  }

  // Default: middle sections are pradhana
  return 'pradhana';
}

function toVoiceKey(manualId: string, title: string): string {
  return manualId.replace(/-/g, '_') + '_' + title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);
}

// Build migrated data
const migrated: any = {
  metadata: {
    manual_id: manualId,
    version: '1.0.0',
    last_validated: '2026-02-12T00:00:00.000Z',
  },
  title: data.title,
  author: data.author,
  sections: [],
};

// Add source_pdf_hash if source exists at root or in first section
if (data.source) {
  const pdfName = data.source.split('/').pop()?.replace('.pdf', '') || '';
  migrated.metadata.source_pdf_hash = pdfName;
}

for (const section of data.sections) {
  const titleEn = section.title?.english || '';
  const type = classifySection(section.id, titleEn, data.sections.length);
  const voiceKey = toVoiceKey(manualId, titleEn);

  const newSection: any = {
    id: section.id,
    type,
    title: section.title,
    voice_guidance_key: voiceKey,
  };

  // Ensure title has hindi
  if (!newSection.title.hindi) {
    newSection.title.hindi = newSection.title.telugu || newSection.title.english;
  }

  if (section.steps && Array.isArray(section.steps)) {
    // Merge steps into flat instructions and slokas
    const mergedInstructions: { english: string[]; telugu: string[]; hindi: string[] } = {
      english: [],
      telugu: [],
      hindi: [],
    };
    const mergedSlokas: { english: string[]; telugu: string[]; devanagari: string[] } = {
      english: [],
      telugu: [],
      devanagari: [],
    };
    let diagram: string | undefined;

    // If section itself has instructions, include them first
    if (section.instructions) {
      if (section.instructions.english) mergedInstructions.english.push(...section.instructions.english);
      if (section.instructions.telugu) mergedInstructions.telugu.push(...section.instructions.telugu);
      if (section.instructions.hindi) mergedInstructions.hindi.push(...section.instructions.hindi);
    }

    for (const step of section.steps) {
      if (step.instructions) {
        if (step.instructions.english) mergedInstructions.english.push(...step.instructions.english);
        if (step.instructions.telugu) mergedInstructions.telugu.push(...step.instructions.telugu);
        if (step.instructions.hindi) mergedInstructions.hindi.push(...step.instructions.hindi);
      }
      if (step.slokas) {
        if (step.slokas.english) mergedSlokas.english.push(step.slokas.english);
        if (step.slokas.telugu) mergedSlokas.telugu.push(step.slokas.telugu);
        if (step.slokas.devanagari) mergedSlokas.devanagari.push(step.slokas.devanagari);
      }
      if (step.diagram && !diagram) {
        diagram = step.diagram;
      }
    }

    newSection.instructions = {
      english: mergedInstructions.english,
      telugu: mergedInstructions.telugu,
      hindi: mergedInstructions.hindi.length > 0 ? mergedInstructions.hindi : mergedInstructions.english,
    };
    newSection.slokas = {
      english: mergedSlokas.english.join('\n'),
      telugu: mergedSlokas.telugu.join('\n'),
      devanagari: mergedSlokas.devanagari.join('\n'),
      swara_enabled: false,
    };
    if (diagram) {
      newSection.diagram_placeholder = diagram;
    }
  } else {
    // Flat section - just copy and augment
    newSection.instructions = section.instructions || { english: [], telugu: [], hindi: [] };
    if (!newSection.instructions.hindi || newSection.instructions.hindi.length === 0) {
      newSection.instructions.hindi = newSection.instructions.english || [];
    }

    const slokas = section.slokas || { english: '', telugu: '', devanagari: '' };
    newSection.slokas = {
      english: slokas.english || '',
      telugu: slokas.telugu || '',
      devanagari: slokas.devanagari || '',
      swara_enabled: false,
    };

    if (section.diagram_placeholder) {
      newSection.diagram_placeholder = section.diagram_placeholder;
    }
    if (section.diagram) {
      newSection.diagram_placeholder = section.diagram;
    }
  }

  migrated.sections.push(newSection);
}

fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2) + '\n');
console.log(`Migrated ${filename}: ${migrated.sections.length} sections`);
