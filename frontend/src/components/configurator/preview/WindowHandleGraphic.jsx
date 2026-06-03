import './WindowHandleGraphic.scss';
import {
  activeHandlePaneIndex,
  handleSideForToken,
  handleStyle,
  shouldShowHandle
} from '@/utils/previewHandle';

export default function WindowHandleGraphic({ handleId, tokens, openingDirection, paneLayouts }) {
  if (!shouldShowHandle(handleId) || !paneLayouts?.length) return null;

  const paneIndex = activeHandlePaneIndex(tokens);
  const layout = paneLayouts[paneIndex] || paneLayouts[0];
  const side = handleSideForToken(tokens[paneIndex], openingDirection);
  if (!side || !layout) return null;

  const { fill, stroke, accent } = handleStyle(handleId);
  const { x, y, w, h } = layout;
  const barW = 10;
  const barH = Math.min(42, Math.max(28, h * 0.38));

  let hx;
  let hy;
  if (side === 'right') {
    hx = x + w - barW - 5;
    hy = y + h / 2 - barH / 2;
  } else if (side === 'left') {
    hx = x + 5;
    hy = y + h / 2 - barH / 2;
  } else {
    hx = x + w / 2 - barW / 2;
    hy = y + h - barH - 8;
  }

  return (
    <g className="preview-window-handle" aria-hidden="true">
      <rect x={hx} y={hy} width={barW} height={barH} rx={3} fill={fill} stroke={stroke} strokeWidth="1.5" />
      {handleId === 'Druckknopf' && (
        <circle cx={hx + barW / 2} cy={hy + 9} r={3.2} fill={accent} />
      )}
      {handleId === 'Abschliessbar' && (
        <>
          <circle cx={hx + barW / 2} cy={hy + barH - 11} r={2.2} fill={accent} />
          <rect x={hx + barW / 2 - 0.8} y={hy + barH - 18} width={1.6} height={6} fill={accent} />
        </>
      )}
    </g>
  );
}
