import {
  MATERIAL_IMAGES,
  OPTION_ICON_IMAGES,
  PRODUCT_IMAGES,
  WINDOW_TYPE_IMAGES
} from '@/config/configurator/configuratorImages';
import {
  lightShapePreview,
  openingShapePreview,
  windowTypeShapePreview
} from '@/utils/windowShapePreview';

const { glass: glassImg, sound: soundImg, security: securityImg, handle: handleImg, frame: frameImg } =
  OPTION_ICON_IMAGES;

/** SVG preview for an opening code (used in cards and live preview). */
export function openingTypePreview(openingType, panes, shape = 'rect') {
  return openingShapePreview(openingType, panes, shape);
}

/** SVG preview for Ober-/Unterlicht and side sections. */
export function lightOptionPreview(lightOption) {
  const panes = lightOption?.includes('geteilt') ? 2 : 1;
  return lightShapePreview(lightOption, panes);
}

export function typeDefaultOpening(typeId, panes) {
  const map = {
    Einteilig: 'DKL',
    'Einteilig bodentief': 'DKL',
    'Zweiteilig mit Stulp': 'DKL-DKR',
    'Zweiteilig mit Pfosten': 'DKL-F',
    Dreiteilig: 'DKL-F-DKR',
    'Dreiteilig bodentief': 'DKL-F-DKR',
    Vierteilig: 'DKL-F-F-DKR',
    'Festverglasung rechteckig': 'F',
    'Festverglasung bodentief': 'F',
    'Balkontuer einteilig': 'DKL',
    'Balkontuer zweiteilig': 'DKL-DKR',
    'Parallel-Schiebe-Kipp': 'S-S',
    'Hebe-Schiebetuer': 'S-S',
    Rundbogen: 'F',
    Segmentbogen: 'F',
    Trapez: 'F',
    Dreieck: 'F',
    Sondertyp: 'DKL'
  };
  const fallback = panes === 1 ? 'DKL' : panes === 2 ? 'DKL-DKR' : panes === 3 ? 'DKL-F-DKR' : 'DKL-F-F-DKR';
  return map[typeId] || fallback;
}

export const PRODUCT_TYPES = [
  { id: 'window', label: 'Fenster', image: PRODUCT_IMAGES.window },
  { id: 'door', label: 'Haustuer', image: PRODUCT_IMAGES.door },
  { id: 'shutter', label: 'Rollladen', image: PRODUCT_IMAGES.shutter }
];

export const WINDOW_MATERIALS = [
  {
    id: 'Kunststoff',
    label: 'Kunststoff',
    image: MATERIAL_IMAGES.Kunststoff,
    badge: 'AKTION',
    footer: 'Sehr beliebt',
    basePrice: 129
  },
  {
    id: 'Kunststoff-Aluminium',
    label: 'Kunststoff-Aluminium',
    image: MATERIAL_IMAGES['Kunststoff-Aluminium'],
    badge: 'AKTION',
    footer: 'Premium Hybrid',
    basePrice: 199
  },
  {
    id: 'Holz',
    label: 'Holz',
    image: MATERIAL_IMAGES.Holz,
    badge: 'NATUR',
    footer: 'Natuerliche Optik',
    basePrice: 249
  },
  {
    id: 'Holz-Aluminium',
    label: 'Holz-Aluminium',
    image: MATERIAL_IMAGES['Holz-Aluminium'],
    badge: 'TOP',
    footer: 'Langlebig + Warm',
    basePrice: 329
  },
  {
    id: 'Aluminium',
    label: 'Aluminium',
    image: MATERIAL_IMAGES.Aluminium,
    badge: 'MODERN',
    footer: 'Schlankes Design',
    basePrice: 299
  }
];

export function getMaterialBasePrice(material) {
  return WINDOW_MATERIALS.find((item) => item.id === material)?.basePrice || 0;
}

export const PROFILE_MANUFACTURERS = [
  { id: 'Aluplast', label: 'Aluplast' },
  { id: 'Salamander', label: 'Salamander' },
  { id: 'Drutex', label: 'Drutex' },
  { id: 'Gealan', label: 'Gealan' },
  { id: 'Schueco', label: 'Schueco' }
];

/**
 * System (Profilhersteller) — fensterversand only shows this section for PVC.
 * For other materials the configurator goes straight to the profile selection.
 */
