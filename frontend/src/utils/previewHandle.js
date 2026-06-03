export function shouldShowHandle(handleId) {
  return Boolean(handleId && handleId !== 'Ohne');
}

export function handleStyle(handleId) {
  switch (handleId) {
    case 'Standard Silber':
      return { fill: '#cbd5e1', stroke: '#64748b', accent: '#475569' };
    case 'Druckknopf':
      return { fill: '#f8fafc', stroke: '#64748b', accent: '#ea580c' };
    case 'Abschliessbar':
      return { fill: '#e2e8f0', stroke: '#334155', accent: '#0f172a' };
    default:
      return { fill: '#f8fafc', stroke: '#94a3b8', accent: '#64748b' };
  }
}

/** Which edge of the sash the handle sits on. */
export function handleSideForToken(token, openingDirection) {
  if (!token || token === 'F') return null;
  if (token === 'K' || token === 'S') return 'bottom';
  if (token.includes('R') || token === 'DR' || token === 'DKR') return 'left';
  if (token.includes('L') || token === 'DL' || token === 'DKL') return 'right';
  if (openingDirection === 'rechts') return 'left';
  if (openingDirection === 'links') return 'right';
  return 'right';
}

export function activeHandlePaneIndex(tokens) {
  if (!tokens?.length) return 0;
  const idx = tokens.findIndex((token) => token && token !== 'F');
  return idx >= 0 ? idx : 0;
}

/** Draw handle on canvas for 3D preview. */
export function drawHandleOnCanvas(ctx, handleId, token, openingDirection, x, y, w, h) {
  if (!shouldShowHandle(handleId)) return;
  const side = handleSideForToken(token, openingDirection);
  if (!side) return;

  const { fill, stroke, accent } = handleStyle(handleId);
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

  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(hx, hy, barW, barH, 3);
  ctx.fill();
  ctx.stroke();

  if (handleId === 'Druckknopf') {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(hx + barW / 2, hy + 9, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  if (handleId === 'Abschliessbar') {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(hx + barW / 2, hy + barH - 11, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(hx + barW / 2 - 0.8, hy + barH - 18, 1.6, 6);
  }
}
