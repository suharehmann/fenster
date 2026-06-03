/**
 * Data-driven configuration for the window configurator.
 *
 * Every material owns ONLY the sections that belong to it (systems, profiles,
 * colour sections, wood data, window types, light/opening options, size limits
 * and prices). The UI renders purely from this data — no option names live in
 * JSX. To extend later, edit this file (and optionally drop a matching SVG;
 * everything that has no SVG is drawn with CSS shapes).
 */

// --- tiny builders --------------------------------------------------------

function color(id, label, hex, priceImpact = 0) {
  return { id, label, color: hex, priceImpact };
}

function prof(id, label, priceImpact = 0) {
  return { id, label, priceImpact };
}

// --- PVC colours ----------------------------------------------------------

const PVC_STANDARD = [
  color('weiss', 'Weiß', '#ffffff', 0),
  color('reinweiss', 'Reinweiß strukturell', '#f4f4f2', 15),
  color('cremeweiss', 'Cremeweiß strukturell', '#f6f1e3', 15),
  color('golden_oak', 'Golden Oak', '#b8763a', 22),
  color('nussbaum', 'Nussbaum', '#5c3a21', 22),
  color('anthrazit_7016', 'Anthrazit ähnlich RAL 7016', '#383e42', 22)
];

const PVC_SONDER = [
  color('mahagoni', 'Mahagoni', '#5c2e1a', 35),
  color('grau_7001', 'Grau ähnlich RAL 7001', '#8f969c', 35),
  color('basaltgrau_7012', 'Basaltgrau ähnlich RAL 7012', '#4b4f54', 35),
  color('eisenglimmer_db703', 'Eisenglimmer DB 703', '#4a4f54', 35),
  color('mooreiche', 'Mooreiche', '#3f2d20', 35),
  color('braun_dekor', 'Braun dekor', '#5a4332', 35)
];

const PVC_ALUDEC_WOODEC = [
  color('aludec_fenstergrau', 'aludec Fenstergrau', '#6b7280', 40),
  color('aludec_umbra', 'aludec Umbra', '#57534e', 40),
  color('aludec_basaltgrau', 'aludec Basaltgrau', '#4b5563', 40),
  color('aludec_anthrazitgrau', 'aludec Anthrazitgrau', '#374151', 40),
  color('aludec_db703', 'aludec DB703', '#52525b', 40),
  color('aludec_jet_black', 'aludec Jet Black', '#1c1c1c', 40),
  color('woodec_turner_oak_malt', 'woodec Turner Oak Malt', '#8a5a2b', 45),
  color('woodec_sheffield_oak_alpine', 'woodec Sheffield Oak Alpine', '#c9b48f', 45),
  color('woodec_sheffield_oak_concrete', 'woodec Sheffield Oak Concrete', '#8d8378', 45),
  color('woodec_turner_oak_toffee', 'woodec Turner Oak Toffee', '#6b4423', 45)
];

const KALU_INNER_SONDER = [
  color('douglasie', 'Douglasie', '#b5703a', 35),
  color('basaltgrau_7012', 'Basaltgrau ähnlich RAL 7012', '#4b4f54', 35),
  color('grau_7001', 'Grau ähnlich RAL 7001', '#8f969c', 35),
  color('eisenglimmer_db703', 'Eisenglimmer DB 703', '#4a4f54', 35)
];

// --- outside aluminium shell groups (shared by hybrid materials) ----------

const ALU_OUT_STANDARD = [
  color('ral9016', 'Weiß RAL 9016', '#f1f0ea', 0),
  color('ral7035', 'Lichtgrau RAL 7035', '#d3d7d4', 20),
  color('ral7016', 'Anthrazitgrau RAL 7016', '#383e42', 25),
  color('ral6005', 'Moosgrün RAL 6005', '#2f4538', 25),
  color('ral8001', 'Ockerbraun RAL 8001', '#9d622b', 25),
  color('ral8017', 'Schokoladenbraun RAL 8017', '#45322b', 25)
];

