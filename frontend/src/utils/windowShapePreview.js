/**
 * Generates schematic window icons (SVG data URLs) for option cards and previews.
 * Matches fensterversand-style layouts: frame, glass, handles, Stulp vs Pfosten,
 * Ober-/Unterlicht bands, and opening symbols where appropriate.
 */

import { resolvePreviewColor } from '@/utils/previewConfig';

export function encodeSvg(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function parseLight(lightOption) {
  const text = lightOption || '';
  return {
    withTop: text.includes('Oberlicht') || text.includes('oberlicht'),
    withBottom: text.includes('Unterlicht') || text.includes('unterlicht'),
    splitTop: text.includes('geteilt') && /ober/i.test(text),
    splitBottom: text.includes('geteilt') && /unter/i.test(text),
    sideLeft: text.includes('Seitenteil links') || text.includes('beidseitig'),
    sideRight: text.includes('Seitenteil rechts') || text.includes('beidseitig')
  };
}

/** Known opening codes → sash modes (legacy hyphen codes and v2 underscore ids). */
const OPENING_SASHES = {
  F: ['fixed'],
  K: ['kipp'],
  DL: ['dreh_l'],
  DR: ['dreh_r'],
  DKL: ['dk_l'],
  DKR: ['dk_r'],
  'F-F': ['fixed', 'fixed'],
  'DKL-F': ['dk_l', 'fixed'],
  'F-DKR': ['fixed', 'dk_r'],
  'DKL-DKR': ['dk_l', 'dk_r'],
  'F-F-F': ['fixed', 'fixed', 'fixed'],
  'DKL-F-DKR': ['dk_l', 'fixed', 'dk_r'],
  fest: ['fixed'],
  kipp: ['kipp'],
  dreh_links: ['dreh_l'],
  dreh_rechts: ['dreh_r'],
  dreh_kipp_links: ['dk_l'],
  dreh_kipp_rechts: ['dk_r'],
  l_fest_r_fest: ['fixed', 'fixed'],
  l_dk_r_fest: ['dk_l', 'fixed'],
  l_fest_r_dk: ['fixed', 'dk_r'],
  l_dk_r_dk: ['dk_l', 'dk_r'],
  l_dreh_r_dk: ['dreh_l', 'dk_r'],
  l_dk_r_dreh: ['dk_l', 'dreh_r'],
  l_fest_m_fest_r_fest: ['fixed', 'fixed', 'fixed'],
  l_dk_m_fest_r_fest: ['dk_l', 'fixed', 'fixed'],
  l_fest_m_fest_r_dk: ['fixed', 'fixed', 'dk_r'],
  l_dk_m_fest_r_dk: ['dk_l', 'fixed', 'dk_r'],
  l_dreh_m_fest_r_dk: ['dreh_l', 'fixed', 'dk_r'],
  l_dk_m_fest_r_dreh: ['dk_l', 'fixed', 'dreh_r']
};

/** Map legacy opening codes (F-DKR, DKL-F, …) to generated-preview sash modes. */
export function legacyOpeningSashes(openingType, panes) {
  return parseOpeningTokens(openingType, panes);
}

function parseOpeningTokens(openingType, panes) {
  const key = String(openingType || 'F');
  if (OPENING_SASHES[key]) {
    const mapped = [...OPENING_SASHES[key]];
    while (mapped.length < panes) mapped.push('fixed');
    return mapped.slice(0, panes);
  }

  const parts = key.split('-');
  const tokens = [...parts];
  while (tokens.length < panes) tokens.push('F');
  return tokens.slice(0, panes).map((t) => {
    const u = t.toUpperCase();
    if (u === 'F' || u === 'FEST') return 'fixed';
    if (u === 'K' || u === 'KIPP') return 'kipp';
    if (u === 'DKL' || u === 'DK_L') return 'dk_l';
    if (u === 'DKR' || u === 'DK_R') return 'dk_r';
    if (u === 'DL' || u === 'DREH_L') return 'dreh_l';
    if (u === 'DR' || u === 'DREH_R') return 'dreh_r';
    if (u === 'S') return 'slide';
    if (u.includes('DK') && u.includes('L')) return 'dk_l';
    if (u.includes('DK') && u.includes('R')) return 'dk_r';
    if (u.includes('L')) return 'dreh_l';
    if (u.includes('R')) return 'dreh_r';
    return 'fixed';
  });
}

/** Small handle bar on the hinge side of an operable sash. */
function handleSvg(px, py, pw, ph, side = 'right') {
  const hx = side === 'right' ? px + pw - 7 : px + 5;
  const hy = py + ph * 0.38;
  const hh = ph * 0.24;
  return `<line x1="${hx}" y1="${hy}" x2="${hx}" y2="${hy + hh}" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>`;
}

/** Öffnungsrichtung (links / rechts / oben / unten) → sash glyph for preview lines. */
export function directionToSashMode(openingDirection) {
  switch (openingDirection) {
    case 'links':
      return 'dreh_l';
    case 'rechts':
      return 'dreh_r';
    case 'oben':
    case 'unten':
      return 'kipp';
    default:
      return null;
  }
}

/** Apply hinge direction overlay (matches Oeffnungsrichtung cards). */
export function applyOpeningDirection(tokens, openingType, openingDirection) {
  const dir = directionToSashMode(openingDirection);
  if (!dir) return tokens;

  const hasOperable = tokens.some((t) => t !== 'fixed');
  if (!hasOperable) {
    const next = [...tokens];
    next[0] = dir;
    return next;
  }

  return tokens.map((t) => {
    if (t === 'fixed') return 'fixed';
    if (dir === 'kipp') return t === 'dk_l' || t === 'dk_r' ? t : 'kipp';
    if (dir === 'dreh_l') {
      if (t === 'dreh_r' || t === 'dk_r') return t;
      if (t === 'dk_l' || t === 'dreh_l') return 'dk_l';
      return 'dreh_l';
    }
    if (dir === 'dreh_r') {
      if (t === 'dreh_l' || t === 'dk_l') return t;
      if (t === 'dk_r' || t === 'dreh_r') return 'dk_r';
      return 'dreh_r';
    }
    return t;
  });
}

/** Opening indicator lines inside a sash (cards + live preview; size scales with pane). */
function openingLinesSvg(px, py, pw, ph, mode) {
  const cx = px + pw / 2;
  const cy = py + ph / 2;
  const strokeW = Math.max(1.75, Math.min(pw, ph) * 0.016);
  const orange = `stroke="#ea580c" stroke-width="${strokeW}" fill="none"`;
  const marginX = pw * 0.26;
  const spanY = ph * 0.16;

  if (mode === 'fixed') {
    const v0 = ph * 0.16;
    const h0 = pw * 0.16;
    return `<line x1="${cx}" y1="${cy - v0}" x2="${cx}" y2="${cy + v0}" stroke="#94a3b8" stroke-width="${strokeW}"/><line x1="${cx - h0}" y1="${cy}" x2="${cx + h0}" y2="${cy}" stroke="#94a3b8" stroke-width="${strokeW}"/>`;
  }
  if (mode === 'kipp') {
    const top = py + ph * 0.34;
    const spread = pw * 0.14;
    return `<path d="M ${cx - spread} ${top + spread * 0.5} L ${cx} ${top} L ${cx + spread} ${top + spread * 0.5}" ${orange}/>`;
  }
  if (mode === 'dreh_r' || mode === 'dk_r') {
    const hingeX = px + pw - marginX;
    const apexX = px + marginX;
    return `<path d="M ${apexX} ${cy - spanY} L ${hingeX} ${cy} L ${apexX} ${cy + spanY}" ${orange}/>`;
  }
  if (mode === 'dreh_l' || mode === 'dk_l') {
    const hingeX = px + marginX;
    const apexX = px + pw - marginX;
    return `<path d="M ${apexX} ${cy - spanY} L ${hingeX} ${cy} L ${apexX} ${cy + spanY}" ${orange}/>`;
  }
  if (mode === 'slide') {
    const inset = pw * 0.22;
    const head = pw * 0.06;
    return `<path d="M ${px + inset} ${cy} L ${px + pw - inset} ${cy}" stroke="#0284c7" stroke-width="${strokeW}"/><path d="M ${px + pw - inset - head} ${cy - head} L ${px + pw - inset} ${cy} L ${px + pw - inset - head} ${cy + head}" stroke="#0284c7" stroke-width="${strokeW}" fill="none"/>`;
  }
  return '';
}

/** Every card icon uses the same canvas and inner slot so sizes match in the grid. */
const SVG_SIZE = { w: 260, h: 220 };
const ICON_SLOT = { w: 184, h: 132 };

/** Shared thin-line look (matches Einteilig card icons). */
const ICON_STYLE = {
  slotFill: '#f1f5f9',
  slotStroke: '#e2e8f0',
  frameFill: '#e8ecf0',
  frameStroke: '#b8c4d0',
  frameOuter: 1.25,
  glassFill: '#eef6fc',
  glassStroke: '#c5d3e0',
  glassStrokeWidth: 1,
  mullionFill: '#d1dae6',
  mullionPfosten: 4,
  mullionStulp: 1.5,
  pad: 6
};

function slotBackground() {
  const x = (SVG_SIZE.w - ICON_SLOT.w) / 2;
  const y = (SVG_SIZE.h - ICON_SLOT.h) / 2;
  const s = ICON_STYLE;
  return `<rect x="${x}" y="${y}" width="${ICON_SLOT.w}" height="${ICON_SLOT.h}" fill="${s.slotFill}" stroke="${s.slotStroke}" stroke-width="1" rx="4"/>`;
}

/** Fit the window drawing inside ICON_SLOT (centered, consistent padding). */
function resolveFrame({ shape, layout, panes = 1 }) {
  const pad = ICON_STYLE.pad + 4;
  const maxW = ICON_SLOT.w - pad * 2;
  const maxH = ICON_SLOT.h - pad * 2;
  const slotX = (SVG_SIZE.w - ICON_SLOT.w) / 2;
  const slotY = (SVG_SIZE.h - ICON_SLOT.h) / 2;

  const aspect = shapeLayoutAspect({ shape, layout, panes });

  let w = maxW;
  let h = maxH;
  if (aspect > w / h) h = w / aspect;
  else w = h * aspect;

  return {
    x: slotX + (ICON_SLOT.w - w) / 2,
    y: slotY + (ICON_SLOT.h - h) / 2,
    w,
    h
  };
}

function shapeLayoutAspect({ shape, layout, panes = 1 }) {
  if (shape === 'tall' || layout === 'tall') return 0.58;
  if (layout === 'sondertyp') return 0.72;
  if (layout === 'psk3') return 1.45;
  if (layout === 'grid2x2') return 1;
  if (shape === 'arch') return 0.72;
  if (shape === 'arch-soft') return 0.8;
  if (shape === 'triangle') return 0.95;
  if (shape === 'trapez') return 1.08;
  if (panes >= 3) return 1.42;
  if (panes === 2) return 1.22;
  return 1.32;
}

/** Scale SVG canvas to match configured mm dimensions (live preview only). */
function resolvePreviewCanvasSize({ transparentChrome, useDimensionAspect, widthMm, heightMm }) {
  if (!transparentChrome || !useDimensionAspect) {
    return { svgW: SVG_SIZE.w, svgH: SVG_SIZE.h, dimensionAspect: null };
  }

  const w = Number(widthMm);
  const h = Number(heightMm);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w < 100 || h < 100) {
    return { svgW: SVG_SIZE.w, svgH: SVG_SIZE.h, dimensionAspect: null };
  }

  const dimensionAspect = w / h;
  const maxEdge = 320;
  const minEdge = 140;
  let svgW;
  let svgH;

  if (dimensionAspect >= 1) {
    svgW = maxEdge;
    svgH = maxEdge / dimensionAspect;
  } else {
    svgH = maxEdge;
    svgW = maxEdge * dimensionAspect;
  }

  if (svgW < minEdge) {
    svgW = minEdge;
    svgH = minEdge / dimensionAspect;
  }
  if (svgH < minEdge) {
    svgH = minEdge;
    svgW = minEdge * dimensionAspect;
  }

  return { svgW, svgH, dimensionAspect };
}

