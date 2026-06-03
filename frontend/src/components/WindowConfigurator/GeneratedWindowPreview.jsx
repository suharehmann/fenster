import {
  findOption,
  getMaterial,
  getOpeningTypes,
  getResolvedPreviewColors,
  getWindowType
} from '@/config/windowConfiguratorData';

/** Opening symbol drawn with inline vector lines (no external image files). */
function OpeningGlyph({ mode }) {
  const drehL = [[100, 2, 2, 50], [100, 98, 2, 50]];
  const drehR = [[0, 2, 98, 50], [0, 98, 98, 50]];
  const kipp = [[2, 2, 50, 98], [98, 2, 50, 98]];

  let lines = [];
  if (mode === 'fixed') lines = [[50, 36, 50, 64], [36, 50, 64, 50]];
  else if (mode === 'dreh_l') lines = drehL;
  else if (mode === 'dreh_r') lines = drehR;
  else if (mode === 'kipp') lines = kipp;
  else if (mode === 'dk_l') lines = [...drehL, ...kipp];
  else if (mode === 'dk_r') lines = [...drehR, ...kipp];

  return (
    <svg className="gw-glyph" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {lines.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}
    </svg>
  );
}

/** A glass pane wrapped in a coloured frame (used for sashes and light cells). */
function Pane({ frameStyle, children, className = '' }) {
  return (
    <div className={`gw-pane ${className}`} style={frameStyle}>
      <div className="gw-glass">{children}</div>
    </div>
  );
}

/**
 * Draws the window using divs, CSS borders/backgrounds and inline opening
 * glyphs. Layout comes from Fenstertyp, the extra top/bottom sections from
 * Ober/Unterlicht, opening lines from Öffnungsart and colours from the selected
 * material colours (inner colour for sashes, outer shell colour for the frame).
 */
export default function GeneratedWindowPreview({ config }) {
  const material = getMaterial(config.material);
  const windowType = getWindowType(material, config.windowType);
  const panes = windowType?.panes || 1;

  const opening = findOption(getOpeningTypes(config.windowType), config.openingType);
  const sashes = opening?.sashes || Array.from({ length: panes }, () => 'fixed');

  const light = config.lightOption || '';
  const hasTop = light.includes('oberlicht');
  const hasBottom = light.includes('unterlicht');
  const split = light.includes('geteilt');

  const { isWood, usesShell, sashColor, shellColor } = getResolvedPreviewColors(config);

  // Outer frame uses the shell colour for hybrids, otherwise the chosen colour.
  const outerFrameColor = usesShell && shellColor ? shellColor : sashColor;
  // Wood materials get a CSS grain on the sash frame.
  const sashBackground = isWood
    ? `repeating-linear-gradient(95deg, ${sashColor}, rgba(0,0,0,0.18) 1px, ${sashColor} 7px)`
    : sashColor;

  const lightCells = split ? [0, 1] : [0];

  return (
    <div className="gw">
      <div className="gw-frame" style={{ background: outerFrameColor }}>
        {hasTop && (
          <div className="gw-light gw-light--top">
            {lightCells.map((c) => (
              <Pane key={c} frameStyle={{ background: sashBackground }} className="gw-pane--light" />
            ))}
          </div>
        )}

        <div className="gw-body" data-panes={panes}>
          {sashes.map((mode, i) => (
            <div key={i} className="gw-sash-wrap">
              {i > 0 && <div className="gw-mullion" aria-hidden="true" />}
              <Pane frameStyle={{ background: sashBackground }}>
                <OpeningGlyph mode={mode} />
              </Pane>
            </div>
          ))}
        </div>

        {hasBottom && (
          <div className="gw-light gw-light--bottom">
            {lightCells.map((c) => (
              <Pane key={c} frameStyle={{ background: sashBackground }} className="gw-pane--light" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
