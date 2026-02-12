import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.resolve(__dirname, '../src/data');

const jsonFiles = fs.readdirSync(DATA_DIR)
  .filter(f => f.endsWith('.json') && f !== 'config.json' && f !== 'common_parts.json');

let totalFixed = 0;

for (const file of jsonFiles) {
  const filePath = path.join(DATA_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  let changed = false;

  for (const section of data.sections) {
    // Skip ref sections (no diagram_placeholder)
    if (section.common_ref) continue;

    if (section.diagram_placeholder && section.diagram_placeholder.startsWith('/diagrams/')) {
      // This is an actual path — move to `diagram`
      section.diagram = section.diagram_placeholder;
      delete section.diagram_placeholder;
      changed = true;
      totalFixed++;
      console.log(`  ${file} id=${section.id} "${section.title.english}": moved to diagram`);
    } else if (section.diagram_placeholder === 'No diagram for this section.') {
      // Remove useless placeholder
      delete section.diagram_placeholder;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  }
}

// Also fix common_parts.json
const cpPath = path.join(DATA_DIR, 'common_parts.json');
const cp = JSON.parse(fs.readFileSync(cpPath, 'utf-8'));
for (const [key, section] of Object.entries(cp.sections) as any) {
  if (section.diagram_placeholder && section.diagram_placeholder.startsWith('/diagrams/')) {
    section.diagram = section.diagram_placeholder;
    delete section.diagram_placeholder;
    totalFixed++;
    console.log(`  common_parts.json "${key}": moved to diagram`);
  }
}
fs.writeFileSync(cpPath, JSON.stringify(cp, null, 2) + '\n');

console.log(`\nFixed ${totalFixed} diagram paths`);