/** Live preview: use full SVG area, no grey slot box. */
function resolveFrameFullBleed({ shape, layout, panes = 1, svgW, svgH, dimensionAspect = null }) {
  const pad = 4;
  const maxW = svgW - pad * 2;
  const maxH = svgH - pad * 2;

  let aspect = dimensionAspect;
  if (!aspect || !Number.isFinite(aspect) || aspect <= 0) {
    aspect = shapeLayoutAspect({ shape, layout, panes });
  }

  let w = maxW;
  let h = maxH;
  if (aspect > w / h) h = w / aspect;
  else w = h * aspect;

  return {
    x: (svgW - w) / 2,
    y: (svgH - h) / 2,
    w,
    h
  };
}

function isShapedFrame(shape) {
  return shape === 'arch' || shape === 'arch-soft' || shape === 'trapez' || shape === 'triangle';
}

/** Outer frame outline — arch peak stays inside the viewBox. */
function outerPath(x, y, w, h, shape) {
  if (shape === 'arch') {
    const shoulder = y + h * 0.42;
    const r = w / 2;
    const ry = Math.min(r, (shoulder - y) * 0.88);
    return `M ${x} ${y + h} L ${x} ${shoulder} A ${r} ${ry} 0 0 1 ${x + w} ${shoulder} L ${x + w} ${y + h} Z`;
  }
  if (shape === 'arch-soft') {
    const rise = h * 0.2;
    const peak = y + rise * 0.55;
    return `M ${x} ${y + rise} Q ${x + w / 2} ${peak} ${x + w} ${y + rise} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  }
  if (shape === 'trapez') {
    const inset = w * 0.1;
    return `M ${x + inset} ${y} L ${x + w - inset} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  }
  if (shape === 'triangle') {
    return `M ${x + w / 2} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  }
  return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
}

/** Single-pane glass inset for shaped frames (no rectangular sash overlay). */
function drawShapedGlass(parts, x, y, w, h, shape, st, showOpening, showHandles, token) {
  const gi = Math.max(7, Math.min(w, h) * 0.08);
  const gx = x + gi;
  const gy = y + gi;
  const gw = w - gi * 2;
  const gh = h - gi * 2;
  parts.push(
    `<path d="${outerPath(gx, gy, gw, gh, shape)}" fill="${st.glassFill}" stroke="${st.glassStroke}" stroke-width="${st.glassStrokeWidth}"/>`
  );
  if (showOpening) parts.push(openingLinesSvg(gx, gy, gw, gh, token || 'fixed'));
  if (showHandles && token && token !== 'fixed') parts.push(handleSvg(gx, gy, gw, gh, 'right'));
}

/**
 * @param {object} opts
 * @param {'type'|'opening'|'light'} [opts.mode] - type: layout+handles only; opening: add symbols
 */
export function buildWindowShapeSvg(opts = {}) {
  const {
    panes = 1,
    shape = 'rect',
    layout = 'row',
    divider = 'pfosten',
    openingType = 'F',
    lightOption = '',
    mode = 'type',
    fixedOnly = false,
    frameFill = null,
    frameStroke = null,
    transparentChrome = false,
    openingDirection = null,
    widthMm = null,
    heightMm = null,
    useDimensionAspect = false
  } = opts;

  const { svgW, svgH, dimensionAspect } = resolvePreviewCanvasSize({
    transparentChrome,
    useDimensionAspect,
    widthMm,
    heightMm
  });
  const frame = transparentChrome
    ? resolveFrameFullBleed({ shape, layout, panes, svgW, svgH, dimensionAspect })
    : resolveFrame({ shape, layout, panes });
  const x = frame.x;
  const y = frame.y;
  const outer = { w: frame.w, h: frame.h };

  const light = parseLight(lightOption);
  const sashCount = layout === 'grid2x2' ? 4 : panes;
  let tokens = parseOpeningTokens(openingType, sashCount);
  if (mode === 'opening' && openingDirection) {
    tokens = applyOpeningDirection(tokens, openingType, openingDirection);
  }
  const showOpening = mode === 'opening' && !fixedOnly;
  const showHandles = mode !== 'light' && !fixedOnly;

  const st = frameFill
    ? {
        ...ICON_STYLE,
        frameFill,
        mullionFill: frameFill,
        frameStroke: frameStroke || frameFill
      }
    : ICON_STYLE;
  const inset = st.pad;
  const parts = [];
  if (!transparentChrome) {
    parts.push(`<rect width="${svgW}" height="${svgH}" fill="#f8fafc"/>`, slotBackground());
  }

  // Sondertyp: small top sash + large bottom
  if (layout === 'sondertyp') {
    const topH = outer.h * 0.28;
    const botY = y + topH + 5;
    const botH = outer.h - topH - 5;
    parts.push(
      `<rect x="${x}" y="${y}" width="${outer.w}" height="${outer.h}" fill="${st.frameFill}" stroke="${st.frameStroke}" stroke-width="${st.frameOuter}" rx="2"/>`,
      `<rect x="${x + inset}" y="${y + inset}" width="${outer.w - inset * 2}" height="${topH - inset - 2}" fill="${st.glassFill}" stroke="${st.glassStroke}" stroke-width="${st.glassStrokeWidth}"/>`,
      `<rect x="${x + inset}" y="${botY}" width="${outer.w - inset * 2}" height="${botH - inset}" fill="${st.glassFill}" stroke="${st.glassStroke}" stroke-width="${st.glassStrokeWidth}"/>`
    );
    if (showHandles) parts.push(handleSvg(x + inset, botY, outer.w - inset * 2, botH - inset, 'right'));
    return wrapSvg(svgW, svgH, parts);
  }

  // PSK: three vertical sections
  if (layout === 'psk3') {
    const gap = 3;
    const sw = (outer.w - inset * 2 - gap * 2) / 3;
    parts.push(
      `<rect x="${x}" y="${y}" width="${outer.w}" height="${outer.h}" fill="${st.frameFill}" stroke="${st.frameStroke}" stroke-width="${st.frameOuter}"/>`
    );
    for (let i = 0; i < 3; i++) {
      const px = x + inset + i * (sw + gap);
      parts.push(
        `<rect x="${px}" y="${y + inset}" width="${sw}" height="${outer.h - inset * 2}" fill="${st.glassFill}" stroke="${st.glassStroke}" stroke-width="${st.glassStrokeWidth}"/>`
      );
    }
    return wrapSvg(svgW, svgH, parts);
  }

  parts.push(
    `<path d="${outerPath(x, y, outer.w, outer.h, shape)}" fill="${st.frameFill}" stroke="${st.frameStroke}" stroke-width="${st.frameOuter}"/>`
  );

  if (isShapedFrame(shape) && panes === 1) {
    const token = tokens[0] || 'fixed';
    drawShapedGlass(parts, x, y, outer.w, outer.h, shape, st, showOpening, showHandles, token);
    return wrapSvg(svgW, svgH, parts);
  }

  const sideW = light.sideLeft || light.sideRight ? Math.max(16, outer.w * 0.14) : 0;
  const topH = light.withTop ? Math.max(20, outer.h * 0.18) : 0;
  const bottomH = light.withBottom ? Math.max(20, outer.h * 0.16) : 0;
  const mainX = x + inset + (light.sideLeft ? sideW : 0);
  const mainY = y + inset + topH;
  const mainW = outer.w - inset * 2 - (light.sideLeft ? sideW : 0) - (light.sideRight ? sideW : 0);
  const mainH = outer.h - inset * 2 - topH - bottomH;

  if (light.sideLeft) {
    parts.push(
      `<rect x="${x + inset}" y="${mainY}" width="${sideW - 3}" height="${mainH}" fill="${st.glassFill}" stroke="${st.glassStroke}" stroke-width="${st.glassStrokeWidth}"/>`
    );
  }
  if (light.sideRight) {
    parts.push(
      `<rect x="${x + outer.w - inset - sideW + 3}" y="${mainY}" width="${sideW - 3}" height="${mainH}" fill="${st.glassFill}" stroke="${st.glassStroke}" stroke-width="${st.glassStrokeWidth}"/>`
    );
  }

  if (light.withTop) {
    const cells = light.splitTop ? 2 : 1;
    const gap = 3;
    const cw = (mainW - (cells - 1) * gap) / cells;
    for (let i = 0; i < cells; i++) {
      parts.push(
        `<rect x="${mainX + i * (cw + gap)}" y="${y + inset}" width="${cw}" height="${topH - 4}" fill="${st.glassFill}" stroke="${st.glassStroke}" stroke-width="${st.glassStrokeWidth}"/>`
      );
    }
  }
  if (light.withBottom) {
    const cells = light.splitBottom ? 2 : 1;
    const gap = 3;
    const cw = (mainW - (cells - 1) * gap) / cells;
    const by = y + outer.h - inset - bottomH + 2;
    for (let i = 0; i < cells; i++) {
      parts.push(
        `<rect x="${mainX + i * (cw + gap)}" y="${by}" width="${cw}" height="${bottomH - 4}" fill="${st.glassFill}" stroke="${st.glassStroke}" stroke-width="${st.glassStrokeWidth}"/>`
      );
    }
  }

  const mullionW = divider === 'stulp' ? st.mullionStulp : st.mullionPfosten;

  const drawSash = (px, py, pw, ph, token, handleSide) => {
    parts.push(
      `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${st.glassFill}" stroke="${st.glassStroke}" stroke-width="${st.glassStrokeWidth}"/>`
    );
    if (showOpening) parts.push(openingLinesSvg(px, py, pw, ph, token));
    if (showHandles && token !== 'fixed') parts.push(handleSvg(px, py, pw, ph, handleSide));
    if (showOpening && token === 'fixed') parts.push(openingLinesSvg(px, py, pw, ph, 'fixed'));
  };

  if (layout === 'grid2x2') {
    const gap = 4;
    const pw = (mainW - gap) / 2;
    const ph = (mainH - gap) / 2;
    const positions = [
      [mainX, mainY],
      [mainX + pw + gap, mainY],
      [mainX, mainY + ph + gap],
      [mainX + pw + gap, mainY + ph + gap]
    ];
    positions.forEach(([px, py], i) => {
      const token = tokens[i] || 'fixed';
      drawSash(px, py, pw, ph, token, i % 2 === 0 ? 'right' : 'left');
    });
  } else {
    const count = panes;
    const totalMullions = Math.max(0, count - 1);
    const mullionTotal = totalMullions * mullionW;
    const sashW = (mainW - mullionTotal) / count;

    for (let i = 0; i < count; i++) {
      const px = mainX + i * (sashW + mullionW);
      const token = tokens[i] || 'fixed';
      drawSash(px, mainY, sashW, mainH, token, i === 0 ? 'right' : 'left');
      if (i < count - 1 && mullionW > 2) {
        parts.push(
          `<rect x="${px + sashW}" y="${mainY}" width="${mullionW}" height="${mainH}" fill="${st.mullionFill}" stroke="${st.frameStroke}" stroke-width="0.75"/>`
        );
      } else if (i < count - 1) {
        parts.push(
          `<line x1="${px + sashW + 0.5}" y1="${mainY + 3}" x2="${px + sashW + 0.5}" y2="${mainY + mainH - 3}" stroke="${st.frameStroke}" stroke-width="1"/>`
        );
      }
    }
  }

  return wrapSvg(svgW, svgH, parts);
}

