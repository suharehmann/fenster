import './CatalogImagePreview.scss';

export default function CatalogImagePreview({ src, dims, mode = '2d' }) {
  if (!src) return null;

  return (
    <div className={`catalog-image-preview catalog-image-preview--${mode}`}>
      <img src={src} alt="Fenstervorschau" loading="lazy" decoding="async" />
      {dims && (
        <>
          <span className="detail-studio-dim detail-studio-dim-h">H {dims.h} mm</span>
          <span className="detail-studio-dim detail-studio-dim-w">B {dims.w} mm</span>
        </>
      )}
    </div>
  );
}
