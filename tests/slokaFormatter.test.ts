import { detectScript, formatSloka, mergeSlokaParts, hasSwaraMarkers } from '../scripts/slokaFormatter';

console.log('\n=== slokaFormatter tests ===\n');

let pass = 0;
let fail = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  PASS  ${message}`);
    pass++;
  } else {
    console.log(`  FAIL  ${message}`);
    fail++;
  }
}

// --- detectScript ---

assert(
  detectScript('oṁ keśavāya svāhā') === 'english',
  'detectScript: Roman transliteration → english'
);

assert(
  detectScript('ఓం కేశవాయ స్వాహా') === 'telugu',
  'detectScript: Telugu text → telugu'
);

assert(
  detectScript('ॐ केशवाय स्वाहा') === 'devanagari',
  'detectScript: Devanagari text → devanagari'
);

assert(
  detectScript('om namah shivaya') === 'english',
  'detectScript: plain English → english'
);

assert(
  detectScript('') === 'english',
  'detectScript: empty string → english (default)'
);

// Mixed text: Telugu dominant
assert(
  detectScript('ఓం కేశవాయ స్వాహా om') === 'telugu',
  'detectScript: Telugu-dominant mixed text → telugu'
);

// Mixed text: Devanagari dominant
assert(
  detectScript('ॐ केशवाय स्वाहा om') === 'devanagari',
  'detectScript: Devanagari-dominant mixed text → devanagari'
);

// --- formatSloka ---

const englishSloka = formatSloka('oṁ keśavāya svāhā');
assert(englishSloka.english === 'oṁ keśavāya svāhā', 'formatSloka: english field set for Roman text');
assert(englishSloka.telugu === '', 'formatSloka: telugu empty for Roman text');
assert(englishSloka.devanagari === '', 'formatSloka: devanagari empty for Roman text');
assert(englishSloka.swara_enabled === false, 'formatSloka: swara_enabled false for Roman text');

const teluguSloka = formatSloka('ఓం కేశవాయ స్వాహా');
assert(teluguSloka.telugu === 'ఓం కేశవాయ స్వాహా', 'formatSloka: telugu field set for Telugu text');
assert(teluguSloka.english === '', 'formatSloka: english empty for Telugu text');

const devanagariSloka = formatSloka('ॐ केशवाय स्वाहा');
assert(devanagariSloka.devanagari === 'ॐ केशवाय स्वाहा', 'formatSloka: devanagari field set for Devanagari text');
assert(devanagariSloka.english === '', 'formatSloka: english empty for Devanagari text');

// --- hasSwaraMarkers ---

assert(hasSwaraMarkers('अ॒ग्निमी॑ळे') === true, 'hasSwaraMarkers: detects Vedic accents');
assert(hasSwaraMarkers('ॐ नमः शिवाय') === false, 'hasSwaraMarkers: no accents in regular Devanagari');
assert(hasSwaraMarkers('om namah shivaya') === false, 'hasSwaraMarkers: no accents in Latin text');

// --- mergeSlokaParts ---

const merged = mergeSlokaParts([
  'oṁ keśavāya svāhā',
  'ఓం కేశవాయ స్వాహా',
  'ॐ केशवाय स्वाहा',
]);
assert(merged.english === 'oṁ keśavāya svāhā', 'mergeSlokaParts: english part merged');
assert(merged.telugu === 'ఓం కేశవాయ స్వాహా', 'mergeSlokaParts: telugu part merged');
assert(merged.devanagari === 'ॐ केशवाय स्वाहा', 'mergeSlokaParts: devanagari part merged');

// Merge with multiple English parts
const multiEnglish = mergeSlokaParts([
  'oṁ keśavāya svāhā',
  'oṁ nārāyaṇāya svāhā',
]);
assert(
  multiEnglish.english === 'oṁ keśavāya svāhā\noṁ nārāyaṇāya svāhā',
  'mergeSlokaParts: multiple same-script parts joined with newline'
);

// Empty parts filtered
const withEmpty = mergeSlokaParts(['', '  ', 'ఓం కేశవాయ స్వాహా']);
assert(withEmpty.telugu === 'ఓం కేశవాయ స్వాహా', 'mergeSlokaParts: empty parts filtered');
assert(withEmpty.english === '', 'mergeSlokaParts: no false english from empty parts');

console.log(`\nResults: ${pass} passed, ${fail} failed, ${pass + fail} total\n`);
if (fail > 0) process.exit(1);