function wrapSvg(w, h, parts) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${parts.join('')}</svg>`;
}

/**
 * Colored schematic for build-step cards (Fenstertyp / Licht / Öffnung).
 * Uses the user's frame colour and the window layout being previewed.
 */
function lightModeOpening(panes) {
  if (panes >= 4) return 'F-F-F-F';
  if (panes === 3) return 'F-F-F';
  if (panes === 2) return 'F-F';
  return 'F';
}

export function buildConfiguratorShapePreview(globalConfig, windowConfig, meta = {}) {
  const { hex } = resolvePreviewColor(globalConfig, meta.colorSurface || 'outside');
  const panes = meta.panes ?? 1;
  let opening = 'F';
  if (meta.fixedOnly) opening = 'F';
  else if (meta.mode === 'light') opening = lightModeOpening(panes);
  else opening = windowConfig.openingType || meta.openingType || 'F';

  const useDimensionAspect = meta.useDimensionAspect === true;

  return encodeSvg(
    buildWindowShapeSvg({
      panes,
      shape: meta.shape ?? 'rect',
      layout: meta.layout ?? 'row',
      divider: meta.divider ?? 'pfosten',
      openingType: opening,
      lightOption: windowConfig.lightOption || '',
      mode: meta.mode ?? 'type',
      fixedOnly: meta.fixedOnly,
      openingDirection: windowConfig.openingDirection || meta.openingDirection || null,
      frameFill: hex,
      frameStroke: hex,
      transparentChrome: meta.transparentChrome === true,
      widthMm: windowConfig?.width,
      heightMm: windowConfig?.height,
      useDimensionAspect
    })
  );
}

export function windowTypeShapePreview(typeId, meta = {}) {
  const {
    panes = 1,
    shape = 'rect',
    layout = 'row',
    divider = 'pfosten',
    openingType = 'DKL',
    fixedOnly = false
  } = meta;
  const opening = fixedOnly ? 'F' : openingType;
  return encodeSvg(
    buildWindowShapeSvg({
      panes,
      shape,
      layout,
      divider,
      openingType: opening,
      mode: 'type',
      fixedOnly
    })
  );
}

export function openingShapePreview(openingType, panes, shape = 'rect') {
  return encodeSvg(
    buildWindowShapeSvg({
      panes,
      shape,
      openingType,
      mode: 'opening'
    })
  );
}

export function lightShapePreview(lightOption, panes = 2) {
  return encodeSvg(
    buildWindowShapeSvg({
      panes,
      shape: 'rect',
      openingType: 'F-F',
      lightOption,
      mode: 'light'
    })
  );
}

/** Map v2 configurator ids to shape preview params. */
export function v2WindowTypeShape(config) {
  const map = {
    einteilig: { panes: 1, openingType: 'fest' },
    zweiteilig: { panes: 2, divider: 'pfosten', openingType: 'l_fest_r_fest' },
    dreiteilig: { panes: 3, openingType: 'l_fest_m_fest_r_fest' },
    sondertypen: { layout: 'sondertyp', panes: 1, openingType: 'fest' }
  };
  const m = map[config.windowType] || map.einteilig;
  const opening = config.openingType || m.openingType;
  return encodeSvg(
    buildWindowShapeSvg({
      panes: m.panes,
      layout: m.layout || 'row',
      divider: m.divider || 'pfosten',
      openingType: opening,
      lightOption: config.lightOption,
      mode: 'type'
    })
  );
}

export function v2LightShape(lightId, windowTypeId) {
  const panes = windowTypeId === 'zweiteilig' ? 2 : windowTypeId === 'dreiteilig' ? 3 : 1;
  const lightLabels = {
    ohne_ober_unterlicht: '',
    mit_oberlicht: 'mit Oberlicht',
    mit_oberlicht_geteilt: 'mit Oberlicht geteilt',
    mit_unterlicht: 'mit Unterlicht',
    mit_unterlicht_geteilt: 'mit Unterlicht geteilt'
  };
  return encodeSvg(
    buildWindowShapeSvg({
      panes,
      openingType: panes === 1 ? 'fest' : 'l_fest_r_fest',
      lightOption: lightLabels[lightId] || lightId,
      mode: 'light'
    })
  );
}

export function v2OpeningShape(openingId, windowTypeId) {
  const panes = { einteilig: 1, zweiteilig: 2, dreiteilig: 3 }[windowTypeId] || 1;
  return encodeSvg(
    buildWindowShapeSvg({
      panes,
      openingType: openingId,
      mode: 'opening'
    })
  );
}
