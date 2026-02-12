import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.resolve(__dirname, '../src/data');

const sources: Record<string, string> = {
  'chandi-homam.json': 'https://vedicastrologer.org/homa/regular/chandi_r_sans-.pdf',
  'dattatreya-homam.json': 'https://vedicastrologer.org/homa/simple/dattatreya_s_sans-.pdf',
  'durga-homam.json': 'https://vedicastrologer.org/homa/simple/durga_s_sans-.pdf',
  'ganesh-homam.json': 'https://vedicastrologer.org/homa/regular/ganapati_r_sans-.pdf',
  'hanuman-homam.json': 'https://vedicastrologer.org/homa/regular/hanuman_r_sans-.pdf',
  'kalabhairava-homam.json': 'https://vedicastrologer.org/homa/regular/kala_bhairava_r_sans-.pdf',
  'kali-homam.json': 'https://vedicastrologer.org/homa/simple/kaali_s_sans-.pdf',
  'kartikey-homam.json': 'https://vedicastrologer.org/homa/simple/kartikeya_s_sans-.pdf',
  'lalitha-homam.json': 'https://vedicastrologer.org/homa/simple/lalita_s_sans-.pdf',
  'mahalakshmi-homam.json': 'https://vedicastrologer.org/homa/regular/mahalakshmi_r_sans-.pdf',
  'narasimha-homam.json': 'https://vedicastrologer.org/homa/regular/narasimha_r_sans-.pdf',
  'saraswati-homam.json': 'https://vedicastrologer.org/homa/simple/saraswati_s_sans-.pdf',
  'srirama-homam.json': 'https://vedicastrologer.org/homa/simple/rama_s_sans-.pdf',
  'tara-homam.json': 'https://vedicastrologer.org/homa/simple/tara_s_sans-.pdf',
  'tarpanam.json': 'https://vedicastrologer.org/tarpana/pdf/tarpana_r_sans-.pdf',
};

for (const [file, url] of Object.entries(sources)) {
  const filePath = path.join(DATA_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (data.source === url) {
    console.log(`  SKIP  ${file} (already has source)`);
    continue;
  }

  // Insert source after author
  const { metadata, title, author, ...rest } = data;
  const updated = { metadata, title, author, source: url, ...rest };

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n');
  console.log(`  ADD   ${file} → ${url}`);
}
