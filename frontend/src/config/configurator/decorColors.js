/** Farbe, Dekor, Aludec und Woodec — Fensterversand-style catalog */

function parseSurchargePct(surcharge) {
  if (!surcharge) return 0;
  const match = String(surcharge).match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return 0;
  return Number(match[1].replace(',', '.'));
}

function decor(id, label, color, extra = {}) {
  const pricePct = extra.pricePct ?? parseSurchargePct(extra.surcharge);
  return { id, label, color, ...extra, pricePct };
}

export const DECOR_STANDARD_COLORS = [
  decor('Weiss', 'Weiß', '#ffffff'),
  decor('Reinweiss strukturell', 'Reinweiß', '#f5f5f4', {
    subtitle: 'strukturell',
    surcharge: '+25%'
  }),
  decor('Cremeweiss strukturell', 'Cremeweiß', '#faf6eb', {
    subtitle: 'strukturell',
    surcharge: '+25%'
  }),
  decor('Golden Oak', 'Golden Oak', '#b8860b', { surcharge: '+25%' }),
  decor('Nussbaum', 'Nussbaum', '#6b4423', { surcharge: '+25%' }),
  decor('Anthrazit', 'Anthrazit', '#3d4450', {
    ralHint: 'ähnlich RAL 7016',
    surcharge: '+25%'
  })
];

export const DECOR_SONDER_COLORS = [
  decor('Mahagoni', 'Mahagoni', '#5c2e1a', { surcharge: '+35%' }),
  decor('Grau', 'Grau', '#9ca3af', { ralHint: 'ähnlich RAL 7001', surcharge: '+35%' }),
  decor('Basaltgrau', 'Basaltgrau', '#4b5563', { ralHint: 'ähnlich RAL 7012', surcharge: '+35%' }),
  decor('Eisenglimmer DB 703', 'Eisenglimmer DB 703', '#4a4f54', { surcharge: '+35%' }),
  decor('Mooreiche', 'Mooreiche', '#3f3228', { surcharge: '+35%' }),
  decor('Braun dekor', 'Braun dekor', '#5c4033', { surcharge: '+35%' })
];

export const ALUDEC_DECORS = [
  decor('aludec Fenstergrau', 'Fenstergrau', '#6b7280', { brand: 'aludec', surcharge: '+35%' }),
  decor('aludec Umbragrau', 'Umbragrau', '#57534e', { brand: 'aludec', surcharge: '+35%' }),
  decor('aludec Basaltgrau', 'Basaltgrau', '#4b5563', { brand: 'aludec', surcharge: '+35%' }),
  decor('aludec Anthrazitgrau', 'Anthrazitgrau', '#374151', { brand: 'aludec', surcharge: '+35%' }),
  decor('aludec DB703', 'DB703', '#52525b', { brand: 'aludec', surcharge: '+35%' }),
  decor('aludec Jet Black', 'Jet Black', '#171717', { brand: 'aludec', surcharge: '+35%' })
];

export const WOODEC_DECORS = [
  decor('woodec Turner Oak Malt', 'Turner Oak Malt', '#9a7b4f', { brand: 'woodec', surcharge: '+35%' }),
  decor('woodec Sheffield Oak Alpine', 'Sheffield Oak Alpine', '#c4a574', {
    brand: 'woodec',
    surcharge: '+35%'
  }),
  decor('woodec Sheffield Oak Concrete', 'Sheffield Oak Concrete', '#9e9a92', {
    brand: 'woodec',
    surcharge: '+35%'
  }),
  decor('woodec Turner Oak Toffee', 'Turner Oak Toffee', '#8b6914', { brand: 'woodec', surcharge: '+35%' })
];

/* --- Farbe Alu-Schale (Außen) — only for hybrid materials with an aluminium shell --- */

export const ALU_STANDARD_COLORS = [
  decor('Weiss', 'Weiß', '#ffffff', { ralHint: 'RAL 9016' }),
  decor('Anthrazit', 'Anthrazit', '#3d4450', { ralHint: 'ähnlich RAL 7016', surcharge: '+25%' }),
  decor('Basaltgrau', 'Basaltgrau', '#4b5563', { ralHint: 'ähnlich RAL 7012', surcharge: '+30%' })
];

