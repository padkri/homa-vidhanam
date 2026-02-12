import * as fs from 'fs';
import * as path from 'path';
import { HomamManualSchema } from '../src/schema/homamSchema';

const DATA_DIR = path.resolve(__dirname, '../src/data');

// Collect all JSON files in src/data/, excluding config.json
const jsonFiles = fs.readdirSync(DATA_DIR)
  .filter(f => f.endsWith('.json') && f !== 'config.json' && f !== 'common_parts.json');

console.log(`\nValidating ${jsonFiles.length} JSON files against HomamManualSchema\n`);
console.log('='.repeat(70));

let passCount = 0;
let failCount = 0;

for (const file of jsonFiles) {
  const filePath = path.join(DATA_DIR, file);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  const result = HomamManualSchema.safeParse(raw);

  if (result.success) {
    console.log(`\n  PASS  ${file}`);
    passCount++;
  } else {
    console.log(`\n  FAIL  ${file}`);
    failCount++;

    // Group errors by path for readability
    const errorsByPath = new Map<string, string[]>();
    for (const issue of result.error.issues) {
      const p = issue.path.join('.');
      if (!errorsByPath.has(p)) {
        errorsByPath.set(p, []);
      }
      errorsByPath.get(p)!.push(`${issue.message} (${issue.code})`);
    }

    // Show first 10 unique error paths to avoid flooding the console
    let shown = 0;
    for (const [errorPath, messages] of errorsByPath) {
      if (shown >= 10) {
        console.log(`        ... and ${errorsByPath.size - shown} more error path(s)`);
        break;
      }
      console.log(`        [${errorPath}] ${messages[0]}`);
      shown++;
    }
  }
}

console.log('\n' + '='.repeat(70));
console.log(`\nResults: ${passCount} passed, ${failCount} failed, ${jsonFiles.length} total\n`);

if (failCount > 0) {
  process.exit(1);
}
