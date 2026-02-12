import config from './data/config.json';
import commonParts from './data/common_parts.json';

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

  // Start with common data, overlay manual-specific fields
  const resolved = {
    ...section,
    title: common.title,
    instructions: common.instructions,
    diagram: common.diagram || section.diagram,
    diagram_placeholder: common.diagram_placeholder || section.diagram_placeholder,
  };

  // Handle slokas — substitute deity placeholders if deity_slokas provided
  if (section.deity_slokas && common.slokas) {
    const substitute = (text, lang) => {
      const deityLang = lang === 'devanagari' ? 'devanagari' : lang;
      const deityText = section.deity_slokas[deityLang] || '';
      return text
        .replace('{deity_invocation}', deityText)
        .replace('{deity_prefix}', deityText);
    };
    resolved.slokas = {
      english: substitute(common.slokas.english, 'english'),
      telugu: substitute(common.slokas.telugu, 'telugu'),
      devanagari: substitute(common.slokas.devanagari, 'devanagari'),
      swara_enabled: common.slokas.swara_enabled,
    };
  } else {
    resolved.slokas = { ...common.slokas };
  }

  // Remove ref-only fields from the resolved object
  delete resolved.common_ref;
  delete resolved.deity_slokas;

  return resolved;
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

    const enrichedData = {
      ...raw,
      sections: resolvedSections,
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
