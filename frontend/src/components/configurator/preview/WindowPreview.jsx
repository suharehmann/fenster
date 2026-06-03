import './WindowPreview.scss';
import { WINDOW_TYPES } from '@/utils/defaults';
import { buildPreviewWindow, glassPaneFill, resolvePreviewColor } from '@/utils/previewConfig';
import WindowHandleGraphic from './WindowHandleGraphic';

function getWindowTypeMeta(windowType) {
  return WINDOW_TYPES.find((type) => type.id === windowType) || WINDOW_TYPES[0];
}

function normalizeTokens(openingType, paneCount) {
  const raw = openingType && openingType.includes('-') ? openingType.split('-') : [openingType || 'F'];
  const cleaned = raw.filter(Boolean);
  while (cleaned.length < paneCount) {
    cleaned.push('F');
  }
  return cleaned.slice(0, paneCount);
}

function OpeningArrow({ token, x, y, w, h }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  if (token === 'F') {
    return null;
  }
  if (token === 'K') {
    return <path d={`M ${x + 14} ${y + 22} L ${cx} ${y + 6} L ${x + w - 14} ${y + 22}`} stroke="#ea580c" strokeWidth="3" fill="none" />;
  }
  if (token === 'S') {
    return (
      <>
        <path d={`M ${x + 12} ${cy - 10} L ${x + w - 12} ${cy - 10}`} stroke="#0284c7" strokeWidth="3" />
        <path d={`M ${x + w - 18} ${cy - 16} L ${x + w - 10} ${cy - 10} L ${x + w - 18} ${cy - 4}`} stroke="#0284c7" strokeWidth="3" fill="none" />
      </>
    );
  }

  const left = token.includes('L');
  const right = token.includes('R');
  const dkl = token.includes('DK');

  if (left || dkl) {
    return <path d={`M ${x + 10} ${y + 12} L ${x + w - 10} ${cy} L ${x + 10} ${y + h - 12}`} stroke="#ea580c" strokeWidth="3" fill="none" />;
  }
  if (right) {
    return <path d={`M ${x + w - 10} ${y + 12} L ${x + 10} ${cy} L ${x + w - 10} ${y + h - 12}`} stroke="#ea580c" strokeWidth="3" fill="none" />;
  }
  if (token === 'D') {
    return <path d={`M ${x + 10} ${y + 12} L ${x + w - 10} ${cy} L ${x + 10} ${y + h - 12}`} stroke="#ea580c" strokeWidth="3" fill="none" />;
  }
  return null;
}