const ALU_OUT_SONDER = [
  color('ral1013', 'Perlweiß RAL 1013', '#e7e2d4', 30),
  color('ral9006', 'Weißaluminium Metallic RAL 9006', '#a5a5a5', 35),
  color('ral3003', 'Rubinrot RAL 3003', '#6b1f24', 35),
  color('ral5014', 'Taubenblau RAL 5014', '#6c7c93', 35),
  color('ral7015', 'Schiefergrau RAL 7015', '#434a52', 35),
  color('ral5011', 'Stahlblau RAL 5011', '#1f2a3a', 35)
];

const ALU_OUT_METALLIC = [
  color('ral9007_metallic', 'Graualuminium Metallic RAL 9007', '#8f9194', 45),
  color('db703_metallic_matt', 'Eisenglimmer DB 703 Metallic matt', '#4a4f54', 45)
];

// --- wood -----------------------------------------------------------------

const WOOD_TYPES = [
  color('kiefer', 'Kiefer', '#d8b878', 0),
  color('fichte', 'Fichte', '#e3c79a', 5),
  color('meranti', 'Meranti', '#9c5a3c', 18),
  color('eukalyptus', 'Eukalyptus', '#a86b4a', 20),
  color('eiche', 'Eiche', '#7a5230', 28),
  color('laerche', 'Lärche', '#c08a4a', 22)
];

// Holzfarbe options depend on the selected Holzart.
const WOOD_COLORS_BY_TYPE = {
  kiefer: [
    color('kiefer_hell_325', 'Kiefer Hell 325', '#e0c08a', 0),
    color('kiefer_weissschleier_d9010', 'Kiefer Weißschleier D9010', '#e9ddc4', 8),
    color('kiefer_nativa', 'Kiefer nativa', '#d6b787', 8),
    color('kiefer_550', 'Kiefer 550', '#c79a5c', 8),
    color('kiefer_melone_303', 'Kiefer Melone 303', '#d9a14a', 8),
    color('kiefer_mahagoni_211', 'Kiefer Mahagoni 211', '#5c2e1a', 10),
    color('kiefer_nussbaum_222', 'Kiefer Nussbaum 222', '#5c3a21', 10),
    color('kiefer_weiss', 'Kiefer Weiß', '#f3ece0', 8)
  ],
  fichte: [
    color('fichte_hell_325', 'Fichte Hell 325', '#e6cd9f', 0),
    color('fichte_weissschleier_d9010', 'Fichte Weißschleier D9010', '#ece1cb', 8),
    color('fichte_nativa', 'Fichte nativa', '#dcc093', 8),
    color('fichte_550', 'Fichte 550', '#cda064', 8),
    color('fichte_weiss', 'Fichte Weiß', '#f4eee2', 8)
  ],
  meranti: [
    color('meranti_hell_325', 'Meranti Hell 325', '#b07650', 0),
    color('meranti_teak_277', 'Meranti Teak 277', '#9c6b3f', 8),
    color('meranti_mahagoni_211', 'Meranti Mahagoni 211', '#5c2e1a', 10),
    color('meranti_nussbaum_222', 'Meranti Nussbaum 222', '#5c3a21', 10),
    color('meranti_kastanie_233', 'Meranti Kastanie 233', '#6b3f2a', 10),
    color('meranti_weiss', 'Meranti Weiß', '#e9d8c8', 8)
  ],
  eukalyptus: [
    color('eukalyptus_hell_325', 'Eukalyptus Hell 325', '#b67e58', 0),
    color('eukalyptus_40_nativa', 'Eukalyptus 40 nativa', '#a86b4a', 8),
    color('eukalyptus_teak_277', 'Eukalyptus Teak 277', '#9c6b3f', 8),
    color('eukalyptus_mahagoni_211', 'Eukalyptus Mahagoni 211', '#5c2e1a', 10),
    color('eukalyptus_nussbaum_222', 'Eukalyptus Nussbaum 222', '#5c3a21', 10),
    color('eukalyptus_kastanie_233', 'Eukalyptus Kastanie 233', '#6b3f2a', 10),
    color('eukalyptus_weiss', 'Eukalyptus Weiß', '#e7d5c5', 8)
  ],
  eiche: [
    color('eiche_hell_325', 'Eiche Hell 325', '#c9a063', 0),
    color('eiche_600', 'Eiche 600', '#8a5a2b', 8),
    color('eiche_nativa', 'Eiche nativa', '#7a5230', 8),
    color('eiche_222', 'Eiche 222', '#5c3a21', 10),
    color('eiche_weiss', 'Eiche Weiß', '#ece0cf', 8)
  ],
  laerche: [
    color('laerche_nativa', 'Lärche nativa', '#c08a4a', 0),
    color('laerche_hell_325', 'Lärche Hell 325', '#d2a566', 8),
    color('laerche_melone_303', 'Lärche Melone 303', '#d9a14a', 8),
    color('laerche_rotbraun_211', 'Lärche Rotbraun 211', '#7a3b22', 10),
    color('laerche_dunkelbraun_222', 'Lärche Dunkelbraun 222', '#4a3120', 10),
    color('laerche_grauschleier_700', 'Lärche Grauschleier 700', '#8c8378', 10)
  ]
};

