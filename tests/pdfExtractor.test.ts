import * as path from 'path';
import * as fs from 'fs';

// Test the module's exported functions
// We test with a dynamically created minimal PDF using pdf-parse's test fixtures

// Unicode detection regex (mirrors the module)
const TELUGU_REGEX = /[\u0C00-\u0C7F]/;
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

console.log('\n=== pdfExtractor tests ===\n');

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

// Test 1: Unicode regex detection
assert(TELUGU_REGEX.test('ఓం నమః శివాయ'), 'Telugu regex detects Telugu text');
assert(!TELUGU_REGEX.test('om namah shivaya'), 'Telugu regex rejects Latin text');
assert(DEVANAGARI_REGEX.test('ॐ नमः शिवाय'), 'Devanagari regex detects Devanagari text');
assert(!DEVANAGARI_REGEX.test('om namah shivaya'), 'Devanagari regex rejects Latin text');

// Test 2: Mixed text detection
const mixedText = 'oṁ keśavāya svāhā ।ఓం కేశవాయ స్వాహా ।ॐ केशवाय स्वाहा।';
assert(TELUGU_REGEX.test(mixedText), 'Detects Telugu in mixed text');
assert(DEVANAGARI_REGEX.test(mixedText), 'Detects Devanagari in mixed text');

// Test 3: Module import and function existence
async function testModuleExports() {
  const mod = await import('../scripts/pdfExtractor');
  assert(typeof mod.extractPages === 'function', 'extractPages is exported as a function');
  assert(typeof mod.extractFullText === 'function', 'extractFullText is exported as a function');
}

// Test 4: Error handling for missing file
async function testMissingFile() {
  const mod = await import('../scripts/pdfExtractor');
  try {
    await mod.extractPages('/nonexistent/file.pdf');
    assert(false, 'Should throw for missing file');
  } catch (e: any) {
    assert(e.message.includes('PDF file not found'), 'Throws descriptive error for missing file');
  }
}

// Test 5: Extraction from a real PDF (if available in test fixtures)
async function testRealPdfExtraction() {
  const mod = await import('../scripts/pdfExtractor');
  // Check if any PDF exists in the project for testing
  const testPdfDir = path.resolve(__dirname, '../test-fixtures');
  if (fs.existsSync(testPdfDir)) {
    const pdfs = fs.readdirSync(testPdfDir).filter(f => f.endsWith('.pdf'));
    if (pdfs.length > 0) {
      const result = await mod.extractPages(path.join(testPdfDir, pdfs[0]));
      assert(result.pages.length > 0, `Extracts pages from ${pdfs[0]}`);
      assert(result.totalPages > 0, `Reports total pages for ${pdfs[0]}`);
      assert(typeof result.hasUnicode.telugu === 'boolean', 'Reports Telugu unicode presence');
      assert(typeof result.hasUnicode.devanagari === 'boolean', 'Reports Devanagari unicode presence');
    } else {
      console.log('  SKIP  No test PDFs found in test-fixtures/');
    }
  } else {
    console.log('  SKIP  No test-fixtures/ directory (create one with sample PDFs for integration tests)');
  }
}

async function runTests() {
  await testModuleExports();
  await testMissingFile();
  await testRealPdfExtraction();

  console.log(`\nResults: ${pass} passed, ${fail} failed, ${pass + fail} total\n`);
  if (fail > 0) process.exit(1);
}

runTests();
