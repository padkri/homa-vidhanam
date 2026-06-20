import config from './data/config.json';
import commonParts from './data/common_parts.json';
import { enrichSankalpaPlaceholders, getSankalpaTexts } from './sankalpaService';

// Cache for loaded manuals
const manualCache = {};

/**
 * Resolves a section that references common_parts.json.
 * Hydrates it with title, instructions, slokas from the canonical source.
 * Substitutes {deity_prefix} and {deity_invocation} placeholders with deity_slokas.
 */
const resolveCommonRef = (section) => {
  if (!section.common_ref) return section;

  const common = commonParts.sections[section.common_ref];
  if (!common) {
    console.warn(`common_ref "${section.common_ref}" not found in common_parts.json`);
    return section;
  }

  const hydrateSlokas = (slokas) => {
    if (!slokas) return undefined;

    if (!section.deity_slokas) {
      return { ...slokas };
    }

    const substitute = (text, lang) => {
      const deityLang = lang === 'devanagari' ? 'devanagari' : lang;
      const deityText = section.deity_slokas[deityLang] || '';
      return text
        .replace('{deity_invocation}', deityText)
        .replace('{deity_prefix}', deityText);
    };

    return {
      english: substitute(slokas.english, 'english'),
      telugu: substitute(slokas.telugu, 'telugu'),
      devanagari: substitute(slokas.devanagari, 'devanagari'),
      swara_enabled: slokas.swara_enabled,
    };
  };

  const hydrateSlokaGroups = (slokaGroups, fallbackSlokas) => {
    const groups = slokaGroups?.length ? slokaGroups : (fallbackSlokas ? [{ slokas: fallbackSlokas }] : []);

    return groups.map(group => ({
      ...group,
      slokas: hydrateSlokas(group.slokas),
    }));
  };

  // Start with common data, overlay manual-specific fields
  const resolved = {
    ...section,
    title: common.title,
    instructions: common.instructions,
    diagram: common.diagram || section.diagram,
    diagram_placeholder: common.diagram_placeholder || section.diagram_placeholder,
  };

  if (common.steps) {
    resolved.steps = common.steps.map(step => ({
      ...step,
      slokas: hydrateSlokas(step.slokas),
      sloka_groups: hydrateSlokaGroups(step.sloka_groups, step.slokas),
    }));
  }
  resolved.slokas = hydrateSlokas(common.slokas);
  resolved.sloka_groups = hydrateSlokaGroups(common.sloka_groups, common.slokas);

  // Remove ref-only fields from the resolved object
  delete resolved.common_ref;
  delete resolved.deity_slokas;

  return resolved;
};

const normalizeSlokaGroups = (content) => {
  if (!content) return content;

  const sloka_groups = content.sloka_groups?.length
    ? content.sloka_groups
    : (content.slokas ? [{ slokas: content.slokas }] : undefined);

  return {
    ...content,
    sloka_groups,
  };
};

const normalizeSectionSlokaGroups = (section) => {
  const normalized = normalizeSlokaGroups(section);

  if (!normalized.steps) {
    return normalized;
  }

  return {
    ...normalized,
    steps: normalized.steps.map(normalizeSlokaGroups),
  };
};

/**
 * Loads a manual by its ID
 * @param {string} manualId - The ID of the manual to load
 * @returns {Promise<Object>} The loaded manual data
 */
export const loadManual = async (manualId) => {
  // Return cached version if available
  if (manualCache[manualId]) {
    return manualCache[manualId];
  }

  // Find the manual configuration
  const manualConfig = config.manuals.find(manual => manual.id === manualId);
  if (!manualConfig) {
    throw new Error(`Manual with ID "${manualId}" not found`);
  }

  try {
    // Dynamically import the manual data
    const manualData = await import(`./data/${manualConfig.filename}`);

    const raw = manualData.default;

    // Resolve all common_ref sections
    const resolvedSections = raw.sections.map(resolveCommonRef);
    const sankalpaTexts = await getSankalpaTexts();
    const sections = enrichSankalpaPlaceholders(resolvedSections, sankalpaTexts)
      .map(normalizeSectionSlokaGroups);

    const enrichedData = {
      ...raw,
      sections,
      // Preserve manual's own metadata, add config info
      metadata: {
        ...raw.metadata,
        id: manualConfig.id,
        name: manualConfig.name,
        description: manualConfig.description,
        filename: manualConfig.filename
      }
    };

    // Cache the loaded manual
    manualCache[manualId] = enrichedData;

    return enrichedData;
  } catch (error) {
    throw new Error(`Failed to load manual "${manualId}": ${error.message}`);
  }
};

/**
 * Gets the list of available manuals
 * @returns {Array} Array of available manual configurations
 */
export const getAvailableManuals = () => {
  return config.manuals;
};

/**
 * Gets the default manual ID
 * @returns {string} The default manual ID
 */
export const getDefaultManualId = () => {
  return config.defaultManual;
};