const HOLZ_RAL = [
  color('holz_ral9016', 'Verkehrsweiß RAL 9016', '#f1f1f1', 20),
  color('holz_ral1001', 'Beige RAL 1001', '#d3c4a8', 20),
  color('holz_ral7016', 'Anthrazitgrau RAL 7016', '#383e42', 22),
  color('holz_ral8016', 'Mahagonibraun RAL 8016', '#4c2f27', 22),
  color('holz_ral6005', 'Moosgrün RAL 6005', '#2f4538', 22),
  color('holz_ral_sonder', 'Sonderfarbe nach RAL', '#cccccc', 40)
];

// --- aluminium colours ----------------------------------------------------

const ALUMINIUM_STANDARD = [
  color('ral9016', 'Weiß RAL 9016', '#f1f0ea', 0),
  color('ral7016', 'Anthrazitgrau RAL 7016', '#383e42', 20),
  color('ral9006', 'Weißaluminium RAL 9006', '#a5a5a5', 20),
  color('ral9007', 'Graualuminium RAL 9007', '#8f9194', 20)
];

const ALUMINIUM_SONDER = [
  color('ral8019', 'Graubraun RAL 8019', '#3d3635', 30),
  color('ral7024', 'Graphitgrau RAL 7024', '#45474a', 30),
  color('ral6005', 'Moosgrün RAL 6005', '#2f4538', 30),
  color('ral3003', 'Rubinrot RAL 3003', '#6b1f24', 30),
  color('eisenglimmer_db703', 'Eisenglimmer DB 703', '#4a4f54', 35),
  color('ral7016_fs', 'Anthrazitgrau RAL 7016 FS', '#383e42', 35),
  color('ral9006_fs', 'Weißaluminium RAL 9006 FS', '#a5a5a5', 35),
  color('ral9007_fs', 'Graualuminium RAL 9007 FS', '#8f9194', 35)
];

// --- window types, lights, openings (shared) ------------------------------

const WINDOW_TYPES = [
  { id: 'einteilig', label: 'Einteilig', panes: 1, priceImpact: 0 },
  { id: 'zweiteilig', label: 'Zweiteilig', panes: 2, priceImpact: 60 },
  { id: 'dreiteilig', label: 'Dreiteilig', panes: 3, priceImpact: 120 }
];
const SONDERTYPEN = { id: 'sondertypen', label: 'Sondertypen', panes: 1, priceImpact: 0, disabled: true };