export const SYSTEMS_BY_MATERIAL = {
  Kunststoff: [
    { id: 'aluplast', label: 'aluplast', logo: '/assets/logo/aluplast.png', price: 0, leadTime: 'Lieferzeit ab 1 Woche' },
    { id: 'VEKA', label: 'VEKA', logo: '/assets/logo/veka.png', price: 20, leadTime: 'Lieferzeit ab 2 Wochen' },
    { id: 'Koemmerling', label: 'Kömmerling', logo: '/assets/logo/koemmerling.png', price: 30, leadTime: 'Lieferzeit ab 2 Wochen' }
  ]
};

export function getAvailableSystems(material) {
  return SYSTEMS_BY_MATERIAL[material] || [];
}

export function materialHasSystem(material) {
  return getAvailableSystems(material).length > 0;
}

function profile(id, meta, label = id) {
  const featureParts = [
    meta.chambers ? `${meta.chambers}-Kammer` : null,
    `${meta.seals} Dichtungen`,
    `${meta.frameDepth} mm Bautiefe`
  ].filter(Boolean);
  return {
    id,
    label,
    uValue: meta.uValue,
    chambers: meta.chambers,
    seals: meta.seals,
    frameDepth: meta.frameDepth,
    priceDiff: meta.priceDiff || 0,
    meta: featureParts.join(' · '),
    metric: `Uw ab ${meta.uValue.toFixed(2).replace('.', ',')}`
  };
}

export const PROFILES_BY_SYSTEM = {
  aluplast: [
    profile('IDEAL TwinSet 4000', { uValue: 1.3, chambers: 5, seals: 2, frameDepth: 85, priceDiff: 0 }),
    profile('IDEAL TwinSet neo AD', { uValue: 1.1, chambers: 6, seals: 2, frameDepth: 85, priceDiff: 45 }),
    profile('TwinSet neo MD', { uValue: 0.95, chambers: 6, seals: 3, frameDepth: 85, priceDiff: 75 }),
    profile('TwinSet 8000', { uValue: 0.9, chambers: 6, seals: 3, frameDepth: 85, priceDiff: 110 })
  ],
  VEKA: [
    profile('VEKA Softline 70', { uValue: 1.2, chambers: 5, seals: 2, frameDepth: 70, priceDiff: 0 }),
    profile('VEKA Softline 82 AD', { uValue: 0.96, chambers: 7, seals: 2, frameDepth: 82, priceDiff: 70 }),
    profile('VEKA Softline 82 MD', { uValue: 0.9, chambers: 7, seals: 3, frameDepth: 82, priceDiff: 95 })
  ],
  Koemmerling: [
    profile('Kömmerling 76 AD', { uValue: 1.0, chambers: 5, seals: 2, frameDepth: 76, priceDiff: 0 }),
    profile('Kömmerling 76 MD', { uValue: 0.95, chambers: 5, seals: 3, frameDepth: 76, priceDiff: 40 }),
    profile('Kömmerling 88 MD', { uValue: 0.83, chambers: 6, seals: 3, frameDepth: 88, priceDiff: 120 })
  ]
};

export const PROFILES_BY_MATERIAL = {
  'Kunststoff-Aluminium': [
    profile('aluplast IDEAL 4000 AluSkin', { uValue: 1.1, chambers: 6, seals: 2, frameDepth: 85, priceDiff: 0 }),
    profile('VEKA Softline 82 AluSkin', { uValue: 0.95, chambers: 7, seals: 3, frameDepth: 82, priceDiff: 60 })
  ],
  Holz: [
    profile('Holz IV 68', { uValue: 1.2, seals: 2, frameDepth: 68, priceDiff: 0 }),
    profile('Holz IV 78', { uValue: 1.0, seals: 2, frameDepth: 78, priceDiff: 55 }),
    profile('Holz IV 92', { uValue: 0.82, seals: 3, frameDepth: 92, priceDiff: 120 })
  ],
  'Holz-Aluminium': [
    profile('Holz-Alu IV 78', { uValue: 0.95, seals: 2, frameDepth: 78, priceDiff: 0 }),
    profile('Holz-Alu IV 92', { uValue: 0.78, seals: 3, frameDepth: 92, priceDiff: 140 })
  ],
  Aluminium: [
    profile('Schueco AWS 75', { uValue: 1.1, chambers: 3, seals: 2, frameDepth: 75, priceDiff: 0 }),
    profile('Schueco AWS 90', { uValue: 0.83, chambers: 3, seals: 3, frameDepth: 90, priceDiff: 130 })
  ]
};

