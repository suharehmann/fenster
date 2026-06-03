/** Shared frame appearance for CSS/SVG previews (Farben, Fensteraufbau, …). */

export function decorFrameBackground(colorId, hex) {
  const color = hex || '#ffffff';
  const id = String(colorId || '');

  if (/golden\s*oak|nussbaum|mahagoni|mooreiche|oak|kiefer|holz|woodec|teak|eiche/i.test(id)) {
    return `repeating-linear-gradient(95deg, ${color}, rgba(0,0,0,0.16) 1px, ${color} 8px)`;
  }
  if (/aludec|metallic|eisenglimmer|9007|9006/i.test(id)) {
    return `linear-gradient(145deg, ${color} 0%, rgba(255,255,255,0.22) 42%, ${color} 100%)`;
  }
  if (/strukturell/i.test(id)) {
    return `repeating-linear-gradient(0deg, ${color}, ${color} 4px, rgba(0,0,0,0.06) 4px, rgba(0,0,0,0.06) 6px)`;
  }
  return color;
}