const LIGHT_BY_TYPE = {
  einteilig: [
    prof('ohne_ober_unterlicht', 'ohne Ober/Unterlicht', 0),
    prof('mit_oberlicht', 'mit Oberlicht', 30),
    prof('mit_unterlicht', 'mit Unterlicht', 30)
  ],
  zweiteilig: [
    prof('ohne_ober_unterlicht', 'ohne Ober/Unterlicht', 0),
    prof('mit_oberlicht', 'mit Oberlicht', 30),
    prof('mit_oberlicht_geteilt', 'mit Oberlicht geteilt', 40),
    prof('mit_unterlicht', 'mit Unterlicht', 30),
    prof('mit_unterlicht_geteilt', 'mit Unterlicht geteilt', 40)
  ],
  dreiteilig: [
    prof('ohne_ober_unterlicht', 'ohne Ober/Unterlicht', 0),
    prof('mit_oberlicht', 'mit Oberlicht', 30),
    prof('mit_unterlicht', 'mit Unterlicht', 30)
  ],
  sondertypen: [prof('ohne_ober_unterlicht', 'ohne Ober/Unterlicht', 0)]
};

// `sashes` describes each sash for the generated preview (and reads cleanly in summary).
function opening(id, label, sashes, priceImpact = 0) {
  return { id, label, sashes, priceImpact };
}

const OPENING_BY_TYPE = {
  einteilig: [
    opening('fest', 'Festverglasung', ['fixed'], 0),
    opening('dreh_links', 'Dreh links', ['dreh_l'], 15),
    opening('dreh_rechts', 'Dreh rechts', ['dreh_r'], 15),
    opening('kipp', 'Kipp', ['kipp'], 10),
    opening('dreh_kipp_links', 'Dreh Kipp links', ['dk_l'], 25),
    opening('dreh_kipp_rechts', 'Dreh Kipp rechts', ['dk_r'], 25)
  ],
  zweiteilig: [
    opening('l_fest_r_fest', 'links fest, rechts fest', ['fixed', 'fixed'], 0),
    opening('l_dk_r_fest', 'links Dreh Kipp, rechts fest', ['dk_l', 'fixed'], 30),
    opening('l_fest_r_dk', 'links fest, rechts Dreh Kipp', ['fixed', 'dk_r'], 30),
    opening('l_dk_r_dk', 'links Dreh Kipp, rechts Dreh Kipp', ['dk_l', 'dk_r'], 55),
    opening('l_dreh_r_dk', 'links Dreh, rechts Dreh Kipp', ['dreh_l', 'dk_r'], 50),
    opening('l_dk_r_dreh', 'links Dreh Kipp, rechts Dreh', ['dk_l', 'dreh_r'], 50)
  ],
  dreiteilig: [
    opening('l_fest_m_fest_r_fest', 'links fest, mitte fest, rechts fest', ['fixed', 'fixed', 'fixed'], 0),
    opening('l_dk_m_fest_r_fest', 'links Dreh Kipp, mitte fest, rechts fest', ['dk_l', 'fixed', 'fixed'], 35),
    opening('l_fest_m_fest_r_dk', 'links fest, mitte fest, rechts Dreh Kipp', ['fixed', 'fixed', 'dk_r'], 35),
    opening('l_dk_m_fest_r_dk', 'links Dreh Kipp, mitte fest, rechts Dreh Kipp', ['dk_l', 'fixed', 'dk_r'], 65),
    opening('l_dreh_m_fest_r_dk', 'links Dreh, mitte fest, rechts Dreh Kipp', ['dreh_l', 'fixed', 'dk_r'], 60),
    opening('l_dk_m_fest_r_dreh', 'links Dreh Kipp, mitte fest, rechts Dreh', ['dk_l', 'fixed', 'dreh_r'], 60)
  ]
};

const DEFAULT_SIZE_LIMITS = {
  width: { min: 385, max: 2500 },
  height: { min: 385, max: 2510 }
};

// --- systems & profiles ---------------------------------------------------