export function getAvailableProfiles(material, system) {
  if (materialHasSystem(material)) {
    const systems = getAvailableSystems(material);
    const activeSystem = system && PROFILES_BY_SYSTEM[system] ? system : systems[0]?.id;
    return PROFILES_BY_SYSTEM[activeSystem] || [];
  }
  return PROFILES_BY_MATERIAL[material] || [];
}

/** Flat union of every profile, used for label/lookup helpers. */
export const PROFILE_SYSTEMS = [
  ...Object.values(PROFILES_BY_SYSTEM).flat(),
  ...Object.values(PROFILES_BY_MATERIAL).flat()
];

const WINDOW_TYPE_BASE = [
  { id: 'Einteilig', label: 'Einteilig', panes: 1, shape: 'rect' },
  { id: 'Einteilig bodentief', label: 'Einteilig bodentief', panes: 1, shape: 'tall', layout: 'tall' },
  { id: 'Zweiteilig mit Stulp', label: 'Zweiteilig mit Stulp', panes: 2, shape: 'rect', divider: 'stulp' },
  { id: 'Zweiteilig mit Pfosten', label: 'Zweiteilig mit Pfosten', panes: 2, shape: 'rect', divider: 'pfosten' },
  { id: 'Dreiteilig', label: 'Dreiteilig', panes: 3, shape: 'rect' },
  { id: 'Dreiteilig bodentief', label: 'Dreiteilig bodentief', panes: 3, shape: 'tall', layout: 'tall' },
  { id: 'Vierteilig', label: 'Vierteilig', panes: 4, shape: 'rect', layout: 'grid2x2' },
  { id: 'Festverglasung rechteckig', label: 'Festverglasung rechteckig', panes: 1, shape: 'rect', fixedOnly: true },
  { id: 'Festverglasung bodentief', label: 'Festverglasung bodentief', panes: 1, shape: 'tall', layout: 'tall', fixedOnly: true },
  { id: 'Balkontuer einteilig', label: 'Balkontuer einteilig', panes: 1, shape: 'tall', layout: 'tall' },
  { id: 'Balkontuer zweiteilig', label: 'Balkontuer zweiteilig', panes: 2, shape: 'tall', layout: 'tall' },
  { id: 'Parallel-Schiebe-Kipp', label: 'Parallel-Schiebe-Kipp', panes: 2, shape: 'rect', layout: 'psk3' },
  { id: 'Hebe-Schiebetuer', label: 'Hebe-Schiebetuer', panes: 2, shape: 'tall', layout: 'tall' },
  { id: 'Rundbogen', label: 'Rundbogen', panes: 1, shape: 'arch', fixedOnly: true },
  { id: 'Segmentbogen', label: 'Segmentbogen', panes: 1, shape: 'arch-soft', fixedOnly: true },
  { id: 'Trapez', label: 'Trapez', panes: 1, shape: 'trapez', fixedOnly: true },
  { id: 'Dreieck', label: 'Dreieck', panes: 1, shape: 'triangle', fixedOnly: true },
  { id: 'Sondertyp', label: 'Sondertyp', panes: 1, shape: 'rect', layout: 'sondertyp' }
];

export const WINDOW_TYPES = WINDOW_TYPE_BASE.map((item) => ({
  ...item,
  image:
    WINDOW_TYPE_IMAGES[item.id] ||
    windowTypeShapePreview(item.id, {
      panes: item.panes,
      shape: item.shape,
      layout: item.layout || 'row',
      divider: item.divider || 'pfosten',
      openingType: typeDefaultOpening(item.id, item.panes),
      fixedOnly: item.fixedOnly
    })
}));

const LIGHT_OPTION_BASE = [
  { id: 'Ohne Ober-/Unterlicht', label: 'Ohne Ober-/Unterlicht' },
  { id: 'Mit Oberlicht', label: 'Mit Oberlicht' },
  { id: 'Mit Oberlicht, geteilt', label: 'Mit Oberlicht, geteilt' },
  { id: 'Mit Unterlicht', label: 'Mit Unterlicht' },
  { id: 'Mit Unterlicht, geteilt', label: 'Mit Unterlicht, geteilt' },
  { id: 'Mit Ober- und Unterlicht', label: 'Mit Ober- und Unterlicht' },
  { id: 'Seitenteil links', label: 'Seitenteil links' },
  { id: 'Seitenteil rechts', label: 'Seitenteil rechts' },
  { id: 'Seitenteil beidseitig', label: 'Seitenteil beidseitig' }
];

