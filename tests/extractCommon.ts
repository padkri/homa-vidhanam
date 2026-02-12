import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.resolve(__dirname, '../src/data');

// Map of English title variants → common_ref key
const COMMON_MAP: Record<string, string> = {
  'aachamanam': 'aachamanam',
  'purificatory sipping of water': 'aachamanam',
  'praanaayaamam': 'praanaayaamam',
  'kalasa suddhi': 'kalasa_suddhi',
  'water purification': 'kalasa_suddhi',
  'suddhaanna bali': 'suddhaanna_bali',
  'pure rice sacrifice': 'suddhaanna_bali',
  'poornaahuti': 'poornaahuti',
};

// Deity-specific slokas for Suddhaanna Bali
const BALI_DEITY: Record<string, any> = {
  'siva-homam.json': {
    english: 'namaḥ śivāya',
    telugu: 'నమః శివాయ',
    devanagari: 'नमः शिवाय',
  },
  'chandi-homam.json': {
    english: 'cāmuṇḍāyai vicce',
    telugu: 'చాముండాయై విచ్చే',
    devanagari: 'चामुण्डायै विच्चे',
  },
  'ganesh-homam.json': {
    english: 'śrī mahāgaṇapati',
    telugu: 'శ్రీ మహాగణపతి',
    devanagari: 'श्री महागणपति',
  },
};

// Deity-specific invocation for Poornaahuti
const POORNAAHUTI_DEITY: Record<string, any> = {
  'siva-homam.json': {
    english: 'namaḥ śivāya',
    telugu: 'నమః శివాయ',
    devanagari: 'नमः शिवाय',
  },
  'chandi-homam.json': {
    english: 'aim hrīṁ klīṁ cāmuṇḍāyai vicce vauṣaṭ',
    telugu: 'ఐం హ్రీం క్లీం చాముండాయై విచ్చే వౌషట్',
    devanagari: 'ऐं ह्रीं क्लीं चामुण्डायै विच्चे वौषट्',
  },
  'ganesh-homam.json': {
    english: 'aim hrīṁ klīṁ cāmuṇḍāyai vicce vauṣaṭ',
    telugu: 'ఐం హ్రీం క్లీం చాముండాయై విచ్చే వౌషట్',
    devanagari: 'ऐं ह्रीं क्लीं चामुण्डायै विच्चे वौषट्',
  },
};

const files = ['siva-homam.json', 'chandi-homam.json', 'ganesh-homam.json'];

for (const file of files) {
  const filePath = path.join(DATA_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const newSections: any[] = [];

  for (const section of data.sections) {
    const titleEn = (section.title?.english || '').toLowerCase();
    const commonRef = COMMON_MAP[titleEn];

    if (commonRef) {
      // Replace with a reference section
      const refSection: any = {
        id: section.id,
        type: section.type,
        common_ref: commonRef,
        voice_guidance_key: section.voice_guidance_key,
      };

      // Add deity-specific overrides
      if (commonRef === 'suddhaanna_bali' && BALI_DEITY[file]) {
        refSection.deity_slokas = BALI_DEITY[file];
      }
      if (commonRef === 'poornaahuti' && POORNAAHUTI_DEITY[file]) {
        refSection.deity_slokas = POORNAAHUTI_DEITY[file];
      }

      newSections.push(refSection);
      console.log(`  ${file} section ${section.id} (${titleEn}) → common_ref: ${commonRef}`);
    } else {
      // Keep as-is
      newSections.push(section);
    }
  }

  data.sections = newSections;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  console.log(`Updated ${file}: ${newSections.filter((s: any) => s.common_ref).length} sections now reference common_parts\n`);
}
