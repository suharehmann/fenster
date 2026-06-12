import DecorColorStudio from '../studio/DecorColorStudio';

export default function ColorsDecorStep({
  surface,
  selected,
  onSelect,
  onSurfaceChange,
  onConfigChange,
  globalConfig
}) {
  return (
    <DecorColorStudio
      surface={surface}
      selected={selected}
      onSelect={onSelect}
      onSurfaceChange={onSurfaceChange}
      onConfigChange={onConfigChange}
      globalConfig={globalConfig}
    />
  );
}
