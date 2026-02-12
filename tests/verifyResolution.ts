import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.resolve(__dirname, '../src/data');
const commonParts = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'common_parts.json'), 'utf-8'));

// Simulate the dataLoader's resolveCommonRef logic
function resolveCommonRef(section: any) {
  if (!section.common_ref) return section;

  const common = commonParts.sections[section.common_ref];
  if (!common) {
    console.error(`  MISSING common_ref: "${section.common_ref}"`);
    return section;
  }

  const resolved: any = {
    ...section,
    title: common.title,
    instructions: common.instructions,
    diagram_placeholder: common.diagram_placeholder || section.diagram_placeholder,
  };

  if (section.deity_slokas && common.slokas) {
    const substitute = (text: string, lang: string) => {
      const deityText = section.deity_slokas[lang] || '';
      return text
        .replace('{deity_invocation}', deityText)
        .replace('{deity_prefix}', deityText);
    };
    resolved.slokas = {
      english: substitute(common.slokas.english, 'english'),
      telugu: substitute(common.slokas.telugu, 'telugu'),
      devanagari: substitute(common.slokas.devanagari, 'devanagari'),
      swara_enabled: common.slokas.swara_enabled,
    };
  } else {
    resolved.slokas = { ...common.slokas };
  }

  delete resolved.common_ref;
  delete resolved.deity_slokas;
  return resolved;
}

// Check the 3 files that have common_ref sections
const files = ['siva-homam.json', 'chandi-homam.json', 'ganesh-homam.json'];
let allOk = true;

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
  console.log(`\n${file}:`);

  for (const section of data.sections) {
    const resolved = resolveCommonRef(section);
    const issues: string[] = [];

    // Every resolved section must have these for App.js
    if (!resolved.title?.english) issues.push('missing title.english');
    if (!resolved.title?.telugu) issues.push('missing title.telugu');
    if (!resolved.title?.hindi) issues.push('missing title.hindi');
    if (!resolved.instructions?.english) issues.push('missing instructions.english');
    if (!resolved.instructions?.telugu) issues.push('missing instructions.telugu');
    if (!resolved.instructions?.hindi) issues.push('missing instructions.hindi');
    if (resolved.slokas === undefined) issues.push('missing slokas');
    if (resolved.slokas && resolved.slokas.english?.includes('{deity_')) issues.push('unresolved {deity_} placeholder in english');
    if (resolved.slokas && resolved.slokas.telugu?.includes('{deity_')) issues.push('unresolved {deity_} placeholder in telugu');
    if (resolved.slokas && resolved.slokas.devanagari?.includes('{deity_')) issues.push('unresolved {deity_} placeholder in devanagari');

    if (issues.length > 0) {
      console.log(`  FAIL  id=${resolved.id} "${resolved.title?.english || '?'}": ${issues.join(', ')}`);
      allOk = false;
    } else {
      const isRef = section.common_ref ? ` [ref:${section.common_ref}]` : '';
      console.log(`  OK    id=${resolved.id} "${resolved.title.english}"${isRef}`);
    }
  }
}

console.log(allOk ? '\nAll sections resolve correctly.' : '\nSome sections have issues.');
if (!allOk) process.exit(1);
