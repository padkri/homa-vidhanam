import config from './data/config.json';

// Cache for loaded manuals
const manualCache = {};

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
    
    // Add metadata to the manual
    const enrichedData = {
      ...manualData.default,
      metadata: {
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
