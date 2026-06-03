import { useEffect, useState } from 'react';
import { getPreviewType } from '@/utils/getPreviewType';
import GeneratedWindowPreview from './GeneratedWindowPreview';

/**
 * Left-hand live preview. Uses a real SVG only for the two supported cases; for
 * everything else (or if the SVG file is missing) it draws the generated CSS
 * preview, so the UI never shows a broken image.
 */
export default function PreviewPanel({ config }) {
  const preview = getPreviewType(config);
  const [svgFailed, setSvgFailed] = useState(false);

  useEffect(() => {
    setSvgFailed(false);
  }, [preview.key]);

  const useSvg = preview.type === 'svg' && !svgFailed;

  return (
    <div className="wc-preview">
      <div className="wc-preview-frame">
        {useSvg ? (
          <img
            src={preview.src}
            alt="Fenster Vorschau"
            className="wc-preview-img"
            onError={() => setSvgFailed(true)}
          />
        ) : (
          <GeneratedWindowPreview config={config} />
        )}
      </div>
    </div>
  );
}