const KUNSTSTOFF_SYSTEMS = [
  {
    id: 'aluplast',
    label: 'aluplast',
    priceImpact: 0,
    profiles: [
      prof('ideal_4000', 'IDEAL 4000', 0),
      prof('ideal_neo_ad', 'IDEAL neo AD', 20),
      prof('ideal_5000', 'IDEAL 5000', 35),
      prof('ideal_neo_md', 'IDEAL neo MD', 45),
      prof('ideal_7000', 'IDEAL 7000', 70),
      prof('ideal_8000', 'IDEAL 8000', 110),
      prof('energeto_neo', 'energeto neo', 130),
      prof('energeto_8000_ed', 'energeto 8000 ED', 160)
    ]
  },
  {
    id: 'veka',
    label: 'VEKA',
    priceImpact: 5,
    profiles: [
      prof('veka_softline_70_ad', 'VEKA Softline 70 AD', 0),
      prof('veka_softline_76_md', 'VEKA Softline 76 MD', 40),
      prof('veka_softline_82_md', 'VEKA Softline 82 MD', 90),
      prof('veka_softline_82_md_passive', 'VEKA Softline 82 MD Passive', 140)
    ]
  },
  {
    id: 'koemmerling',
    label: 'Kömmerling',
    priceImpact: 8,
    profiles: [
      prof('koemmerling_70_ad', 'Kömmerling 70 AD', 0),
      prof('koemmerling_76_ad', 'Kömmerling 76 AD', 35),
      prof('koemmerling_76_md', 'Kömmerling 76 MD', 60),
      prof('koemmerling_88_md', 'Kömmerling 88 MD', 120)
    ]
  }
];

const ALUMINIUM_SYSTEMS = [
  {
    id: 'aluprof',
    label: 'Aluprof',
    priceImpact: 0,
    profiles: [
      prof('mb_45', 'MB 45', 0),
      prof('mb_79', 'MB 79', 60),
      prof('mb_79_si', 'MB 79 SI', 90),
      prof('mb_86', 'MB 86', 130)
    ]
  },
  {
    id: 'schueco',
    label: 'Schüco',
    priceImpact: 25,
    profiles: [
      prof('mb_45', 'MB 45', 0),
      prof('mb_79', 'MB 79', 60),
      prof('mb_79_si', 'MB 79 SI', 90),
      prof('mb_86', 'MB 86', 130)
    ]
  }
];

const KUNSTSTOFF_ALU_PROFILES = [
  prof('twinset_4000', 'IDEAL TwinSet 4000', 0),
  prof('twinset_neo_ad', 'IDEAL TwinSet neo AD', 25),
  prof('twinset_neo_md', 'IDEAL TwinSet neo MD', 55),
  prof('twinset_8000', 'IDEAL TwinSet 8000', 110),
  prof('energeto_twinset_8000_ed', 'energeto TwinSet 8000 ED', 160)
];

const HOLZ_PROFILES = [
  prof('classic_68', 'Classic 68 mm', 0),
  prof('rustikal_68', 'Rustikal 68 mm', 15),
  prof('classic_78', 'Classic 78 mm', 45),
  prof('rustikal_78', 'Rustikal 78 mm', 60),
  prof('classic_92', 'Classic 92 mm', 110),
  prof('rustikal_92', 'Rustikal 92 mm', 125)
];

const HOLZ_ALU_PROFILES = [
  prof('idealu_classicline_68', 'IDEALU classicline 68 mm', 0),
  prof('idealu_trendline_68', 'IDEALU trendline 68 mm', 20),
  prof('ideal_plano', 'IDEAL Plano', 40),
  prof('idealu_classicline_78', 'IDEALU classicline 78 mm', 60),
  prof('idealu_classicline_92', 'IDEALU classicline 92 mm', 120),
  prof('idealu_design_92', 'IDEALU Design 92 mm', 150),
  prof('eco_idealu_classicline', 'ECO IDEALU classicline', 70),
  prof('ideal_eco_plano', 'IDEAL ECO Plano', 90)
];

// --- materials ------------------------------------------------------------

