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

  const hydrateSlokas = (slokas: any) => {
    if (!slokas) return undefined;

    if (!section.deity_slokas) {
      return { ...slokas };
    }

    const substitute = (text: string, lang: string) => {
      const deityLang = lang === 'devanagari' ? 'devanagari' : lang;
      const deityText = section.deity_slokas[deityLang] || '';
      return text
        .replace('{deity_invocation}', deityText)
        .replace('{deity_prefix}', deityText);
    };

    return {
      english: substitute(slokas.english, 'english'),
      telugu: substitute(slokas.telugu, 'telugu'),
      devanagari: substitute(slokas.devanagari, 'devanagari'),
      swara_enabled: slokas.swara_enabled,
    };
  };

  const hydrateSlokaGroups = (slokaGroups: any[], fallbackSlokas?: any) => {
    const groups = slokaGroups?.length ? slokaGroups : (fallbackSlokas ? [{ slokas: fallbackSlokas }] : []);

    return groups.map(group => ({
      ...group,
      slokas: hydrateSlokas(group.slokas),
    }));
  };

  const resolved: any = {
    ...section,
    title: common.title,
    instructions: common.instructions,
    diagram: common.diagram || section.diagram,
    diagram_placeholder: common.diagram_placeholder || section.diagram_placeholder,
    slokas: hydrateSlokas(common.slokas),
    sloka_groups: hydrateSlokaGroups(common.sloka_groups, common.slokas),
  };

  if (common.steps) {
    resolved.steps = common.steps.map((step: any) => ({
      ...step,
      slokas: hydrateSlokas(step.slokas),
      sloka_groups: hydrateSlokaGroups(step.sloka_groups, step.slokas),
    }));
  }

  delete resolved.common_ref;
  delete resolved.deity_slokas;
  return resolved;
}

// Check every manual that may have common_ref sections
const files = fs.readdirSync(DATA_DIR)
  .filter(file => file.endsWith('.json') && file !== 'config.json' && file !== 'common_parts.json')
  .sort();
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
    if (!resolved.sloka_groups?.length && resolved.slokas === undefined) issues.push('missing sloka_groups/slokas');

    const allSlokas = [
      resolved.slokas,
      ...(resolved.sloka_groups || []).map((group: any) => group.slokas),
    ].filter(Boolean);
    if (allSlokas.some((slokas: any) => slokas.english?.includes('{deity_'))) issues.push('unresolved {deity_} placeholder in english');
    if (allSlokas.some((slokas: any) => slokas.telugu?.includes('{deity_'))) issues.push('unresolved {deity_} placeholder in telugu');
    if (allSlokas.some((slokas: any) => slokas.devanagari?.includes('{deity_'))) issues.push('unresolved {deity_} placeholder in devanagari');

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
