# Sloka Meanings & Metadata

**Status:** Open
**Spec:** #5
**Priority:** P1

## Overview
Enrich each long sloka in the homam manuals with structured Sanskrit grammatical analysis: pada vibhaga (word split with sandhi/vibhakti), anvaya (reordered words for clarity), meaning, metre (alamkara), source reference, deity-specificity, and chanting directions. Metadata is generated at build time using an LLM prompt, reviewed, then baked into the JSON data files and statically deployed. Users see a click-to-expand panel below each sloka.

## Scope
- Add `sloka_metadata` to the schema with structured analysis fields
- Build-time script (`scripts/enrichSlokas.ts`) that extracts slokas from manuals and generates metadata via Claude API using a standardized prompt
- Metadata fields: `pada_vibhaga`, `anvaya`, `meaning` (multilingual), `alamkara` (metre), `source`, `deity_specific`, `chanting_directions`
- UI: clickable expand panel below each sloka
- Apply to both inline sections and `common_parts.json` slokas

## LLM Prompt for Sloka Analysis

The build-time script uses this prompt template for each sloka:

```
Take Sanskrit verses or poems. Give pada vibhaga (split sandhis) and rearrange words for easy reading. Give meaning of each word. Finally, give the meaning of the verses.

## పద విభాగ Pada vibhaga (Word split)
Write each word in Devanagari and meaning in English.

Sandhi: When you encounter an infrequent joined (sandhi) word, split the words from sandhi to give meaning of each word.
Vibhakti: Wherever a vibhakti is present in a word, name the vibhakti in brackets and root along. Translate word into Telugu along with vibhakti prayog. Write vibhakti name in Telugu.

Examples:
भूमौ - भूमि (earth) + औ (locative singular, seventh case, సప్తమి విభక్తి): On the earth
भार्या - भार्या (wife) + अ (nominative singular, first case, ప్రథమ విభక్తి): Wife

## అన్వయం - Anvaya (Words reordered for clarity)
Re-order the words to help extract the meaning of the poem. Write meaning in English and Telugu.

## అలంకారం - Alamkara (Metre)
Give the meter of the poem. When describing Metre show the padas.
```

## Key Decisions
- Static/build-time enrichment via LLM, not runtime
- Only "long" slokas (multi-line or significant mantras) get metadata; short invocations do not
- Metadata is optional per sloka — schema uses optional fields so existing manuals remain valid
- LLM output is reviewed before committing to data files
- Pada vibhaga includes sandhi splitting and vibhakti analysis with Telugu grammatical terms

## Notes
- Common slokas in `common_parts.json` get metadata once and it applies across all manuals
- The enrichment script should support re-running for individual manuals or slokas
- Output should be in structured JSON, not raw markdown, for the UI to render properly