export const ALU_SONDER_RAL_COLORS = [
  decor('Grau', 'Grau', '#9ca3af', { ralHint: 'ähnlich RAL 7001', surcharge: '+35%' }),
  decor('Eisenglimmer DB 703', 'Eisenglimmer DB 703', '#4a4f54', { surcharge: '+35%' }),
  decor('Mahagoni', 'Mahagoni', '#5c2e1a', { surcharge: '+35%' }),
  decor('Mooreiche', 'Mooreiche', '#3f3228', { surcharge: '+35%' })
];

export const ALU_METALLIC_COLORS = [
  decor('aludec Fenstergrau', 'Graualuminium Metallic', '#6b7280', { ralHint: 'RAL 9007', surcharge: '+40%' }),
  decor('aludec Umbragrau', 'Umbragrau Feinstruktur', '#57534e', { surcharge: '+40%' }),
  decor('aludec Anthrazitgrau', 'Anthrazitgrau Metallic', '#374151', { surcharge: '+40%' }),
  decor('aludec DB703', 'Eisenglimmer DB 703 Metallic', '#52525b', { surcharge: '+40%' }),
  decor('aludec Jet Black', 'Tiefschwarz Feinstruktur', '#171717', { ralHint: 'RAL 9005', surcharge: '+40%' })
];

/* --- Holz: Holzart, Holzfarbe und Holz-RAL-Farben (für Holzfenster) --- */

export const HOLZ_ARTEN = [
  decor('Kiefer', 'Kiefer', '#d8b878', { subtitle: 'Standard' }),
  decor('Fichte', 'Fichte', '#e3c79a', { subtitle: 'Hell & leicht', surcharge: '+5%' }),
  decor('Meranti', 'Meranti', '#9c5a3c', { subtitle: 'Hartholz', surcharge: '+15%' }),
  decor('Eukalyptus', 'Eukalyptus', '#a86b4a', { subtitle: 'Hartholz', surcharge: '+18%' }),
  decor('Eiche', 'Eiche', '#7a5230', { subtitle: 'Premium Hartholz', surcharge: '+25%' }),
  decor('Laerche', 'Lärche', '#c08a4a', { subtitle: 'Witterungsbeständig', surcharge: '+20%' })
];

export const HOLZ_FARBEN = [
  decor('Kiefer Hell 325', 'Kiefer Hell 325', '#e0c08a'),
  decor('Eiche Hell 314', 'Eiche Hell 314', '#c9a063', { surcharge: '+10%' }),
  decor('Mahagoni 211', 'Mahagoni 211', '#5c2e1a', { surcharge: '+10%' }),
  decor('Nussbaum 222', 'Nussbaum 222', '#6b4423', { surcharge: '+10%' }),
  decor('Teak 234', 'Teak 234', '#9c6b3f', { surcharge: '+10%' }),
  decor('Palisander 248', 'Palisander 248', '#4a2c1a', { surcharge: '+12%' })
];

export const HOLZ_RAL_COLORS = [
  decor('Holz RAL 9016', 'Verkehrsweiß', '#f1f1f1', { ralHint: 'RAL 9016', surcharge: '+18%' }),
  decor('Holz RAL 7016', 'Anthrazitgrau', '#383e42', { ralHint: 'RAL 7016', surcharge: '+18%' }),
  decor('Holz RAL 7035', 'Lichtgrau', '#cbd0cc', { ralHint: 'RAL 7035', surcharge: '+18%' }),
  decor('Holz RAL 6005', 'Moosgrün', '#114232', { ralHint: 'RAL 6005', surcharge: '+18%' }),
  decor('Holz RAL 3004', 'Purpurrot', '#75151e', { ralHint: 'RAL 3004', surcharge: '+18%' }),
  decor('Holz RAL 5011', 'Stahlblau', '#1a2b3c', { ralHint: 'RAL 5011', surcharge: '+18%' })
];

