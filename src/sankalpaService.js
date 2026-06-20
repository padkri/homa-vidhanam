const SANKALPA_API_BASE = process.env.REACT_APP_SANKALPA_API_BASE || 'http://138.197.45.102';
const DEFAULT_SANKALPA_LOCATION = process.env.REACT_APP_SANKALPA_LOCATION || 'Shrewsbury, MA';
const SANKALPA_LOCATION_STORAGE_KEY = 'homaSankalpaLocation';

const DEFAULT_PHRASES = {
  telugu: 'అద్య శుభదినే శుభముహూర్తే',
  devanagari: 'अद्य शुभदिने शुभमुहूर्ते',
};

const cachedSankalpaByLocation = {};

const getConfiguredLocation = () => {
  if (typeof window === 'undefined') return DEFAULT_SANKALPA_LOCATION;

  try {
    return window.localStorage.getItem(SANKALPA_LOCATION_STORAGE_KEY) || DEFAULT_SANKALPA_LOCATION;
  } catch {
    return DEFAULT_SANKALPA_LOCATION;
  }
};

const cleanInlineSankalpaText = (text) => (
  text
    .trim()
    .replace(/[.\u2026]+$/u, '')
    .trim()
);

const fetchSankalpaText = async (location, lang) => {
  const response = await fetch(`${SANKALPA_API_BASE}/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, lang }),
  });

  if (!response.ok) {
    throw new Error(`Sankalpa API returned ${response.status}`);
  }

  const data = await response.json();
  const text = data?.sankalpa?.text;

  if (!text) {
    throw new Error('Sankalpa API response did not include sankalpa.text');
  }

  return cleanInlineSankalpaText(text);
};

export const getSankalpaTexts = async () => {
  const location = getConfiguredLocation();

  if (cachedSankalpaByLocation[location]) {
    return cachedSankalpaByLocation[location];
  }

  try {
    const [telugu, devanagari] = await Promise.all([
      fetchSankalpaText(location, 'te'),
      fetchSankalpaText(location, 'hi'),
    ]);

    cachedSankalpaByLocation[location] = { telugu, devanagari };
    return cachedSankalpaByLocation[location];
  } catch (error) {
    console.warn('Unable to fetch dynamic sankalpa; using manual defaults.', error);
    cachedSankalpaByLocation[location] = null;
    return null;
  }
};

const replaceSankalpaPlaceholders = (slokas, sankalpaTexts) => {
  if (!slokas || !sankalpaTexts) return slokas;

  return {
    ...slokas,
    telugu: slokas.telugu?.replace(DEFAULT_PHRASES.telugu, sankalpaTexts.telugu) || slokas.telugu,
    devanagari: slokas.devanagari?.replace(DEFAULT_PHRASES.devanagari, sankalpaTexts.devanagari) || slokas.devanagari,
  };
};

const replaceSlokaGroupPlaceholders = (slokaGroups, sankalpaTexts) => (
  slokaGroups?.map((group) => ({
    ...group,
    slokas: replaceSankalpaPlaceholders(group.slokas, sankalpaTexts),
  }))
);

export const enrichSankalpaPlaceholders = (sections, sankalpaTexts) => (
  sections.map((section) => {
    if (section.steps) {
      return {
        ...section,
        slokas: replaceSankalpaPlaceholders(section.slokas, sankalpaTexts),
        sloka_groups: replaceSlokaGroupPlaceholders(section.sloka_groups, sankalpaTexts),
        steps: section.steps.map((step) => ({
          ...step,
          slokas: replaceSankalpaPlaceholders(step.slokas, sankalpaTexts),
          sloka_groups: replaceSlokaGroupPlaceholders(step.sloka_groups, sankalpaTexts),
        })),
      };
    }

    return {
      ...section,
      slokas: replaceSankalpaPlaceholders(section.slokas, sankalpaTexts),
      sloka_groups: replaceSlokaGroupPlaceholders(section.sloka_groups, sankalpaTexts),
    };
  })
);