export const LIGHT_OPTIONS = LIGHT_OPTION_BASE.map((item) => ({
  ...item,
  image: lightOptionPreview(item.id)
}));

const OPENING_TYPE_BASE = [
  { id: 'F', label: 'Festverglast', meta: 'Nicht oeffnbar', panes: 1 },
  { id: 'K', label: 'Kippfluegel', meta: 'Nur kippbar', panes: 1 },
  { id: 'DL', label: 'Dreh links', meta: 'Oeffnet von rechts nach links', panes: 1 },
  { id: 'DR', label: 'Dreh rechts', meta: 'Oeffnet von links nach rechts', panes: 1 },
  { id: 'DKL', label: 'Dreh-Kipp links', meta: 'Kipp- und drehbar', panes: 1 },
  { id: 'DKR', label: 'Dreh-Kipp rechts', meta: 'Kipp- und drehbar', panes: 1 },

  { id: 'DKL-F', label: 'Links Dreh-Kipp, rechts fest', meta: 'Fenster mit Mittelpfosten', panes: 2 },
  { id: 'F-DKR', label: 'Links fest, rechts Dreh-Kipp', meta: 'Fenster mit Mittelpfosten', panes: 2 },
  { id: 'DKL-DKR', label: 'Links und rechts Dreh-Kipp', meta: 'Fenster mit Mittelpfosten', panes: 2 },
  { id: 'F-F', label: 'Zweiteilig festverglast', meta: 'Nicht oeffnbar', panes: 2 },
  { id: 'S-S', label: 'Schwing-/Schiebeausfuehrung', meta: 'Sonderoeffnung', panes: 2 },

  { id: 'DKL-F-DKR', label: '3-teilig: DKL | F | DKR', meta: 'Code: DKL-F-DKR', panes: 3 },
  { id: 'F-DKL-F', label: '3-teilig: F | DKL | F', meta: 'Code: F-DKL-F', panes: 3 },
  { id: 'DKL-DK-DKR', label: '3-teilig: DKL | DK | DKR', meta: 'Code: DKL-DK-DKR', panes: 3 },
  { id: 'F-F-F', label: '3-teilig: F | F | F', meta: 'Code: F-F-F', panes: 3 },
  { id: 'S-F-S', label: '3-teilig: Schiebe | F | Schiebe', meta: 'Code: S-F-S', panes: 3 },

  { id: 'DKL-F-F-DKR', label: '4-teilig: DKL | F | F | DKR', meta: 'Code: DKL-F-F-DKR', panes: 4 },
  { id: 'F-DKL-DKR-F', label: '4-teilig: F | DKL | DKR | F', meta: 'Code: F-DKL-DKR-F', panes: 4 },
  { id: 'F-F-F-F', label: '4-teilig: F | F | F | F', meta: 'Code: F-F-F-F', panes: 4 },
  { id: 'S-S-S-S', label: '4-teilig: Schiebe | Schiebe | Schiebe | Schiebe', meta: 'Code: S-S-S-S', panes: 4 }
];

export const OPENING_TYPES = OPENING_TYPE_BASE.map((item) => ({
  ...item,
  image: openingTypePreview(item.id, item.panes)
}));

export const OPENING_DIRECTIONS = [
  { id: 'links', label: 'links', image: openingTypePreview('DKL', 1) },
  { id: 'rechts', label: 'rechts', image: openingTypePreview('DKR', 1) },
  { id: 'oben', label: 'oben', image: openingTypePreview('K', 1) },
  { id: 'unten', label: 'unten', image: openingTypePreview('K', 1) }
];

export {
  FRAME_COLORS,
  DECOR_STANDARD_COLORS,
  DECOR_SONDER_COLORS,
  ALUDEC_DECORS,
  WOODEC_DECORS,
  ALU_STANDARD_COLORS,
  ALU_SONDER_RAL_COLORS,
  ALU_METALLIC_COLORS,
  HOLZ_ARTEN,
  HOLZ_FARBEN,
  HOLZ_RAL_COLORS
} from '@/config/configurator/decorColors';

export const GLASS_TYPES = [
  { id: '2-fach Ug 1.1', label: '2-fach Verglasung Ug 1.1', image: glassImg },
  { id: '2-fach Ug 1.0', label: '2-fach Verglasung Ug 1.0', image: glassImg },
  { id: '3-fach Ug 0.7', label: '3-fach Verglasung Ug 0.7', image: glassImg },
  { id: '3-fach Ug 0.6', label: '3-fach Verglasung Ug 0.6', image: glassImg }
];

