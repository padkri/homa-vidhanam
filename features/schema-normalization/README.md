# Schema Normalization

**Status:** Done
**Spec:** #2
**Priority:** P1

## Overview
Normalize the JSON schema across all homam manuals to ensure consistent structure, making it easier to add new manuals and support tooling like the PDF parser.

## Scope
- Define a canonical TypeScript schema (`src/schema/homamSchema.ts`) using Zod
- Migrate all existing manual JSON files to the normalized format
- Support `common_parts.json` for shared ritual sections with `common_ref` resolution
- Validate all manuals against the schema via `tests/validateSchemas.ts`
- CI validation in GitHub Actions workflow

## Key Decisions
- Schema defined in TypeScript with Zod at `src/schema/homamSchema.ts`
- Common ritual parts extracted into `src/data/common_parts.json`
- Sections can be full inline or reference common parts via `common_ref`
- `dataLoader.js` resolves common refs and substitutes deity placeholders at runtime
