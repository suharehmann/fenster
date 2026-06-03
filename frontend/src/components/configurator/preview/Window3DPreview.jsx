import './Window3DPreview.scss';
import { useEffect, useRef, useState } from 'react';
import { WINDOW_TYPES } from '@/utils/defaults';
import { buildPreviewWindow, glassPaneFill, resolvePreviewColor } from '@/utils/previewConfig';
import { activeHandlePaneIndex, drawHandleOnCanvas } from '@/utils/previewHandle';

function shade(hex, amount) {
  const v = hex.replace('#', '');
  const num = parseInt(v, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `rgb(${r},${g},${b})`;
}

function getTypeMeta(windowType) {
  return WINDOW_TYPES.find((type) => type.id === windowType) || WINDOW_TYPES[0];
}

function tokensFor(openingType, paneCount) {
  const base = openingType && openingType.includes('-') ? openingType.split('-') : [openingType || 'F'];
  const clean = base.filter(Boolean);
  while (clean.length < paneCount) clean.push('F');
  return clean.slice(0, paneCount);
}

function drawOpenShape(ctx, token, x, y, w, h) {
  if (!token || token === 'F') return;
  const cx = x + w / 2;
  const cy = y + h / 2;

  ctx.save();
  ctx.strokeStyle = '#b35d2c';
  ctx.lineWidth = 2.4;

  if (token === 'K') {
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 15);
    ctx.lineTo(cx, y + 5);
    ctx.lineTo(x + w - 10, y + 15);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (token === 'S') {
    ctx.beginPath();
    ctx.moveTo(x + 8, cy);
    ctx.lineTo(x + w - 12, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + w - 16, cy - 5);
    ctx.lineTo(x + w - 8, cy);
    ctx.lineTo(x + w - 16, cy + 5);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.beginPath();
  if (token.includes('R') || token === 'DR' || token === 'DKR') {
    ctx.moveTo(x + w - 8, y + 10);
    ctx.lineTo(x + 8, cy);
    ctx.lineTo(x + w - 8, y + h - 10);
  } else {
    ctx.moveTo(x + 8, y + 10);
    ctx.lineTo(x + w - 8, cy);
    ctx.lineTo(x + 8, y + h - 10);
  }
  ctx.stroke();
  ctx.restore();
}

export default function Window3DPreview({ windowConfig, globalConfig, colorSurface, showHandle = false, embedded = false }) {
  const win = buildPreviewWindow(windowConfig, globalConfig) || windowConfig;
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const outside = resolvePreviewColor(globalConfig, 'outside').hex;
  const inside = resolvePreviewColor(globalConfig, 'inside').hex;
  const frameColor = colorSurface === 'inside' ? inside : outside;
  const frameDark = shade(frameColor, -35);
  const frameLight = shade(frameColor, 20);
  const paneFill = glassPaneFill(win?.glassType);

  const typeMeta = getTypeMeta(win?.windowType || 'Einteilig');
  const paneCount = typeMeta.panes || 1;
  const tokens = tokensFor(win?.openingType, paneCount);

  const withTop = (win?.lightOption || '').includes('Oberlicht');
  const withBottom = (win?.lightOption || '').includes('Unterlicht');
  const sideLeft = (win?.lightOption || '').includes('Seitenteil links') || (win?.lightOption || '').includes('beidseitig');
  const sideRight = (win?.lightOption || '').includes('Seitenteil rechts') || (win?.lightOption || '').includes('beidseitig');

  const W = 300;
  const H = 300;
  const fx = 36;
  const fy = 32;
  const fw = 220;
  const fh = 220;
  const depthX = 18;
  const depthY = -14;

  const sideW = sideLeft || sideRight ? fw * 0.14 : 0;
  const topH = withTop ? fh * 0.16 : 0;
  const bottomH = withBottom ? fh * 0.14 : 0;

  const innerX = fx + 10 + (sideLeft ? sideW : 0);
  const innerY = fy + 10 + topH;
  const innerW = fw - 20 - (sideLeft ? sideW : 0) - (sideRight ? sideW : 0);
  const innerH = fh - 20 - topH - bottomH;
  const paneW = innerW / paneCount;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const wrapper = canvas.parentElement;
    if (!wrapper) return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setCanvasSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height }
      );
    });

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const scale = Math.min(rect.width / W, rect.height / H);
    const offsetX = (rect.width - W * scale) / 2;
    const offsetY = (rect.height - H * scale) / 2;
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#f7f1e6';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = frameDark;
    ctx.strokeStyle = '#3f3a33';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(fx + depthX, fy + depthY);
    ctx.lineTo(fx + fw + depthX, fy + depthY);
    ctx.lineTo(fx + fw + depthX, fy + fh + depthY);
    ctx.lineTo(fx + depthX, fy + fh + depthY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = frameLight;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + depthX, fy + depthY);
    ctx.lineTo(fx + fw + depthX, fy + depthY);
    ctx.lineTo(fx + fw, fy);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = frameDark;
    ctx.beginPath();
    ctx.moveTo(fx + fw, fy);
    ctx.lineTo(fx + fw + depthX, fy + depthY);
    ctx.lineTo(fx + fw + depthX, fy + fh + depthY);
    ctx.lineTo(fx + fw, fy + fh);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = frameColor;
    ctx.strokeStyle = '#1f1b16';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + fw, fy);
    ctx.lineTo(fx + fw, fy + fh);
    ctx.lineTo(fx, fy + fh);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1.5;
      ctx.fillStyle = paneFill;

    if (sideLeft) {
      ctx.fillRect(fx + 10, fy + 10, sideW - 2, fh - 20);
      ctx.strokeRect(fx + 10, fy + 10, sideW - 2, fh - 20);
    }
    if (sideRight) {
      ctx.fillRect(fx + fw - 10 - sideW, fy + 10, sideW - 2, fh - 20);
      ctx.strokeRect(fx + fw - 10 - sideW, fy + 10, sideW - 2, fh - 20);
    }
    if (withTop) {
      ctx.fillRect(innerX, fy + 10, innerW, topH - 2);
      ctx.strokeRect(innerX, fy + 10, innerW, topH - 2);
    }
    if (withBottom) {
      ctx.fillRect(innerX, fy + fh - 10 - bottomH, innerW, bottomH - 2);
      ctx.strokeRect(innerX, fy + fh - 10 - bottomH, innerW, bottomH - 2);
    }

    for (let i = 0; i < paneCount; i += 1) {
      const x = innerX + paneW * i;
      ctx.fillStyle = paneFill;
      ctx.strokeStyle = '#3f3a33';
      ctx.lineWidth = 1.5;
      ctx.fillRect(x, innerY, paneW - 1.5, innerH);
      ctx.strokeRect(x, innerY, paneW - 1.5, innerH);
      drawOpenShape(ctx, tokens[i], x + 4, innerY + 4, paneW - 8, innerH - 8);
    }

    const handlePane = activeHandlePaneIndex(tokens);
    const handleX = innerX + paneW * handlePane;
    drawHandleOnCanvas(
      ctx,
      showHandle ? win?.handle : 'Ohne',
      tokens[handlePane],
      win?.openingDirection,
      handleX + 4,
      innerY + 4,
      paneW - 8,
      innerH - 8
    );

    if (win?.hasGrille) {
      ctx.strokeStyle = '#9aa0a6';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < (win?.grilleVertical || 0); i += 1) {
        const x = innerX + ((i + 1) * innerW) / ((win?.grilleVertical || 0) + 1);
        ctx.beginPath();
        ctx.moveTo(x, innerY);
        ctx.lineTo(x, innerY + innerH);
        ctx.stroke();
      }
      for (let i = 0; i < (win?.grilleHorizontal || 0); i += 1) {
        const y = innerY + ((i + 1) * innerH) / ((win?.grilleHorizontal || 0) + 1);
        ctx.beginPath();
        ctx.moveTo(innerX, y);
        ctx.lineTo(innerX + innerW, y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [
    canvasSize,
    frameColor,
    frameDark,
    frameLight,
    paneCount,
    tokens,
    withTop,
    withBottom,
    sideLeft,
    sideRight,
    innerX,
    innerY,
    innerW,
    innerH,
    paneW,
    paneFill,
    win,
    showHandle
  ]);

  const canvasBlock = (
    <div className="canvas-wrap" role="img" aria-label="3D Fenstervorschau">
      <canvas ref={canvasRef} />
    </div>
  );

  if (embedded) {
    return <div className="preview-3d preview-3d-embedded">{canvasBlock}</div>;
  }

  return (
    <aside className="preview-box preview-3d">
      <h3>Live Vorschau 3D</h3>
      {canvasBlock}
      <p>{win?.windowType || 'Einteilig'} · {win?.openingType || 'DKL'}</p>
      <p>
        {win?.width} x {win?.height} mm · {win?.frameColorOutside || 'Weiss'}
      </p>
    </aside>
  );
}