export default function WindowPreview({
  windowConfig,
  globalConfig,
  colorSurface,
  showHandle = false,
  embedded = false
}) {
  const win = buildPreviewWindow(windowConfig, globalConfig) || windowConfig;
  const outside = resolvePreviewColor(globalConfig, 'outside').hex;
  const inside = resolvePreviewColor(globalConfig, 'inside').hex;
  const frameFill = colorSurface === 'inside' ? inside : outside;
  const sashStroke = colorSurface === 'inside' ? outside : inside;
  const width = Number(win?.width || 1200);
  const height = Number(win?.height || 1400);
  const scale = embedded
    ? Math.min(280 / width, 320 / height)
    : Math.min(260 / width, 260 / height);
  const viewW = Math.max(180, width * scale);
  const viewH = Math.max(210, height * scale);
  const paneFill = glassPaneFill(win?.glassType);
  const typeMeta = getWindowTypeMeta(win?.windowType || 'Einteilig');
  const paneCount = typeMeta.panes || 1;
  const openingTokens = normalizeTokens(win?.openingType, paneCount);

  const withTop = (win?.lightOption || '').includes('Oberlicht');
  const withBottom = (win?.lightOption || '').includes('Unterlicht');
  const sideLeft = (win?.lightOption || '').includes('Seitenteil links') || (win?.lightOption || '').includes('beidseitig');
  const sideRight = (win?.lightOption || '').includes('Seitenteil rechts') || (win?.lightOption || '').includes('beidseitig');

  const outerX = 8;
  const outerY = 8;
  const outerW = viewW - 16;
  const outerH = viewH - 16;

  const sideW = sideLeft || sideRight ? Math.max(18, outerW * 0.16) : 0;
  const topH = withTop ? Math.max(18, outerH * 0.18) : 0;
  const bottomH = withBottom ? Math.max(18, outerH * 0.16) : 0;

  const mainX = outerX + (sideLeft ? sideW : 0);
  const mainY = outerY + topH;
  const mainW = outerW - (sideLeft ? sideW : 0) - (sideRight ? sideW : 0);
  const mainH = outerH - topH - bottomH;

  const paneW = mainW / paneCount;
  const hasGrille = win?.hasGrille;
  const paneLayouts = Array.from({ length: paneCount }).map((_, idx) => ({
    x: mainX + idx * paneW + 5,
    y: mainY + 5,
    w: paneW - 10,
    h: mainH - 10
  }));

  const framePath = (() => {
    if (typeMeta.shape === 'arch' || typeMeta.shape === 'arch-soft') {
      const curve = typeMeta.shape === 'arch' ? outerH * 0.42 : outerH * 0.28;
      return `M ${outerX} ${outerY + curve} Q ${outerX + outerW / 2} ${outerY - curve * 0.32} ${outerX + outerW} ${outerY + curve} L ${outerX + outerW} ${outerY + outerH} L ${outerX} ${outerY + outerH} Z`;
    }
    if (typeMeta.shape === 'trapez') {
      return `M ${outerX + 18} ${outerY} L ${outerX + outerW} ${outerY} L ${outerX + outerW - 18} ${outerY + outerH} L ${outerX} ${outerY + outerH} Z`;
    }
    if (typeMeta.shape === 'triangle') {
      return `M ${outerX + outerW / 2} ${outerY} L ${outerX + outerW} ${outerY + outerH} L ${outerX} ${outerY + outerH} Z`;
    }
    return `M ${outerX} ${outerY} L ${outerX + outerW} ${outerY} L ${outerX + outerW} ${outerY + outerH} L ${outerX} ${outerY + outerH} Z`;
  })();

  const svg = (
      <svg
        className={embedded ? 'preview-svg-embedded' : undefined}
        width="100%"
        height={embedded ? '100%' : 300}
        viewBox={`0 0 ${viewW} ${viewH}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Fenstervorschau"
      >
        <path d={framePath} fill={frameFill} stroke="#0f172a" strokeWidth="5" />

        {sideLeft && (
          <rect
            x={outerX + 4}
            y={outerY + 4}
            width={sideW - 6}
            height={outerH - 8}
            fill={paneFill}
            stroke={sashStroke}
            strokeWidth="3"
          />
        )}
        {sideRight && (
          <rect
            x={outerX + outerW - sideW + 2}
            y={outerY + 4}
            width={sideW - 6}
            height={outerH - 8}
            fill={paneFill}
            stroke={sashStroke}
            strokeWidth="3"
          />
        )}

        {withTop && (
          <rect
            x={mainX + 3}
            y={outerY + 4}
            width={mainW - 6}
            height={topH - 6}
            fill={paneFill}
            stroke={sashStroke}
            strokeWidth="3"
          />
        )}
        {withBottom && (
          <rect
            x={mainX + 3}
            y={outerY + outerH - bottomH + 2}
            width={mainW - 6}
            height={bottomH - 6}
            fill={paneFill}
            stroke={sashStroke}
            strokeWidth="3"
          />
        )}

        {Array.from({ length: paneCount }).map((_, idx) => {
          const x = mainX + idx * paneW;
          return (
            <g key={`pane-${idx}`}>
              <rect
                x={x + 3}
                y={mainY + 3}
                width={paneW - 6}
                height={mainH - 6}
                fill={paneFill}
                stroke={sashStroke}
                strokeWidth="3"
              />
              {idx > 0 && (
                <rect
                  x={x - 1}
                  y={mainY + 2}
                  width={4}
                  height={mainH - 4}
                  fill={frameFill}
                  stroke="none"
                />
              )}
              <OpeningArrow token={openingTokens[idx]} x={x + 5} y={mainY + 5} w={paneW - 10} h={mainH - 10} />
            </g>
          );
        })}

        <WindowHandleGraphic
          handleId={showHandle ? win?.handle : 'Ohne'}
          tokens={openingTokens}
          openingDirection={win?.openingDirection}
          paneLayouts={paneLayouts}
        />

        {hasGrille && (
          <g>
            {Array.from({ length: win?.grilleVertical || 0 }).map((_, i) => {
              const x = mainX + ((i + 1) * mainW) / ((win?.grilleVertical || 0) + 1);
              return <line key={`gv-${i}`} x1={x} y1={mainY + 2} x2={x} y2={mainY + mainH - 2} stroke="#94a3b8" strokeWidth="2" />;
            })}
            {Array.from({ length: win?.grilleHorizontal || 0 }).map((_, i) => {
              const y = mainY + ((i + 1) * mainH) / ((win?.grilleHorizontal || 0) + 1);
              return <line key={`gh-${i}`} x1={mainX + 2} y1={y} x2={mainX + mainW - 2} y2={y} stroke="#94a3b8" strokeWidth="2" />;
            })}
          </g>
        )}
      </svg>
  );

  if (embedded) {
    return <div className="preview-embedded-svg">{svg}</div>;
  }

  return (
    <aside className="preview-box">
      <h3>Live Vorschau</h3>
      {svg}
      <p>{win?.windowType || 'Einteilig'} · {width} x {height} mm</p>
      <p>{win?.openingType || 'DKL'} · {win?.lightOption || 'Ohne Ober-/Unterlicht'}</p>
      <p>{win?.glassType} · {win?.soundClass}</p>
    </aside>
  );
}
