import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.resolve(__dirname, '../src/data');
const files = ['siva-homam.json', 'chandi-homam.json', 'ganesh-homam.json'];

const targets: Record<string, string[]> = {
  'Aachamanam': ['Purificatory Sipping of Water', 'Aachamanam'],
  'Praanaayaamam': ['Praanaayaamam'],
  'Kalasa Suddhi': ['Water Purification', 'Kalasa Suddhi'],
  'Suddhaanna Bali': ['Pure Rice Sacrifice', 'Suddhaanna Bali'],
  'Poornaahuti': ['Poornaahuti'],
};

function findSection(data: any, alts: string[]) {
  return data.sections.find((s: any) =>
    alts.some(a => s.title?.english?.toLowerCase() === a.toLowerCase())
  );
}

function normalizeWS(s: string): string {
  return s.replace(/\n/g, '').replace(/\s+/g, ' ').trim();
}

for (const [target, alts] of Object.entries(targets)) {
  console.log('\n' + '='.repeat(80));
  console.log('SECTION:', target);
  console.log('='.repeat(80));

  const sections: any[] = [];
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
    const sec = findSection(data, alts);
    if (sec) {
      sections.push({ file, sec });
      console.log(`\n--- ${file} (id=${sec.id}) ---`);
      console.log('SLOKAS_EN:', JSON.stringify(sec.slokas?.english).substring(0, 200));
      console.log('SLOKAS_TE:', JSON.stringify(sec.slokas?.telugu).substring(0, 200));
      console.log('SLOKAS_DE:', JSON.stringify(sec.slokas?.devanagari).substring(0, 200));
      console.log('INSTR_EN count:', sec.instructions?.english?.length);
      console.log('INSTR_TE count:', sec.instructions?.telugu?.length);
      console.log('INSTR_HI count:', sec.instructions?.hindi?.length);
    } else {
      console.log(`\n--- ${file}: NOT FOUND ---`);
    }
  }

  // Compare slokas (normalized whitespace)
  if (sections.length === 3) {
    const slokasMatch = (lang: string) => {
      const vals = sections.map(s => normalizeWS(s.sec.slokas?.[lang] || ''));
      const allSame = vals.every(v => v === vals[0]);
      if (allSame) return 'IDENTICAL';
      // Check pairwise
      const pairs = [];
      if (vals[0] === vals[1]) pairs.push('siva=chandi');
      if (vals[0] === vals[2]) pairs.push('siva=ganesh');
      if (vals[1] === vals[2]) pairs.push('chandi=ganesh');
      return pairs.length > 0 ? pairs.join(', ') + ' (others differ)' : 'ALL DIFFER';
    };
    console.log('\n  Slokas comparison (whitespace-normalized):');
    console.log('    english:', slokasMatch('english'));
    console.log('    telugu:', slokasMatch('telugu'));
    console.log('    devanagari:', slokasMatch('devanagari'));
  }
}