export const MATERIALS = [
  {
    id: 'kunststoff',
    label: 'Kunststoff',
    startingPrice: 27,
    usesWood: false,
    usesShell: false,
    systems: KUNSTSTOFF_SYSTEMS,
    sections: [
      { id: 'farben_dekore', title: 'Farben und Dekore', field: 'innerColor', options: PVC_STANDARD },
      { id: 'sonderfarben', title: 'Sonderfarben', field: 'innerColor', options: PVC_SONDER },
      { id: 'aludec_woodec', title: 'Aludec und Woodec', field: 'innerColor', options: PVC_ALUDEC_WOODEC }
    ],
    windowTypes: WINDOW_TYPES
  },
  {
    id: 'kunststoff_aluminium',
    label: 'Kunststoff Aluminium',
    startingPrice: 80,
    usesWood: false,
    usesShell: true,
    profiles: KUNSTSTOFF_ALU_PROFILES,
    sections: [
      { id: 'farbe_standarddekore_innen', title: 'Farbe und Standarddekore innen', field: 'innerColor', options: PVC_STANDARD },
      { id: 'sonderfarben_innen', title: 'Sonderfarben innen', field: 'innerColor', options: KALU_INNER_SONDER },
      { id: 'alu_standard', title: 'Farbe Alu Schale außen · Standard Farben', field: 'outerColor', options: ALU_OUT_STANDARD },
      { id: 'alu_sonder', title: 'Sonder RAL Farben außen', field: 'outerColor', options: ALU_OUT_SONDER },
      { id: 'alu_metallic', title: 'Metallic und Feinstruktur außen', field: 'outerColor', options: ALU_OUT_METALLIC }
    ],
    windowTypes: WINDOW_TYPES
  },
  {
    id: 'holz',
    label: 'Holz',
    startingPrice: 100,
    usesWood: true,
    usesShell: false,
    profiles: HOLZ_PROFILES,
    woodTypes: WOOD_TYPES,
    sections: [
      { id: 'holzart', title: 'Holzart', field: 'woodType', dynamic: 'woodType' },
      { id: 'holzfarbe', title: 'Holzfarbe', field: 'woodColor', dynamic: 'woodColor' },
      { id: 'holz_ral', title: 'Holz RAL Farben', field: 'outerColor', options: HOLZ_RAL }
    ],
    windowTypes: [...WINDOW_TYPES, SONDERTYPEN]
  },
  {
    id: 'holz_aluminium',
    label: 'Holz Aluminium',
    startingPrice: 132,
    usesWood: true,
    usesShell: true,
    profiles: HOLZ_ALU_PROFILES,
    woodTypes: WOOD_TYPES,
    sections: [
      { id: 'holzart', title: 'Holzart', field: 'woodType', dynamic: 'woodType' },
      { id: 'holzfarbe', title: 'Holzfarbe', field: 'woodColor', dynamic: 'woodColor' },
      { id: 'alu_standard', title: 'Farbe Alu Schale außen · Standard Farben', field: 'outerColor', options: ALU_OUT_STANDARD },
      { id: 'alu_sonder', title: 'Sonder RAL Farben außen', field: 'outerColor', options: ALU_OUT_SONDER },
      { id: 'alu_metallic', title: 'Metallic und Feinstruktur außen', field: 'outerColor', options: ALU_OUT_METALLIC }
    ],
    windowTypes: [...WINDOW_TYPES, SONDERTYPEN]
  },
  {
    id: 'aluminium',
    label: 'Aluminium',
    startingPrice: 84,
    usesWood: false,
    usesShell: false,
    systems: ALUMINIUM_SYSTEMS,
    sections: [
      { id: 'standardfarben', title: 'Standardfarben', field: 'innerColor', options: ALUMINIUM_STANDARD },
      { id: 'sonderfarben', title: 'Sonderfarben', field: 'innerColor', options: ALUMINIUM_SONDER }
    ],
    windowTypes: WINDOW_TYPES
  }
];

// --- lookup helpers -------------------------------------------------------

export function getMaterial(materialId) {
  return MATERIALS.find((m) => m.id === materialId) || MATERIALS[0];
}

export function hasSystem(material) {
  return Array.isArray(material?.systems) && material.systems.length > 0;
}

export function getSystems(material) {
  return hasSystem(material) ? material.systems : [];
}

export function getSystem(material, systemId) {
  return getSystems(material).find((s) => s.id === systemId) || null;
}

export function getProfiles(material, systemId) {
  if (hasSystem(material)) {
    const system = getSystem(material, systemId) || material.systems[0];
    return system?.profiles || [];
  }
  return material?.profiles || [];
}