export const SOUND_CLASSES = [
  { id: 'Klasse 2 (32 dB)', label: 'Klasse 2 (32 dB)', image: soundImg },
  { id: 'Klasse 3 (36 dB)', label: 'Klasse 3 (36 dB)', image: soundImg },
  { id: 'Klasse 4 (42 dB)', label: 'Klasse 4 (42 dB)', image: soundImg },
  { id: 'Klasse 5 (45 dB)', label: 'Klasse 5 (45 dB)', image: soundImg }
];

export const SECURITY_GLASS = [
  { id: 'Ohne', label: 'Ohne Sicherheitsglas', image: securityImg },
  { id: 'ESG 4mm aussen', label: 'ESG 4 mm aussen', image: securityImg },
  { id: 'VSG 8mm', label: 'VSG 8 mm', image: securityImg },
  { id: 'TRAV DIN 18008', label: 'TRAV DIN 18008', image: securityImg }
];

export const ORNAMENT_GLASS = [
  'Klarglas',
  'Kathedral klein',
  'Chinchilla',
  'Mastercare',
  'Satinato'
];

export const GRILLE_TYPES = ['Keine', 'Helima Sprosse', 'Wiener Sprosse', 'Glasteilende Sprosse'];

export const FITTINGS = [
  { id: 'Basissicherheit', label: 'Basissicherheit', image: frameImg },
  { id: 'RC1', label: 'RC1', image: frameImg },
  { id: 'RC2', label: 'RC2', image: frameImg }
];

export const HANDLES = [
  { id: 'Ohne', label: 'Ohne Griff', image: handleImg },
  { id: 'Standard Weiss', label: 'Standard Weiss', image: handleImg },
  { id: 'Standard Silber', label: 'Standard Silber', image: handleImg },
  { id: 'Druckknopf', label: 'Druckknopf', image: handleImg },
  { id: 'Abschliessbar', label: 'Abschliessbar', image: handleImg }
];

export const FRAME_EXTENSION = [
  { id: 'Ohne Stahl', label: 'Ohne Stahl', image: frameImg },
  { id: 'Mit Stahl', label: 'Mit Stahl', image: frameImg }
];

const BASE_WINDOW = {
  id: crypto.randomUUID(),
  name: '',
  windowType: 'Einteilig',
  lightOption: 'Ohne Ober-/Unterlicht',
  openingType: 'DKL',
  openingDirection: 'links',
  width: 1200,
  height: 1400,
  glassType: '3-fach Ug 0.7',
  soundClass: 'Klasse 3 (36 dB)',
  thermalEdge: true,
  securityGlass: 'Ohne',
  ornamentGlass: 'Klarglas',
  hasGrille: false,
  grilleType: 'Keine',
  grilleWidth: 26,
  grilleVertical: 0,
  grilleHorizontal: 0,
  fitting: 'Basissicherheit',
  hasVent: false,
  handle: 'Standard Weiss',
  preDrilledHoles: false,
  frameExtensionEnabled: false,
  frameExtensionKind: 'Ohne Stahl',
  frameExtensionLeft: 0,
  frameExtensionRight: 0,
  frameExtensionTop: 0,
  frameExtensionBottom: 0
};

export const createWindow = () => ({ ...BASE_WINDOW, id: crypto.randomUUID() });

export const INITIAL_CONFIGURATOR_STATE = {
  productType: 'window',
  quantity: 1,
  globalConfig: {
    material: 'Kunststoff',
    manufacturer: 'aluplast',
    profileSystem: 'IDEAL TwinSet 4000',
    frameColorOutside: 'Weiss',
    frameColorInside: 'Weiss',
    woodSpecies: 'Kiefer'
  },
  windows: [createWindow()],
  doorConfig: {
    model: 'Modell A',
    color: 'Anthrazit',
    width: 1100,
    height: 2100,
    extras: 'Seitenteil links'
  },
  shutterConfig: {
    shutterType: 'Aufsatzrollladen',
    width: 1200,
    height: 1400,
    control: 'Elektrisch',
    features: 'Hinderniserkennung'
  },
  customer: {
    fullName: '',
    address: '',
    email: '',
    phone: '',
    notes: ''
  }
};