export const FRAME_COLORS = [
  ...DECOR_STANDARD_COLORS,
  ...DECOR_SONDER_COLORS,
  ...ALUDEC_DECORS,
  ...WOODEC_DECORS,
  ...HOLZ_FARBEN,
  ...HOLZ_RAL_COLORS
];

/** Every selectable colour/decor id (incl. Alu-Schale options used on hybrid exteriors). */
const ALL_COLOR_OPTIONS = [
  ...DECOR_STANDARD_COLORS,
  ...DECOR_SONDER_COLORS,
  ...ALUDEC_DECORS,
  ...WOODEC_DECORS,
  ...ALU_STANDARD_COLORS,
  ...ALU_SONDER_RAL_COLORS,
  ...ALU_METALLIC_COLORS,
  ...HOLZ_FARBEN,
  ...HOLZ_RAL_COLORS,
  ...HOLZ_ARTEN
];

export function findDecorById(id) {
  if (!id) return null;
  return ALL_COLOR_OPTIONS.find((entry) => entry.id === id || entry.label === id) ?? null;
}

const HOLZ_RAL_IDS = new Set(HOLZ_RAL_COLORS.map((c) => c.id));
const HOLZ_STAIN_IDS = new Set(HOLZ_FARBEN.map((c) => c.id));

/** Option lists to search for a surface — order matters (avoids duplicate ids like Weiss / Grau). */
export function getDecorCatalogsForSurface(material, surface) {
  const isOutside = surface === 'outside';
  switch (material) {
    case 'Aluminium':
    case 'Kunststoff-Aluminium':
      return isOutside
        ? [ALU_STANDARD_COLORS, ALU_SONDER_RAL_COLORS, ALU_METALLIC_COLORS]
        : material === 'Kunststoff-Aluminium'
          ? [DECOR_STANDARD_COLORS, DECOR_SONDER_COLORS, ALUDEC_DECORS, WOODEC_DECORS]
          : [ALU_STANDARD_COLORS, ALU_SONDER_RAL_COLORS, ALU_METALLIC_COLORS];
    case 'Holz-Aluminium':
      return isOutside
        ? [ALU_STANDARD_COLORS, ALU_SONDER_RAL_COLORS, ALU_METALLIC_COLORS]
        : [HOLZ_FARBEN, HOLZ_ARTEN];
    case 'Holz':
      return isOutside ? [HOLZ_RAL_COLORS, HOLZ_ARTEN] : [HOLZ_FARBEN, HOLZ_ARTEN];
    case 'Kunststoff':
    default:
      return [DECOR_STANDARD_COLORS, DECOR_SONDER_COLORS, ALUDEC_DECORS, WOODEC_DECORS];
  }
}

/** Resolve a decor entry for the active material + Außen/Innen (disambiguates shared ids). */
export function findDecorByIdForSurface(id, material, surface) {
  if (!id) return null;
  const catalogs = getDecorCatalogsForSurface(material, surface);
  for (const list of catalogs) {
    const hit = list.find((entry) => entry.id === id || entry.label === id);
    if (hit) return hit;
  }
  return findDecorById(id);
}

/**
 * Effective colour id for the live preview (Holzart, Alu-Schale vs PVC, …).
 * @param {'outside'|'inside'} surface
 */
export function resolvePreviewColorId(globalConfig, surface) {
  const material = globalConfig?.material || 'Kunststoff';
  const isOutside = surface === 'outside';
  const frameKey = isOutside ? 'frameColorOutside' : 'frameColorInside';
  let colorId = globalConfig?.[frameKey];
  const species = globalConfig?.woodSpecies;

  if (material === 'Holz') {
    if (isOutside) {
      if (!colorId || !HOLZ_RAL_IDS.has(colorId)) {
        colorId = species || colorId;
      }
    } else if (!colorId || !HOLZ_STAIN_IDS.has(colorId)) {
      colorId = species || colorId;
    }
  } else if (material === 'Holz-Aluminium' && !isOutside) {
    if (!colorId || !HOLZ_STAIN_IDS.has(colorId)) {
      colorId = species || colorId;
    }
  }

  return colorId || 'Weiss';
}
