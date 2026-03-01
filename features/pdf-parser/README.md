# PDF Parser

**Status:** In Progress
**Spec:** #1
**Priority:** P1

## Overview
Parse homam manual PDFs to automatically extract structured data (sections, slokas, instructions, diagrams) into the application's JSON schema format, reducing the manual effort of adding new manuals.

## Scope
- Parse PDF files containing homam manuals
- Extract multilingual text (English, Telugu, Devanagari)
- Map extracted content to the normalized JSON schema
- Handle diagrams/images embedded in PDFs

## Key Decisions
- Active development on `pdf-parser` branch

## Notes
- Branch `pdf-parser` has schema normalization commits as prerequisites