export function getWoodTypeOptions(material) {
  return material?.usesWood ? material.woodTypes || [] : [];
}

export function getWoodColorOptions(woodTypeId) {
  return WOOD_COLORS_BY_TYPE[woodTypeId] || [];
}

/** Resolve the option list for a section, handling wood-dependent sections. */
export function getSectionOptions(material, section, config) {
  if (section.dynamic === 'woodType') return getWoodTypeOptions(material);
  if (section.dynamic === 'woodColor') return getWoodColorOptions(config.woodType);
  return section.options || [];
}

export function getWindowTypes(material) {
  return material?.windowTypes || WINDOW_TYPES;
}

export function getWindowType(material, windowTypeId) {
  return getWindowTypes(material).find((t) => t.id === windowTypeId) || getWindowTypes(material)[0];
}

export function getLightOptions(windowTypeId) {
  return LIGHT_BY_TYPE[windowTypeId] || LIGHT_BY_TYPE.einteilig;
}

export function getOpeningTypes(windowTypeId) {
  return OPENING_BY_TYPE[windowTypeId] || OPENING_BY_TYPE.einteilig;
}

export function getSizeLimits(material) {
  return material?.sizeLimits || DEFAULT_SIZE_LIMITS;
}

export function findOption(options, id) {
  return options?.find((o) => o.id === id) || null;
}

/** All inner-colour options across a material's inner sections. */
export function getInnerColorOptions(material) {
  return (material?.sections || [])
    .filter((s) => s.field === 'innerColor')
    .flatMap((s) => s.options || []);
}

/** All outer-colour options across a material's outer sections. */
export function getOuterColorOptions(material) {
  return (material?.sections || [])
    .filter((s) => s.field === 'outerColor')
    .flatMap((s) => s.options || []);
}

/** Resolve a colour option (with hex) for any field. */
export function resolveColorOption(material, field, id) {
  if (!id) return null;
  if (field === 'innerColor') return findOption(getInnerColorOptions(material), id);
  if (field === 'outerColor') return findOption(getOuterColorOptions(material), id);
  if (field === 'woodType') return findOption(getWoodTypeOptions(material), id);
  if (field === 'woodColor') {
    // wood colour id is unique per type; search the whole map.
    for (const list of Object.values(WOOD_COLORS_BY_TYPE)) {
      const hit = findOption(list, id);
      if (hit) return hit;
    }
  }
  return null;
}

/** Hex colours used by the generated CSS preview. */
export function getResolvedPreviewColors(config) {
  const material = getMaterial(config.material);
  const isWood = material.usesWood;
  const sashOption = isWood
    ? resolveColorOption(material, 'woodColor', config.woodColor)
    : resolveColorOption(material, 'innerColor', config.innerColor);
  const shellOption = resolveColorOption(material, 'outerColor', config.outerColor);

  return {
    isWood,
    usesShell: material.usesShell,
    sashColor: sashOption?.color || '#ffffff',
    shellColor: shellOption?.color || null
  };
}

/** Build a valid default selection for a material. */
export function getDefaultsForMaterial(material) {
  const system = getSystems(material)[0] || null;
  const profile = getProfiles(material, system?.id)[0] || null;
  const innerColor = getInnerColorOptions(material)[0]?.id || null;
  const outerColor = material.usesShell ? getOuterColorOptions(material)[0]?.id || null : null;
  const woodType = material.usesWood ? getWoodTypeOptions(material)[0]?.id || null : null;
  const woodColor = woodType ? getWoodColorOptions(woodType)[0]?.id || null : null;
  const windowType = 'einteilig';
  const lightOption = getLightOptions(windowType)[0]?.id || 'ohne_ober_unterlicht';
  const openingType = getOpeningTypes(windowType)[0]?.id || 'fest';

  return {
    material: material.id,
    system: system?.id || null,
    profile: profile?.id || null,
    innerColor,
    outerColor,
    woodType,
    woodColor,
    windowType,
    lightOption,
    openingType,
    width: 1200,
    height: 1400
  };
}
